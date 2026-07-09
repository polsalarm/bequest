/**
 * PDAX Institutional API client (server-side only).
 *
 * Auth: POST /login (username+password) → { access_token, id_token, expiry }.
 * Authed requests send raw `access_token` + `id_token` headers. Tokens cached
 * in module scope (survives warm invocations), re-fetched before expiry.
 *
 * UAT pricing is flaky (mock OTC), so getRate() falls back to RAMP_RATE_FALLBACK.
 * Credentials come from env: PDAX_USERNAME, PDAX_PASSWORD, PDAX_BASE_URL.
 * See docs/PDAX_API.md.
 */
const BASE =
  process.env.PDAX_BASE_URL ??
  'https://uat.services.sandbox.pdax.ph/api/pdax-api'
const IN = `${BASE}/pdax-institution/v1`
const IN_V2 = `${BASE}/pdax-institution/v2`
const RATE_FALLBACK = Number(process.env.RAMP_RATE_FALLBACK ?? '58')

interface Tokens {
  access: string
  id: string
  exp: number // epoch ms
}
let cached: Tokens | null = null

async function login(): Promise<Tokens> {
  const username = process.env.PDAX_USERNAME
  const password = process.env.PDAX_PASSWORD
  if (!username || !password) throw new Error('PDAX credentials not configured')

  const res = await fetch(`${IN}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error(`PDAX login failed: ${res.status}`)
  const j = (await res.json()) as {
    access_token: string
    id_token: string
    expiry?: number
  }
  const ttl = (j.expiry ?? 600) * 1000
  return { access: j.access_token, id: j.id_token, exp: Date.now() + ttl - 30_000 }
}

async function tokens(): Promise<Tokens> {
  if (cached && Date.now() < cached.exp) return cached
  cached = await login()
  return cached
}

async function authed<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  opts: {
    query?: Record<string, string | number>
    body?: unknown
    /** API version. Pricing/quotes live on v2; funding + auth on v1. */
    v?: 1 | 2
  } = {},
): Promise<T> {
  const t = await tokens()
  const root = opts.v === 2 ? IN_V2 : IN
  const qs = opts.query
    ? '?' +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(opts.query).map(([k, v]) => [k, String(v)]),
        ),
      ).toString()
    : ''
  const res = await fetch(`${root}${path}${qs}`, {
    method,
    headers: {
      access_token: t.access,
      id_token: t.id,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`PDAX ${method} ${path} ${res.status}: ${text}`)
  return (text ? JSON.parse(text) : undefined) as T
}

export interface Balance {
  currency: string
  available: string
  hold: string
  total: string
  asset_type: 'FIAT' | 'CRYPTO'
}

export async function getBalances(): Promise<Balance[]> {
  const j = await authed<{ data: Balance[] }>('GET', '/balances')
  return j.data ?? []
}

export interface RateResult {
  rate: number
  /** `live` = a real market rate was fetched; `fallback` = hardcoded constant. */
  source: 'live' | 'fallback'
  /** Which tier produced the rate. Surfaced so a live rate is never mistaken
   *  for a PDAX rate when it actually came from the public feed. */
  provider: 'pdax' | 'public' | 'constant'
  base: string
  quote: string
}

/** Public spot-rate feed (Layer 1 per BUILD_PLAN decision #4) — no credentials,
 *  works when PDAX UAT's mock OTC does not. Keyed by our currency codes. */
const COINGECKO_IDS: Record<string, string> = {
  USDC: 'usd-coin',
  XLM: 'stellar',
}

let publicRateCache: { key: string; rate: number; exp: number } | null = null

/** Spot `quote` per 1 `base` from the public feed. Cached 60s; null on failure. */
async function fetchPublicRate(base: string, quote: string): Promise<number | null> {
  const id = COINGECKO_IDS[base.toUpperCase()]
  if (!id) return null
  const vs = quote.toLowerCase()
  const key = `${id}:${vs}`
  if (publicRateCache?.key === key && Date.now() < publicRateCache.exp) {
    return publicRateCache.rate
  }

  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 4000)
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`,
      { signal: ctl.signal },
    )
    if (!res.ok) return null
    const j = (await res.json()) as Record<string, Record<string, number>>
    const rate = Number(j?.[id]?.[vs])
    if (!Number.isFinite(rate) || rate <= 0) return null
    publicRateCache = { key, rate, exp: Date.now() + 60_000 }
    return rate
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Flat PHP payout fee per channel (UAT — mirrors the demo pricing). */
const PAYOUT_FEES: Record<string, number> = { gcash: 15, maya: 15, bank: 25 }

export interface WithdrawResult {
  /** `submitted` = PDAX accepted the payout; `simulated` = UAT declined
   *  (mock liquidity/pricing) so we returned a demo reference. */
  status: 'submitted' | 'simulated'
  reference: string
  amountUsdc: number
  rate: number
  rateSource: 'live' | 'fallback'
  php: number
  fee: number
  net: number
  method: string
}

/** Off-ramp execution (heir, USDC→PHP→cash). Per docs/PDAX_API.md:
 *  SELL USDC→PHP via /trade then POST /fiat/withdraw to the payout channel.
 *  UAT OTC is mock and often 500s, so each leg degrades to a simulated receipt
 *  rather than throwing — the caller always gets a breakdown. */
export async function withdrawFiat(params: {
  amount: number
  method: string
  destination: string
}): Promise<WithdrawResult> {
  const { amount, method, destination } = params
  const q = await getRate('USDC', 'PHP', amount, 'SELL')
  const php = +(q.rate * amount).toFixed(2)
  const fee = PAYOUT_FEES[method] ?? 15
  const net = +(php - fee).toFixed(2)
  const base = {
    amountUsdc: amount,
    rate: q.rate,
    rateSource: q.source,
    php,
    fee,
    net,
    method,
  }

  try {
    // Firm quote → execute SELL → fiat payout. Any leg failing (UAT mock)
    // drops us to the simulated branch below.
    const quote = await authed<{ id?: string; quote_id?: string }>(
      'POST',
      '/trade/quote',
      { body: { base_currency: 'USDC', quote_currency: 'PHP', base_quantity: amount, side: 'SELL' } },
    )
    const quoteId = quote.id ?? quote.quote_id
    if (quoteId) await authed('POST', '/trade', { body: { quote_id: quoteId } })

    const wd = await authed<{ id?: string; reference?: string }>(
      'POST',
      '/fiat/withdraw',
      { body: { currency: 'PHP', amount: net, channel: method, destination } },
    )
    return {
      status: 'submitted',
      reference: wd.reference ?? wd.id ?? `PDAX-${Date.now()}`,
      ...base,
    }
  } catch {
    return { status: 'simulated', reference: `SIM-${Date.now()}`, ...base }
  }
}

/** Indicative rate for base→quote, in three tiers:
 *  1. PDAX `/trade/price` — the real venue rate. UAT's mock OTC currently 400s.
 *  2. Public spot feed — no credentials, always available.
 *  3. `RAMP_RATE_FALLBACK` — last resort so the UI never blocks.
 *  Only tier 3 reports `source: 'fallback'`. */
export async function getRate(
  base: string,
  quote: string,
  baseQuantity: number,
  side: 'BUY' | 'SELL',
): Promise<RateResult> {
  try {
    // v2 `/trade/price`: `quote_currency` is the CRYPTO and `base_currency` is
    // PHP — the reverse of the v1 naming. `quantity` is denominated in
    // `currency`, and the venue enforces a minimum (e.g. >= 1 USDC).
    const j = await authed<{ data?: { price?: number } }>('GET', '/trade/price', {
      v: 2,
      query: {
        side: side.toLowerCase(),
        quote_currency: base,
        base_currency: quote,
        currency: base,
        quantity: baseQuantity,
      },
    })
    const rate = Number(j?.data?.price)
    if (Number.isFinite(rate) && rate > 0) {
      return { rate, source: 'live', provider: 'pdax', base, quote }
    }
    throw new Error('no usable price field')
  } catch (e) {
    // PDAX unavailable (or below minimum quantity) — try the public feed.
    console.error('[pdax getRate tier1]', e instanceof Error ? e.message : e)
  }

  const spot = await fetchPublicRate(base, quote)
  if (spot != null) {
    return { rate: spot, source: 'live', provider: 'public', base, quote }
  }

  return { rate: RATE_FALLBACK, source: 'fallback', provider: 'constant', base, quote }
}

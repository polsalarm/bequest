// Client-side PDAX helper. Only ever calls our own /api/* endpoints — the
// PDAX credentials live server-side and never reach the browser.

export interface RateQuote {
  rate: number
  source: 'live' | 'fallback'
  /** Which tier produced the rate: the PDAX venue, the public spot feed, or
   *  the hardcoded constant. `live` can mean `pdax` or `public`. */
  provider: 'pdax' | 'public' | 'constant'
  base: string
  quote: string
  amount: number
  php: number
  ts: number
}

export interface WithdrawReceipt {
  status: 'submitted' | 'simulated'
  reference: string
  amountUsdc: number
  asset: string
  rate: number
  rateSource: 'live' | 'fallback'
  rateProvider: 'pdax' | 'public' | 'constant'
  php: number
  fee: number
  net: number
  method: string
  /** Present when `status === 'simulated'`: which leg failed, and why.
   *  `deposit` is client-side (the on-chain transfer / PDAX crediting it);
   *  the rest are PDAX API calls. */
  failure?: { leg: 'deposit' | 'quote' | 'order' | 'withdraw'; message: string }
  /** Stellar tx hash of the heir's deposit into PDAX custody, when one was made. */
  depositTxHash?: string
}

/** Execute a USDC→PHP cash-out to a payout channel. Hits our own endpoint;
 *  PDAX keys stay server-side. `accountName` is the beneficiary's account name,
 *  which PDAX requires on every payout. */
export async function withdrawToFiat(
  amount: number,
  method: string,
  destination: string,
  accountName: string,
  asset = 'USDC',
): Promise<WithdrawReceipt> {
  const res = await fetch('/api/pdax-withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, method, destination, accountName, asset }),
  })
  if (!res.ok) throw new Error(`withdraw failed (${res.status})`)
  return res.json() as Promise<WithdrawReceipt>
}

/** Indicative PHP quote for `amount` of `base` (default USDC, SELL). */
export async function getRate(
  amount: number,
  base = 'USDC',
  side: 'BUY' | 'SELL' = 'SELL',
): Promise<RateQuote> {
  const res = await fetch(
    `/api/pdax-rate?base=${base}&amount=${amount}&side=${side}`,
  )
  if (!res.ok) throw new Error(`rate lookup failed (${res.status})`)
  return res.json() as Promise<RateQuote>
}

export interface PdaxDepositAddress {
  currency: string
  address: string
  /** Stellar memo (destination tag). Omitting it strands the deposit. */
  memo: string
}

/** PDAX's custody address for depositing `currency`. On testnet this is a real
 *  Stellar account, so the deposit is a genuine on-chain payment. */
export async function getDepositAddress(
  currency = 'XLM_TEST',
): Promise<PdaxDepositAddress> {
  const res = await fetch(`/api/pdax-deposit-address?currency=${currency}`)
  if (!res.ok) throw new Error(`deposit address lookup failed (${res.status})`)
  return res.json() as Promise<PdaxDepositAddress>
}

/** Available balance of `currency` inside the PDAX account. */
export async function getPdaxBalance(currency = 'XLM'): Promise<number> {
  const res = await fetch(`/api/pdax-balance?currency=${currency}`)
  if (!res.ok) throw new Error(`balance lookup failed (${res.status})`)
  const j = (await res.json()) as { available: number }
  return j.available
}

/** Poll PDAX until `currency` credits by at least `delta` above `baseline`.
 *  Crediting is asynchronous — a few ledgers plus PDAX's own confirmations. */
export async function waitForCredit(
  currency: string,
  baseline: number,
  delta: number,
  { timeoutMs = 120_000, intervalMs = 5_000 } = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  // Allow for PDAX's network fee shaving a hair off the credited amount.
  const target = baseline + delta * 0.98
  while (Date.now() < deadline) {
    const now = await getPdaxBalance(currency).catch(() => baseline)
    if (now >= target) return true
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}

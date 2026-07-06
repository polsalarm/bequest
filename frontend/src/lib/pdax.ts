// Client-side PDAX helper. Only ever calls our own /api/* endpoints — the
// PDAX credentials live server-side and never reach the browser.

export interface RateQuote {
  rate: number
  source: 'live' | 'fallback'
  base: string
  quote: string
  amount: number
  php: number
  ts: number
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

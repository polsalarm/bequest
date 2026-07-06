/**
 * GET /api/pdax-rate?base=USDC&amount=100&side=SELL
 * Returns an indicative PHP rate for the given crypto amount. Keys stay
 * server-side; the client only ever hits this endpoint.
 *
 * Vercel Node runtime signature: (req, res) where req.query is parsed for us.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getRate } from './_pdax.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const q = req.query as Record<string, string | string[] | undefined>
  const str = (v: string | string[] | undefined, d: string) =>
    (Array.isArray(v) ? v[0] : v) ?? d

  const base = str(q.base, 'USDC').toUpperCase()
  const amount = Number(str(q.amount, '1'))
  const side = str(q.side, 'SELL').toUpperCase() as 'BUY' | 'SELL'

  try {
    const r = await getRate(base, 'PHP', amount > 0 ? amount : 1, side)
    res.status(200).json({
      ...r,
      amount,
      php: +(r.rate * amount).toFixed(2),
      ts: Date.now(),
    })
  } catch (e) {
    res
      .status(502)
      .json({ error: e instanceof Error ? e.message : 'rate failed' })
  }
}

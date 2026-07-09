/**
 * GET /api/pdax-balance?currency=XLM
 * Available balance of one asset inside the PDAX account. The off-ramp polls
 * this after an on-chain deposit to know when PDAX has credited the funds —
 * crediting is asynchronous and takes a few ledgers plus PDAX's own confirms.
 *
 * Vercel Node runtime signature: (req, res).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getBalance } from './_pdax.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const raw = req.query.currency
  const currency = String(Array.isArray(raw) ? raw[0] : (raw ?? 'XLM')).toUpperCase()

  try {
    const available = await getBalance(currency)
    res.status(200).json({ currency, available })
  } catch (e) {
    res
      .status(502)
      .json({ error: e instanceof Error ? e.message : 'balance failed' })
  }
}

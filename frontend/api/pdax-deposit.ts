/**
 * POST /api/pdax-deposit  body: { amount, method }
 * Cash-in: starts a PHP deposit into the PDAX account and returns the payment
 * checkout URL. Keys and the BSP travel-rule identity stay server-side — the
 * client sends only an amount and a payment channel, never personal data.
 *
 * On UAT the checkout is a PayMongo sandbox page that never settles, so the
 * status is always `pending` and no crypto arrives. See docs/PDAX_API.md.
 *
 * Vercel Node runtime signature: (req, res).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { depositFiat } from './_pdax.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {}
  const amount = Number(body.amount)
  const method = String(body.method ?? 'instapay_upay_cashin')

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'amount must be a positive number' })
    return
  }

  try {
    res.status(200).json(await depositFiat({ amount, method }))
  } catch (e) {
    res
      .status(400)
      .json({ error: e instanceof Error ? e.message : 'deposit failed' })
  }
}

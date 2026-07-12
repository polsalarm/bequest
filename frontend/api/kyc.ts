/**
 * POST /api/kyc?action=submit
 * body: { heir: string, deny?: boolean }
 *
 * DEMO compliance approver for the gated RWA (HOUSE02). See `_kyc.ts` for the
 * demo-vs-real boundary: the on-chain gate is real, the KYC DECISION is stubbed
 * (auto-approve). No identity fields are read or stored here — the client's
 * demo KYC form is cosmetic; only the heir address is used. Pass `deny: true`
 * to simulate a rejected applicant and show the blocked-claim path.
 *
 * Vercel Node runtime signature: (req, res).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authorizeHeir } from './_kyc.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {}
  const heir = String(body.heir ?? '')
  if (!heir) {
    res.status(400).json({ error: 'heir is required' })
    return
  }

  // Simulated rejection — demonstrates that an un-approved heir stays gated.
  if (body.deny) {
    res.status(200).json({
      approved: false,
      reason: 'KYC declined (simulated) — heir remains unauthorized to claim.',
    })
    return
  }

  // Auto-approve (demo) → authorize the heir's trustline on-chain.
  try {
    const result = await authorizeHeir(heir)
    if (!result.ok) {
      res.status(502).json({ approved: false, error: result.error })
      return
    }
    res.status(200).json({ approved: true, hash: result.hash })
  } catch (e) {
    res.status(500).json({
      approved: false,
      error: e instanceof Error ? e.message : 'approval failed',
    })
  }
}

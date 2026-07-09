/**
 * GET /api/pdax-deposit-address?currency=XLM_TEST
 * Returns PDAX's custody address (and its mandatory memo) for depositing a
 * crypto asset. Keys stay server-side; the client only ever hits this endpoint.
 *
 * On UAT the `XLM_TEST` wallet is a real Stellar **testnet** account, so a
 * deposit to it is a genuine on-chain transfer. See docs/PDAX_API.md.
 *
 * Vercel Node runtime signature: (req, res).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDepositAddress } from './_pdax.js'

/** Only assets we actually support depositing. Prevents the client asking for
 *  an arbitrary wallet (e.g. a mainnet one) through our credentials. */
const ALLOWED = new Set(['XLM_TEST', 'XLM', 'USDCXLM'])

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const raw = req.query.currency
  const currency = String(Array.isArray(raw) ? raw[0] : (raw ?? 'XLM_TEST')).toUpperCase()

  if (!ALLOWED.has(currency)) {
    res.status(400).json({ error: `unsupported currency "${currency}"` })
    return
  }

  try {
    const { address, tag } = await getDepositAddress(currency)
    res.status(200).json({ currency, address, memo: tag })
  } catch (e) {
    res
      .status(502)
      .json({ error: e instanceof Error ? e.message : 'deposit address failed' })
  }
}

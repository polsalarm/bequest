/** RWA compliance gate (Phase 3) client wrapper.
 *
 *  DEMO: the KYC form fields are cosmetic — nothing here transmits or stores
 *  identity data; only the heir's Stellar address is sent. The server
 *  (`api/kyc`) auto-approves (or, with `deny`, simulates a rejection) and
 *  authorizes the heir's trustline on-chain. A real deployment swaps the
 *  server for a licensed SEP-12 KYC + compliance decision. Not a real KYC
 *  provider; testnet, not legally binding. See docs/RWA_PHASES.md. */

export interface KycResult {
  approved: boolean
  hash?: string
  reason?: string
  error?: string
}

/** Submit the (demo) KYC approval for `heir`. `deny` forces the simulated
 *  rejection path so the blocked-claim state can be shown. */
export async function requestKyc(heir: string, deny = false): Promise<KycResult> {
  const res = await fetch('/api/kyc?action=submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heir, deny }),
  })
  return (await res.json()) as KycResult
}

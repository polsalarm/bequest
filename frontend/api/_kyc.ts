/**
 * RWA compliance approver — server-side (Phase 3). Demo-scoped.
 *
 * ┌─ DEMO vs REAL — READ THIS ────────────────────────────────────────────────┐
 * │ The GATE is real: HOUSE02 has AUTH_REQUIRED, so on-chain NO account can    │
 * │ hold or claim it until its trustline is authorized. This module performs   │
 * │ that authorization — it is the SEP-8-style "approval server".              │
 * │                                                                            │
 * │ What is STUBBED is the COMPLIANCE DECISION. A real deployment runs SEP-12  │
 * │ KYC + a licensed compliance officer / custodian admin here and authorizes  │
 * │ only after a genuine identity + sanctions check. This demo AUTO-APPROVES   │
 * │ (the caller can force a denial to show the blocked path) and does NOT      │
 * │ inspect, store, or transmit any identity data. Do not feed it real PII.    │
 * │ Testnet only — not a real KYC provider, not legally binding.               │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Authorizing a holder = the SAC admin (the issuer) calling `set_authorized`.
 * The issuer secret lives in env (RWA_GATED_ISSUER_SECRET) and never reaches
 * the client — same trust boundary as the PDAX credentials.
 */
import {
  rpc,
  TransactionBuilder,
  BASE_FEE,
  Contract,
  Address,
  Keypair,
  nativeToScVal,
} from '@stellar/stellar-sdk'

const RPC_URL = process.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org'
const PASSPHRASE =
  process.env.VITE_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015'
const ISSUER_SECRET = process.env.RWA_GATED_ISSUER_SECRET
// SAC of the gated title (HOUSE02). Public id — safe to default.
const GATED_SAC =
  process.env.RWA_GATED_SAC ?? 'CDPJ2C55GRIZDS67FG7D3SPZT7ND6STKLPDNCD2HQU6EUZRG3WA36UJT'

export interface AuthorizeResult {
  ok: boolean
  hash?: string
  error?: string
}

/** Authorize `heir`'s trustline to the gated asset via the SAC admin (issuer),
 *  so the heir can receive/claim it. The heir must already hold a (pending)
 *  trustline — `set_authorized` flips an existing trustline's flag. */
export async function authorizeHeir(heir: string): Promise<AuthorizeResult> {
  if (!ISSUER_SECRET) {
    return { ok: false, error: 'approver not configured (RWA_GATED_ISSUER_SECRET)' }
  }
  const server = new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith('http://') })
  const issuer = Keypair.fromSecret(ISSUER_SECRET)
  const source = await server.getAccount(issuer.publicKey())
  const sac = new Contract(GATED_SAC)

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(
      sac.call(
        'set_authorized',
        new Address(heir).toScVal(),
        nativeToScVal(true, { type: 'bool' }),
      ),
    )
    .setTimeout(60)
    .build()

  const prepared = await server.prepareTransaction(tx)
  prepared.sign(issuer)

  const sent = await server.sendTransaction(prepared)
  if (sent.status === 'ERROR') {
    return { ok: false, error: `send failed: ${JSON.stringify(sent.errorResult)}` }
  }
  let got = await server.getTransaction(sent.hash)
  for (let i = 0; i < 30 && got.status === 'NOT_FOUND'; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    got = await server.getTransaction(sent.hash)
  }
  if (got.status !== 'SUCCESS') {
    return { ok: false, error: `tx did not succeed: ${got.status}` }
  }
  return { ok: true, hash: sent.hash }
}

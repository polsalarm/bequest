import { Asset, Operation } from '@stellar/stellar-sdk'
import { readContract } from './stellar'
import { submitClassic } from './stellar'
import { CONFIG, NATIVE_SAC } from './config'

/** The classic asset a SAC wraps, or native XLM. */
export type SacAsset = { native: true } | { native: false; code: string; issuer: string }

/** Read a token contract's symbol + decimals, and the classic asset it wraps
 *  (via the SAC `name()` = "CODE:ISSUER" or "native"). */
export async function readTokenMeta(
  sac: string,
  source: string,
): Promise<{ symbol: string; decimals: number; asset: SacAsset }> {
  const [symbol, decimals, name] = await Promise.all([
    readContract<string>(sac, 'symbol', [], source),
    readContract<number>(sac, 'decimals', [], source),
    readContract<string>(sac, 'name', [], source),
  ])
  let asset: SacAsset
  if (sac === NATIVE_SAC || name === 'native' || !name.includes(':')) {
    asset = { native: true }
  } else {
    const [code, issuer] = name.split(':')
    asset = { native: false, code, issuer }
  }
  return { symbol, decimals: Number(decimals), asset }
}

/** Does `account` already trust this classic asset? Native never needs one. */
export async function hasTrustline(
  account: string,
  asset: SacAsset,
): Promise<boolean> {
  if (asset.native) return true
  const res = await fetch(`${CONFIG.horizonUrl}/accounts/${account}`)
  if (!res.ok) return false
  const j = await res.json()
  return (j.balances ?? []).some(
    (b: { asset_code?: string; asset_issuer?: string }) =>
      b.asset_code === asset.code && b.asset_issuer === asset.issuer,
  )
}

/** Add a trustline for a classic asset so the account can receive it. */
export async function addTrustline(account: string, asset: SacAsset) {
  if (asset.native) return
  await submitClassic(
    [Operation.changeTrust({ asset: new Asset(asset.code, asset.issuer) })],
    account,
  )
}

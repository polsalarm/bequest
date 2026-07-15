import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr'
import {
  WalletConnectModule,
  WalletConnectTargetChain,
} from '@creit.tech/stellar-wallets-kit/modules/wallet-connect'
import type { ModuleInterface } from '@creit.tech/stellar-wallets-kit'
import { CONFIG } from './config'

/** Stellar Wallets Kit (v2.5, static API).
 *
 *  Desktop: Freighter extension.
 *  Android Chrome: Freighter mobile + LOBSTR + others via WalletConnect —
 *  which keeps the user in Chrome, so Web NFC (Phase 7 tap-to-claim) still
 *  works in the same session. WalletConnect is opt-in: it activates only when
 *  a project id (free, cloud.reown.com) is set in VITE_WALLETCONNECT_PROJECT_ID. */
const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined

const modules: ModuleInterface[] = [
  new FreighterModule(),
  new LobstrModule(),
  new xBullModule(),
  new AlbedoModule(),
]

if (wcProjectId) {
  modules.push(
    new WalletConnectModule({
      projectId: wcProjectId,
      allowedChains: [
        CONFIG.network === 'mainnet'
          ? WalletConnectTargetChain.PUBLIC
          : WalletConnectTargetChain.TESTNET,
      ],
      metadata: {
        name: 'Bequest',
        description: 'Trustless on-chain inheritance for Filipino families.',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://bequest.app',
        icons: [
          typeof window !== 'undefined'
            ? `${window.location.origin}/logo.png`
            : '',
        ],
      },
    }),
  )
}

StellarWalletsKit.init({
  network: CONFIG.network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET,
  modules,
})

/** Open the wallet chooser; resolve with the chosen address. */
export async function connectWallet(): Promise<string> {
  const { address } = await StellarWalletsKit.authModal()
  return address
}

/** Sign a transaction XDR with the connected wallet; returns signed XDR. */
export async function signTx(xdr: string, address: string): Promise<string> {
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    address,
    networkPassphrase: CONFIG.networkPassphrase,
  })
  return signedTxXdr
}

export { StellarWalletsKit as kit }

# Pamana — Demo Script

Target runtime **≤ 4 minutes**. Every step is live on Stellar Testnet. Record a backup video in advance (network insurance). Live app: **https://pamana-sigma.vercel.app**.

> Use a **short demo timeout** (e.g. 60s) when creating the demo vault so the "owner goes silent" moment fits on stage — not the 90-day default.

---

## Pre-stage setup (before you present)
- Two wallets ready: **Owner** and **Heir** (Freighter desktop, or LOBSTR/Freighter-mobile via WalletConnect on Android).
- Owner wallet funded with testnet XLM (Friendbot) + a second asset if showing multi-token.
- Backup demo video recorded and open in a tab.
- Optional: NFC claim card programmed (owner address) if demoing on Android.

---

## Step 1 — Vault setup (30s)
Owner opens Pamana → **Connect Wallet** → **Create My Vault** (pick the 60s demo timeout) → sign. A fresh isolated vault contract deploys just for this wallet.
Then **Deposit** — fund with XLM (and tap **Add token** → paste a second asset's SAC to show multi-token). Dashboard shows the balances and a green **"Alive"** status ring.

> Line: *"Every family gets their own vault — the factory just stamps out a new one. This one holds more than one asset."*

## Step 2 — Designate heirs (40s)
**Add Heirs** → paste two heir addresses, set **70% / 30%**. The total meter turns green only at exactly 100% — show it **reject a wrong split** live (e.g. 70/20 stays red, Save disabled). Save → sign.
*(Optional trust-fund:* set a release schedule on one heir — 50% now, 50% in a year.*)*

> Line: *"Shares are basis points on-chain. It won't let me save unless they sum to 100%."*

## Step 3 — Check-in (15s)
Tap **"I'm Alive"** → sign. Heartbeat resets on-chain; status shows **"Next check-in in 60 days"** (or seconds, on the demo timeout). Point at the tx on Stellar Expert.

> Line: *"This is the proof-of-life. As long as I check in, nothing happens."*

## Step 4 — The event (20s)
Stop checking in. Wait out the demo timeout (~60s — cut to the backup video here if you don't want dead air). Status flips to amber: **"Inheritance Unlocked."** The contract is now in permissionless distribution.

> Line: *"I've gone silent. No one pressed a button — time did this. The vault is now open to my heirs."*

## Step 5 — Heir claims (45s)
Switch to the **Heir** wallet → **Claim** → enter the owner's address (or **tap the NFC card** on Android → opens prefilled). App shows the heir's share per token.
Heir taps **Claim** on each token → sign → funds land. (For a non-native asset, the app shows **Add trustline** first — one tap, then Claim.) Second heir claims independently — different amounts, separate transactions, both visible in the explorer.

> Line: *"The heir claims directly from the contract. No approval from me, no company, no court. Each token, each heir, independent."*

## Step 6 — PHP off-ramp (30s)
Heir taps **Cash out to pesos** → enter amount → app pulls a **live PDAX rate** and shows the quote (e.g. *350 USDC ≈ ₱20,300*). Pick **GCash** → enter destination → **Withdraw** → receipt with gross / fee / net + reference.

> Line: *"Inherited crypto becomes pesos through PDAX — a BSP-licensed exchange. Real rate, real rails."*
> (UAT note: if the payout returns `simulated`, say so — the rate and flow are real; UAT settlement is mock.)

## Step 7 — The mic-drop (15s)
> *"Watch this — I'll turn off our backend."* [kill the server / show it's down]
> *"Re-run the heir's claim."* [claim still executes — it never touched our server]
> **"The blockchain is the executor. Vaulnox needs a Wyoming LLC to honor this. Pamana needs nothing but the ledger."**

---

## Cut list (if over time)
Drop in this order: trust-fund schedule → NFC (use manual address entry) → multi-token second asset → off-ramp execution (show rate only). **Never cut:** create vault → set heirs → timeout → heir claim → mic-drop.

## What's roadmap (say honestly if asked)
RWA asset card, Sentinel monitor, passkey smart-wallet, PHP on-ramp, cross-chain assets — shown as vision in the UI, labeled Roadmap. Reason for RWA/cross-chain staying roadmap: they'd need a legal/oracle/bridge layer that could reintroduce a custodian, which contradicts the trustless thesis.

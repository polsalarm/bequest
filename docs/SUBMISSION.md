# Pamana — Hackathon Submission Answers

Draft answers for the Rise In × Stellar APAC Hackathon 2026 form. Pulled from `Pamana-Full-Document.md` §2 and updated to what's actually live. Deadline **2026-07-15**.

- **Project:** Pamana — *Your pamana moves on its own.*
- **Live app:** https://pamana-sigma.vercel.app
- **Repo:** https://github.com/polsalarm/pamana
- **Network:** Stellar Testnet · Factory `CANQJ6N5BNPYY5CZWGRY7QTZKAY7IAIMSI7RPRNJZP564DROBWOG5PQM`

---

## Track
**Local Finance & Real World Access.** Pamana's thesis is real-world access word-for-word: bypassing courts, banks, and lawyers at death. Every pillar — OFW families, informal earners, PHP off-ramp via PDAX, NFC for non-crypto-native heirs — is a local-finance / real-world-access story, not a payments-velocity or DeFi-composability one.

## Problem
When a Filipino crypto holder dies or becomes incapacitated, their self-custodied assets are lost permanently. No seed-phrase recovery, no probate for private keys, no legal mechanism that reaches a wallet the way it freezes a bank account. Hits hardest in families with no estate-planning culture, no lawyer access, and OFW/informal-earner members. Existing "crypto inheritance" products reintroduce a custodian (off-chain company + foreign legal entity) — the inheritance only fires if that company survives and cooperates.

## Solution
A self-custody Stellar wallet with inheritance enforced entirely on-chain by a Soroban proof-of-life vault. The owner periodically calls `check_in()` to prove they're alive, resetting a countdown. If they go silent past the timeout, designated heirs claim their basis-point share directly from the contract — no company, court, or lawyer at any step. Layers on top: native multisig social recovery, an NFC claim card for non-crypto heirs, time-locked trust-fund release, multi-heir BPS splits, multi-token vaults, and a real PDAX PHP off-ramp.

**Core claim:** if our app, our company, and all our servers disappear, your family still inherits — because the Stellar ledger is the executor.

## Target users
OFWs sending remittances into crypto; informal earners (sari-sari owners, market vendors, tricycle drivers) with no estate-planning access; first-generation crypto holders whose families don't know what a seed phrase is; and **heirs** — the explicit design target, someone who has never touched a wallet, claiming with a tap.

## Stellar integration
- **Soroban smart contracts** — factory + heartbeat vault; BPS splits, pull-based per-token claims, `TotalLocked` snapshot, TTL management.
- **Stellar Asset Contract (SAC / SEP-41)** — vaults hold and distribute any Stellar asset (XLM, USDC, custom tokens).
- **Native multisig / weighted signers** — guardian-based social recovery at the protocol layer (`setOptions`).
- **Deployer/factory pattern** — one isolated vault contract per family.
- **Horizon + Soroban RPC** — reads, balances, classic recovery txns.
- **PDAX (anchor-style rails)** — PHP off-ramp for the last mile.

## Why Stellar
The inheritance trigger must be trustless — which points at Stellar's native primitives. Claimable balances with time predicates are a built-in dead-man's-switch other chains simulate with custom logic. Native multisig gives social recovery without bolting on MPC. Soroban does percentage splits + pull-based claims on a ledger built for fast, cheap, predictable settlement — which matters when a grieving heir is trying to claim. Low fees + fast finality matter for the off-ramp. Stellar's anchor/compliance design is built for real-world fiat rails — matching Pamana's actual job: get money from a deceased person's wallet into a living family's pocket, in pesos.

## What's built (live on Testnet)
- ✅ Soroban **factory + multi-token vault**, 28 unit tests, deployed to Testnet; full inheritance flow verified live (deposit → set heirs → timeout → per-token claim).
- ✅ **Multi-token** — a vault holds any number of Stellar assets; heirs inherit their share of each independently. Add-your-own-token by pasting a SAC address; trustline UX for custom assets.
- ✅ **Multi-heir BPS splits** with live 100% validator; **trust-fund release schedules**.
- ✅ **Social recovery** — native multisig guardian add/remove.
- ✅ **NFC tap-to-claim** (Android Chrome, feature-detected) + deep-link claim.
- ✅ **PDAX PHP off-ramp** — live rate proxy + cash-out UI (serverless, keys server-side); withdrawal execution with honest simulated fallback on UAT.
- ✅ Mobile-first installable PWA, multi-wallet (Freighter / LOBSTR / WalletConnect).

## Roadmap (honest)
Passkey smart-wallets, PHP on-ramp, RWA asset card, Sentinel monitor, NFC secure-element signing, **cross-chain assets**. Shown as vision in the UI, labeled Roadmap — RWA/cross-chain stay roadmap because they'd need a legal/oracle/bridge layer that could reintroduce a custodian.

## Team
Paul Henry Dacalan — Project Lead / Developer · Stellar Ambassador PH · FEU Institute of Technology.

## Links
- Live app: https://pamana-sigma.vercel.app
- Repo: https://github.com/polsalarm/pamana
- Factory (Stellar Expert): https://stellar.expert/explorer/testnet/contract/CANQJ6N5BNPYY5CZWGRY7QTZKAY7IAIMSI7RPRNJZP564DROBWOG5PQM
- Demo video: _TBD_
- Pitch deck: _TBD_

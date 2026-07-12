# Pamana Pitch Deck Draft

Use this as the slide source for Canva, Google Slides, or PowerPoint. Keep the deck to 8-10 slides and let the live demo do the proof.

## Slide 1 - Pamana
**Headline:** Your pamana moves on its own.

**Subtitle:** Trustless on-chain inheritance for Filipino families, built on Stellar.

**Footer:** Rise In x Stellar APAC Hackathon 2026 - Local Finance & Real World Access

**Visual:** Pamana logo, live app screenshot, Stellar Testnet badge.

## Slide 2 - The Problem
**Headline:** Crypto inheritance fails at the exact moment families need it.

**Bullets:**
- When a self-custodied holder dies, private keys often die with them.
- Probate courts and banks cannot recover a seed phrase.
- Custodial inheritance products only work if a company survives and cooperates.
- Filipino OFW and informal-earner families are least likely to have lawyers or formal estate plans.

**Speaker note:** Frame this as a family-protection problem, not a DeFi yield problem.

## Slide 3 - Target Users
**Headline:** Built for the owner and the heir.

**Bullets:**
- Owners: OFWs, first-generation crypto holders, informal earners.
- Heirs: non-crypto-native family members who should not need a seed phrase.
- Local need: move inherited value into Philippine rails, including pesos.

**Visual:** Three user cards: Owner, Heir, Local payout.

## Slide 4 - The Solution
**Headline:** A proof-of-life vault that executes inheritance on-chain.

**Flow:**
1. Owner creates a personal vault.
2. Owner deposits Stellar assets and designates heirs.
3. Owner checks in before the timeout.
4. If the owner goes silent, heirs claim directly from the contract.

**Speaker line:** No company, court, lawyer, or backend approval is needed for the claim.

## Slide 5 - Live Demo Story
**Headline:** Four minutes, end to end.

**Demo beats:**
- Create vault.
- Deposit XLM or another Stellar asset.
- Set heirs with a 70/30 split.
- Let the timeout expire.
- Heir claims.
- Show PDAX peso quote.
- Kill the backend and claim still works.

**Visual:** Use the sequence from `docs/DEMO_SCRIPT.md`.

## Slide 6 - Why Stellar
**Headline:** Stellar gives inheritance the right primitives.

**Bullets:**
- Soroban for programmable vault logic.
- Stellar Asset Contract support for XLM, USDC, and other Stellar assets.
- Native multisig for social recovery.
- Low fees and fast finality for family-scale claims.
- Anchor-style ecosystem fit for PHP off-ramp rails.

**Proof point:** Factory contract on Testnet: `CANQJ6N5BNPYY5CZWGRY7QTZKAY7IAIMSI7RPRNJZP564DROBWOG5PQM`

## Slide 7 - What Is Built
**Headline:** Live on Testnet.

**Bullets:**
- Factory plus isolated per-family vault contracts.
- Multi-heir BPS splits with TotalLocked snapshot protection.
- Multi-token inheritance.
- Scheduled release support.
- NFC tap-to-claim deep links.
- Native multisig guardian recovery.
- PDAX off-ramp quote and cash-out UI with server-side credentials.

**Verification:** 28 contract tests pass; frontend production build passes.

## Slide 8 - Trustless Mic-Drop
**Headline:** If Pamana disappears, the inheritance still works.

**Bullets:**
- The backend is only for convenience features like PDAX proxying.
- The heir claim is a direct Soroban contract call.
- Killing the server does not stop inheritance.

**Speaker line:** The blockchain is the executor.

## Slide 9 - Roadmap
**Headline:** Honest roadmap, clearly labeled.

**Bullets:**
- Passkey smart accounts for heirs.
- PHP on-ramp for vault funding.
- Sentinel monitoring.
- RWA asset cards with legal/oracle support.
- Cross-chain assets through a bridge or wrapped-asset layer.
- NFC secure-element signing.

**Speaker note:** Keep RWA and cross-chain explicitly out of the shipped core because they need extra trust assumptions.

## Slide 10 - Ask / Close
**Headline:** Make inheritance a property of the asset itself.

**Bullets:**
- Ship a Filipino-first self-custody inheritance flow.
- Validate with OFW and family users.
- Harden contracts and passkey UX after the hackathon.
- Move from Testnet demo to audited Mainnet pilot.

**Links:**
- Live app: https://pamana-sigma.vercel.app
- Repo: https://github.com/polsalarm/pamana
- Submission draft: `docs/SUBMISSION.md`
- Demo script: `docs/DEMO_SCRIPT.md`
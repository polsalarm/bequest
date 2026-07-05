# Pamana — Phase Log

Living record of what changed each phase: contract IDs, deploy links, keys (public only), test results, key decisions. **Updated at the end of every phase.** Plan lives in [`BUILD_PLAN.md`](BUILD_PLAN.md); this is the as-built log.

> 🔐 **Secrets rule:** only **public** keys / addresses / contract IDs go here. Secret keys live in `~/.config/stellar/` and env files — never in this doc or the repo.

---

## Quick reference (latest)

| Item | Value |
|------|-------|
| Current phase | ✅ Phases 0–3 done → ▶ Phase 4 next (factory + deploy) |
| Network | Stellar Testnet (`Test SDF Network ; September 2015`) |
| Deployer identity | `pamana-testnet` → `GDVWTEQQHWWPB7BHGVZDNZQGNWNB4EDLOKTHHNW2AXLI7JBC6SRJM4X3` |
| Factory contract ID | TBD (Phase 4) |
| Vault contract ID(s) | TBD (Phase 4) |
| Vault wasm hash | `32c5a1599ac5b0eb7e1b014ebe3e28b51f7704891af2a6fb94f5ea0393078f0f` |
| USDC SAC (testnet) | TBD (Phase 4) |
| Live app URL | TBD |
| soroban-sdk | 22.x · target `wasm32v1-none` · stellar-cli 25.2.0 |

---

## Phase 0 — Tooling & scaffold ✅
**Date:** 2026-07-06 · **Status:** Complete

### Changes
- `contracts/` converted to a cargo **workspace** — root `Cargo.toml` (release profile tuned for small wasm) with members `pamana-vault` + `pamana-factory`.
- `pamana-vault` + `pamana-factory` = minimal `version() -> 0` skeletons that compile clean. Old PalengkePay payment template code + stale test snapshots removed.
- `frontend/` scaffolded: Vite 6 + React 19 + TypeScript 5 + Tailwind v4 (`@tailwindcss/vite`). `main.tsx`, `App.tsx` (landing placeholder), `.env.example`.
- `.gitignore` extended (`*.tsbuildinfo`). Lockfiles committed.
- Toolchain + identity documented in [`contract-deployment.md`](contract-deployment.md).

### Toolchain (verified)
| Tool | Version |
|------|---------|
| Node.js | 24.14.1 |
| Rust / cargo | 1.94.1 |
| stellar-cli | 25.2.0 |
| Build target | `wasm32v1-none` |
| soroban-sdk | 22.x |

### Build artifacts (wasm hashes)
| Contract | Wasm hash |
|----------|-----------|
| pamana_vault.wasm | `9c6492048f8310aeac1078c5bbc61449e2ff599dd3a5ad721b9b16cc544ae433` |
| pamana_factory.wasm | `14fde08027676c63c11e04751ecc421ad97d2fcc8ff07c61f00daa4904443254` |

### Keys / identities
| Alias | Address | Notes |
|-------|---------|-------|
| `pamana-testnet` | `GDVWTEQQHWWPB7BHGVZDNZQGNWNB4EDLOKTHHNW2AXLI7JBC6SRJM4X3` | Funded via Friendbot. Secret in `~/.config/stellar/`. |

### Tests
| Suite | Result |
|-------|--------|
| `cargo build` / `stellar contract build` | ✅ both crates → wasm |
| `npm run build` (frontend) | ✅ clean (196 kB / 61 kB gz) |

### Success criteria — all met ✅
- [x] Both contracts compile to wasm
- [x] Frontend builds / dev-serves
- [x] Funded Testnet account exists
- [x] SDK pinned + documented

---

## Phase 1 — Vault core: heartbeat + single-heir claim ✅
**Date:** 2026-07-06 · **Status:** Complete

### Changes
- `pamana-vault` implemented: `types.rs` (Heir, VaultStatus, DataKey, Error enum) + full `lib.rs`.
- Persistent storage with TTL bump on every mutation (§5.2 archival guard); permissionless `bump()` keepalive.
- Vault wasm: 10 516 bytes, **13 exported functions**.

### Contract functions added
`init` · `deposit` · `check_in` · `set_heirs` · `claim` · `withdraw` · `bump` · views (`get_status`, `get_heirs`, `get_owner`, `get_heartbeat`, `get_timeout`)

### Tests (part of the 16-test suite)
| Test | Result |
|------|--------|
| init sets owner + Alive status | ✅ |
| double init fails | ✅ |
| deposit moves funds into vault | ✅ |
| deposit zero rejected | ✅ |
| claim before timeout rejected | ✅ |
| check_in resets countdown | ✅ |
| single heir claims full balance | ✅ |
| double-claim (single heir) rejected | ✅ |
| withdraw returns funds to owner | ✅ |

### Success criteria — all met ✅
- [x] Unit tests green (deposit, timeout gate, single-heir payout)

---

## Phase 2 — Multi-heir BPS + TotalLocked snapshot ✅
**Date:** 2026-07-06 · **Status:** Complete

> Built together with Phase 1 — the `TotalLocked` snapshot lives inside the `claim` path and cannot be cleanly separated. ⚠ highest-risk logic (§5.1).

### Changes
- `set_heirs` validates `sum(bps) == 10_000` and rejects otherwise; empty list rejected.
- Pull-based independent claims; `claim` snapshots the full balance into `TotalLocked` on the **first** claim and pins `Distributing = true`; later heirs compute against the snapshot, never the shrinking live balance.
- Double-claim guard per heir (`claimed` flag).

### Tests
| Test | Result |
|------|--------|
| bps sum ≠ 10000 rejected | ✅ |
| empty heir list rejected | ✅ |
| 7000/3000 correct, order A→B | ✅ (700 / 300) |
| 7000/3000 correct, order B→A | ✅ (700 / 300) |
| snapshot immutable after first claim | ✅ |
| unknown claimant rejected | ✅ |
| withdraw blocked after distribution starts | ✅ |

**Full suite: `cargo test -p pamana-vault` → 16 passed, 0 failed.**

### Success criteria — all met ✅
- [x] 7000/3000 heirs correct in either claim order
- [x] bps≠10000 rejected
- [x] double-claim rejected
- [x] snapshot immutable after first claim

---

## Phase 3 — Schedule + bump + withdraw ✅
**Date:** 2026-07-06 · **Status:** Complete

> `bump` + `withdraw` already shipped in Phase 1; Phase 3 delivers the trust-fund release schedule.

### Changes
- `ReleaseSlot { unlock_time, bps, claimed }` type + `DataKey::Schedule(Address)`.
- `set_schedule(heir_addr, slots)` — owner-only; rejects unknown heir + slot bps sum ≠ 10 000.
- `claim` is now schedule-aware: a scheduled heir releases **one matured tranche per call** (`NothingMatured` until `unlock_time`); heir marked fully `claimed` only when every slot is drained. Lump-sum heirs unchanged.
- `get_schedule` view. Vault wasm now 13 562 bytes, **15 exported functions**.

### Tests
| Test | Result |
|------|--------|
| set_schedule rejects unknown heir | ✅ |
| set_schedule rejects bad bps sum | ✅ |
| scheduled heir releases in tranches (300 → 600), premature = NothingMatured | ✅ |
| drained schedule → AlreadyClaimed; lump-sum heir unaffected (400) | ✅ |
| schedule stored + readable | ✅ |

**Full suite: `cargo test -p pamana-vault` → 20 passed, 0 failed.**

### Success criteria — all met ✅
- [x] Full vault suite green
- [x] mature tranche claimable / immature rejected (`NothingMatured`)
- [x] withdraw blocked after first claim (Phase 2)

---

## Phase 4 — Factory + Testnet deploy ⬜
**Date:** — · **Status:** Not started

### Deploys / IDs (fill on deploy)
| Contract | Testnet ID | Explorer |
|----------|-----------|----------|
| PamanaFactory | TBD | — |
| PamanaVault | TBD | — |

### Success criteria
- [ ] Factory deploys a working vault in one call
- [ ] Two owners → two isolated vaults
- [ ] CLI end-to-end (create→deposit→check_in→claim) passes on Testnet
- [ ] Contract IDs recorded here + in `.env.example`

---

## Phase 5 — Frontend foundation ⬜
**Date:** — · **Status:** Not started

### Success criteria
- [ ] Owner connects wallet, creates vault, deposits USDC
- [ ] Status light + countdown live
- [ ] check_in updates on-chain heartbeat (verified in Stellar Expert)

---

## Phase 6 — Heir designation + claim flow ⬜
**Date:** — · **Status:** Not started

### Success criteria
- [ ] Full flow on Testnet with 5-min demo timeout
- [ ] Two heirs claim independently, correct amounts

---

## Phase 7 — Passkey heir path + NFC + recovery ⬜
**Date:** — · **Status:** Not started

### Success criteria
- [ ] Heir claims via passkey (no seed phrase)
- [ ] NFC tap on Android triggers claim
- [ ] Multisig guardian designation UI (stretch)

---

## Phase 8 — PDAX on- & off-ramp ⬜
**Date:** — · **Status:** Not started

### Keys / config (public only)
- _PDAX integration notes, rate fallback, payout methods_

### Success criteria
- [ ] Live PHP rate + timestamp both directions
- [ ] On-ramp funds a vault with USDC from PHP
- [ ] Off-ramp executes withdrawal
- [ ] Keys server-side only

---

## Phase 9 — Stubs, polish, demo, submission ⬜
**Date:** — · **Status:** Not started

### Deliverables
- [ ] RWA card + Sentinel light stubs
- [ ] Demo ≤4 min + backup video
- [ ] Pitch deck
- [ ] Submission form (from doc §2)
- [ ] Live app URL + demo links added to Quick reference

---

## Change history
| Date | Phase | Summary |
|------|-------|---------|
| 2026-07-06 | 0 | Workspace + frontend scaffold, funded testnet identity, toolchain pinned |
| 2026-07-06 | 1 | Vault core: init/deposit/check_in/set_heirs/claim/withdraw/bump + views |
| 2026-07-06 | 2 | Multi-heir BPS validation + TotalLocked snapshot; 16/16 tests green |
| 2026-07-06 | 3 | Trust-fund release schedule (ReleaseSlot, tranches); 20/20 tests green |

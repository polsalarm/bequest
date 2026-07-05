# Contract Deployment & Toolchain

Deployment log + pinned toolchain for Pamana's Soroban contracts.

## Toolchain (verified Phase 0, 2026-07-06)

| Tool | Version |
|------|---------|
| Node.js | 24.x |
| Rust / cargo | 1.94.x |
| Build target | `wasm32v1-none` (stellar-cli default) |
| stellar-cli | 25.2.0 |
| soroban-sdk | 22.x (workspace-pinned in `contracts/Cargo.toml`) |

> SDK note: stellar-cli 25.2 builds against `wasm32v1-none` and pairs with `soroban-sdk` 22.x — the setup proven on PalengkePay Pro. Do not bump the SDK without re-verifying the CLI build.

## Build

```bash
cd contracts
cargo test --workspace     # unit tests
stellar contract build     # -> target/wasm32v1-none/release/*.wasm
```

Phase 0 build output (skeletons):
- `pamana_vault.wasm` — hash `9c6492048f8310aeac1078c5bbc61449e2ff599dd3a5ad721b9b16cc544ae433`
- `pamana_factory.wasm` — hash `14fde08027676c63c11e04751ecc421ad97d2fcc8ff07c61f00daa4904443254`

## Testnet identity

| Alias | Address |
|-------|---------|
| `pamana-testnet` | `GDVWTEQQHWWPB7BHGVZDNZQGNWNB4EDLOKTHHNW2AXLI7JBC6SRJM4X3` |

- Created + funded via Friendbot: `stellar keys generate pamana-testnet --network testnet --fund`
- Secret key lives in `~/.config/stellar/identity/pamana-testnet.toml` — **never committed**.
- Network passphrase: `Test SDF Network ; September 2015`.

## Deployed contract IDs

Populated in Phase 4 (factory + vault deploy).

| Contract | Testnet ID | Deployed |
|----------|-----------|----------|
| PamanaFactory | TBD | — |
| PamanaVault (per family) | TBD | — |

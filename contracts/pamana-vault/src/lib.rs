#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

/// Pamana inheritance vault.
///
/// Phase 0 skeleton — compiles clean. Real inheritance logic
/// (init / deposit / check_in / set_heirs / claim / bump / withdraw)
/// lands in Phase 1–3. See docs/BUILD_PLAN.md and Pamana-Full-Document.md §10.
#[contract]
pub struct PamanaVault;

#[contractimpl]
impl PamanaVault {
    /// Contract version marker. Placeholder until Phase 1.
    pub fn version(_env: Env) -> u32 {
        0
    }
}

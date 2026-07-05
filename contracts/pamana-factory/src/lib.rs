#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

/// Pamana vault factory.
///
/// Phase 0 skeleton — compiles clean. Deploys one isolated PamanaVault
/// per family and keeps an owner → vault registry. Real deployer + registry
/// logic lands in Phase 4. See docs/BUILD_PLAN.md.
#[contract]
pub struct PamanaFactory;

#[contractimpl]
impl PamanaFactory {
    /// Contract version marker. Placeholder until Phase 4.
    pub fn version(_env: Env) -> u32 {
        0
    }
}

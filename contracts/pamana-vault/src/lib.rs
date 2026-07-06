#![no_std]

//! Pamana inheritance vault (multi-token).
//!
//! A Soroban proof-of-life vault. The owner deposits one or more tokens and
//! periodically calls `check_in` to reset a countdown. If the owner goes silent
//! past `timeout`, designated heirs claim their basis-point share of **each**
//! token directly — no company, court, or lawyer in the loop.
//!
//! Each heir's `bps` share applies to every token the vault holds. Claims are
//! per (token, heir): the total for a token is snapshotted at that token's
//! first claim (§5.1), so later heirs are never shortchanged by a shrinking
//! live balance. See `Pamana-Full-Document.md` §4–6.

pub mod types;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, token, Address, Env, Vec};
use types::{DataKey, Error, Heir, ReleaseSlot, VaultStatus};

/// Total basis points = 100%.
const BPS_DENOM: u32 = 10_000;

// Persistent-entry TTL management (§5.2 — archival gotcha).
const BUMP_THRESHOLD: u32 = 100_000; // ~7 days of ledgers
const BUMP_AMOUNT: u32 = 2_000_000; // ~115 days of ledgers

#[contract]
pub struct PamanaVault;

#[contractimpl]
impl PamanaVault {
    /// Initialize the vault. One-time. Owner must authorize. Tokens are added
    /// implicitly on first deposit — no token is fixed at init.
    pub fn init(env: Env, owner: Address, timeout: u64) -> Result<(), Error> {
        let store = env.storage().persistent();
        if store.has(&DataKey::Owner) {
            return Err(Error::AlreadyInitialized);
        }
        owner.require_auth();

        store.set(&DataKey::Owner, &owner);
        store.set(&DataKey::Timeout, &timeout);
        store.set(&DataKey::LastHeartbeat, &env.ledger().timestamp());
        store.set(&DataKey::Distributing, &false);
        store.set(&DataKey::Tokens, &Vec::<Address>::new(&env));

        bump_key(&env, &DataKey::Owner);
        bump_key(&env, &DataKey::Timeout);
        bump_key(&env, &DataKey::LastHeartbeat);
        bump_key(&env, &DataKey::Distributing);
        bump_key(&env, &DataKey::Tokens);
        Ok(())
    }

    /// Owner deposits `amount` of `token` into the vault. First deposit of a
    /// token registers it in the vault's token set.
    pub fn deposit(env: Env, token: Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let store = env.storage().persistent();
        let owner: Address = store.get(&DataKey::Owner).ok_or(Error::NotInitialized)?;
        owner.require_auth();

        token::Client::new(&env, &token).transfer(
            &owner,
            &env.current_contract_address(),
            &amount,
        );
        register_token(&env, &token);
        Ok(())
    }

    /// Proof of life. Owner resets the countdown and bumps TTL past the timeout.
    pub fn check_in(env: Env) -> Result<(), Error> {
        let store = env.storage().persistent();
        let owner: Address = store.get(&DataKey::Owner).ok_or(Error::NotInitialized)?;
        owner.require_auth();
        store.set(&DataKey::LastHeartbeat, &env.ledger().timestamp());
        bump_key(&env, &DataKey::LastHeartbeat);
        Ok(())
    }

    /// Designate heirs. Their `bps` must sum to exactly 10_000. Owner-only.
    /// A single heir is just a list of length one. Shares apply to all tokens.
    pub fn set_heirs(env: Env, heirs: Vec<Heir>) -> Result<(), Error> {
        let store = env.storage().persistent();
        let owner: Address = store.get(&DataKey::Owner).ok_or(Error::NotInitialized)?;
        owner.require_auth();

        if heirs.is_empty() {
            return Err(Error::NoHeirs);
        }
        let mut sum: u32 = 0;
        for h in heirs.iter() {
            sum += h.bps;
        }
        if sum != BPS_DENOM {
            return Err(Error::InvalidBps);
        }

        store.set(&DataKey::Heirs, &heirs);
        bump_key(&env, &DataKey::Heirs);
        Ok(())
    }

    /// Set a trust-fund release schedule for one heir (§4.5). Slot `bps` must
    /// sum to exactly 10_000. Owner-only. Applies per token independently.
    pub fn set_schedule(
        env: Env,
        heir_addr: Address,
        slots: Vec<ReleaseSlot>,
    ) -> Result<(), Error> {
        let store = env.storage().persistent();
        let owner: Address = store.get(&DataKey::Owner).ok_or(Error::NotInitialized)?;
        owner.require_auth();

        let heirs: Vec<Heir> = store.get(&DataKey::Heirs).ok_or(Error::NoHeirs)?;
        if !heirs.iter().any(|h| h.addr == heir_addr) {
            return Err(Error::HeirNotFound);
        }
        if slots.is_empty() {
            return Err(Error::InvalidBps);
        }
        let mut sum: u32 = 0;
        for s in slots.iter() {
            sum += s.bps;
        }
        if sum != BPS_DENOM {
            return Err(Error::InvalidBps);
        }

        let key = DataKey::Schedule(heir_addr);
        store.set(&key, &slots);
        bump_key(&env, &key);
        Ok(())
    }

    /// An heir claims their share of `token`. Permissionless once the owner has
    /// timed out. On the first claim of a token its balance is snapshotted into
    /// `TotalLocked(token)` (§5.1) so later heirs compute against the same base.
    pub fn claim(env: Env, token: Address, heir_addr: Address) -> Result<(), Error> {
        let store = env.storage().persistent();

        let heartbeat: u64 = store
            .get(&DataKey::LastHeartbeat)
            .ok_or(Error::NotInitialized)?;
        let timeout: u64 = store.get(&DataKey::Timeout).unwrap();
        if env.ledger().timestamp() <= heartbeat + timeout {
            return Err(Error::OwnerStillActive);
        }

        // Token must have been deposited.
        let tokens: Vec<Address> = store.get(&DataKey::Tokens).unwrap_or(Vec::new(&env));
        if !tokens.iter().any(|t| t == token) {
            return Err(Error::TokenNotFound);
        }

        let heirs: Vec<Heir> = store.get(&DataKey::Heirs).ok_or(Error::NoHeirs)?;
        let heir = heirs
            .iter()
            .find(|h| h.addr == heir_addr)
            .ok_or(Error::HeirNotFound)?;

        let client = token::Client::new(&env, &token);

        // Snapshot this token's total on its first claim; flag distribution.
        let locked_key = DataKey::TotalLocked(token.clone());
        let total: i128 = if store.has(&locked_key) {
            store.get(&locked_key).unwrap()
        } else {
            let balance = client.balance(&env.current_contract_address());
            store.set(&locked_key, &balance);
            bump_key(&env, &locked_key);
            if !store.get(&DataKey::Distributing).unwrap_or(false) {
                store.set(&DataKey::Distributing, &true);
                bump_key(&env, &DataKey::Distributing);
            }
            balance
        };

        let heir_share = total * heir.bps as i128 / BPS_DENOM as i128;

        let schedule_key = DataKey::Schedule(heir_addr.clone());
        let amount: i128 = if store.has(&schedule_key) {
            // Trust-fund mode: release the next matured tranche for this token.
            let slots: Vec<ReleaseSlot> = store.get(&schedule_key).unwrap();
            let claimed_key = DataKey::SlotClaimed(token.clone(), heir_addr.clone());
            let mut claimed: Vec<bool> = store.get(&claimed_key).unwrap_or_else(|| {
                let mut v = Vec::new(&env);
                for _ in 0..slots.len() {
                    v.push_back(false);
                }
                v
            });

            let now = env.ledger().timestamp();
            let mut slot_idx: Option<u32> = None;
            for (i, s) in slots.iter().enumerate() {
                if !claimed.get(i as u32).unwrap() && now >= s.unlock_time {
                    slot_idx = Some(i as u32);
                    break;
                }
            }
            let si = slot_idx.ok_or(Error::NothingMatured)?;
            let slot = slots.get(si).unwrap();
            let tranche = heir_share * slot.bps as i128 / BPS_DENOM as i128;

            claimed.set(si, true);
            store.set(&claimed_key, &claimed);
            bump_key(&env, &claimed_key);
            tranche
        } else {
            // Lump-sum: whole share of this token, once.
            let claimed_key = DataKey::Claimed(token.clone(), heir_addr.clone());
            if store.get(&claimed_key).unwrap_or(false) {
                return Err(Error::AlreadyClaimed);
            }
            store.set(&claimed_key, &true);
            bump_key(&env, &claimed_key);
            heir_share
        };

        client.transfer(&env.current_contract_address(), &heir_addr, &amount);
        Ok(())
    }

    /// Permissionless TTL keepalive (§5.2). Anyone can call.
    pub fn bump(env: Env) {
        bump_key(&env, &DataKey::LastHeartbeat);
        bump_key(&env, &DataKey::Heirs);
        bump_key(&env, &DataKey::Tokens);
    }

    /// Owner reclaims `amount` of `token`. Blocked once distribution has begun.
    pub fn withdraw(env: Env, token: Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let store = env.storage().persistent();
        let owner: Address = store.get(&DataKey::Owner).ok_or(Error::NotInitialized)?;
        owner.require_auth();
        if store.get(&DataKey::Distributing).unwrap_or(false) {
            return Err(Error::Distributing);
        }
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &owner,
            &amount,
        );
        Ok(())
    }

    // ── Views ──────────────────────────────────────────────────────────

    pub fn get_status(env: Env) -> VaultStatus {
        let store = env.storage().persistent();
        if store.get(&DataKey::Distributing).unwrap_or(false) {
            return VaultStatus::Distributing;
        }
        let heartbeat: u64 = store.get(&DataKey::LastHeartbeat).unwrap_or(0);
        let timeout: u64 = store.get(&DataKey::Timeout).unwrap_or(0);
        if env.ledger().timestamp() > heartbeat + timeout {
            VaultStatus::TimedOut
        } else {
            VaultStatus::Alive
        }
    }

    pub fn get_tokens(env: Env) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Tokens)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_heirs(env: Env) -> Vec<Heir> {
        env.storage()
            .persistent()
            .get(&DataKey::Heirs)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_schedule(env: Env, heir_addr: Address) -> Vec<ReleaseSlot> {
        env.storage()
            .persistent()
            .get(&DataKey::Schedule(heir_addr))
            .unwrap_or(Vec::new(&env))
    }

    /// Whether a lump-sum heir has claimed a given token.
    pub fn is_claimed(env: Env, token: Address, heir_addr: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Claimed(token, heir_addr))
            .unwrap_or(false)
    }

    pub fn get_owner(env: Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::Owner)
    }

    pub fn get_heartbeat(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::LastHeartbeat)
            .unwrap_or(0)
    }

    pub fn get_timeout(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Timeout)
            .unwrap_or(0)
    }
}

/// Add a token to the vault's token set if not already present.
fn register_token(env: &Env, token: &Address) {
    let store = env.storage().persistent();
    let mut tokens: Vec<Address> = store.get(&DataKey::Tokens).unwrap_or(Vec::new(env));
    if !tokens.iter().any(|t| &t == token) {
        tokens.push_back(token.clone());
        store.set(&DataKey::Tokens, &tokens);
        bump_key(env, &DataKey::Tokens);
    }
}

/// Bump a persistent entry's TTL if it exists.
fn bump_key(env: &Env, key: &DataKey) {
    let store = env.storage().persistent();
    if store.has(key) {
        store.extend_ttl(key, BUMP_THRESHOLD, BUMP_AMOUNT);
    }
}

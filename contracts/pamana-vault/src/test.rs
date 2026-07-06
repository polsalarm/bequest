#![cfg(test)]

use crate::types::{Error, Heir, ReleaseSlot, VaultStatus};
use crate::{PamanaVault, PamanaVaultClient};
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{token, vec, Address, Env, Vec};

const TIMEOUT: u64 = 300; // 5-minute demo timeout, in seconds

struct Setup<'a> {
    env: Env,
    owner: Address,
    vault: PamanaVaultClient<'a>,
    token: token::TokenClient<'a>,
    token_admin: token::StellarAssetClient<'a>,
    token_addr: Address,
}

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(owner.clone());
    let token_addr = sac.address();
    let token = token::TokenClient::new(&env, &token_addr);
    let token_admin = token::StellarAssetClient::new(&env, &token_addr);

    let vault_id = env.register(PamanaVault, ());
    let vault = PamanaVaultClient::new(&env, &vault_id);

    vault.init(&owner, &TIMEOUT);

    Setup {
        env,
        owner,
        vault,
        token,
        token_admin,
        token_addr,
    }
}

/// Register a second independent token against the same vault/owner.
fn second_token<'a>(
    s: &Setup<'a>,
) -> (Address, token::TokenClient<'a>, token::StellarAssetClient<'a>) {
    let sac = s.env.register_stellar_asset_contract_v2(s.owner.clone())
    ;
    let addr = sac.address();
    (
        addr.clone(),
        token::TokenClient::new(&s.env, &addr),
        token::StellarAssetClient::new(&s.env, &addr),
    )
}

fn heir(_env: &Env, addr: &Address, bps: u32) -> Heir {
    Heir {
        addr: addr.clone(),
        bps,
    }
}

fn advance_past_timeout(env: &Env) {
    env.ledger().with_mut(|l| {
        l.timestamp += TIMEOUT + 1;
    });
}

// ── Phase 1 — core ────────────────────────────────────────────────────

#[test]
fn init_sets_owner_and_alive_status() {
    let s = setup();
    assert_eq!(s.vault.get_owner(), Some(s.owner.clone()));
    assert_eq!(s.vault.get_timeout(), TIMEOUT);
    assert_eq!(s.vault.get_status(), VaultStatus::Alive);
    assert_eq!(s.vault.get_tokens().len(), 0);
}

#[test]
fn init_twice_fails() {
    let s = setup();
    let res = s.vault.try_init(&s.owner, &TIMEOUT);
    assert_eq!(res, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn deposit_moves_funds_and_registers_token() {
    let s = setup();
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &500);
    assert_eq!(s.token.balance(&s.vault.address), 500);
    assert_eq!(s.token.balance(&s.owner), 500);
    // Token now registered.
    let toks = s.vault.get_tokens();
    assert_eq!(toks.len(), 1);
    assert_eq!(toks.get(0).unwrap(), s.token_addr);
}

#[test]
fn deposit_zero_fails() {
    let s = setup();
    let res = s.vault.try_deposit(&s.token_addr, &0);
    assert_eq!(res, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn claim_before_timeout_fails() {
    let s = setup();
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    let res = s.vault.try_claim(&s.token_addr, &h);
    assert_eq!(res, Err(Ok(Error::OwnerStillActive)));
}

#[test]
fn check_in_resets_countdown() {
    let s = setup();
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    advance_past_timeout(&s.env);
    s.vault.check_in();
    assert_eq!(s.vault.get_status(), VaultStatus::Alive);

    let res = s.vault.try_claim(&s.token_addr, &h);
    assert_eq!(res, Err(Ok(Error::OwnerStillActive)));
}

#[test]
fn single_heir_claims_full_balance() {
    let s = setup();
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    advance_past_timeout(&s.env);
    assert_eq!(s.vault.get_status(), VaultStatus::TimedOut);
    s.vault.claim(&s.token_addr, &h);

    assert_eq!(s.token.balance(&h), 1_000);
    assert_eq!(s.token.balance(&s.vault.address), 0);
    assert_eq!(s.vault.get_status(), VaultStatus::Distributing);
    assert!(s.vault.is_claimed(&s.token_addr, &h));
}

#[test]
fn double_claim_single_heir_fails() {
    let s = setup();
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    advance_past_timeout(&s.env);
    s.vault.claim(&s.token_addr, &h);
    let res = s.vault.try_claim(&s.token_addr, &h);
    assert_eq!(res, Err(Ok(Error::AlreadyClaimed)));
}

#[test]
fn withdraw_returns_funds_to_owner() {
    let s = setup();
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.withdraw(&s.token_addr, &400);
    assert_eq!(s.token.balance(&s.owner), 400);
    assert_eq!(s.token.balance(&s.vault.address), 600);
}

// ── Phase 2 — multi-heir BPS + snapshot ───────────────────────────────

fn two_heirs(env: &Env, a: &Address, b: &Address) -> Vec<Heir> {
    vec![env, heir(env, a, 7_000), heir(env, b, 3_000)]
}

#[test]
fn set_heirs_rejects_wrong_bps_sum() {
    let s = setup();
    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    let bad = vec![&s.env, heir(&s.env, &a, 7_000), heir(&s.env, &b, 2_000)];
    let res = s.vault.try_set_heirs(&bad);
    assert_eq!(res, Err(Ok(Error::InvalidBps)));
}

#[test]
fn set_heirs_rejects_empty() {
    let s = setup();
    let empty: Vec<Heir> = Vec::new(&s.env);
    let res = s.vault.try_set_heirs(&empty);
    assert_eq!(res, Err(Ok(Error::NoHeirs)));
}

#[test]
fn two_heirs_split_correctly_in_order_a_then_b() {
    let s = setup();
    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&two_heirs(&s.env, &a, &b));

    advance_past_timeout(&s.env);
    s.vault.claim(&s.token_addr, &a);
    s.vault.claim(&s.token_addr, &b);

    assert_eq!(s.token.balance(&a), 700);
    assert_eq!(s.token.balance(&b), 300);
    assert_eq!(s.token.balance(&s.vault.address), 0);
}

#[test]
fn snapshot_is_immutable_after_first_claim() {
    let s = setup();
    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&two_heirs(&s.env, &a, &b));

    advance_past_timeout(&s.env);
    s.vault.claim(&s.token_addr, &a); // drops balance to 300, snapshot pinned at 1000
    s.vault.claim(&s.token_addr, &b);
    assert_eq!(s.token.balance(&b), 300);
}

#[test]
fn heir_not_found_fails() {
    let s = setup();
    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    let stranger = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&two_heirs(&s.env, &a, &b));

    advance_past_timeout(&s.env);
    let res = s.vault.try_claim(&s.token_addr, &stranger);
    assert_eq!(res, Err(Ok(Error::HeirNotFound)));
}

#[test]
fn withdraw_blocked_after_distribution_starts() {
    let s = setup();
    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.set_heirs(&two_heirs(&s.env, &a, &b));

    advance_past_timeout(&s.env);
    s.vault.claim(&s.token_addr, &a);
    let res = s.vault.try_withdraw(&s.token_addr, &100);
    assert_eq!(res, Err(Ok(Error::Distributing)));
}

// ── Phase 3 — trust-fund schedule ─────────────────────────────────────

fn slot(unlock_time: u64, bps: u32) -> ReleaseSlot {
    ReleaseSlot { unlock_time, bps }
}

fn set_time(env: &Env, ts: u64) {
    env.ledger().with_mut(|l| {
        l.timestamp = ts;
    });
}

#[test]
fn set_schedule_rejects_unknown_heir() {
    let s = setup();
    let a = Address::generate(&s.env);
    let stranger = Address::generate(&s.env);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &a, 10_000)]);
    let res = s
        .vault
        .try_set_schedule(&stranger, &vec![&s.env, slot(1_000, 10_000)]);
    assert_eq!(res, Err(Ok(Error::HeirNotFound)));
}

#[test]
fn set_schedule_rejects_bad_bps_sum() {
    let s = setup();
    let a = Address::generate(&s.env);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &a, 10_000)]);
    let res = s
        .vault
        .try_set_schedule(&a, &vec![&s.env, slot(1_000, 5_000), slot(2_000, 4_000)]);
    assert_eq!(res, Err(Ok(Error::InvalidBps)));
}

#[test]
fn scheduled_heir_releases_in_tranches() {
    let s = setup();
    let a = Address::generate(&s.env); // 60%, scheduled 50/50
    let b = Address::generate(&s.env); // 40%, lump sum
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault
        .set_heirs(&vec![&s.env, heir(&s.env, &a, 6_000), heir(&s.env, &b, 4_000)]);
    s.vault
        .set_schedule(&a, &vec![&s.env, slot(1_000, 5_000), slot(2_000, 5_000)]);

    set_time(&s.env, TIMEOUT + 1);
    let res = s.vault.try_claim(&s.token_addr, &a);
    assert_eq!(res, Err(Ok(Error::NothingMatured)));

    set_time(&s.env, 1_500);
    s.vault.claim(&s.token_addr, &a);
    assert_eq!(s.token.balance(&a), 300);

    let res = s.vault.try_claim(&s.token_addr, &a);
    assert_eq!(res, Err(Ok(Error::NothingMatured)));

    set_time(&s.env, 2_500);
    s.vault.claim(&s.token_addr, &a);
    assert_eq!(s.token.balance(&a), 600);

    // Lump-sum heir B: full 40% at once, same snapshot.
    s.vault.claim(&s.token_addr, &b);
    assert_eq!(s.token.balance(&b), 400);
    assert_eq!(s.token.balance(&s.vault.address), 0);
}

#[test]
fn schedule_stored_and_readable() {
    let s = setup();
    let a = Address::generate(&s.env);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &a, 10_000)]);
    s.vault
        .set_schedule(&a, &vec![&s.env, slot(1_000, 4_000), slot(2_000, 6_000)]);
    let sched = s.vault.get_schedule(&a);
    assert_eq!(sched.len(), 2);
    assert_eq!(sched.get(0).unwrap().bps, 4_000);
    assert_eq!(sched.get(1).unwrap().unlock_time, 2_000);
}

// ── Multi-token ───────────────────────────────────────────────────────

#[test]
fn two_tokens_tracked_independently() {
    let s = setup();
    let (addr2, tok2, admin2) = second_token(&s);
    s.token_admin.mint(&s.owner, &1_000);
    admin2.mint(&s.owner, &2_000);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.deposit(&addr2, &2_000);

    let toks = s.vault.get_tokens();
    assert_eq!(toks.len(), 2);

    let a = Address::generate(&s.env);
    let b = Address::generate(&s.env);
    s.vault.set_heirs(&two_heirs(&s.env, &a, &b)); // 70 / 30

    advance_past_timeout(&s.env);
    // Each heir claims their share of EACH token independently.
    s.vault.claim(&s.token_addr, &a);
    s.vault.claim(&addr2, &a);
    s.vault.claim(&s.token_addr, &b);
    s.vault.claim(&addr2, &b);

    assert_eq!(s.token.balance(&a), 700); // 70% of 1000
    assert_eq!(tok2.balance(&a), 1_400); // 70% of 2000
    assert_eq!(s.token.balance(&b), 300); // 30% of 1000
    assert_eq!(tok2.balance(&b), 600); // 30% of 2000
}

#[test]
fn claim_of_one_token_does_not_mark_other_claimed() {
    let s = setup();
    let (addr2, _tok2, admin2) = second_token(&s);
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    admin2.mint(&s.owner, &500);
    s.vault.deposit(&s.token_addr, &1_000);
    s.vault.deposit(&addr2, &500);
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    advance_past_timeout(&s.env);
    s.vault.claim(&s.token_addr, &h);
    assert!(s.vault.is_claimed(&s.token_addr, &h));
    assert!(!s.vault.is_claimed(&addr2, &h)); // second token still unclaimed
    // and it's still claimable
    s.vault.claim(&addr2, &h);
    assert!(s.vault.is_claimed(&addr2, &h));
}

#[test]
fn claim_unknown_token_fails() {
    let s = setup();
    let (addr2, _t, _a) = second_token(&s);
    let h = Address::generate(&s.env);
    s.token_admin.mint(&s.owner, &1_000);
    s.vault.deposit(&s.token_addr, &1_000); // only token 1 deposited
    s.vault.set_heirs(&vec![&s.env, heir(&s.env, &h, 10_000)]);

    advance_past_timeout(&s.env);
    let res = s.vault.try_claim(&addr2, &h);
    assert_eq!(res, Err(Ok(Error::TokenNotFound)));
}

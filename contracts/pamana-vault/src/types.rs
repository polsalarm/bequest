use soroban_sdk::{contracterror, contracttype, Address};

/// A designated heir with a basis-point share of the vault.
/// All heirs' `bps` must sum to exactly 10_000 (= 100%). The share applies to
/// **every** token the vault holds.
#[contracttype]
#[derive(Clone)]
pub struct Heir {
    pub addr: Address,
    pub bps: u32,
}

/// One tranche of a trust-fund release schedule for a single heir.
/// A heir's slots' `bps` sum to 10_000 (= 100% of that heir's allocation).
/// Slot claim state is tracked per token (see `DataKey::SlotClaimed`).
#[contracttype]
#[derive(Clone)]
pub struct ReleaseSlot {
    /// Ledger timestamp (seconds) after which this tranche is claimable.
    pub unlock_time: u64,
    /// Share of this heir's allocation released at this slot, in basis points.
    pub bps: u32,
}

/// High-level vault state, legible to a non-crypto UI.
#[contracttype]
#[derive(Clone, PartialEq, Eq, Debug)]
pub enum VaultStatus {
    /// Owner still checking in — countdown active.
    Alive,
    /// Timeout passed, no heir has claimed yet.
    TimedOut,
    /// First claim taken — distribution has begun.
    Distributing,
}

#[contracttype]
pub enum DataKey {
    Owner,
    LastHeartbeat,
    Timeout,
    Heirs,
    /// Vec<Address> — every token ever deposited into this vault.
    Tokens,
    /// i128 — snapshot of a token's balance at the first claim of that token.
    TotalLocked(Address),
    /// bool — distribution has begun (any token claimed). Gates withdraw.
    Distributing,
    /// bool — lump-sum heir has claimed a given token. Key: (token, heir).
    Claimed(Address, Address),
    /// Vec<ReleaseSlot> — per-heir trust-fund schedule.
    Schedule(Address),
    /// Vec<bool> — which schedule slots a heir has claimed for a token.
    /// Key: (token, heir), parallel to that heir's Schedule.
    SlotClaimed(Address, Address),
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    /// Heir bps do not sum to exactly 10_000.
    InvalidBps = 3,
    /// Owner is still active — timeout not reached.
    OwnerStillActive = 4,
    HeirNotFound = 5,
    AlreadyClaimed = 6,
    /// Deposit / withdraw amount must be positive.
    InvalidAmount = 7,
    /// Owner cannot withdraw once distribution has begun.
    Distributing = 8,
    /// No heirs designated yet.
    NoHeirs = 9,
    /// A schedule was set but no tranche has matured yet.
    NothingMatured = 10,
    /// This token has never been deposited into the vault.
    TokenNotFound = 11,
}

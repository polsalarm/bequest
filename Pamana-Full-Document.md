**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## 🪙 

## **PAMANA** 

Your pamana moves on its own. 

Trustless On-Chain Inheritance for Filipino Families 

Rise In × Stellar APAC Hackathon 2026 

Track: Local Finance & Real World Access Deadline: July 15, 2026  ·  Paul Henry Dacalan  ·  FEU Institute of Technology 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 1 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **1. Executive Summary** 

Pamana is a self-custody wallet on Stellar with on-chain inheritance enforced entirely by a Soroban smart contract — no company, no lawyer, and no legal trust required for the inheritance to fire. When a Filipino crypto holder dies or becomes incapacitated, their family receives their share automatically after a proof-oflife heartbeat expires. 

Unlike every existing 'crypto inheritance' product, Pamana does not reintroduce a custodian. Competitors build off-chain trust wrappers and foreign legal entities. Pamana builds the inheritance logic into the blockchain itself. If our app, our company, and our servers all disappear, the inheritance still executes — because the Stellar ledger is the executor. 

## **One-liner** 

_A Stellar self-custody wallet where your assets carry programmable, trustless inheritance — enforced onchain via Soroban, claimable in PHP via PDAX._ 

|**Pillar**|**What it does**|**Status**|
|---|---|---|
|Trustless Inheritance|Soroban heartbeat vault — heirs<br>claim afer tmeout|Build (Week 1)|
|Mult-Heir BPS Splits|Basis-point splits, pull-based,<br>independent claims|Build (Week 1)|
|Social Recovery|Natve Stellar multsig + SEP-30<br>guardians|Build (Week 2)|
|NFC Claim Card|Tapik-style NFC tap for non-crypto-<br>natve heirs|Build (Week 2)|
|Time-Locked Release|Trust-fund style scheduled<br>disbursement|Build (Week 2)|
|PDAX PHP Of-ramp|BSP-licensed PHP conversion +<br>withdrawal|Build (Week 3)|
|RWA Asset Card|Mock on-chain real-world asset<br>display|Stub (Roadmap)|
|Sentnel Monitor|24/7 anomaly detecton status light|Stub (Roadmap)|



Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 2 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **2. Hackathon Submission Fields** 

## **2.1 Track** 

## **Selected Track** 

_Local Finance & Real World Access_ 

Pamana's thesis is Real World Access word-for-word: bypassing courts, banks, and lawyers at death. Every pillar — OFW families, informal earners, PHP off-ramp via PDAX, NFC for non-crypto-native heirs — is a local finance and real-world-access story, not a payments-velocity or DeFi-composability story. 

## **2.2 Problem Statement** 

When a Filipino crypto holder dies or becomes incapacitated, their self-custodied assets are lost permanently. There is no seed phrase recovery process, no probate equivalent for private keys, and no legal mechanism that can reach into a wallet the way it can freeze a bank account. This hits hardest in families with no estate-planning culture, no lawyer access, and members who are OFWs or informal earners — exactly the people with the least financial cushion to absorb a total loss. 

Existing 'crypto inheritance' products solve this by reintroducing a custodian: an off-chain company, a foreign legal entity, or a key-share they hold. The inheritance only works if that company survives and chooses to cooperate. They rebuilt a bank with extra steps — which is why they hedge with 'better than a bank' rather than 'no bank at all.' 

## **2.3 Proposed Solution** 

Pamana is a self-custody wallet with inheritance enforced entirely on-chain via a Soroban proof-of-life smart contract. The owner periodically calls check_in() to prove they're alive, resetting a countdown. If they go silent past the timeout, designated heirs claim their share directly from the contract — no company, court, or lawyer involved at any step. 

Pamana adds five interlocking layers on top of the core contract: 

- Stellar-native social recovery (multisig guardians / SEP-30) for lost-key scenarios 

- An NFC card as a non-crypto-native claim path for heirs who have never touched a wallet 

- Optional time-locked release schedules for trust-fund style disbursement over years 

- Multi-heir basis-point splits with pull-based independent claims 

- Real PHP off-ramp through the BSP-licensed PDAX exchange so inherited crypto becomes usable money 

## **Core claim** 

_If our app, our company, and all our servers disappear, your family still inherits. The Stellar ledger is the executor. No competitor with an off-chain trust model can make that claim._ 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 3 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **2.4 Target Users / Audience** 

- OFWs sending remittances into crypto whose families are in the Philippines 

- Informal earners (sari-sari owners, market vendors, tricycle drivers) with no estate-planning access 

- First-generation crypto holders whose families don't know what a seed phrase is 

- Heirs — the explicit design target: someone who has never touched a wallet needs to claim with a tap, not a 24-word phrase 

## **2.5 Expected Stellar Integration** 

- Soroban smart contracts — heartbeat vault, BPS splits, pull-based claims, TTL management 

- Native Stellar multisig / weighted signers — guardian-based social recovery at the protocol level 

- SEP-30 recoverysigner — seedless key recovery without MPC infrastructure 

- Stellar Asset Contract (SAC) — USDC custody and transfer within the vault 

- Claimable balances with time predicates — native fallback dead-man's switch if Soroban is delayed 

- Anchor rails (SEP-24/-6 pattern) — conceptually mirrored by PDAX for PHP last-mile off-ramp 

## **2.6 Why Stellar Specifically** 

Pamana's thesis depends on the inheritance trigger being trustless — and that requirement points straight at Stellar's native primitives. 

- Claimable balances with time predicates are a native Stellar primitive other ecosystems have to simulate with custom contract logic — a built-in dead-man's switch other chains can't match 

- Native multisig / weighted signers give social recovery without bolting on MPC infrastructure — recovery logic lives at the protocol layer, not a company backend 

- Soroban enables percentage splits and pull-based claims while settling on a ledger built for fast, cheap, predictable transactions — critical when a grieving heir is trying to claim funds 

- Low fees and fast finality matter specifically for the off-ramp: an heir converting inheritance to PHP shouldn't lose meaningful value to network costs 

- Stellar's anchor/compliance design philosophy (SEP-8, SEP-24) is built for real-world fiat rails — matching Pamana's actual job: get money from a deceased person's wallet into a living family's pocket, in pesos 

## **Why not EVM?** 

_Other chains can fake an inheritance switch with a contract. Stellar gives you one as a primitive, and gives you the settlement and fiat-rail philosophy to make recovery and off-ramp institutionally credible rather than improvised._ 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 4 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **3. Competitive Positioning** 

## **3.1 The Competitor: Vaulnox** 

Vaulnox (exhibitor, Philippine Blockchain Week 2026, SMX) is the closest live competitor. Their pitch: 'If anything happens to you, your family keeps your crypto. Inheritance, built in.' They also offer MPC custody, 24/7 Sentinel monitoring, RWA in wallet, and PHP conversion. Tagline: 'Better than a bank.' 

Their product is real and funded. Do not try to out-feature them. The entire Vaulnox stack depends on a Wyoming DAO LLC and a key-share they hold. That is a legal wrapper plus off-chain process. The inheritance fires only if (a) the company survives, (b) a US legal entity honors the transfer, and (c) you trust their internal process at the moment of death. They rebuilt a bank with extra steps. 

## **3.2 The Armor (say this to judges verbatim)** 

## **⚔  Judge Q&A armor line** 

_Vaulnox's inheritance depends on a company and a Wyoming LLC staying alive to honor it. Pamana's inheritance executes on-chain. If our app, our company, and our servers all disappear tomorrow, your family still inherits — because the Stellar ledger itself is the executor. No competitor with an off-chain trust model can make that claim._ 

|**Dimension**|**Vaulnox**|**Pamana**|
|---|---|---|
|Inheritance mechanism|Of-chain: Wyoming DAO LLC +<br>company key-share|On-chain: Soroban contract + tme<br>predicate|
|Trustless?|No — depends on company<br>surviving|Yes — executes if company<br>disappears|
|Custody|MPC (company holds a shard)|True self-custody (owner holds<br>keys)|
|Social recovery|MPC-based (proprietary)|Natve Stellar multsig + SEP-30|
|PHP of-ramp|Unspecifed exchange|PDAX — BSP-licensed, named,<br>verifable|
|RWA|Wyoming DAO LLC-backed|Stub — honest roadmap|
|Heir UX|Unclear|NFC card + account abstracton<br>(Email/Passkey)|
|Legal wrapper needed?|Yes (Wyoming DAO LLC)|No — blockchain is the executor|



Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 5 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **4. Feature Breakdown** 

## **4.1 Trustless Inheritance — The Heartbeat** 

The core of Pamana. A Soroban vault contract holds the user's USDC. The owner periodically calls check_in() to reset the countdown. If the owner stops checking in for the full timeout period (default: 90 days), the contract enters a permissionless distribution state — any designated heir can call claim() and receive their share. No company is in the loop. No key-share is held by anyone. The contract executes because the ledger says so. 

- Timeout is configurable at vault creation (90 days default, owner sets it) 

- A check-in reminder notification fires 14 days and 3 days before timeout expires 

- The status indicator shows 'Alive' (green) or 'Inheritance Unlocked' (amber) — legible to a non-crypto user 

## **4.2 Multi-Heir BPS Splits** 

Heirs are designated with basis-point shares (10,000 bps = 100%). Single heir is just a list of length one — one code path handles both. The contract validates that all heir shares sum to exactly 10,000 bps at set_heirs() time; it rejects the call otherwise. 

- Pull-based: each heir claims their own share independently 

- One heir's lost key or inaction never blocks another heir's claim 

- TotalLocked snapshot taken at first claim — all subsequent shares compute from the same immutable base (see §5.1 for why this is critical) 

## **4.3 Social Recovery — Native Stellar Multisig + SEP-30** 

If the owner loses their phone or device, they don't lose their vault. Two paths: 

- Native Stellar multisig: owner designates 2-of-3 (or N-of-M) guardians. If the owner's key is lost, guardians co-sign a key rotation. 

- SEP-30 recoverysigner: the owner registers recovery servers. The server holds a partial signer; the owner authenticates via Email/SMS to recover the key. No seed phrase required. 

This directly answers Vaulnox's 'lose your phone, not your crypto' pillar — without an MPC dependency on a proprietary company infrastructure. 

## **4.4 NFC Heir Claim Card** 

The heir doesn't need a crypto wallet installed. They receive a Tapik-style NFC card at vault creation — the inheritance address is bound to it. When the time comes, they tap the card to an NFC-capable Android phone. The card presents the heir's claim credentials; the app verifies and calls claim() on their behalf. 

- NFC card is the physical, real-world claim path — a demo prop judges can touch 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 6 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

- Combined with account abstraction (Email/Passkey login), the heir never handles a seed phrase 

- Tapik's NTAG 424 DNA + ACR1252U reader pipeline is the technical reference — implement the claim 

touchpoint now, defer full JavaCard secure-element signing to post-hackathon 

## **Scope boundary** 

_Build the NFC claim touchpoint. Do NOT attempt to ship the full Tapik secure-element signing stack inside Pamana by July 15. Simulate the secure-element if needed; flag it as hardware-verified in roadmap._ 

## **4.5 Time-Locked Release — Trust Fund Mode** 

The heir can't blow it all at once. The owner configures a release schedule at vault creation: either a onetime unlock at a future timestamp, or periodic tranches (e.g. 25% per year over 4 years). The contract enforces the schedule on-chain. 

- ReleaseSchedule: Vec<{timestamp: u64, bps: u32}> — stored per heir 

- Each tranche fires independently; heirs can claim a mature tranche without waiting for the full schedule 

- Covers the 'protect your children' pitch — crypto released at 18, or in manageable chunks, not a onetime lump sum 

## **TTL collision note** 

_A 10-year release schedule means the contract must stay alive on the Stellar ledger for a decade with the owner gone. The contract cannot rely on check_in() bumping TTL post-death. Use permissionless TTL-bump calls — any address can trigger bump() — and document the assumption clearly. See §5.2._ 

## **4.6 PDAX PHP Off-Ramp (Real Integration)** 

Inherited USDC converts to Philippine pesos through PDAX — a BSP-licensed local exchange. This is a 

genuine integration, not a mock. A BSP-licensed exchange is a stronger judge story than a vague 'seamless conversion' promise. 

- Owner or heir initiates conversion from within the Pamana interface 

- PDAX API call: fetch live USDC/PHP rate → show quote → confirm → execute withdrawal to GCash, Maya, or local bank 

- If production API keys are not available by demo day: pull live PDAX public market rates (unauthenticated feed) and show a real-rate quote screen. Honest fallback — state 'live withdrawal pending API production access.' 

## **4.7 Stub Features — Roadmap (be honest about it)** 

These are shown as vision in the pitch. Stating them as roadmap is sound hackathon strategy and protects credibility under Q&A. 

|**Feature**|**Demo Treatment**|**Why It's Roadmap**|
|---|---|---|
|RWA in Wallet|Mock asset card in UI (property|Requires legal entty + of-chain|



Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 7 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

|**Feature**|**Demo Treatment**|**Why It's Roadmap**|
|---|---|---|
||image + on-chain token)|atestaton + oracle. Building it the<br>Vaulnox way (Wyoming LLC)<br>contradicts the trustless thesis.|
|Sentnel Monitor|Statc 'Protected' green status light<br>in the UI|A full always-on anomaly-detecton<br>backend is a separate product.|



Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 8 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **5. Critical Technical Gotchas** 

These are the four points that separate a real submission from a toy. Raise these proactively with mentors — they signal depth. 

## **5.1 The TotalLocked Snapshot (Multi-Heir Math Trap)** 

## **Risk** 

_In a pull-based model, Heir A claims 50% first. The vault balance drops. Heir B's 50% is now calculated against the remaining balance — they get shortchanged._ 

Fix: The contract must capture an immutable snapshot of the total vault balance the exact moment the very first claim() is called. All subsequent payouts calculate from that initial snapshot, regardless of how much has already been withdrawn. 

```
// In claim():
if !env.storage().persistent().has(&DataKey::Distributing) {
    let balance = token_client.balance(&env.current_contract_address());
    env.storage().persistent().set(&DataKey::TotalLocked, &balance);
    env.storage().persistent().set(&DataKey::Distributing, &true);
}
let total: i128 = env.storage().persistent().get(&DataKey::TotalLocked).unwrap();
let amount = total * heir.bps as i128 / 10_000;
```

## **5.2 Soroban State TTL Archival** 

## **Risk** 

_Soroban persistent state expires (becomes archived) if its TTL lapses and nobody bumps it. An inheritance contract sits untouched for months by design — and the trigger is the owner going silent, so nobody bumps TTL naturally. State could archive before the heir can claim._ 

Fix: Three layers of protection: 

- Bump persistent-entry TTL generously on init(), set_heirs(), and check_in() — minimum bump should exceed the configured timeout with a safety margin 

- Add a permissionless bump() function — any address can call it to extend TTL. Heirs or family members can run this as a lightweight keepalive without vault access 

- For time-locked releases spanning years: document the assumption explicitly in your submission. The full solution involves Stellar's state archival + restoration pathway for truly long-lived contracts 

```
pub fn check_in(env: Env) {
    // ... auth, update heartbeat ...
    // Bump TTL to well beyond timeout
    let ledgers_needed: u32 = 12_000_000; // ~1 year in ledgers
    env.storage().persistent().extend_ttl(
        &DataKey::LastHeartbeat, ledgers_needed, ledgers_needed
    );
}
```

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 9 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

```
pub fn bump(env: Env) {
    // Permissionless — anyone can call this
    let ledgers: u32 = 6_000_000;
    env.storage().persistent().extend_ttl(
        &DataKey::LastHeartbeat, ledgers, ledgers
    );
}
```

## **5.3 Non-Crypto-Native Heir Barrier** 

## **Risk** 

_Informal earners, first-gen holders, and OFW families rarely have a crypto wallet or understand seed phrases. If the heir can't claim, the whole product fails at its most important moment._ 

Fix: Two paths eliminate the seed-phrase requirement: 

- Web3Auth / social login: heir authenticates with Email or Phone Number → a key is derived client-side → they claim. No seed phrase ever shown. 

- NFC card: the card stores the heir's claim credential. Tap on Android → credential presented → app calls claim() on their behalf. 

- These are not mutually exclusive — ship both. The card is the premium path; social login is the web fallback. 

## **5.4 PDAX API Key Timeline** 

## **Risk** 

_Waiting for PDAX production API keys before demo day can paralyze the off-ramp integration._ 

Fix: Build the off-ramp in two layers: 

- Layer 1 (always): pull PDAX public unauthenticated market feeds for live USDC/PHP rates. Show a real rate, real timestamp. This works without keys. 

- Layer 2 (if keys land): wire actual quote → confirm → withdrawal flow to GCash/Maya/bank. This is the full demo. 

- Layer 1 is not a fake — it's a real rate pull from a BSP-licensed exchange. State it honestly in the pitch. Judges respect transparency. 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 10 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **6. Technical Architecture** 

## **6.1 System Overview** 

Pamana is a Soroban vault contract on Stellar with a React/Vite frontend. The contract holds USDC, tracks the owner's heartbeat, and enforces heir claims autonomously. The frontend handles UX, NFC interactions, and the PDAX off-ramp integration. Firebase handles off-chain metadata (heir contacts, check-in reminders, push notifications). 

|**Layer**|**Technology**|**Role**|
|---|---|---|
|Smart Contract|Soroban (Rust)|Vault, heartbeat, heir splits, TTL<br>management|
|Token|USDC via Stellar SAC|The asset held and distributed|
|Frontend|React 19 + Vite + Tailwind|Wallet UI, deposit, heir mgmt,<br>check-in, claim|
|Auth / Signing|Freighter wallet / Passkeys<br>(Web3Auth)|Owner auth; heir social login|
|Of-chain|Firebase Firestore|Heir contacts, check-in reminders,<br>notfcatons|
|NFC|NTAG 424 DNA card + Web NFC API|Heir claim card — tap-to-claim|
|Of-ramp|PDAX API|USDC → PHP conversion +<br>withdrawal|
|Testnet|Stellar Testnet|All development and demo|



## **6.2 Contract Storage Schema** 

**==> picture [488 x 252] intentionally omitted <==**

**----- Start of picture text -----**<br>
#[contracttype]<br>pub struct Heir {<br>    pub addr:    Address,<br>    pub bps:     u32,     // basis points — all heirs sum to exactly 10_000<br>    pub claimed: bool,<br>}<br>#[contracttype]<br>pub struct ReleaseSlot {<br>    pub unlock_time: u64,   // ledger timestamp after which this slot is claimable<br>    pub bps:         u32,   // share of this heir's allocation released at this slot<br>    pub claimed:     bool,<br>}<br>#[contracttype]<br>pub enum DataKey {<br>    Owner,           // Address<br>    Token,           // Address of USDC SAC<br>    LastHeartbeat,   // u64 — ledger timestamp of last check_in<br>    Timeout,         // u64 — seconds (default: 90 days = 7_776_000)<br>    Heirs,           // Vec<Heir><br>**----- End of picture text -----**<br>


Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 11 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

```
    TotalLocked,     // i128 — snapshot at first claim; immutable after set
    Distributing,    // bool — distribution phase flag
    Schedule(Address), // Vec<ReleaseSlot> — per-heir trust-fund schedule (optional)
}
```

## **6.3 Full Contract Function Set** 

```
// ── INIT ──────────────────────────────────────────────────────
```

```
pub fn init(env: Env, owner: Address, token: Address, timeout: u64)
    // Store owner, token, timeout
    // Set last_heartbeat = env.ledger().timestamp()
    // Bump persistent TTL generously (see §5.2)
```

```
// ── DEPOSIT ───────────────────────────────────────────────────
pub fn deposit(env: Env, amount: i128)
    // owner.require_auth()
    // token_client.transfer(owner → contract, amount)
```

```
// ── CHECK_IN (proof of life) ───────────────────────────────────
pub fn check_in(env: Env)
    // owner.require_auth()
```

```
    // last_heartbeat = env.ledger().timestamp()
    // Bump persistent TTL > timeout (critical — see §5.2)
```

```
// ── SET_HEIRS ─────────────────────────────────────────────────
pub fn set_heirs(env: Env, heirs: Vec<Heir>)
    // owner.require_auth()
    // Validate: sum(heir.bps) == 10_000 — reject with error if not
    // Store heirs with all claimed = false
    // Bump TTL
// ── SET_SCHEDULE (trust fund mode) ───────────────────────────
pub fn set_schedule(env: Env, heir_addr: Address, slots: Vec<ReleaseSlot>)
    // owner.require_auth()
    // Validate heir exists in Heirs list
    // Validate sum(slot.bps) == 10_000 within this heir's allocation
    // Store Schedule(heir_addr)
// ── CLAIM ─────────────────────────────────────────────────────
pub fn claim(env: Env, heir_addr: Address)
    // 1. Check timeout: now > last_heartbeat + timeout — panic if not
    // 2. Find heir in Heirs — panic if not found
    // 3. Panic if heir.claimed == true
    // 4. If !Distributing: snapshot TotalLocked, set Distributing = true
    // 5. Check release schedule if set:
    //    - Find first unclaimed slot where now >= slot.unlock_time
    //    - amount = TotalLocked * (heir.bps/10_000) * (slot.bps/10_000)
    //    - If no schedule: amount = TotalLocked * heir.bps / 10_000
    // 6. token_client.transfer(contract → heir_addr, amount)
    // 7. Mark heir.claimed = true (or slot.claimed = true if scheduled)
// ── BUMP (permissionless TTL keepalive) ───────────────────────
pub fn bump(env: Env)
    // No auth required — anyone can call
    // Extend persistent TTL
// ── WITHDRAW (owner reclaims) ─────────────────────────────────
```

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 12 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

```
pub fn withdraw(env: Env, amount: i128)
```

```
    // owner.require_auth()
```

```
    // Require !Distributing (cannot withdraw after first claim)
```

```
    // token_client.transfer(contract → owner, amount)
```

```
// ── VIEW FUNCTIONS ────────────────────────────────────────────
```

```
pub fn get_status(env: Env)   -> VaultStatus  // Alive | TimedOut | Distributing
pub fn get_heirs(env: Env)    -> Vec<Heir>
pub fn get_heartbeat(env: Env) -> u64          // last check-in timestamp
pub fn get_timeout(env: Env)   -> u64
```

## **6.4 Fallback: Native Claimable Balances** 

If the Soroban contract fights you in week 3, the native Stellar claimable-balance primitive provides a working fallback for the core dead-man's switch: 

- Create a claimable balance with two claimants: owner (can claim anytime) and heir (can claim only after T days) 

- Owner proves life by reclaiming and re-creating the balance, resetting the timer 

- No Soroban required — this is base Stellar protocol 

- Limitation: funds are locked during the protection period; multi-heir splits are clunky. Use as safety net only, not primary build. 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 13 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **7. Demo Flow — Stage Script** 

Target runtime: 4 minutes. Every step should be live on Stellar Testnet. Record a backup video during week 3. 

## **Step 1 — Vault Setup (30s)** 

Owner opens Pamana, connects wallet (Freighter). Deposits 500 USDC into the vault. Shows balance and a green 'Alive — next check-in in 89 days' status indicator. 

## **Step 2 — Designate Heirs (45s)** 

Owner adds two heirs: 70 bps (7,000) and 30 bps (3,000). Contract validates the sum equals 10,000 — show it reject a wrong split live. Owner sets a release schedule on heir #2: 50% at 1 year, 50% at 2 years (trust fund mode). Confirm on-chain. 

## **Step 3 — Check-In (20s)** 

Owner taps 'I'm Alive.' Heartbeat resets on-chain. Show the updated ledger timestamp in the block explorer. 'Next check-in in 90 days.' 

## **Step 4 — The Event (20s)** 

Fast-forward past timeout on Testnet (use a 5-minute demo timeout, not 90 days). Status flips to amber: 'Inheritance Unlocked — your heirs may now claim.' Contract is now in permissionless distribution state. 

## **Step 5 — Heir Claims (45s)** 

Heir #1 connects via Email login (no seed phrase). Taps NFC card on Android. App reads the claim credential from the card, calls claim() on-chain. 350 USDC (70%) lands in their wallet. Heir #2 claims independently — 150 USDC (30%). Two separate transactions, correct amounts, visible in block explorer. 

## **Step 6 — PHP Off-Ramp (30s)** 

Heir #1 initiates PDAX conversion. App pulls live USDC/PHP rate from PDAX. Shows quote: '350 USDC ≈ ₱20,020 at ₱57.20/USDC.' If keys available: execute withdrawal to GCash. If not: show the live-rate quote screen honestly. 

## **Step 7 — The Mic-Drop Line (15s)** 

## **Close the demo with this** 

_'We just turned off our backend server. [kill the server live] Re-run the heir's claim — it still works. [claim executes] The blockchain is the executor. Vaulnox needs a Wyoming LLC to honor this. Pamana needs nothing but the ledger.'_ 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 14 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **8. Build Timeline — Now to July 15** 

## **Week 1 — The Contract (July 6–9)** 

- Soroban vault: init, deposit, check_in, set_heirs, claim 

- BPS validation (sum == 10,000) + reject on mismatch 

- TotalLocked snapshot on first claim 

- Permissionless bump() for TTL keepalive 

- Unit tests: BPS sum gate, timeout gate, snapshot correctness, double-claim prevention 

- Deploy to Stellar Testnet 

## **Week 2 — The Product (July 9–13)** 

- Frontend: deposit, heir designation with BPS split validator UI 

- check_in button + countdown display 

- Heir claim flow (Freighter + Web3Auth social login path) 

- NFC card claim touchpoint (Web NFC API on Android) 

- Trust fund / release schedule UI (set_schedule, claim per slot) 

- Social recovery: Stellar multisig guardian designation UI 

- Wire all frontend to Testnet contract 

## **Week 3 — Polish + Off-ramp (July 13–15)** 

- PDAX off-ramp: live rate pull (unauthenticated feed, always works) 

- PDAX production keys if available: full quote → confirm → withdraw flow 

- Stub RWA asset card + Sentinel status light in UI 

- Demo rehearsal — time it, cut anything over 4 minutes 

- Record backup demo video (insurance against demo-day network issues) 

- Finalize pitch deck (§1–3 + §7 as the backbone) 

- Write submission form answers from §2 of this doc 

## **Cut Line (if behind in Week 3)** 

## **Safe to cut** 

_Stub features (RWA card, Sentinel light). Trust fund schedule UI. NFC if Web NFC API fights you — fall back to social login only. The WIN CONDITION is: inheritance contract working on Testnet + PDAX rate pull + heir claims on stage._ 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 15 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **9. Risks & Mitigations** 

|**Risk**|**Likelihood**|**Mitgaton**|
|---|---|---|
|Soroban TTL archival breaks claim|Medium|Bump TTL > tmeout on every<br>check_in; add permissionless<br>bump(); document assumpton|
|TotalLocked mult-heir math bug|High (easy to miss)|Snapshot on frst claim, all<br>subsequent shares from same base<br>— unit test this explicitly|
|PDAX producton keys don't arrive|Medium|Live rate pull from public feed is the<br>fallback — real rates, honest<br>framing|
|NFC Web NFC API not supported on<br>judge's device|Medium|Social login (Email/Passkey) is the<br>parallel path — NFC is<br>enhancement, not dependency|
|Scope creep into RWA or Sentnel|High|Both are explicitly stubbed. Do not<br>build them. Cut line is documented.|
|'Is this just Vaulnox?' judge queston|Certain|No. Vaulnox is of-chain/legal-<br>wrapper. Pamana is trustless on-<br>chain. Use the armor line from §3.2.|
|Demo day network failure|Low-Medium|Record backup demo video in week<br>3. Testnet is stable but have the<br>recording ready.|
|Testnet USDC availability|Low|Stellar testnet USDC via<br>Friendbot/testanchor.stellar.org —<br>fund test accounts early in week 1|



Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 16 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

## **10. Appendix — Full Soroban Contract Skeleton (Rust)** 

This is the complete contract skeleton. Copy into src/lib.rs. Fill in the marked TODO sections, run cargo build --target wasm32-unknown-unknown --release, and deploy to Testnet with Stellar CLI. 

```
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, vec,
    Address, Env, Vec,
};
```

```
#[contracttype]
#[derive(Clone)]
pub struct Heir {
    pub addr:    Address,
    pub bps:     u32,
    pub claimed: bool,
}
```

```
#[contracttype]
#[derive(Clone)]
pub struct ReleaseSlot {
    pub unlock_time: u64,
    pub bps:         u32,
    pub claimed:     bool,
}
```

```
#[contracttype]
pub enum DataKey {
    Owner,
    Token,
    LastHeartbeat,
    Timeout,
    Heirs,
    TotalLocked,
    Distributing,
    Schedule(Address),
}
const LEDGER_BUMP: u32 = 12_000_000; // ~1 year
```

```
#[contract]
pub struct PamanaVault;
```

```
#[contractimpl]
impl PamanaVault {
    pub fn init(env: Env, owner: Address, token: Address, timeout: u64) {
        owner.require_auth();
```

```
        let now = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Owner, &owner);
        env.storage().persistent().set(&DataKey::Token, &token);
        env.storage().persistent().set(&DataKey::Timeout, &timeout);
        env.storage().persistent().set(&DataKey::LastHeartbeat, &now);
        env.storage().persistent().set(&DataKey::Distributing, &false);
        for key in &[DataKey::Owner, DataKey::Token,
                     DataKey::Timeout, DataKey::LastHeartbeat,
```

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 17 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

```
               .extend_ttl(key, LEDGER_BUMP, LEDGER_BUMP);
```

```
        }
    }
```

```
    pub fn deposit(env: Env, amount: i128) {
        let owner: Address = env.storage().persistent()
            .get(&DataKey::Owner).unwrap();
        owner.require_auth();
        let token: Address = env.storage().persistent()
            .get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        client.transfer(&owner, &env.current_contract_address(), &amount);
    }
```

```
    pub fn check_in(env: Env) {
        let owner: Address = env.storage().persistent()
            .get(&DataKey::Owner).unwrap();
        owner.require_auth();
        let now = env.ledger().timestamp();
        env.storage().persistent()
            .set(&DataKey::LastHeartbeat, &now);
        env.storage().persistent()
            .extend_ttl(&DataKey::LastHeartbeat, LEDGER_BUMP, LEDGER_BUMP);
```

```
    }
```

```
    pub fn set_heirs(env: Env, heirs: Vec<Heir>) {
        let owner: Address = env.storage().persistent()
            .get(&DataKey::Owner).unwrap();
```

```
        owner.require_auth();
        let total: u32 = heirs.iter().map(|h| h.bps).sum();
        assert!(total == 10_000, "Heir bps must sum to 10_000");
        env.storage().persistent().set(&DataKey::Heirs, &heirs);
        env.storage().persistent()
            .extend_ttl(&DataKey::Heirs, LEDGER_BUMP, LEDGER_BUMP);
```

```
    }
```

```
    pub fn set_schedule(
        env: Env, heir_addr: Address, slots: Vec<ReleaseSlot>
```

```
    ) {
```

```
        let owner: Address = env.storage().persistent()
            .get(&DataKey::Owner).unwrap();
```

```
        owner.require_auth();
        let total: u32 = slots.iter().map(|s| s.bps).sum();
        assert!(total == 10_000, "Schedule bps must sum to 10_000");
        env.storage().persistent()
            .set(&DataKey::Schedule(heir_addr), &slots);
```

```
    }
```

```
    pub fn claim(env: Env, heir_addr: Address) {
        let now = env.ledger().timestamp();
        let heartbeat: u64 = env.storage().persistent()
            .get(&DataKey::LastHeartbeat).unwrap();
        let timeout: u64 = env.storage().persistent()
            .get(&DataKey::Timeout).unwrap();
        assert!(now > heartbeat + timeout, "Owner still active");
        let heirs: Vec<Heir> = env.storage().persistent()
```

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 18 

**PAMANA** Trustless On-Chain Inheritance · Stellar APAC Hackathon 2026 

```
            .get(&DataKey::Heirs).unwrap();
        let heir = heirs.iter()
            .find(|h| h.addr == heir_addr)
            .expect("Heir not found");
        assert!(!heir.claimed, "Already claimed");
        // Snapshot on first claim
        let distributing: bool = env.storage().persistent()
            .get(&DataKey::Distributing).unwrap_or(false);
        if !distributing {
            let token: Address = env.storage().persistent()
                .get(&DataKey::Token).unwrap();
            let client = token::Client::new(&env, &token);
            let balance = client.balance(&env.current_contract_address());
            env.storage().persistent()
                .set(&DataKey::TotalLocked, &balance);
            env.storage().persistent()
                .set(&DataKey::Distributing, &true);
```

```
        let total: i128 = env.storage().persistent()
            .get(&DataKey::TotalLocked).unwrap();
        let amount = total * heir.bps as i128 / 10_000;
        let token: Address = env.storage().persistent()
            .get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &heir_addr, &amount);
```

```
        // TODO: handle release schedule slots
        // TODO: mark heir.claimed = true and update storage
    }
    pub fn bump(env: Env) {
        // Permissionless — no auth
        env.storage().persistent()
            .extend_ttl(&DataKey::LastHeartbeat, LEDGER_BUMP, LEDGER_BUMP);
    }
    pub fn withdraw(env: Env, amount: i128) {
        let owner: Address = env.storage().persistent()
            .get(&DataKey::Owner).unwrap();
        owner.require_auth();
        let distributing: bool = env.storage().persistent()
            .get(&DataKey::Distributing).unwrap_or(false);
        assert!(!distributing, "Cannot withdraw during distribution");
        let token: Address = env.storage().persistent()
            .get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &owner, &amount);
    }
}
```

## **PAMANA  ·** _Your pamana moves on its own._ 

Paul Henry Dacalan  ·  FEU Institute of Technology  ·  Stellar Ambassador PH  ·  Rise In × Stellar APAC Hackathon 2026 

Pamana © 2026 · Paul Henry Dacalan · FEU Institute of Technology · 19 


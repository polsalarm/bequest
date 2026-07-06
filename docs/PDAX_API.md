# PDAX Institutional API — reference (Pamana)

Discovered via the hackathon playbook + live UAT probing (2026-07-06). **No secrets here** — credentials live in server-side env only (`PDAX_USERNAME`, `PDAX_PASSWORD` in Vercel + gitignored `.env.local`).

## Environment
- **UAT base URL:** `https://uat.services.sandbox.pdax.ph/api/pdax-api`
- Prefix for all endpoints: `/pdax-institution/v1`
- UAT uses **mock pricing / mock liquidity**; quotes and pricing may be flaky or unavailable (per playbook §3 disclaimer). Always keep a fallback rate.

## Auth (verified ✅)
```
POST /pdax-institution/v1/login
body: { "username": "<email>", "password": "<pw>" }
→ 200 { username(uuid), email, phone_number, access_token, id_token, refresh_token, token_type, preferred_mfa, expiry }
```
- No MFA on the test account (`preferred_mfa: "NOT_SET"`).
- `expiry: 600` seconds → cache the token, re-login before expiry.
- **Authenticated requests need two headers:** `access_token` and `id_token` (raw token values, not `Bearer`).
- Refresh: `PUT /pdax-institution/v1/refresh-token`.

## Balances (verified ✅)
```
GET /balances   (headers: access_token, id_token)
→ 200 { data: [ { currency, available, hold, total, asset_type: "FIAT"|"CRYPTO" }, ... ] }
```
Test account holds: **PHP 100000 · USDC 10000 · XLM** (so `PHP`, `USDC`, `XLM` are valid currency codes).

## Trading
```
GET  /pdax-institution/v1/trade/price     indicative rate
     query: base_currency, quote_currency, base_quantity, side (BUY|SELL)   [all required]
     e.g. ?base_currency=USDC&quote_currency=PHP&base_quantity=10&side=SELL
POST /pdax-institution/v1/trade/quote     firm executable quote
POST /pdax-institution/v1/trade           execute a trade from a firm quote
GET  /pdax-institution/v1/orders/{id}     order status
```
- Param names confirmed by progressive 400s: `quote_currency` → `base_quantity` → `side` all required.
- ⚠️ In UAT, `/trade/price` currently returns `500 ERR_BAD_REQUEST` ("Request failed with status code 400") for every asset tested — an upstream OTC pricing failure, not a param issue (assets/currencies are valid per `/balances`). **→ Pamana uses `RAMP_RATE_FALLBACK` when price fails.**

## Funding
```
GET  /pdax-institution/v1/crypto/deposit  → wallet address (+ memo/tag if applicable)
POST /pdax-institution/v1/fiat/deposit     → payment checkout URL / reference / pending status
```

## Withdrawal
```
POST /pdax-institution/v1/fiat/withdraw    → PHP payout to supported channels (GCash/Maya/bank)
```

## Error shape
`{ code, name, message }` — e.g. `{ "code":"OT010018", "name":"OTCServiceError", "message":"side is required" }`. 404s: `{ "code":404, "message":"Resouce not found" }`.

## Pamana ramp flows (planned)
- **Off-ramp (heir, USDC→PHP):** deposit crypto to PDAX custody (`/crypto/deposit`) → `/trade` SELL USDC→PHP → `/fiat/withdraw` to GCash/Maya/bank. Layer 1 = show live rate via `/trade/price` (fallback if down).
- **On-ramp (owner, PHP→USDC):** `/fiat/deposit` (PHP checkout) → `/trade` BUY → `/crypto/deposit` address is the owner's vault; withdraw USDC there.

## Docs portal (auth-gated)
`https://doc.general.api.pdax.ph/#introduction` — Basic-auth with the separate **documentation** credentials (not the API login). Full request/response schemas live here.

#!/usr/bin/env bash
# Pamana RWA — Phase 3 gated issuance (testnet, demo).
#
# Issues HOUSE02 with AUTH_REQUIRED on top of the Phase 1 controls (revocable +
# clawback). AUTH_REQUIRED is the real, on-chain compliance gate: NO account or
# contract can hold the asset until the issuer authorizes its trustline. That
# authorization is what a licensed operator gates behind KYC (SEP-8 / SEP-12).
#
# ┌─ DEMO vs REAL ────────────────────────────────────────────────────────────┐
# │ The GATE is real and on-chain enforced. WHO decides to open it is stubbed. │
# │ In this demo the approver (api/kyc) AUTO-APPROVES after a dummy KYC form —  │
# │ standing in for a real compliance officer / custodian admin review. No     │
# │ real identity check, no real PII. Testnet, not legally binding.            │
# └────────────────────────────────────────────────────────────────────────────┘
#
# Authorization mechanics (proven on testnet):
#  - classic account holder (owner, heir): issuer `set-trustline-flags --set-authorize`
#  - contract holder (the vault): issuer calls the SAC's `set_authorized(id, true)`
#    (classic set-trustline-flags can't target a C... contract address)
# An unauthorized transfer traps with SAC Error #11 "balance is deauthorized".
set -euo pipefail

NET="testnet"
ISSUER="pamana-rwa-issuer-gated"     # dedicated issuer (keeps HOUSE01 pristine)
OWNER="pamana-testnet"
ASSET_CODE="HOUSE02"
VAULT="CDJOXNIY6FMVUBDCDYV3VXWDXVZ323WURQ3VOLSNGH6BTHBMXP7X5LJG"
UNIT=10000000                         # 1.0000000 (7 decimals)
LIMIT=1000000000000

echo "== 1. gated issuer identity =="
if ! stellar keys address "$ISSUER" >/dev/null 2>&1; then
  stellar keys generate "$ISSUER" --network "$NET" --fund
fi
ISSUER_PK=$(stellar keys address "$ISSUER")
OWNER_PK=$(stellar keys address "$OWNER")
ASSET="${ASSET_CODE}:${ISSUER_PK}"
echo "issuer=$ISSUER_PK  asset=$ASSET"

echo "== 2. issuer flags: AUTH_REQUIRED + revocable + clawback =="
stellar tx new set-options --source "$ISSUER" --network "$NET" \
  --set-required --set-revocable --set-clawback-enabled

echo "== 3. owner trustline (created UNAUTHORIZED under AUTH_REQUIRED) =="
stellar tx new change-trust --source "$OWNER" --network "$NET" \
  --line "$ASSET" --limit "$LIMIT"

echo "== 4. issuer authorizes the owner's trustline (SEP-8-style approval) =="
stellar tx new set-trustline-flags --source "$ISSUER" --network "$NET" \
  --trustor "$OWNER_PK" --asset "$ASSET" --set-authorize

echo "== 5. issuer mints 1 $ASSET_CODE to owner =="
stellar tx new payment --source "$ISSUER" --network "$NET" \
  --destination "$OWNER_PK" --asset "$ASSET" --amount "$UNIT"

echo "== 6. SAC-wrap $ASSET_CODE =="
SAC=$(stellar contract asset deploy --asset "$ASSET" --source "$OWNER" --network "$NET" 2>/dev/null \
  || stellar contract id asset --asset "$ASSET" --network "$NET")
echo "SAC=$SAC"

echo "== 7. authorize the VAULT contract to hold it (SAC set_authorized) =="
stellar contract invoke --id "$SAC" --source "$ISSUER" --network "$NET" \
  -- set_authorized --id "$VAULT" --authorize true

echo "== 8. owner deposits the gated title into the vault =="
stellar contract invoke --id "$VAULT" --source "$OWNER" --network "$NET" \
  -- deposit --token "$SAC" --amount "$UNIT"

echo ""
echo "== DONE =="
echo "asset_code : $ASSET_CODE"
echo "issuer_pk  : $ISSUER_PK"
echo "sac_id     : $SAC"
echo "vault      : $VAULT"
echo ""
echo "Heirs remain UNAUTHORIZED — a claim traps until the approver (api/kyc)"
echo "runs set_authorized(heir, true) after the demo KYC form. That is Phase 3."

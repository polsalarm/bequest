#!/usr/bin/env bash
# Pamana RWA — Phase 1 issuance (testnet, demo-real).
#
# Issues a regulated Stellar asset representing one real-world asset (a house
# title), SAC-wraps it, delivers it to the vault owner, and deposits it into the
# owner's existing vault so it inherits the full dead-man's-switch + claim flow.
#
# Regulated-asset control for Phase 1 = AUTH_REVOCABLE + AUTH_CLAWBACK_ENABLED
# (issuer can freeze and claw back). AUTH_REQUIRED (per-holder approval) is
# deferred to Phase 3, where it pairs with SEP-8/SEP-12 KYC — with it set here
# the vault contract and the heir would each need a pre-authorized trustline,
# blocking deposit/claim without an approval server.
#
# Idempotent-ish: re-running reuses the issuer identity if it already exists.
# Secret keys live in ~/.config/stellar/ — never commit them.
set -euo pipefail

NETWORK="testnet"
ISSUER="pamana-rwa-issuer"          # dedicated issuer identity
OWNER="pamana-testnet"              # vault owner / distributor
ASSET_CODE="HOUSE01"               # 5-12 chars -> credit_alphanum12
VAULT="CDJOXNIY6FMVUBDCDYV3VXWDXVZ323WURQ3VOLSNGH6BTHBMXP7X5LJG"
UNIT=10000000                       # 1.0000000 (7 decimals) = "1 title"
LIMIT=1000000000000                 # trustline limit, generous (stroops)

echo "== 1. issuer identity =="
if ! stellar keys address "$ISSUER" >/dev/null 2>&1; then
  stellar keys generate "$ISSUER" --network "$NETWORK" --fund
  echo "created + funded $ISSUER"
else
  echo "$ISSUER already exists"
fi
ISSUER_PK=$(stellar keys address "$ISSUER")
OWNER_PK=$(stellar keys address "$OWNER")
ASSET="${ASSET_CODE}:${ISSUER_PK}"
echo "issuer=$ISSUER_PK"
echo "owner =$OWNER_PK"
echo "asset =$ASSET"

echo "== 2. issuer flags: revocable + clawback (BEFORE trustline) =="
stellar tx new set-options \
  --source "$ISSUER" --network "$NETWORK" \
  --set-revocable --set-clawback-enabled

echo "== 3. owner trustline to $ASSET_CODE =="
stellar tx new change-trust \
  --source "$OWNER" --network "$NETWORK" \
  --line "$ASSET" --limit "$LIMIT"

echo "== 4. issuer mints 1 $ASSET_CODE to owner =="
stellar tx new payment \
  --source "$ISSUER" --network "$NETWORK" \
  --destination "$OWNER_PK" --asset "$ASSET" --amount "$UNIT"

echo "== 5. SAC-wrap $ASSET_CODE =="
SAC=$(stellar contract asset deploy \
  --asset "$ASSET" --source "$OWNER" --network "$NETWORK" 2>/dev/null || true)
if [ -z "${SAC:-}" ]; then
  # already deployed — derive the deterministic id
  SAC=$(stellar contract id asset --asset "$ASSET" --network "$NETWORK")
fi
echo "SAC=$SAC"

echo "== 6. owner deposits the title into the vault =="
stellar contract invoke \
  --id "$VAULT" --source "$OWNER" --network "$NETWORK" \
  -- deposit --token "$SAC" --amount "$UNIT"

echo ""
echo "== DONE =="
echo "asset_code : $ASSET_CODE"
echo "issuer_pk  : $ISSUER_PK"
echo "sac_id     : $SAC"
echo "vault      : $VAULT"
echo "deposited  : $UNIT stroops (1.0 $ASSET_CODE)"

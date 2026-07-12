# Pamana — App Screenshots (phone frame)

Captured from the live dev build (`frontend`) in **demo-capture mode**
(`localStorage['pamana.demoCapture']='1'`), rendered inside the desktop
phone-device frame (`DesktopFrame`, `lg` breakpoint). Mock data comes from
`frontend/src/lib/devDemo.ts` — no wallet/chain calls.

Viewport 1120×1000 @2x DPR; each PNG is clipped to the phone bezel.

| File | Route | Screen |
|------|-------|--------|
| `00-landing.png`   | `/`         | Landing — "Connect Wallet" (wallet disconnected) |
| `01-dashboard.png` | `/dashboard`| Owner home — Alive status ring, vault balances, heirs |
| `02-deposit.png`   | `/deposit`  | Deposit into vault (token picker) |
| `03-heirs.png`     | `/heirs`    | Manage heirs — BPS split |
| `04-recovery.png`  | `/recovery` | Multisig social recovery |
| `05-claim.png`     | `/claim`    | Heir claim — "Inheritance Unlocked" (amber), per-token claim |
| `06-offramp.png`   | `/offramp`  | PDAX cash-out to pesos |
| `07-withdraw.png`  | `/withdraw` | Owner withdraw from vault |
| `08-create.png`    | `/create`   | Create vault — check-in window |

Regenerate: run `npm run dev` in `frontend`, then drive the routes above with
demo-capture enabled (see `devDemo.ts`).

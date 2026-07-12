# Demo Recording Checklist

Use this to record the Phase 9 backup video. Target length: 3:30 to 4:00.

## Recording Setup
- Record at 1080p or higher.
- Keep browser zoom at 100%.
- Use the live app: https://pamana-sigma.vercel.app
- Keep Stellar Expert open in a second tab for contract proof.
- Have Owner and Heir wallets funded on Stellar Testnet.
- Use a short demo timeout, ideally 60 seconds.
- If showing NFC, use Android Chrome and test the tag immediately before recording.

## Preflight
- Owner wallet can connect.
- Heir wallet can connect.
- Owner has a vault or can create one during the recording.
- Owner has enough testnet XLM for fees and demo deposit.
- Heir account exists and has enough XLM for fees.
- PDAX rate endpoint returns a quote or graceful fallback.
- Backup owner address and vault address are written in a local note.

## Shot List
1. Landing page and wallet connect.
2. Create vault with short timeout.
3. Deposit one asset.
4. Add two heirs and show bad split rejection.
5. Save 70/30 split.
6. Check in and show Alive status.
7. Wait for timeout or cut to a later recording segment.
8. Heir opens Claim, enters owner address, and claims.
9. Show balance or transaction proof.
10. Open Cash out to pesos and show PDAX quote.
11. Kill or disable backend demo path, then show claim still works if using a fresh unclaimed token/heir path.
12. End on the live app, repo, and contract links.

## Narration Beats
- "Every family gets its own isolated vault."
- "The owner proves life by checking in."
- "If the owner goes silent, the contract opens distribution."
- "The heir claims directly from Stellar, not from our backend."
- "PDAX gives the Philippine peso exit ramp."
- "The blockchain is the executor."

## Fallback Clips
- If a wallet popup stalls, cut to the signed transaction result.
- If Testnet is slow, show the successful transaction on Stellar Expert.
- If PDAX UAT declines settlement, show the quote and receipt/fallback state honestly.
- If NFC fails, use manual owner-address entry and state NFC is the tap-to-open shortcut.

## Export
- Filename: `pamana-demo-backup-YYYY-MM-DD.mp4`
- Keep one local copy and one cloud copy.
- Add the final public URL to `README.md` and `docs/SUBMISSION.md`.
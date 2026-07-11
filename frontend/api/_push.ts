/**
 * Web Push (server-side only) — demo-scoped.
 *
 * Subscriptions are held in module-scope memory (survives warm invocations,
 * same pattern as `_pdax.ts`'s token cache) rather than a database. That means
 * they reset on cold start / redeploy — fine for a testnet demo, not for
 * production, where this should move to a real store (Vercel KV/Postgres).
 *
 * Keys come from env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
 * Generate a pair with: `npx web-push generate-vapid-keys`.
 */
import webpush from 'web-push'

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:support@pamana.app'

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)
}

export interface PushSubscriptionJSON {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

/** owner Stellar address → subscriptions registered from its browsers. */
const subscriptions = new Map<string, PushSubscriptionJSON[]>()

export function saveSubscription(owner: string, sub: PushSubscriptionJSON): void {
  const existing = subscriptions.get(owner) ?? []
  if (existing.some((s) => s.endpoint === sub.endpoint)) return
  subscriptions.set(owner, [...existing, sub])
}

export function removeSubscription(owner: string, endpoint: string): void {
  const existing = subscriptions.get(owner)
  if (!existing) return
  subscriptions.set(
    owner,
    existing.filter((s) => s.endpoint !== endpoint),
  )
}

export function getSubscriptions(owner: string): PushSubscriptionJSON[] {
  return subscriptions.get(owner) ?? []
}

export interface SendResult {
  sent: number
  failed: number
}

/** Pushes `payload` to every subscription an owner has registered. Dead
 *  subscriptions (410/404 — user revoked permission, or uninstalled) are
 *  pruned automatically. */
export async function sendToOwner(
  owner: string,
  payload: { title: string; body: string },
): Promise<SendResult> {
  if (!PUBLIC_KEY || !PRIVATE_KEY) {
    throw new Error('VAPID keys not configured')
  }
  const subs = getSubscriptions(owner)
  let sent = 0
  let failed = 0
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload))
        sent++
      } catch (e) {
        failed++
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) removeSubscription(owner, sub.endpoint)
        else console.error('[push send]', e instanceof Error ? e.message : e)
      }
    }),
  )
  return { sent, failed }
}

/** Web Push opt-in (demo). Registers the service worker, subscribes the
 *  browser, and hands the subscription to the server (`api/push.ts`) keyed
 *  by a Stellar address — an owner's on the vault dashboard, an heir's on
 *  the claim page. See `api/_push.ts` for caveats (in-memory store —
 *  resets on redeploy). */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64Safe)
  const array = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) array[i] = raw.charCodeAt(i)
  return array
}

/** Registers the SW (idempotent — re-registering an unchanged worker is a
 *  no-op), requests permission, and subscribes for push. Throws if the
 *  browser lacks support, permission is denied, or VAPID isn't configured. */
export async function enablePushReminders(owner: string): Promise<void> {
  if (!pushSupported()) throw new Error('Push notifications are not supported in this browser')
  if (!VAPID_PUBLIC_KEY) throw new Error('Push notifications are not configured')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notification permission denied')

  const registration = await navigator.serviceWorker.register('/sw.js')
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }))

  const res = await fetch('/api/push?action=subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, subscription: subscription.toJSON() }),
  })
  if (!res.ok) throw new Error('Failed to save push subscription')
}

/** Whether this browser already has an active push subscription. */
export async function pushEnabled(): Promise<boolean> {
  if (!pushSupported()) return false
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!registration) return false
  return (await registration.pushManager.getSubscription()) != null
}

/** Fire-and-forget: pushes `title`/`body` to every subscription `subscriber`
 *  registered. Swallows errors — a failed reminder shouldn't break the flow
 *  that triggered it (e.g. a successful claim). */
export function notify(subscriber: string, title: string, body: string): void {
  fetch('/api/push?action=send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner: subscriber, title, body }),
  }).catch((e) => console.error('[push notify]', e))
}

/** Guards a reminder so it fires once per `key` (e.g. vaultId + heartbeat,
 *  so it re-arms after the next check-in) rather than on every poll tick. */
export function notifyOnce(key: string, run: () => void): void {
  const flag = `bequest:notified:${key}`
  if (localStorage.getItem(flag)) return
  localStorage.setItem(flag, '1')
  run()
}

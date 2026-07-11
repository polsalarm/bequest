/**
 * POST /api/push?action=subscribe   body: { owner, subscription }
 * POST /api/push?action=unsubscribe body: { owner, endpoint }
 * POST /api/push?action=send        body: { owner, title?, body? }
 *
 * All three actions live in one function so they share the same warm
 * module instance of `_push.ts`'s in-memory subscription store — Vercel
 * bundles each api/*.ts file into its own isolated serverless function, so
 * splitting subscribe/send across separate files would give each its own
 * copy of the store and `send` would never see what `subscribe` saved.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  saveSubscription,
  removeSubscription,
  sendToOwner,
  type PushSubscriptionJSON,
} from './_push.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const action = String(req.query.action ?? '')
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {}
  const owner = String(body.owner ?? '')
  if (!owner) {
    res.status(400).json({ error: 'owner is required' })
    return
  }

  switch (action) {
    case 'subscribe': {
      const subscription = body.subscription as PushSubscriptionJSON | undefined
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        res.status(400).json({ error: 'a valid push subscription is required' })
        return
      }
      saveSubscription(owner, subscription)
      res.status(200).json({ ok: true })
      return
    }
    case 'unsubscribe': {
      const endpoint = String(body.endpoint ?? '')
      if (!endpoint) {
        res.status(400).json({ error: 'endpoint is required' })
        return
      }
      removeSubscription(owner, endpoint)
      res.status(200).json({ ok: true })
      return
    }
    case 'send': {
      const title = String(body.title ?? "Don't forget to check in")
      const notifBody = String(
        body.body ?? 'Your Pamana vault is waiting for proof of life.',
      )
      try {
        res.status(200).json(await sendToOwner(owner, { title, body: notifBody }))
      } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'push send failed' })
      }
      return
    }
    default:
      res.status(400).json({ error: 'action must be subscribe, unsubscribe, or send' })
  }
}

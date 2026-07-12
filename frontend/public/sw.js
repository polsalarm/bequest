// Push service worker — receives Web Push events and shows a notification.
// Registered from src/lib/push.ts. Vite serves anything in public/ at the
// site root, so this lives at /sw.js (a push SW's scope is its own path).

self.addEventListener('push', (event) => {
  let data = { title: "Don't forget to check in", body: 'Your Pamana vault is waiting for proof of life.' }
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch {
      data.body = event.data.text()
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow('/')
    }),
  )
})

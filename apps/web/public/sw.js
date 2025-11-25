// Capsule Note Push Notification Service Worker
// This service worker handles push notifications for delivery completion alerts

const NOTIFICATION_ICON = "/icon-192x192.png"
const NOTIFICATION_BADGE = "/icon-72x72.png"

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event)

  let data = { title: "Capsule Note", body: "You have a new notification" }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || NOTIFICATION_ICON,
    badge: data.badge || NOTIFICATION_BADGE,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || "/",
      deliveryId: data.deliveryId,
      letterId: data.letterId,
    },
    actions: data.actions || [
      { action: "view", title: "View Letter" },
      { action: "dismiss", title: "Dismiss" },
    ],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || `capsule-${Date.now()}`,
    renotify: data.renotify || false,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click:", event.action)

  event.notification.close()

  const data = event.notification.data || {}
  let url = "/"

  if (event.action === "view" && data.letterId) {
    url = `/letters/${data.letterId}`
  } else if (data.url) {
    url = data.url
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && "focus" in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed:", event.notification.tag)
})

// Service worker install
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")
  self.skipWaiting()
})

// Service worker activate
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")
  event.waitUntil(clients.claim())
})

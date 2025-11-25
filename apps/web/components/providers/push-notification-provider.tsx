"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey,
  isPushNotificationsEnabled,
} from "@/server/actions/push-subscriptions"

interface PushNotificationContextValue {
  isSupported: boolean
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null)

export function usePushNotifications() {
  const context = useContext(PushNotificationContext)
  if (!context) {
    throw new Error("usePushNotifications must be used within PushNotificationProvider")
  }
  return context
}

interface PushNotificationProviderProps {
  children: React.ReactNode
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Check for push notification support and existing subscription
  useEffect(() => {
    const checkSupport = async () => {
      // First check if feature is enabled via feature flag
      const featureEnabled = await isPushNotificationsEnabled()
      if (!featureEnabled) {
        setIsSupported(false)
        setIsLoading(false)
        return
      }

      // Check if push notifications are supported
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window

      setIsSupported(supported)

      if (!supported) {
        setIsLoading(false)
        return
      }

      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        setRegistration(reg)

        // Check for existing subscription
        const subscription = await reg.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.error("Service worker registration failed:", err)
        setError("Failed to register service worker")
      } finally {
        setIsLoading(false)
      }
    }

    checkSupport()
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!registration || !isSupported) {
      setError("Push notifications not supported")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setError("Notification permission denied")
        setIsLoading(false)
        return false
      }

      // Get VAPID public key from server
      const vapidPublicKey = await getVapidPublicKey()
      if (!vapidPublicKey) {
        setError("Push notifications not configured")
        setIsLoading(false)
        return false
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      })

      // Send subscription to server
      const result = await subscribeToPush(subscription.toJSON())

      if (result.success) {
        setIsSubscribed(true)
        setIsLoading(false)
        return true
      } else {
        setError(result.error || "Failed to save subscription")
        // Unsubscribe from push manager if server save failed
        await subscription.unsubscribe()
        setIsLoading(false)
        return false
      }
    } catch (err) {
      console.error("Push subscription failed:", err)
      setError("Failed to subscribe to notifications")
      setIsLoading(false)
      return false
    }
  }, [registration, isSupported])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()

        // Remove subscription from server
        await unsubscribeFromPush(subscription.endpoint)
      }

      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error("Push unsubscription failed:", err)
      setError("Failed to unsubscribe from notifications")
      setIsLoading(false)
      return false
    }
  }, [registration])

  const value: PushNotificationContextValue = {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  }

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

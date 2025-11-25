"use client"

import { useState } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { usePushNotifications } from "@/components/providers/push-notification-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PushNotificationToggleProps {
  translations: {
    enable: string
    disable: string
    enabling: string
    disabling: string
    notSupported: string
    permissionDenied: string
  }
}

export function PushNotificationToggle({ translations }: PushNotificationToggleProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications()
  const [localLoading, setLocalLoading] = useState(false)

  const handleToggle = async () => {
    setLocalLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } finally {
      setLocalLoading(false)
    }
  }

  const loading = isLoading || localLoading

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-secondary">
        <BellOff className="h-4 w-4" />
        <span className="font-mono text-sm">{translations.notSupported}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant="outline"
        className={cn(
          "border-2 border-charcoal font-mono",
          isSubscribed
            ? "bg-lime text-charcoal hover:bg-lime/80"
            : "bg-white text-charcoal hover:bg-duck-yellow/20"
        )}
        style={{ borderRadius: "2px" }}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSubscribed ? translations.disabling : translations.enabling}
          </>
        ) : isSubscribed ? (
          <>
            <Bell className="mr-2 h-4 w-4" />
            {translations.disable}
          </>
        ) : (
          <>
            <BellOff className="mr-2 h-4 w-4" />
            {translations.enable}
          </>
        )}
      </Button>
      {error && (
        <p className="font-mono text-xs text-coral">
          {error === "Notification permission denied"
            ? translations.permissionDenied
            : error}
        </p>
      )}
    </div>
  )
}

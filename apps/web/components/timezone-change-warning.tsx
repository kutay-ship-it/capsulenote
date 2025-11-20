"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getUserTimezone, getTimezoneAbbr } from "@/lib/utils"

interface TimezoneChangeWarningProps {
  savedTimezone: string // Timezone from user's profile
  onUpdateTimezone?: () => void
}

/**
 * Timezone Change Warning Component
 *
 * Detects when user's current browser timezone differs from
 * their saved profile timezone and shows a warning banner.
 *
 * This helps prevent confusion about delivery times when users:
 * - Travel to different time zones
 * - Move to a new location
 * - Access the app from a different device
 */
export function TimezoneChangeWarning({
  savedTimezone,
  onUpdateTimezone,
}: TimezoneChangeWarningProps) {
  const [currentTimezone, setCurrentTimezone] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Get current browser timezone
    const tz = getUserTimezone()
    setCurrentTimezone(tz)

    // Check if user has dismissed this warning in this session
    const dismissedKey = `timezone-warning-dismissed-${tz}`
    const wasDismissed = sessionStorage.getItem(dismissedKey)
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    if (currentTimezone) {
      sessionStorage.setItem(`timezone-warning-dismissed-${currentTimezone}`, "true")
    }
  }

  // Don't show if timezones match or if dismissed
  if (!currentTimezone || currentTimezone === savedTimezone || dismissed) {
    return null
  }

  const currentAbbr = getTimezoneAbbr()
  const savedAbbr = getTimezoneAbbr(new Date()) // Will use saved timezone if we had a way to pass it

  return (
    <Alert
      className="border-2 border-charcoal bg-duck-yellow animate-in slide-in-from-top-2"
      style={{ borderRadius: "2px" }}
    >
      <AlertTriangle className="h-5 w-5 text-charcoal" strokeWidth={2} />
      <AlertTitle className="font-mono text-base font-normal uppercase tracking-wide text-charcoal">
        Timezone Changed
      </AlertTitle>
      <AlertDescription className="font-mono text-sm text-gray-secondary">
        <p className="mb-3">
          We've detected your timezone has changed from <strong className="text-charcoal">{savedTimezone}</strong> to{" "}
          <strong className="text-charcoal">{currentTimezone}</strong>.
        </p>
        <p className="mb-4">
          Your scheduled letter deliveries will still arrive at the <strong className="text-charcoal">same local time</strong> you originally selected,
          but this will be a different time in your new timezone.
        </p>
        <div className="flex flex-wrap gap-3">
          {onUpdateTimezone && (
            <Button
              onClick={onUpdateTimezone}
              size="sm"
              className="border-2 border-charcoal bg-charcoal font-mono text-xs uppercase hover:bg-gray-800"
              style={{ borderRadius: "2px" }}
            >
              Update Timezone in Settings
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="border-2 border-charcoal font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            Dismiss for Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

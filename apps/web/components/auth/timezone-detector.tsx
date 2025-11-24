"use client"

/**
 * Silent Timezone Detection Component
 *
 * Automatically detects the user's browser timezone and stores it
 * in Clerk's unsafeMetadata. This allows the server-side webhook
 * and auto-provision handlers to create profiles with the correct timezone.
 *
 * Mount this component in signup flow layouts to enable automatic
 * timezone detection without any user interaction required.
 *
 * @module timezone-detector
 */

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { detectBrowserTimezone } from "@/lib/timezone"

/**
 * Props for TimezoneDetector
 */
interface TimezoneDetectorProps {
  /**
   * Callback when timezone is successfully stored
   */
  onDetected?: (timezone: string) => void

  /**
   * Callback when detection fails
   */
  onError?: (error: Error) => void

  /**
   * Whether to update if timezone already exists
   * @default false
   */
  forceUpdate?: boolean
}

/**
 * Silent component that detects and stores browser timezone in Clerk metadata
 *
 * This component:
 * 1. Detects the user's browser timezone using Intl API
 * 2. Validates the timezone is a valid IANA identifier
 * 3. Stores it in Clerk's unsafeMetadata as `detectedTimezone`
 * 4. The webhook/auto-provision handlers read this value
 *
 * @example
 * // In signup layout or page
 * export default function SignUpLayout({ children }) {
 *   return (
 *     <>
 *       <TimezoneDetector />
 *       {children}
 *     </>
 *   )
 * }
 *
 * @example
 * // With callbacks
 * <TimezoneDetector
 *   onDetected={(tz) => console.log("Detected:", tz)}
 *   onError={(err) => console.error("Failed:", err)}
 * />
 */
export function TimezoneDetector({
  onDetected,
  onError,
  forceUpdate = false,
}: TimezoneDetectorProps = {}) {
  const { user, isLoaded } = useUser()
  const t = useTranslations("auth.timezoneDetector")
  const hasAttempted = useRef(false)

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return

    // Prevent multiple attempts in the same session
    if (hasAttempted.current && !forceUpdate) return
    hasAttempted.current = true

    // Need a user to update metadata
    if (!user) return

    // Check if timezone already stored (unless forcing update)
    const existingTimezone = (
      user.unsafeMetadata as { detectedTimezone?: string } | undefined
    )?.detectedTimezone

    if (existingTimezone && !forceUpdate) {
      console.debug("[TimezoneDetector] Timezone already stored:", existingTimezone)
      onDetected?.(existingTimezone)
      return
    }

    // Detect browser timezone
    const timezone = detectBrowserTimezone()

    if (!timezone) {
      const error = new Error(t("error"))
      console.warn("[TimezoneDetector]", error.message)
      onError?.(error)
      return
    }

    console.log("[TimezoneDetector] Detected timezone:", timezone)

    // Store in Clerk metadata
    user
      .update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          detectedTimezone: timezone,
        },
      })
      .then(() => {
        console.log("[TimezoneDetector] Stored timezone in Clerk metadata")
        onDetected?.(timezone)
      })
      .catch((error) => {
        console.error("[TimezoneDetector] Failed to update metadata:", error)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      })
  }, [isLoaded, user, forceUpdate, onDetected, onError, t])

  // Silent component - no UI
  return null
}

/**
 * Hook version for more control over timezone detection
 *
 * @returns Object with detection state and manual trigger
 *
 * @example
 * function SignUpForm() {
 *   const { isStored, timezone, storeTimezone } = useTimezoneDetection()
 *
 *   useEffect(() => {
 *     if (!isStored) {
 *       storeTimezone()
 *     }
 *   }, [isStored])
 *
 *   return <form>...</form>
 * }
 */
export function useTimezoneDetection() {
  const { user, isLoaded } = useUser()

  const existingTimezone = (
    user?.unsafeMetadata as { detectedTimezone?: string } | undefined
  )?.detectedTimezone

  const storeTimezone = async (): Promise<string | null> => {
    if (!user) {
      console.warn("[useTimezoneDetection] No user available")
      return null
    }

    const timezone = detectBrowserTimezone()
    if (!timezone) {
      console.warn("[useTimezoneDetection] Could not detect timezone")
      return null
    }

    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        detectedTimezone: timezone,
      },
    })

    return timezone
  }

  return {
    /** Whether Clerk is loaded */
    isLoaded,
    /** Whether timezone is already stored */
    isStored: !!existingTimezone,
    /** Currently stored timezone */
    timezone: existingTimezone ?? null,
    /** Manually trigger timezone storage */
    storeTimezone,
  }
}

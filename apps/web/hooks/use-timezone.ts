"use client"

/**
 * React hook for browser timezone detection
 *
 * Provides timezone detection with loading state for client components.
 * Use this hook when you need to detect the user's browser timezone
 * in React components.
 *
 * @module use-timezone
 */

import { useEffect, useState } from "react"
import { detectBrowserTimezone, validateTimezone } from "@/lib/timezone"

interface UseTimezoneResult {
  /** Detected timezone (IANA format) or null if not yet detected */
  timezone: string | null
  /** True while detection is in progress */
  isDetecting: boolean
  /** True if detected timezone is valid */
  isValid: boolean
  /** Error message if detection failed */
  error: string | null
}

/**
 * Hook to detect browser timezone
 *
 * Returns the detected timezone with loading and validation states.
 * Detection runs once on mount.
 *
 * @returns Object with timezone, loading state, and validation status
 *
 * @example
 * function TimezoneDisplay() {
 *   const { timezone, isDetecting, isValid } = useTimezone()
 *
 *   if (isDetecting) return <span>Detecting...</span>
 *   if (!isValid) return <span>Could not detect timezone</span>
 *
 *   return <span>Your timezone: {timezone}</span>
 * }
 */
export function useTimezone(): UseTimezoneResult {
  const [timezone, setTimezone] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const detected = detectBrowserTimezone()
      setTimezone(detected)

      if (!detected) {
        setError("Could not detect browser timezone")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("[useTimezone] Detection error:", err)
    } finally {
      setIsDetecting(false)
    }
  }, [])

  return {
    timezone,
    isDetecting,
    isValid: timezone !== null && validateTimezone(timezone),
    error,
  }
}

/**
 * Hook to compare browser timezone with saved timezone
 *
 * Useful for showing warnings when user's browser timezone
 * differs from their saved profile timezone.
 *
 * @param savedTimezone - User's saved timezone from profile
 * @returns Object with comparison results
 *
 * @example
 * function TimezoneWarning({ savedTimezone }: { savedTimezone: string }) {
 *   const { hasMismatch, browserTimezone } = useTimezoneComparison(savedTimezone)
 *
 *   if (hasMismatch) {
 *     return (
 *       <Alert>
 *         Your browser is in {browserTimezone} but your profile
 *         is set to {savedTimezone}
 *       </Alert>
 *     )
 *   }
 *
 *   return null
 * }
 */
export function useTimezoneComparison(savedTimezone: string | null | undefined) {
  const { timezone: browserTimezone, isDetecting, isValid } = useTimezone()

  const hasMismatch =
    !isDetecting &&
    isValid &&
    browserTimezone !== null &&
    savedTimezone !== null &&
    savedTimezone !== undefined &&
    browserTimezone !== savedTimezone

  return {
    browserTimezone,
    savedTimezone: savedTimezone ?? null,
    hasMismatch,
    isDetecting,
    isValid,
  }
}

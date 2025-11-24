/**
 * Enterprise-grade timezone detection and validation utilities
 *
 * This module provides the foundation for timezone handling across the application.
 * All timezone operations should use these utilities for consistency.
 *
 * @module timezone
 */

import { z } from "zod"

/**
 * IANA timezone schema with validation
 * Validates against Intl.DateTimeFormat supported timezones
 *
 * @example
 * timezoneSchema.parse("Europe/Istanbul") // ✅ Valid
 * timezoneSchema.parse("Invalid/Zone") // ❌ Throws ZodError
 */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      // Validate timezone is recognized by Intl
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  },
  { message: "Invalid IANA timezone identifier" }
)

/**
 * Type for validated IANA timezone string
 */
export type IANATimezone = z.infer<typeof timezoneSchema>

/**
 * Detect user's browser timezone
 *
 * Returns IANA timezone string (e.g., "Europe/Istanbul", "America/New_York")
 * Returns null if detection fails or runs on server
 *
 * @returns Browser's detected timezone or null if detection fails
 *
 * @example
 * const tz = detectBrowserTimezone()
 * // Returns "Europe/Istanbul" for Turkish users
 */
export function detectBrowserTimezone(): string | null {
  // Guard against server-side execution
  if (typeof window === "undefined") {
    return null
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Validate detected timezone
    const result = timezoneSchema.safeParse(timezone)

    if (!result.success) {
      console.warn("[Timezone] Browser timezone validation failed:", timezone)
      return null
    }

    return result.data
  } catch (error) {
    console.error("[Timezone] Failed to detect browser timezone:", error)
    return null
  }
}

/**
 * Validate a timezone string
 *
 * @param timezone - Timezone string to validate
 * @returns true if valid IANA timezone, false otherwise
 *
 * @example
 * validateTimezone("America/New_York") // true
 * validateTimezone("Invalid/Zone") // false
 */
export function validateTimezone(timezone: string): boolean {
  return timezoneSchema.safeParse(timezone).success
}

/**
 * Get user's timezone with proper fallback chain
 *
 * Priority:
 * 1. Profile.timezone (user preference - canonical source)
 * 2. User.timezone (legacy field)
 * 3. Browser detected (client-side only)
 * 4. UTC (last resort)
 *
 * @param profileTimezone - Timezone from user's profile (canonical)
 * @param userTimezone - Legacy timezone from user table
 * @returns Valid IANA timezone string
 *
 * @example
 * // Server-side with user data
 * const tz = getUserTimezoneWithFallback(user.profile?.timezone, user.timezone)
 */
export function getUserTimezoneWithFallback(
  profileTimezone?: string | null,
  userTimezone?: string | null
): string {
  // 1. Try profile timezone (canonical source)
  if (profileTimezone && validateTimezone(profileTimezone)) {
    return profileTimezone
  }

  // 2. Try legacy user timezone
  if (userTimezone && validateTimezone(userTimezone)) {
    return userTimezone
  }

  // 3. Try browser detection (client-side only)
  if (typeof window !== "undefined") {
    const detected = detectBrowserTimezone()
    if (detected) {
      return detected
    }
  }

  // 4. Last resort fallback
  return "UTC"
}

/**
 * Get timezone abbreviation (EST, PST, etc.)
 *
 * @param timezone - IANA timezone identifier
 * @param date - Date for which to get abbreviation (affects DST)
 * @returns Timezone abbreviation string
 *
 * @example
 * getTimezoneAbbreviation("America/New_York", new Date("2024-01-15"))
 * // Returns "EST"
 *
 * getTimezoneAbbreviation("America/New_York", new Date("2024-07-15"))
 * // Returns "EDT"
 */
export function getTimezoneAbbreviation(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(date)

    const abbr = parts.find((part) => part.type === "timeZoneName")?.value
    return abbr || timezone
  } catch {
    return timezone
  }
}

/**
 * Get UTC offset string for a timezone
 *
 * @param timezone - IANA timezone identifier
 * @param date - Date for which to calculate offset
 * @returns UTC offset string (e.g., "UTC-5", "UTC+5:30")
 *
 * @example
 * getUTCOffsetString("America/New_York", new Date("2024-01-15"))
 * // Returns "UTC-5"
 */
export function getUTCOffsetString(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }))
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60)

    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const minutes = Math.abs(offsetMinutes) % 60
    const sign = offsetMinutes >= 0 ? "+" : "-"

    if (minutes === 0) {
      return `UTC${sign}${hours}`
    }
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`
  } catch {
    return "UTC"
  }
}

/**
 * Check if a timezone observes DST
 *
 * @param timezone - IANA timezone identifier
 * @returns true if timezone observes DST
 *
 * @example
 * observesDST("America/New_York") // true
 * observesDST("Asia/Tokyo") // false
 */
export function observesDST(timezone: string): boolean {
  try {
    const year = new Date().getFullYear()
    const jan = new Date(year, 0, 1)
    const jul = new Date(year, 6, 1)

    const janOffset = new Date(
      jan.toLocaleString("en-US", { timeZone: timezone })
    ).getTime()
    const julOffset = new Date(
      jul.toLocaleString("en-US", { timeZone: timezone })
    ).getTime()

    return janOffset !== julOffset
  } catch {
    return false
  }
}

/**
 * Common timezone options for dropdown selectors
 * Includes major cities and UTC
 */
export const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "New York (Eastern)" },
  { value: "America/Chicago", label: "Chicago (Central)" },
  { value: "America/Denver", label: "Denver (Mountain)" },
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
  { value: "America/Anchorage", label: "Anchorage (Alaska)" },
  { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Mumbai/Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
] as const

export type CommonTimezone = (typeof COMMON_TIMEZONES)[number]["value"]

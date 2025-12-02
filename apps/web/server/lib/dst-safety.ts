/**
 * DST (Daylight Saving Time) Safety Utilities
 *
 * Provides protection against delivery timing issues during DST transitions.
 * DST transitions can cause:
 * - Times to "skip" forward (spring) - 2:30 AM doesn't exist
 * - Times to "repeat" (fall) - 2:30 AM happens twice
 *
 * This utility adds buffer time around DST transitions to ensure reliable delivery.
 */

import { logger } from "./logger"

/**
 * Buffer time in hours around DST transitions
 * We avoid scheduling deliveries within this window
 */
const DST_BUFFER_HOURS = 3

/**
 * Check if a date falls within a DST transition window
 *
 * @param date - The date to check
 * @param timezone - IANA timezone identifier
 * @returns Object with transition info
 */
export function checkDSTTransition(
  date: Date,
  timezone: string
): {
  isInTransitionWindow: boolean
  transitionType: "spring-forward" | "fall-back" | null
  suggestedDate: Date | null
  message: string | null
} {
  try {
    // Get the offset for the target date
    const targetOffset = getTimezoneOffset(date, timezone)

    // Check offsets before and after the target time
    const hourBefore = new Date(date.getTime() - 60 * 60 * 1000)
    const hourAfter = new Date(date.getTime() + 60 * 60 * 1000)

    const offsetBefore = getTimezoneOffset(hourBefore, timezone)
    const offsetAfter = getTimezoneOffset(hourAfter, timezone)

    // Check if there's a DST transition nearby
    const dayBefore = new Date(date.getTime() - 24 * 60 * 60 * 1000)
    const dayAfter = new Date(date.getTime() + 24 * 60 * 60 * 1000)

    const offsetDayBefore = getTimezoneOffset(dayBefore, timezone)
    const offsetDayAfter = getTimezoneOffset(dayAfter, timezone)

    // Detect transition within the buffer window
    if (offsetDayBefore !== offsetDayAfter) {
      // There's a DST transition within this day
      const transitionType = offsetDayAfter > offsetDayBefore ? "spring-forward" : "fall-back"

      // Find the approximate transition time
      const transitionHour = findDSTTransitionHour(date, timezone)

      if (transitionHour !== null) {
        const transitionTime = new Date(date)
        transitionTime.setHours(transitionHour, 0, 0, 0)

        const bufferMs = DST_BUFFER_HOURS * 60 * 60 * 1000
        const lowerBound = new Date(transitionTime.getTime() - bufferMs)
        const upperBound = new Date(transitionTime.getTime() + bufferMs)

        if (date >= lowerBound && date <= upperBound) {
          // Suggest a time outside the buffer window
          const suggestedDate = new Date(upperBound.getTime() + 60 * 60 * 1000) // 1 hour after buffer

          return {
            isInTransitionWindow: true,
            transitionType,
            suggestedDate,
            message: `Delivery time falls within ${DST_BUFFER_HOURS} hours of a DST ${transitionType} transition. Consider scheduling for ${suggestedDate.toISOString()} instead.`,
          }
        }
      }
    }

    // Also check if the specific time doesn't exist (spring forward)
    if (offsetBefore !== targetOffset || targetOffset !== offsetAfter) {
      // The time might not exist or is ambiguous
      if (offsetAfter > offsetBefore) {
        // Spring forward - this time might not exist
        const suggestedDate = new Date(date.getTime() + 60 * 60 * 1000)
        return {
          isInTransitionWindow: true,
          transitionType: "spring-forward",
          suggestedDate,
          message: "This time may not exist due to DST spring-forward. Adjusted to a valid time.",
        }
      }
    }

    return {
      isInTransitionWindow: false,
      transitionType: null,
      suggestedDate: null,
      message: null,
    }
  } catch (error) {
    // If timezone handling fails, log and return safe default
    logger.warn("[DST] Failed to check DST transition", {
      date: date.toISOString(),
      timezone,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      isInTransitionWindow: false,
      transitionType: null,
      suggestedDate: null,
      message: null,
    }
  }
}

/**
 * Get the UTC offset for a date in a specific timezone
 */
function getTimezoneOffset(date: Date, timezone: string): number {
  // Create a formatter that will give us the offset
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  })

  const parts = formatter.formatToParts(date)
  const tzPart = parts.find(p => p.type === "timeZoneName")

  if (!tzPart) return 0

  // Parse offset like "GMT+01:00" or "GMT-05:00"
  const match = tzPart.value.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match || !match[1] || !match[2] || !match[3]) return 0

  const sign = match[1] === "+" ? 1 : -1
  const hours = parseInt(match[2], 10)
  const minutes = parseInt(match[3], 10)

  return sign * (hours * 60 + minutes)
}

/**
 * Find the hour when DST transition occurs on a given day
 */
function findDSTTransitionHour(date: Date, timezone: string): number | null {
  const testDate = new Date(date)
  testDate.setHours(0, 0, 0, 0)

  let prevOffset = getTimezoneOffset(testDate, timezone)

  for (let hour = 1; hour <= 23; hour++) {
    testDate.setHours(hour)
    const currentOffset = getTimezoneOffset(testDate, timezone)

    if (currentOffset !== prevOffset) {
      return hour
    }
    prevOffset = currentOffset
  }

  return null
}

/**
 * Adjust a delivery date to avoid DST transition windows
 *
 * @param date - Original delivery date
 * @param timezone - IANA timezone identifier
 * @returns Adjusted date (same as input if no adjustment needed)
 */
export function adjustForDST(date: Date, timezone: string): Date {
  const check = checkDSTTransition(date, timezone)

  if (check.isInTransitionWindow && check.suggestedDate) {
    logger.info("[DST] Adjusting delivery time to avoid DST transition", {
      originalDate: date.toISOString(),
      adjustedDate: check.suggestedDate.toISOString(),
      transitionType: check.transitionType,
      timezone,
    })
    return check.suggestedDate
  }

  return date
}

/**
 * Validate that a delivery time is safe from DST issues
 * Returns validation result with optional warning
 */
export function validateDeliveryTime(
  date: Date,
  timezone: string
): {
  isValid: boolean
  warning: string | null
  adjustedDate: Date
} {
  const check = checkDSTTransition(date, timezone)

  if (check.isInTransitionWindow) {
    return {
      isValid: true, // Still valid, but with warning
      warning: check.message,
      adjustedDate: check.suggestedDate || date,
    }
  }

  return {
    isValid: true,
    warning: null,
    adjustedDate: date,
  }
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d)
}

/**
 * Format date and time with timezone abbreviation
 * Example: "January 15, 2026 at 9:00 AM PST"
 */
export function formatDateTimeWithTimezone(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  // Format date and time
  const dateTimeStr = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)

  // Get timezone abbreviation
  const timezoneParts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(d)
  const timezoneName = timezoneParts.find(part => part.type === "timeZoneName")?.value || ""

  return `${dateTimeStr} ${timezoneName}`
}

/**
 * Get user's current timezone name (IANA format)
 * Example: "America/New_York"
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get timezone abbreviation for a given date
 * Example: "PST" or "PDT" depending on DST
 */
export function getTimezoneAbbr(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date
  const timezoneParts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(d)
  return timezoneParts.find(part => part.type === "timeZoneName")?.value || ""
}

/**
 * Check if a date is during Daylight Saving Time
 */
export function isDST(date: Date | string = new Date()): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== d.getTimezoneOffset()
}

/**
 * Get UTC offset string
 * Example: "UTC-8" or "UTC+5:30"
 */
export function getUTCOffset(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date
  const offset = -d.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? "+" : "-"

  if (minutes === 0) {
    return `UTC${sign}${hours}`
  }
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`
}

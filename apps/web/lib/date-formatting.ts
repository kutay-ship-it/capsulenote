import { format } from "date-fns"
import { enUS, tr } from "date-fns/locale"
import type { Locale as DateFnsLocale } from "date-fns"

/**
 * Map next-intl locale codes to date-fns locale objects
 */
const localeMap: Record<string, DateFnsLocale> = {
  en: enUS,
  tr: tr,
}

/**
 * Get date-fns locale object from next-intl locale string
 */
export function getDateFnsLocale(locale: string): DateFnsLocale {
  return localeMap[locale] ?? enUS
}

/**
 * Get Intl.DateTimeFormat locale string from next-intl locale
 */
export function getIntlLocale(locale: string): string {
  return locale === "tr" ? "tr-TR" : "en-US"
}

/**
 * Format a date with locale support using date-fns
 *
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string (e.g., "PPP", "MMMM d, yyyy")
 * @param locale - next-intl locale code ("en" | "tr")
 */
export function formatDateLocalized(
  date: Date | string,
  formatStr: string,
  locale: string
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, formatStr, { locale: getDateFnsLocale(locale) })
}

// ============================================
// Pre-configured format helpers
// ============================================

/**
 * Long date format (e.g., "Sunday, June 7, 2026" / "7 Haziran 2026 Pazar")
 */
export function formatLongDate(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "PPPP", locale)
}

/**
 * Medium date format (e.g., "June 7, 2026" / "7 Haziran 2026")
 */
export function formatMediumDate(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "PPP", locale)
}

/**
 * Short date format (e.g., "Jun 7, 2026" / "7 Haz 2026")
 */
export function formatShortDate(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "PP", locale)
}

/**
 * Month and year format (e.g., "Jun 2026" / "Haz 2026")
 */
export function formatMonthYear(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "MMM yyyy", locale)
}

/**
 * Day, month and year format (e.g., "Jun 7, 2026" / "7 Haz 2026")
 */
export function formatDayMonthYear(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "MMM d, yyyy", locale)
}

/**
 * Weekday with short date (e.g., "Sun, Jun 7, 2026" / "Paz, 7 Haz 2026")
 */
export function formatWeekdayShortDate(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "EEE, MMM d, yyyy", locale)
}

/**
 * Full date with time (e.g., "June 7, 2026 at 9:00 AM" / "7 Haziran 2026 09:00")
 */
export function formatDateTimeLocalized(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "PPP 'at' p", locale)
}

/**
 * Full date with time - long format (e.g., "Sunday, June 7, 2026 at 9:00 AM")
 */
export function formatFullDateTime(date: Date | string, locale: string): string {
  return formatDateLocalized(date, "PPPP 'at' p", locale)
}

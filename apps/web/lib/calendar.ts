/**
 * Calendar (.ics) File Generation Utility
 *
 * Creates iCalendar files for delivery reminders that users can add to
 * their calendar apps (Google Calendar, Apple Calendar, Outlook, etc.)
 *
 * Format: RFC 5545 (iCalendar)
 */

export interface CalendarEventOptions {
  title: string
  description: string
  location?: string
  startTime: Date
  endTime: Date
  url?: string
  organizerEmail?: string
  attendeeEmail?: string
}

/**
 * Generate an .ics calendar file content
 *
 * @param options - Event details
 * @returns iCalendar format string
 */
export function generateICSFile(options: CalendarEventOptions): string {
  const {
    title,
    description,
    location = "",
    startTime,
    endTime,
    url = "",
    organizerEmail = "no-reply@dearme.app",
    attendeeEmail,
  } = options

  // Format dates to iCalendar format: YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    const seconds = String(date.getUTCSeconds()).padStart(2, "0")

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
  }

  // Current timestamp for DTSTAMP
  const now = new Date()
  const timestamp = formatDate(now)

  // Unique ID for the event (using timestamp + random)
  const uid = `${timestamp}-${Math.random().toString(36).substring(7)}@dearme.app`

  // Build iCalendar content (RFC 5545)
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DearMe//Letter Delivery Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
  ]

  if (location) {
    lines.push(`LOCATION:${escapeICSText(location)}`)
  }

  if (url) {
    lines.push(`URL:${url}`)
  }

  if (organizerEmail) {
    lines.push(`ORGANIZER:mailto:${organizerEmail}`)
  }

  if (attendeeEmail) {
    lines.push(`ATTENDEE:mailto:${attendeeEmail}`)
  }

  // Add reminder: 1 day before
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICSText(`Reminder: ${title}`)}`,
    "END:VALARM"
  )

  lines.push("END:VEVENT", "END:VCALENDAR")

  // Join with CRLF (required by RFC 5545)
  return lines.join("\r\n")
}

/**
 * Escape special characters in iCalendar text fields
 *
 * Per RFC 5545: Comma, semicolon, backslash, and newline must be escaped
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Backslash
    .replace(/;/g, "\\;") // Semicolon
    .replace(/,/g, "\\,") // Comma
    .replace(/\n/g, "\\n") // Newline
}

/**
 * Create a downloadable .ics file blob
 *
 * Usage in browser:
 * ```ts
 * const blob = createICSBlob(icsContent)
 * const url = URL.createObjectURL(blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = 'delivery-reminder.ics'
 * a.click()
 * URL.revokeObjectURL(url)
 * ```
 */
export function createICSBlob(icsContent: string): Blob {
  return new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  })
}

/**
 * Generate calendar event for a letter delivery
 *
 * Convenience wrapper for delivery-specific events
 */
export function generateDeliveryCalendarEvent(
  letterTitle: string,
  deliveryDate: Date,
  deliveryMethod: "email" | "mail",
  recipientEmail: string
): string {
  const title = `📬 Letter Delivery: ${letterTitle}`

  const description = [
    `Your letter "${letterTitle}" will be delivered via ${deliveryMethod === "email" ? "email" : "physical mail"}.`,
    "",
    `Delivery method: ${deliveryMethod === "email" ? "Email" : "Physical Mail"}`,
    `Recipient: ${recipientEmail}`,
    "",
    "This is a reminder to check your inbox (or mailbox) for your letter to your future self.",
    "",
    "Sent with love by DearMe - https://dearme.app",
  ].join("\n")

  // Event duration: 30 minutes (just for calendar display)
  const endTime = new Date(deliveryDate.getTime() + 30 * 60 * 1000)

  return generateICSFile({
    title,
    description,
    startTime: deliveryDate,
    endTime,
    attendeeEmail: recipientEmail,
    url: "https://dearme.app/deliveries",
  })
}

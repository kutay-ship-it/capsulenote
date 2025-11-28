/**
 * Email sender configuration with branded display names
 *
 * Capsule Note uses two distinct sender addresses:
 * - Notifications: noreply@ for system emails (confirmations, alerts)
 * - Deliveries: yourcapsulenote@ for scheduled letter deliveries
 */

export interface EmailSenderConfig {
  /** Full sender format: "Display Name <email@domain.com>" */
  from: string
  /** Email address only (for validation) */
  email: string
  /** Display name only */
  displayName: string
}

/**
 * Email sender types
 */
export type EmailSenderType = "notification" | "delivery"

/**
 * Get email sender configuration by type
 *
 * @param type - 'notification' for system emails, 'delivery' for letter deliveries
 * @returns Formatted sender configuration
 * @throws Error if configuration is missing or invalid
 *
 * @example
 * ```typescript
 * const sender = getEmailSender('notification')
 * // Returns: {
 * //   from: "Capsule Note <noreply@capsulenote.com>",
 * //   email: "noreply@capsulenote.com",
 * //   displayName: "Capsule Note"
 * // }
 * ```
 */
export function getEmailSender(type: EmailSenderType): EmailSenderConfig {
  const envVar =
    type === "notification" ? "EMAIL_FROM_NOTIFICATION" : "EMAIL_FROM_DELIVERY"

  // Try specific env var first, then fall back to legacy EMAIL_FROM
  const fromAddress =
    process.env[envVar] || process.env.EMAIL_FROM

  if (!fromAddress) {
    throw new Error(
      `${envVar} not configured (and EMAIL_FROM fallback not set). ` +
        `Please set either ${envVar} or EMAIL_FROM environment variable.`
    )
  }

  // Parse "Display Name <email@domain.com>" or just "email@domain.com"
  const parsed = parseEmailAddress(fromAddress)

  return {
    from: fromAddress,
    email: parsed.email,
    displayName: parsed.displayName || "Capsule Note",
  }
}

/**
 * Parse email address with optional display name
 * Supports formats:
 * - "Display Name <email@domain.com>"
 * - "email@domain.com"
 *
 * @param input - Email address string to parse
 * @returns Parsed email and optional display name
 *
 * @example
 * ```typescript
 * parseEmailAddress('"Capsule Note" <noreply@capsulenote.com>')
 * // Returns: { email: "noreply@capsulenote.com", displayName: "Capsule Note" }
 *
 * parseEmailAddress('noreply@capsulenote.com')
 * // Returns: { email: "noreply@capsulenote.com" }
 * ```
 */
function parseEmailAddress(input: string): {
  email: string
  displayName?: string
} {
  // Match pattern: "Name" <email> or Name <email>
  const match = input.match(/^"?([^"<]+)"?\s*<([^>]+)>$/)

  if (match && match[1] && match[2]) {
    return {
      displayName: match[1].trim(),
      email: match[2].trim(),
    }
  }

  // Plain email address without display name
  return { email: input.trim() }
}

/**
 * Validate email sender configuration at startup
 * Called during worker initialization to ensure all required
 * email senders are properly configured before processing jobs
 *
 * @throws Error if any required sender configuration is missing or invalid
 *
 * @example
 * ```typescript
 * // In worker initialization:
 * validateEmailSenderConfig()
 * // Throws if EMAIL_FROM_NOTIFICATION or EMAIL_FROM_DELIVERY not set
 * ```
 */
export function validateEmailSenderConfig(): void {
  const errors: string[] = []

  try {
    getEmailSender("notification")
  } catch (error) {
    errors.push(
      `Notification sender: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  try {
    getEmailSender("delivery")
  } catch (error) {
    errors.push(
      `Delivery sender: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  if (errors.length > 0) {
    throw new Error(
      `Email sender configuration invalid:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    )
  }
}

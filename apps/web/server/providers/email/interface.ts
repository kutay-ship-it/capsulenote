/**
 * Email provider abstraction layer
 * Allows switching between Resend, Postmark, SendGrid, etc.
 */

export interface EmailOptions {
  from: string
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface EmailResult {
  id: string
  success: boolean
  error?: string
}

export interface DomainVerificationResult {
  verified: boolean
  records: {
    type: string
    name: string
    value: string
    status: "verified" | "pending" | "failed"
  }[]
}

export interface EmailProvider {
  /**
   * Send an email
   */
  send(options: EmailOptions): Promise<EmailResult>

  /**
   * Verify domain configuration (SPF, DKIM, DMARC)
   */
  verifyDomain?(domain: string): Promise<DomainVerificationResult>

  /**
   * Get provider name for logging
   */
  getName(): string
}

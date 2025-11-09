import { Resend } from "resend"
import { env } from "@/env.mjs"
import type { EmailProvider, EmailOptions, EmailResult, DomainVerificationResult } from "./interface"

export class ResendEmailProvider implements EmailProvider {
  private client: Resend

  constructor() {
    this.client = new Resend(env.RESEND_API_KEY)
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const result = await this.client.emails.send({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        headers: options.headers,
      })

      if (result.error) {
        return {
          id: "",
          success: false,
          error: result.error.message,
        }
      }

      return {
        id: result.data?.id || "",
        success: true,
      }
    } catch (error) {
      console.error("Resend send error:", error)
      return {
        id: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async verifyDomain(domain: string): Promise<DomainVerificationResult> {
    try {
      // Resend API doesn't have a direct verify endpoint
      // This would need to query domain settings
      // Placeholder implementation
      return {
        verified: false,
        records: [
          {
            type: "TXT",
            name: `_resend.${domain}`,
            value: "resend-verification-token",
            status: "pending",
          },
          {
            type: "TXT",
            name: domain,
            value: "v=spf1 include:resend.com ~all",
            status: "pending",
          },
        ],
      }
    } catch (error) {
      console.error("Resend verify domain error:", error)
      throw error
    }
  }

  getName(): string {
    return "Resend"
  }
}

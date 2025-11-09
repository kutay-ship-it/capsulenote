import { env } from "@/env.mjs"
import type { EmailProvider, EmailOptions, EmailResult, DomainVerificationResult } from "./interface"

/**
 * Postmark email provider (fallback option)
 * Requires POSTMARK_SERVER_TOKEN environment variable
 */
export class PostmarkEmailProvider implements EmailProvider {
  private serverToken: string

  constructor() {
    if (!env.POSTMARK_SERVER_TOKEN) {
      throw new Error("POSTMARK_SERVER_TOKEN not configured")
    }
    this.serverToken = env.POSTMARK_SERVER_TOKEN
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const response = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": this.serverToken,
          ...(options.headers?.["X-Idempotency-Key"] && {
            "Idempotency-Key": options.headers["X-Idempotency-Key"],
          }),
        },
        body: JSON.stringify({
          From: options.from,
          To: Array.isArray(options.to) ? options.to.join(",") : options.to,
          Subject: options.subject,
          HtmlBody: options.html,
          TextBody: options.text,
          ReplyTo: options.replyTo,
          TrackOpens: true,
          TrackLinks: "HtmlOnly",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          id: "",
          success: false,
          error: data.Message || "Postmark API error",
        }
      }

      return {
        id: data.MessageID,
        success: true,
      }
    } catch (error) {
      console.error("Postmark send error:", error)
      return {
        id: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async verifyDomain(domain: string): Promise<DomainVerificationResult> {
    try {
      const response = await fetch(
        `https://api.postmarkapp.com/domains/${domain}/verifyspf`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "X-Postmark-Server-Token": this.serverToken,
          },
        }
      )

      const data = await response.json()

      return {
        verified: data.SPFVerified && data.DKIMVerified,
        records: [
          {
            type: "TXT",
            name: domain,
            value: data.SPFTextValue || "",
            status: data.SPFVerified ? "verified" : "pending",
          },
          {
            type: "CNAME",
            name: data.DKIMHost || "",
            value: data.DKIMTextValue || "",
            status: data.DKIMVerified ? "verified" : "pending",
          },
        ],
      }
    } catch (error) {
      console.error("Postmark verify domain error:", error)
      throw error
    }
  }

  getName(): string {
    return "Postmark"
  }
}

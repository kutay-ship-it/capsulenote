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
      // Build headers with List-Unsubscribe for CAN-SPAM compliance
      const headers: Record<string, string> = {
        ...options.headers,
      }

      if (options.unsubscribeUrl) {
        headers["List-Unsubscribe"] = `<${options.unsubscribeUrl}>`
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
      }

      const result = await this.client.emails.send({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
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
      // List domains and find matching one
      const domainsResponse = await this.client.domains.list()

      if (domainsResponse.error) {
        throw new Error(domainsResponse.error.message)
      }

      const domainData = domainsResponse.data?.data?.find(
        (d) => d.name === domain
      )

      if (!domainData) {
        // Domain not found in Resend - return pending status with setup instructions
        return {
          verified: false,
          records: [
            {
              type: "TXT",
              name: `_resend.${domain}`,
              value: "Domain not registered with Resend. Add domain in Resend dashboard first.",
              status: "pending",
            },
          ],
        }
      }

      // Get detailed domain verification status
      const detailResponse = await this.client.domains.get(domainData.id)

      if (detailResponse.error) {
        throw new Error(detailResponse.error.message)
      }

      const detail = detailResponse.data
      const records: DomainVerificationResult["records"] = []

      // Map Resend domain records to our format
      if (detail?.records) {
        for (const record of detail.records) {
          records.push({
            type: record.type || "TXT",
            name: record.name || domain,
            value: record.value || "",
            status: record.status === "verified" ? "verified" :
              record.status === "failed" ? "failed" : "pending",
          })
        }
      }

      return {
        verified: detail?.status === "verified",
        records,
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

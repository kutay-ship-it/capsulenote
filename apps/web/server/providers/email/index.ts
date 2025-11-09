import type { EmailProvider } from "./interface"
import { ResendEmailProvider } from "./resend-provider"
import { PostmarkEmailProvider } from "./postmark-provider"
import { getFeatureFlag } from "@/server/lib/feature-flags"

export type { EmailProvider, EmailOptions, EmailResult } from "./interface"

/**
 * Get the active email provider based on feature flags
 * Falls back to Resend by default
 */
export async function getEmailProvider(): Promise<EmailProvider> {
  // Check feature flag to determine provider
  const usePostmark = await getFeatureFlag("use-postmark-email")

  if (usePostmark) {
    try {
      return new PostmarkEmailProvider()
    } catch (error) {
      console.warn("Failed to initialize Postmark, falling back to Resend:", error)
      return new ResendEmailProvider()
    }
  }

  return new ResendEmailProvider()
}

/**
 * Convenience function to send email using active provider
 */
export async function sendEmail(options: Parameters<EmailProvider["send"]>[0]) {
  const provider = await getEmailProvider()
  console.log(`📧 Sending email via ${provider.getName()}`)
  return provider.send(options)
}

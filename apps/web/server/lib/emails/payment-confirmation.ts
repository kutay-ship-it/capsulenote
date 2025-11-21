/**
 * Payment Confirmation Email
 *
 * Sends confirmation email to users after successful subscription payment.
 * Used in anonymous checkout flow to guide users to complete signup.
 */

import { getEmailProvider } from "@/server/providers/email"
import { env } from "@/env.mjs"

export interface PaymentConfirmationParams {
  email: string
  plan: string
  amountCents: number
  currency: string
  nextSteps: {
    signUpUrl: string
    supportEmail: string
  }
}

export interface PaymentConfirmationResult {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Send payment confirmation email
 *
 * @param params - Email parameters including recipient, plan, amount, and next steps
 * @returns Result with success status and email ID
 */
export async function sendPaymentConfirmationEmail(
  params: PaymentConfirmationParams
): Promise<PaymentConfirmationResult> {
  try {
    const provider = await getEmailProvider()

    // Format amount for display
    const amount = (params.amountCents / 100).toFixed(2)
    const currencySymbol = getCurrencySymbol(params.currency)

    // Get friendly plan name
    const planName = getPlanDisplayName(params.plan)

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - Capsule Note</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #6366f1; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Payment Successful! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                Thank you for subscribing to <strong>Capsule Note ${planName}</strong>!
              </p>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Payment Details</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                      ${currencySymbol}${amount} ${params.currency.toUpperCase()}
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                      ${planName} Plan
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af; font-size: 16px;">
                  Next Step: Complete Your Account
                </p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #1e3a8a; line-height: 20px;">
                  To activate your subscription and start writing letters to your future self, please complete your account setup:
                </p>
                <a href="${params.nextSteps.signUpUrl}"
                   style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Complete Signup →
                </a>
              </div>

              <!-- Benefits -->
              <p style="margin: 24px 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">
                What's Included:
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 22px;">
                <li style="margin-bottom: 8px;">✨ Unlimited letters to your future self</li>
                <li style="margin-bottom: 8px;">📧 Unlimited email deliveries</li>
                <li style="margin-bottom: 8px;">📮 2 physical mail deliveries per month</li>
                <li style="margin-bottom: 8px;">🔒 End-to-end encryption for your privacy</li>
                <li style="margin-bottom: 8px;">⏰ Smart scheduling with timezone support</li>
              </ul>

              <!-- Support -->
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280; line-height: 20px;">
                Questions? Reply to this email or contact us at
                <a href="mailto:${params.nextSteps.supportEmail}" style="color: #3b82f6; text-decoration: none;">
                  ${params.nextSteps.supportEmail}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 18px;">
                Capsule Note - Write letters to your future self<br>
                You received this email because you just subscribed to Capsule Note.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // Send email
    const result = await provider.send({
      from: env.EMAIL_FROM_NOTIFICATION || env.EMAIL_FROM || "noreply@capsulenote.com",
      to: params.email,
      subject: `Payment Confirmed - Welcome to Capsule Note ${planName}!`,
      html: emailHtml,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send email",
      }
    }

    return {
      success: true,
      emailId: result.id,
    }
  } catch (error) {
    console.error("[Payment Confirmation Email] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get currency symbol for display
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    jpy: "¥",
    cad: "CA$",
    aud: "A$",
  }

  return symbols[currency.toLowerCase()] || currency.toUpperCase()
}

/**
 * Get friendly plan display name
 */
function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",
  }

  return names[plan.toLowerCase()] || plan
}

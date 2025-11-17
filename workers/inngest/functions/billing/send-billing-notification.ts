/**
 * Billing Notification Email Function
 *
 * Sends billing-related emails via Inngest:
 * - Trial ending (3 days before)
 * - Payment failed (immediate)
 * - Subscription canceled
 * - Payment receipt
 *
 * Uses existing email provider abstraction.
 */

import { inngest } from "../../client"
import { getEmailSender } from "../../lib/email-config"

/**
 * Get email provider
 */
async function getEmailProvider() {
  const { getEmailProvider } = await import("../../../../apps/web/server/providers/email")
  return getEmailProvider()
}

/**
 * Format currency amount
 */
function formatAmount(amountCents: number, currency: string): string {
  return `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`
}

/**
 * Billing notification email function
 */
export const sendBillingNotification = inngest.createFunction(
  {
    id: "send-billing-notification",
    name: "Send Billing Notification",
    retries: 3,
  },
  { event: "billing/send-notification" },
  async ({ event, step }) => {
    const { template, userId, email, ...data } = event.data

    console.log("[Billing Notification] Sending email", {
      template,
      userId,
      email,
    })

    // Get email sender configuration
    const sender = getEmailSender("notification")

    // Prepare email based on template
    const emailContent = await step.run("prepare-email", async () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      
      switch (template) {
        case "trial-ending": {
          const trialEndsDate = new Date(data.trialEndsAt as string).toLocaleDateString()
          return {
            subject: "Your free trial ends in 3 days",
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Your Trial is Ending Soon</h1>
                <p style="color: #666; font-size: 16px;">
                  Your 14-day free trial of DearMe Pro will end in ${data.daysRemaining} days.
                </p>
                <p style="color: #666; font-size: 16px;">
                  After your trial ends on ${trialEndsDate}, 
                  you will be charged $9/month to continue using Pro features.
                </p>
                <div style="margin: 24px 0;">
                  <a href="${appUrl}/settings/billing" 
                     style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Manage Subscription
                  </a>
                </div>
                <p style="color: #999; font-size: 14px;">
                  If you do not want to continue, you can cancel anytime before your trial ends.
                </p>
              </div>
            `,
          }
        }

        case "payment-failed": {
          const amount = formatAmount(data.amountDue as number, data.currency as string)
          return {
            subject: "Payment failed for your DearMe subscription",
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #dc2626;">Payment Failed</h1>
                <p style="color: #666; font-size: 16px;">
                  We were unable to process your payment of ${amount}.
                </p>
                <p style="color: #666; font-size: 16px;">
                  This was attempt #${data.attemptCount}. Your payment method will be tried again automatically.
                </p>
                <div style="margin: 24px 0;">
                  <a href="${appUrl}/settings/billing" 
                     style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Update Payment Method
                  </a>
                </div>
                <p style="color: #999; font-size: 14px;">
                  Please update your payment method to avoid subscription cancellation.
                </p>
              </div>
            `,
          }
        }

        case "subscription-canceled":
          return {
            subject: "Your DearMe subscription has been canceled",
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Subscription Canceled</h1>
                <p style="color: #666; font-size: 16px;">
                  Your DearMe Pro subscription has been canceled.
                </p>
                <p style="color: #666; font-size: 16px;">
                  You will continue to have access to Pro features until the end of your billing period.
                </p>
                <div style="margin: 24px 0;">
                  <a href="${appUrl}/pricing" 
                     style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reactivate Subscription
                  </a>
                </div>
                <p style="color: #999; font-size: 14px;">
                  We would love to have you back anytime.
                </p>
              </div>
            `,
          }

        case "payment-receipt": {
          const amount = formatAmount(data.amountPaid as number, data.currency as string)
          return {
            subject: "Receipt for your DearMe payment",
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Payment Receipt</h1>
                <p style="color: #666; font-size: 16px;">
                  Thank you for your payment! Here are the details:
                </p>
                <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
                  <p style="margin: 0;"><strong>Amount:</strong> ${amount}</p>
                  <p style="margin: 8px 0 0;"><strong>Invoice:</strong> ${data.invoiceNumber}</p>
                </div>
                <div style="margin: 24px 0;">
                  <a href="${data.invoiceUrl}" 
                     style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 8px;">
                    View Invoice
                  </a>
                  <a href="${data.pdfUrl}" 
                     style="background: #666; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Download PDF
                  </a>
                </div>
                <p style="color: #999; font-size: 14px;">
                  This receipt has also been emailed to you from Stripe.
                </p>
              </div>
            `,
          }
        }

        default:
          throw new Error(`Unknown email template: ${template}`)
      }
    })

    // Send email via provider
    await step.run("send-email", async () => {
      const provider = await getEmailProvider()

      const result = await provider.send({
        from: sender.from,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      if (!result.success) {
        throw new Error(`Email send failed: ${result.error}`)
      }

      console.log("[Billing Notification] Email sent successfully", {
        template,
        userId,
        email,
        messageId: result.id,
      })

      return result
    })

    return { success: true, template, userId, email }
  }
)

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
      const lettersUrl = `${appUrl}/letters`
      const journeyUrl = `${appUrl}/journey`
      const settingsUrl = `${appUrl}/settings`

      // Variation B - Soft Brutalist email wrapper
      const wrapEmail = (content: string, accentColor: string = "#38C1B0") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; background-color: #F4EFE2; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <div style="font-size: 22px; color: #383838;">Capsule Note</div>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border: 2px solid #383838; border-radius: 2px;">
                <tr>
                  <td style="background-color: ${accentColor}; height: 6px;"></td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <div style="font-size: 11px; color: #666666;">
                <a href="${lettersUrl}" style="color: #383838; text-decoration: none;">My Letters</a>
                <span style="margin: 0 8px; color: #383838;">&middot;</span>
                <a href="${journeyUrl}" style="color: #383838; text-decoration: none;">Journey</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `

      switch (template) {
        case "trial-ending": {
          const trialEndsDate = new Date(data.trialEndsAt as string).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
          return {
            subject: "Your free trial ends in 3 days",
            html: wrapEmail(`
              <!-- Icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 64px; height: 64px; background-color: #FFDE00; border: 2px solid #383838; border-radius: 2px; text-align: center; vertical-align: middle; font-size: 28px;">
                    &#9200;
                  </td>
                </tr>
              </table>

              <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 24px 0 8px 0;">
                Your Trial is Ending Soon
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                Your 14-day free trial of Capsule Note Pro will end in <strong>${data.daysRemaining} days</strong>.
              </p>

              <!-- Details Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 1px solid rgba(56,56,56,0.15); border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 8px;">Trial Ends</div>
                    <div style="font-size: 18px; color: #383838; font-weight: bold;">${trialEndsDate}</div>
                    <div style="font-size: 13px; color: #666666; margin-top: 8px;">After this date, you'll be charged $9/month to continue using Pro features.</div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${settingsUrl}?tab=billing" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                Manage Subscription
              </a>

              <p style="font-size: 13px; color: #666666; margin: 24px 0 0 0;">
                If you do not want to continue, you can cancel anytime before your trial ends.
              </p>
            `, "#FFDE00"),
          }
        }

        case "payment-failed": {
          const amount = formatAmount(data.amountDue as number, data.currency as string)
          return {
            subject: "Payment failed for your Capsule Note subscription",
            html: wrapEmail(`
              <!-- Icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 64px; height: 64px; background-color: #FF6B6B; border: 2px solid #383838; border-radius: 2px; text-align: center; vertical-align: middle; font-size: 28px;">
                    &#9888;
                  </td>
                </tr>
              </table>

              <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 24px 0 8px 0;">
                Payment Failed
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                We were unable to process your payment of <strong>${amount}</strong>.
              </p>

              <!-- Warning Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFF5F5; border: 2px solid #FF6B6B; border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 14px; color: #383838;">
                      <strong>Attempt #${data.attemptCount}</strong><br />
                      Your payment method will be tried again automatically, but please update it to avoid subscription cancellation.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${settingsUrl}?tab=billing" style="display: inline-block; background-color: #FF6B6B; color: #ffffff; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                Update Payment Method
              </a>
            `, "#FF6B6B"),
          }
        }

        case "subscription-canceled":
          return {
            subject: "Your Capsule Note subscription has been canceled",
            html: wrapEmail(`
              <!-- Icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 64px; height: 64px; background-color: #F4EFE2; border: 2px solid #383838; border-radius: 2px; text-align: center; vertical-align: middle; font-size: 28px;">
                    &#128075;
                  </td>
                </tr>
              </table>

              <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 24px 0 8px 0;">
                Subscription Canceled
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                Your Capsule Note Pro subscription has been canceled.
              </p>

              <!-- Info Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 1px solid rgba(56,56,56,0.15); border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 14px; color: #383838;">
                      You will continue to have access to Pro features until the end of your current billing period. Your letters remain safe and encrypted.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${appUrl}/pricing" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                Reactivate Subscription
              </a>

              <p style="font-size: 13px; color: #666666; margin: 24px 0 0 0;">
                We'd love to have you back anytime.
              </p>
            `, "#383838"),
          }

        case "payment-receipt": {
          const amount = formatAmount(data.amountPaid as number, data.currency as string)
          return {
            subject: "Receipt for your Capsule Note payment",
            html: wrapEmail(`
              <!-- Icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 64px; height: 64px; background-color: #38C1B0; border: 2px solid #383838; border-radius: 2px; text-align: center; vertical-align: middle; font-size: 28px; color: #ffffff;">
                    &#10003;
                  </td>
                </tr>
              </table>

              <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 24px 0 8px 0;">
                Payment Successful
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                Thank you for your payment! Here are the details:
              </p>

              <!-- Receipt Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 2px solid #383838; border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #FFDE00; padding: 12px 20px; border-bottom: 2px solid #383838;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #383838;">
                      &#128203; Receipt
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">Amount</div>
                          <div style="font-size: 24px; color: #383838; font-weight: bold; margin-top: 4px;">${amount}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px dashed rgba(56,56,56,0.2);">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">Invoice</div>
                          <div style="font-size: 14px; color: #383838; margin-top: 4px;">${data.invoiceNumber}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTAs -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="${data.invoiceUrl}" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                      View Invoice
                    </a>
                  </td>
                  <td>
                    <a href="${data.pdfUrl}" style="display: inline-block; background-color: #ffffff; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                      Download PDF
                    </a>
                  </td>
                </tr>
              </table>
            `, "#38C1B0"),
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

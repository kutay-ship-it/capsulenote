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
 * Supports localization based on user's language preference.
 */

import { inngest } from "../../client"
import { prisma } from "@dearme/prisma"
import { getEmailSender } from "../../lib/email-config"
import { loadMessages, type Locale } from "../../lib/i18n/load-messages"

/**
 * Get email provider
 */
async function getEmailProvider() {
  const { getEmailProvider } = await import("../../../../apps/web/server/providers/email")
  return getEmailProvider()
}

/**
 * Format currency amount with locale awareness
 */
function formatAmount(amountCents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100)
}

/**
 * Format date with locale awareness
 */
function formatDate(dateStr: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
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

    // Check if email is suppressed (bounced/complained)
    const suppression = await step.run("check-suppression", async () => {
      const { checkEmailSuppression } = await import(
        "../../../../apps/web/server/lib/email-suppression"
      )
      return checkEmailSuppression(email)
    })

    if (suppression.isSuppressed) {
      console.log("[Billing Notification] Skipping - email suppressed", {
        template,
        userId,
        email,
        reason: suppression.reason,
      })
      return { skipped: true, reason: `suppressed:${suppression.reason}` }
    }

    // Fetch user's locale preference
    const userLocale = await step.run("fetch-locale", async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      })
      return (user?.profile?.locale as Locale) || "en"
    })

    // Load translated messages
    const messages = await step.run("load-messages", async () => {
      return loadMessages(userLocale)
    })

    // Get email sender configuration
    const sender = getEmailSender("notification")

    // Prepare email based on template
    const emailContent = await step.run("prepare-email", async () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const lettersUrl = `${appUrl}/letters`
      const journeyUrl = `${appUrl}/journey`
      const settingsUrl = `${appUrl}/settings`
      const m = messages.emails.billingNotifications

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
          const t = m.trialEnding
          const trialEndsDate = formatDate(data.trialEndsAt as string, userLocale)
          return {
            subject: t.subject.replace("{days}", String(data.daysRemaining)),
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
                ${t.headline}
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                ${t.body.replace("{days}", `<strong>${data.daysRemaining}</strong>`)}
              </p>

              <!-- Details Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 1px solid rgba(56,56,56,0.15); border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 8px;">${t.trialEndsLabel}</div>
                    <div style="font-size: 18px; color: #383838; font-weight: bold;">${trialEndsDate}</div>
                    <div style="font-size: 13px; color: #666666; margin-top: 8px;">${t.afterTrialNotice}</div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${settingsUrl}?tab=billing" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                ${t.manageSubscription}
              </a>

              <p style="font-size: 13px; color: #666666; margin: 24px 0 0 0;">
                ${t.cancelNotice}
              </p>
            `, "#FFDE00"),
          }
        }

        case "payment-failed": {
          const t = m.paymentFailed
          const amount = formatAmount(data.amountDue as number, data.currency as string, userLocale)
          return {
            subject: t.subject,
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
                ${t.headline}
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                ${t.body.replace("{amount}", `<strong>${amount}</strong>`)}
              </p>

              <!-- Warning Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFF5F5; border: 2px solid #FF6B6B; border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 14px; color: #383838;">
                      <strong>${t.attemptLabel.replace("{count}", String(data.attemptCount))}</strong><br />
                      ${t.retryNotice}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${settingsUrl}?tab=billing" style="display: inline-block; background-color: #FF6B6B; color: #ffffff; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                ${t.updatePaymentMethod}
              </a>
            `, "#FF6B6B"),
          }
        }

        case "subscription-canceled": {
          const t = m.subscriptionCanceled
          return {
            subject: t.subject,
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
                ${t.headline}
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                ${t.body}
              </p>

              <!-- Info Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 1px solid rgba(56,56,56,0.15); border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 14px; color: #383838;">
                      ${t.accessNotice}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${appUrl}/pricing" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                ${t.reactivate}
              </a>

              <p style="font-size: 13px; color: #666666; margin: 24px 0 0 0;">
                ${t.comeBack}
              </p>
            `, "#383838"),
          }
        }

        case "payment-receipt": {
          const t = m.paymentReceipt
          const amount = formatAmount(data.amountPaid as number, data.currency as string, userLocale)
          return {
            subject: t.subject,
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
                ${t.headline}
              </h1>

              <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                ${t.body}
              </p>

              <!-- Receipt Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 2px solid #383838; border-radius: 2px; margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #FFDE00; padding: 12px 20px; border-bottom: 2px solid #383838;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #383838;">
                      &#128203; ${t.receiptLabel}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">${t.amountLabel}</div>
                          <div style="font-size: 24px; color: #383838; font-weight: bold; margin-top: 4px;">${amount}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px dashed rgba(56,56,56,0.2);">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">${t.invoiceLabel}</div>
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
                      ${t.viewInvoice}
                    </a>
                  </td>
                  <td>
                    <a href="${data.pdfUrl}" style="display: inline-block; background-color: #ffffff; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                      ${t.downloadPdf}
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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const idempotencyKey = `billing-${template}-${userId}-${event.id}`

      const result = await provider.send({
        from: sender.from,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
        unsubscribeUrl: `${appUrl}/settings/notifications`,
      })

      if (!result.success) {
        throw new Error(`Email send failed: ${result.error}`)
      }

      console.log("[Billing Notification] Email sent successfully", {
        template,
        userId,
        email,
        messageId: result.id,
        idempotencyKey,
      })

      return result
    })

    return { success: true, template, userId, email }
  }
)

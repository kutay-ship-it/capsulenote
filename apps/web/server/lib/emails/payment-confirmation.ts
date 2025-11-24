/**
 * Payment Confirmation Email
 *
 * Sends confirmation email after successful payment for subscription
 */

import { getEmailProvider } from "../../providers/email"
import { loadMessages } from "@/lib/i18n/load-messages"
import type { Locale } from "@/i18n/routing"

export interface PaymentConfirmationEmailOptions {
  email: string
  plan: string
  amountCents: number
  currency: string
  locale?: Locale
  nextSteps: {
    signUpUrl: string
    supportEmail: string
  }
}

export interface EmailResult {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  options: PaymentConfirmationEmailOptions
): Promise<EmailResult> {
  try {
    const provider = await getEmailProvider()

    const locale: Locale = (options.locale as Locale) || "en"
    const messages = await loadMessages(locale)
    const m = messages.emails.paymentConfirmation

    const amount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: options.currency.toUpperCase(),
    }).format(options.amountCents / 100)
    const planName = options.plan.charAt(0).toUpperCase() + options.plan.slice(1)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${m.subject.replace("{plan}", planName)}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border: 2px solid #000; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #000; margin: 0 0 20px 0; font-size: 28px;">${m.headline}</h1>
            <p style="font-size: 16px; margin-bottom: 15px;">${m.thankYou.replace("{plan}", planName)}</p>
            <div style="background-color: #fff; border: 2px solid #000; padding: 20px; margin: 20px 0;">
              <h2 style="margin-top: 0; font-size: 20px;">${m.paymentDetails}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">${m.fields.plan}</td>
                  <td style="padding: 10px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">${m.fields.amount}</td>
                  <td style="padding: 10px 0;">${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">${m.fields.email}</td>
                  <td style="padding: 10px 0;">${options.email}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 30px 0;">
              <h2 style="font-size: 20px;">${m.nextStepsTitle}</h2>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">
                  <strong>${m.steps[0].split(":")[0]}:</strong>
                  <a href="${options.nextSteps.signUpUrl}" style="color: #0066cc; text-decoration: underline;">
                    ${m.steps[0].split(":")[1]?.trim() || m.steps[0]}
                  </a>
                </li>
                <li style="margin-bottom: 10px;">${m.steps[1]}</li>
                <li style="margin-bottom: 10px;">${m.steps[2]}</li>
              </ol>
            </div>

            <div style="background-color: #fff3cd; border: 2px solid #000; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                ${m.expiryNotice}
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                ${m.support.replace("{email}", `<a href="mailto:${options.nextSteps.supportEmail}" style="color: #0066cc;">${options.nextSteps.supportEmail}</a>`)}
              </p>
              <p style="font-size: 12px; color: #999; margin: 0;">
                ${m.automated}
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
${m.headline}

${m.text.thankYou.replace("{plan}", planName)}

${m.paymentDetails}:
- ${m.fields.plan} ${planName}
- ${m.fields.amount} ${amount}
- ${m.fields.email} ${options.email}

${m.nextStepsTitle}:
1. ${m.text.nextSteps[0].replace("{url}", options.nextSteps.signUpUrl)}
2. ${m.text.nextSteps[1]}
3. ${m.text.nextSteps[2]}

${m.text.expiryNotice}

${m.support.replace("{email}", options.nextSteps.supportEmail)}
    `.trim()

    const result = await provider.send({
      from: "Capsule Note <no-reply@letter.capsulenote.com>",
      to: options.email,
      subject: m.subject.replace("{plan}", planName),
      html,
      text,
    })

    if (result.success) {
      return {
        success: true,
        emailId: result.id,
      }
    } else {
      return {
        success: false,
        error: result.error || "Failed to send email",
      }
    }
  } catch (error) {
    console.error("[Payment Confirmation] Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

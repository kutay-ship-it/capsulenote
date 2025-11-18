/**
 * Payment Confirmation Email
 *
 * Sends confirmation email after successful payment for subscription
 */

import { getEmailProvider } from "../../providers/email"

export interface PaymentConfirmationEmailOptions {
  email: string
  plan: string
  amountCents: number
  currency: string
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

    const amount = (options.amountCents / 100).toFixed(2)
    const planName = options.plan.charAt(0).toUpperCase() + options.plan.slice(1)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border: 2px solid #000; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #000; margin: 0 0 20px 0; font-size: 28px;">Payment Confirmed! 🎉</h1>
            <p style="font-size: 16px; margin-bottom: 15px;">
              Thank you for subscribing to DearMe ${planName} plan.
            </p>
            <div style="background-color: #fff; border: 2px solid #000; padding: 20px; margin: 20px 0;">
              <h2 style="margin-top: 0; font-size: 20px;">Payment Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Plan:</td>
                  <td style="padding: 10px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Amount:</td>
                  <td style="padding: 10px 0;">${options.currency.toUpperCase()} $${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 10px 0;">${options.email}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 30px 0;">
              <h2 style="font-size: 20px;">Next Steps</h2>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">
                  <strong>Create your account:</strong>
                  <a href="${options.nextSteps.signUpUrl}" style="color: #0066cc; text-decoration: underline;">
                    Sign up here
                  </a> to activate your subscription
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Start writing:</strong> Once signed up, you can immediately start writing letters to your future self
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Schedule deliveries:</strong> Choose when you want to receive your letters
                </li>
              </ol>
            </div>

            <div style="background-color: #fff3cd; border: 2px solid #000; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>⏰ Important:</strong> Your subscription will expire in 30 days if you don't create an account.
                Sign up soon to keep your subscription active!
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                Need help? Contact us at <a href="mailto:${options.nextSteps.supportEmail}" style="color: #0066cc;">${options.nextSteps.supportEmail}</a>
              </p>
              <p style="font-size: 12px; color: #999; margin: 0;">
                This is an automated message from DearMe. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Payment Confirmed!

Thank you for subscribing to DearMe ${planName} plan.

Payment Details:
- Plan: ${planName}
- Amount: ${options.currency.toUpperCase()} $${amount}
- Email: ${options.email}

Next Steps:
1. Create your account: ${options.nextSteps.signUpUrl}
2. Start writing letters to your future self
3. Schedule deliveries for when you want to receive them

⏰ Important: Your subscription will expire in 30 days if you don't create an account.

Need help? Contact us at ${options.nextSteps.supportEmail}
    `.trim()

    const result = await provider.send({
      from: "DearMe <no-reply@dearme.app>",
      to: options.email,
      subject: `Payment Confirmed - Welcome to DearMe ${planName}!`,
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

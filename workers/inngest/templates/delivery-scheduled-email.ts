import { escape } from "html-escaper"

export interface DeliveryScheduledEmailData {
  letterTitle: string
  deliveryId: string
  deliveryDate: string // Formatted date with timezone
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  userFirstName?: string
  deliveryUrl: string
  dashboardUrl: string
}

/**
 * Generate HTML email for delivery scheduled confirmation
 */
export function generateDeliveryScheduledEmail(data: DeliveryScheduledEmailData): string {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    deliveryUrl,
    dashboardUrl,
  } = data

  const greeting = userFirstName ? `Hi ${escape(userFirstName)}` : "Hello"
  const methodText = deliveryMethod === "email" ? "Email" : "Physical Mail"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Scheduled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: #FFF9E6; border: 2px solid #333; padding: 30px; margin-bottom: 20px;">
    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">
      ✓ Delivery Scheduled
    </h1>
    <p style="margin: 0; font-size: 14px; color: #666;">
      Your letter to your future self is all set!
    </p>
  </div>

  <div style="background: white; border: 2px solid #333; padding: 30px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      ${greeting},
    </p>

    <p style="font-size: 16px; margin: 0 0 20px 0;">
      Great news! Your letter <strong>"${escape(letterTitle)}"</strong> has been scheduled for delivery.
    </p>

    <div style="background: #E8F4F8; border: 2px solid #333; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
        Delivery Details
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Delivery Date:</td>
          <td style="padding: 8px 0;">${escape(deliveryDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Delivery Method:</td>
          <td style="padding: 8px 0;">${methodText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Recipient:</td>
          <td style="padding: 8px 0;">${escape(recipientEmail)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      <strong>What happens next?</strong>
    </p>

    <ul style="font-size: 15px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
      <li>Your letter is safely stored and encrypted</li>
      <li>On the scheduled date, it will be ${deliveryMethod === "email" ? "emailed" : "sent by physical mail"} to ${escape(recipientEmail)}</li>
      <li>You'll receive a delivery confirmation when it's sent</li>
      <li>You can view or update the delivery anytime from your dashboard</li>
    </ul>

    <div style="margin: 30px 0;">
      <a href="${deliveryUrl}" style="display: inline-block; background: #333; color: white; padding: 12px 30px; text-decoration: none; border: 2px solid #333; text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px;">
        View Delivery Details →
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin: 20px 0 0 0;">
      Need to make changes? Visit your <a href="${dashboardUrl}" style="color: #333; text-decoration: underline;">dashboard</a> to manage all your letters and deliveries.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p style="margin: 0 0 5px 0;">
      Sent with ❤️ by <strong>DearMe</strong>
    </p>
    <p style="margin: 0;">
      Letters to your future self
    </p>
  </div>

</body>
</html>
  `.trim()
}

/**
 * Generate plain text email for delivery scheduled confirmation
 */
export function generateDeliveryScheduledEmailText(data: DeliveryScheduledEmailData): string {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    deliveryUrl,
    dashboardUrl,
  } = data

  const greeting = userFirstName ? `Hi ${userFirstName}` : "Hello"
  const methodText = deliveryMethod === "email" ? "Email" : "Physical Mail"

  return `
✓ DELIVERY SCHEDULED

${greeting},

Great news! Your letter "${letterTitle}" has been scheduled for delivery.

DELIVERY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Delivery Date: ${deliveryDate}
Delivery Method: ${methodText}
Recipient: ${recipientEmail}

WHAT HAPPENS NEXT?

• Your letter is safely stored and encrypted
• On the scheduled date, it will be ${deliveryMethod === "email" ? "emailed" : "sent by physical mail"} to ${recipientEmail}
• You'll receive a delivery confirmation when it's sent
• You can view or update the delivery anytime from your dashboard

VIEW DELIVERY DETAILS
${deliveryUrl}

Need to make changes? Visit your dashboard to manage all your letters and deliveries:
${dashboardUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent with ❤️ by DearMe
Letters to your future self
  `.trim()
}

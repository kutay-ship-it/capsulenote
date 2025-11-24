import { escape } from "html-escaper"

import { defaultLocale, loadMessages, type Locale } from "../lib/i18n/load-messages"

export interface DeliveryScheduledEmailData {
  letterTitle: string
  deliveryId: string
  deliveryDate: string // already formatted string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  userFirstName?: string
  deliveryUrl: string
  dashboardUrl: string
  locale?: Locale
}

export async function generateDeliveryScheduledEmail(data: DeliveryScheduledEmailData): Promise<string> {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    deliveryUrl,
    dashboardUrl,
    locale = defaultLocale,
  } = data

  const messages = await loadMessages(locale)
  const m = messages.emails.deliveryScheduled

  const greeting = userFirstName ? m.greeting.replace("{name}", escape(userFirstName)) : m.greeting.replace("{name}", "").trim() || "Hello"
  const methodText = m.methods[deliveryMethod]
  const channel = deliveryMethod === "email" ? m.methods.email.toLowerCase() : m.methods.mail.toLowerCase()

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${m.subject.replace("{title}", escape(letterTitle))}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: #FFF9E6; border: 2px solid #333; padding: 30px; margin-bottom: 20px;">
    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">
      ${m.headline}
    </h1>
    <p style="margin: 0; font-size: 14px; color: #666;">
      ${m.subhead}
    </p>
  </div>

  <div style="background: white; border: 2px solid #333; padding: 30px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      ${greeting},
    </p>

    <p style="font-size: 16px; margin: 0 0 20px 0;">
      ${m.body.replace("{title}", escape(letterTitle))}
    </p>

    <div style="background: #E8F4F8; border: 2px solid #333; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
        ${m.detailsLabel}
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">${m.fields.date}</td>
          <td style="padding: 8px 0;">${escape(deliveryDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">${m.fields.method}</td>
          <td style="padding: 8px 0;">${methodText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">${m.fields.recipient}</td>
          <td style="padding: 8px 0;">${escape(recipientEmail)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      <strong>${m.nextTitle}</strong>
    </p>

    <ul style="font-size: 15px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
      <li>${m.bullets[0]}</li>
      <li>${m.bullets[1].replace("{channel}", channel).replace("{recipient}", escape(recipientEmail))}</li>
      <li>${m.bullets[2]}</li>
      <li>${m.bullets[3]}</li>
    </ul>

    <div style="margin: 30px 0;">
      <a href="${deliveryUrl}" style="display: inline-block; background: #333; color: white; padding: 12px 30px; text-decoration: none; border: 2px solid #333; text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px;">
        ${m.cta}
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin: 20px 0 0 0;">
      ${m.change.replace("{dashboard}", `<a href="${dashboardUrl}" style="color: #333; text-decoration: underline;">${m.dashboardCta}</a>`)}
    </p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p style="margin: 0 0 5px 0;">
      ${m.footer.sentWith}
    </p>
    <p style="margin: 0;">
      ${m.footer.tagline}
    </p>
  </div>

</body>
</html>
  `.trim()
}

export async function generateDeliveryScheduledEmailText(data: DeliveryScheduledEmailData): Promise<string> {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    deliveryUrl,
    dashboardUrl,
    locale = defaultLocale,
  } = data

  const messages = await loadMessages(locale)
  const m = messages.emails.deliveryScheduled

  const greeting = userFirstName ? m.greeting.replace("{name}", userFirstName) : m.greeting.replace("{name}", "").trim() || "Hello"
  const methodText = m.methods[deliveryMethod]
  const channel = deliveryMethod === "email" ? m.methods.email.toLowerCase() : m.methods.mail.toLowerCase()

  return `
${m.text.headline}

${greeting},

${m.text.body.replace("{title}", letterTitle)}

${m.text.details}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${m.fields.date} ${deliveryDate}
${m.fields.method} ${methodText}
${m.fields.recipient} ${recipientEmail}

${m.text.whatNext}

• ${m.text.bullets[0]}
• ${m.text.bullets[1].replace("{channel}", channel).replace("{recipient}", recipientEmail)}
• ${m.text.bullets[2]}
• ${m.text.bullets[3]}

${m.text.view}
${deliveryUrl}

${m.text.change}
${dashboardUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${m.footer.sentWith}
${m.footer.tagline}
  `.trim()
}

import { escape } from "html-escaper"

import { defaultLocale, loadMessages, type Locale } from "../lib/i18n/load-messages"

export interface LetterCreatedEmailProps {
  letterTitle: string
  letterId: string
  userFirstName?: string
  letterUrl: string
  dashboardUrl: string
  locale?: Locale
}

export async function generateLetterCreatedEmail({
  letterTitle,
  userFirstName,
  letterUrl,
  dashboardUrl,
  locale = defaultLocale,
}: LetterCreatedEmailProps): Promise<string> {
  const sanitizedTitle = escape(letterTitle)
  const sanitizedFirstName = userFirstName ? escape(userFirstName) : null
  const messages = await loadMessages(locale)
  const m = messages.emails.letterCreated

  const greetingLine = sanitizedFirstName ? m.subheadPrefix.replace("{name}", sanitizedFirstName) : ""
  const subhead = sanitizedFirstName ? m.subhead.replace("{name}", "") : m.subheadNoName

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${m.subject.replace("{title}", sanitizedTitle)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">Capsule Note</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Letters to Your Future Self</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">${m.headline}</h1>
              <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.6;">${greetingLine}${subhead}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
                <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">${m.letterTitleLabel}</div>
                <div style="font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">"${sanitizedTitle}"</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${letterUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">${m.viewLetter}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${m.whatsNext}</h2>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${m.steps
                    .map(
                      (step: string) => `
                  <tr>
                    <td style="padding: 8px 0;">
                      <div style="font-size: 15px; color: #374151; line-height: 1.6;">${step}</div>
                    </td>
                  </tr>`
                    )
                    .join("")}
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; color: #1a1a1a; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 24px; border: 2px solid #e5e7eb; border-radius: 6px;">${m.dashboard}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <div style="font-size: 13px; color: #6b7280; text-align: center; line-height: 1.6;">
                ${m.footer.reason}<br>
                <a href="${dashboardUrl}/settings/notifications" style="color: #1a1a1a; text-decoration: underline;">${m.footer.manage}</a>
              </div>
              <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">${m.footer.copyright}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function generateLetterCreatedEmailText({
  letterTitle,
  userFirstName,
  letterUrl,
  dashboardUrl,
  locale = defaultLocale,
}: LetterCreatedEmailProps): Promise<string> {
  const messages = await loadMessages(locale)
  const m = messages.emails.letterCreated

  const sanitizedTitle = letterTitle.replace(/"/g, '\\"')
  const greeting = userFirstName
    ? m.text.greeting.replace("{name}", userFirstName)
    : m.text.greeting.replace("{name}", "").trim() || m.text.body

  return `
${greeting}

${m.text.body.replace("{title}", sanitizedTitle)}

${m.whatsNext}
- ${m.text.details[0]}
- ${m.text.details[1]}
- ${m.text.details[2]}

${m.text.view}: ${letterUrl}
${m.text.dashboard}: ${dashboardUrl}

${m.footer.reason}
${m.footer.manage}: ${dashboardUrl}/settings/notifications
  `.trim()
}

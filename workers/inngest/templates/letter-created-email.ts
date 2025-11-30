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

  const greeting = sanitizedFirstName ? `Welcome, ${sanitizedFirstName}!` : "Letter Created!"

  // Replace dashboard with letters/journey
  const lettersUrl = dashboardUrl.replace("/dashboard", "/letters")
  const journeyUrl = dashboardUrl.replace("/dashboard", "/journey")
  const settingsUrl = dashboardUrl.replace("/dashboard", "/settings")

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${m.subject.replace("{title}", sanitizedTitle)}</title>
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
              <div style="font-size: 11px; color: #666666; margin-top: 4px;">Letters to Your Future Self</div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border: 2px solid #383838; border-radius: 2px; box-shadow: -6px 6px 0 rgba(56,56,56,0.08);">
                <!-- Teal Bar -->
                <tr>
                  <td style="background-color: #38C1B0; height: 6px;"></td>
                </tr>

                <tr>
                  <td style="padding: 48px 40px;">
                    <!-- Success Icon -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width: 80px; height: 80px; background-color: #38C1B0; border: 2px solid #383838; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 36px;">
                                &#10003;
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <h1 style="font-size: 28px; font-weight: normal; color: #383838; margin: 0 0 8px 0; text-align: center;">
                      ${greeting}
                    </h1>

                    <p style="font-size: 15px; color: #666666; margin: 0 0 40px 0; text-align: center; line-height: 1.7;">
                      Your letter has been saved and encrypted.<br />
                      Ready to schedule it for future delivery?
                    </p>

                    <!-- Letter Title Card -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 2px solid #383838; border-radius: 2px; margin-bottom: 40px;">
                      <tr>
                        <td style="padding: 24px; text-align: center;">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 8px; font-weight: bold;">${m.letterTitleLabel}</div>
                          <div style="font-size: 20px; color: #383838; line-height: 1.4;">"${sanitizedTitle}"</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Steps -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
                      <tr>
                        <td>
                          <div style="font-size: 14px; font-weight: bold; color: #383838; margin-bottom: 20px;">${m.whatsNext}</div>
                        </td>
                      </tr>
                      <!-- Step 1 -->
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #6FC2FF; border: 2px solid #383838; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #383838;">1</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: middle;">
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">Review Your Letter</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">Make sure it says exactly what you want</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Connector -->
                      <tr>
                        <td>
                          <div style="border-left: 2px dashed rgba(56,56,56,0.15); height: 16px; margin-left: 15px;"></div>
                        </td>
                      </tr>
                      <!-- Step 2 -->
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #FFDE00; border: 2px solid #383838; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #383838;">2</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: middle;">
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">Schedule Delivery</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">Pick when future-you should receive it</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Connector -->
                      <tr>
                        <td>
                          <div style="border-left: 2px dashed rgba(56,56,56,0.15); height: 16px; margin-left: 15px;"></div>
                        </td>
                      </tr>
                      <!-- Step 3 -->
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #38C1B0; border: 2px solid #383838; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #ffffff;">&#10003;</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: middle;">
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">Receive &amp; Reflect</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">A gift from your past self arrives</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${letterUrl}" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 16px 40px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                            ${m.viewLetter}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <div style="font-size: 11px; color: #666666; margin-bottom: 16px;">
                <a href="${lettersUrl}" style="color: #383838; text-decoration: none;">My Letters</a>
                <span style="margin: 0 8px; color: #383838;">&#183;</span>
                <a href="${journeyUrl}" style="color: #383838; text-decoration: none;">Journey</a>
              </div>
              <div style="font-size: 11px; color: #666666;">
                <a href="${settingsUrl}/notifications" style="color: #383838; text-decoration: underline;">${m.footer.manage}</a>
              </div>
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
  const greeting = userFirstName ? `Welcome, ${userFirstName}!` : "Letter Created!"

  // Replace dashboard with letters/journey
  const lettersUrl = dashboardUrl.replace("/dashboard", "/letters")
  const journeyUrl = dashboardUrl.replace("/dashboard", "/journey")
  const settingsUrl = dashboardUrl.replace("/dashboard", "/settings")

  return `
CAPSULE NOTE
Letters to Your Future Self

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${greeting}

Your letter has been saved and encrypted.
Ready to schedule it for future delivery?

YOUR LETTER
─────────────────
"${sanitizedTitle}"

${m.whatsNext}
─────────────────
1. Review Your Letter - Make sure it says exactly what you want
2. Schedule Delivery - Pick when future-you should receive it
3. Receive & Reflect - A gift from your past self arrives

View your letter: ${letterUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

My Letters: ${lettersUrl}
Journey: ${journeyUrl}

Manage notifications: ${settingsUrl}/notifications

Sent with Capsule Note
  `.trim()
}

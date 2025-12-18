import { escape } from "html-escaper"

import { defaultLocale, loadMessages, type Locale } from "../lib/i18n/load-messages"

export interface LetterCreatedEmailProps {
  letterTitle: string
  letterId: string
  userFirstName?: string
  letterUrl: string
  lettersUrl: string
  journeyUrl: string
  notificationsUrl: string
  locale?: Locale
}

export async function generateLetterCreatedEmail({
  letterTitle,
  userFirstName,
  letterUrl,
  lettersUrl,
  journeyUrl,
  notificationsUrl,
  locale = defaultLocale,
}: LetterCreatedEmailProps): Promise<string> {
  const sanitizedTitle = escape(letterTitle)
  const sanitizedFirstName = userFirstName ? escape(userFirstName) : null
  const messages = await loadMessages(locale)
  const m = messages.emails.letterCreated

  const greeting = sanitizedFirstName
    ? m.greetingWithName.replace("{name}", sanitizedFirstName)
    : m.greetingNoName

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
              <div style="font-size: 11px; color: #666666; margin-top: 4px;">${m.tagline}</div>
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
                      ${m.savedMessage}<br />
                      ${m.schedulePrompt}
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
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">${m.stepsSection.review.title}</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">${m.stepsSection.review.description}</div>
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
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">${m.stepsSection.schedule.title}</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">${m.stepsSection.schedule.description}</div>
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
                                <div style="font-size: 14px; font-weight: bold; color: #383838;">${m.stepsSection.receive.title}</div>
                                <div style="font-size: 13px; color: #666666; margin-top: 4px;">${m.stepsSection.receive.description}</div>
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
                <a href="${lettersUrl}" style="color: #383838; text-decoration: none;">${m.nav.letters}</a>
                <span style="margin: 0 8px; color: #383838;">&#183;</span>
                <a href="${journeyUrl}" style="color: #383838; text-decoration: none;">${m.nav.journey}</a>
              </div>
              <div style="font-size: 11px; color: #666666;">
                <a href="${notificationsUrl}" style="color: #383838; text-decoration: underline;">${m.footer.manage}</a>
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
  lettersUrl,
  journeyUrl,
  notificationsUrl,
  locale = defaultLocale,
}: LetterCreatedEmailProps): Promise<string> {
  const messages = await loadMessages(locale)
  const m = messages.emails.letterCreated

  const sanitizedTitle = letterTitle.replace(/"/g, '\\"')
  const greeting = userFirstName
    ? m.greetingWithName.replace("{name}", userFirstName)
    : m.greetingNoName

  return `
CAPSULE NOTE
${m.tagline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${greeting}

${m.savedMessage}
${m.schedulePrompt}

${m.yourLetter}
─────────────────
"${sanitizedTitle}"

${m.whatsNext}
─────────────────
1. ${m.stepsSection.review.title} - ${m.stepsSection.review.description}
2. ${m.stepsSection.schedule.title} - ${m.stepsSection.schedule.description}
3. ${m.stepsSection.receive.title} - ${m.stepsSection.receive.description}

${m.viewLetter}: ${letterUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${m.nav.letters}: ${lettersUrl}
${m.nav.journey}: ${journeyUrl}

${m.footer.manage}: ${notificationsUrl}

${m.sentWith}
  `.trim()
}

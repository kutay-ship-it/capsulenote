import { escape } from "html-escaper"

import { defaultLocale, loadMessages, type Locale } from "../lib/i18n/load-messages"

export interface DeliveryScheduledEmailData {
  letterTitle: string
  deliveryId: string
  deliveryDate: string // already formatted string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  userFirstName?: string
  letterUrl: string
  scheduleUrl: string
  lettersUrl: string
  journeyUrl: string
  locale?: Locale
}

export async function generateDeliveryScheduledEmail(data: DeliveryScheduledEmailData): Promise<string> {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    letterUrl,
    scheduleUrl,
    lettersUrl,
    journeyUrl,
    locale = defaultLocale,
  } = data

  const messages = await loadMessages(locale)
  const m = messages.emails.deliveryScheduled

  const greeting = userFirstName
    ? m.greeting.replace("{name}", escape(userFirstName))
    : m.greetingDefault
  const methodText = m.methods[deliveryMethod]

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${m.subject.replace("{title}", escape(letterTitle))}</title>
</head>
<body style="margin: 0; padding: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; background-color: #F4EFE2; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">

          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <div style="font-size: 22px; font-weight: normal; color: #383838;">Capsule Note</div>
              <div style="font-size: 11px; color: #666666; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em;">${m.tagline}</div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border: 2px solid #383838; border-radius: 2px;">
                <!-- Accent Bar -->
                <tr>
                  <td style="background-color: #6FC2FF; height: 6px;"></td>
                </tr>

                <tr>
                  <td style="padding: 40px;">
                    <!-- Status Icon -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 64px; height: 64px; background-color: #6FC2FF; border: 2px solid #383838; border-radius: 2px; text-align: center; vertical-align: middle; font-size: 28px;">
                          &#128197;
                        </td>
                      </tr>
                    </table>

                    <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 24px 0 8px 0;">
                      ${m.headline}
                    </h1>

                    <p style="font-size: 15px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                      ${greeting}, ${m.bodySummary}
                    </p>

                    <!-- Timeline Visual -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2; border: 1px solid rgba(56,56,56,0.15); border-radius: 2px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 24px;">
                          <!-- Now -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width: 20px; vertical-align: top; padding-top: 4px;">
                                <div style="width: 12px; height: 12px; background-color: #38C1B0; border: 2px solid #383838; border-radius: 50%;"></div>
                              </td>
                              <td style="padding-left: 12px;">
                                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #38C1B0; font-weight: bold;">${m.timeline.now}</div>
                                <div style="font-size: 14px; color: #383838;">${m.timeline.nowDescription}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Connector Line -->
                          <div style="border-left: 2px dashed rgba(56,56,56,0.2); height: 24px; margin-left: 5px;"></div>

                          <!-- Delivery -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width: 20px; vertical-align: top; padding-top: 4px;">
                                <div style="width: 12px; height: 12px; background-color: #6FC2FF; border: 2px solid #383838; border-radius: 50%;"></div>
                              </td>
                              <td style="padding-left: 12px;">
                                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6FC2FF; font-weight: bold;">${m.timeline.delivery}</div>
                                <div style="font-size: 14px; color: #383838; font-weight: bold;">${escape(deliveryDate)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Details Table -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(56,56,56,0.1);">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 4px;">${m.labels.letter}</div>
                          <div style="font-size: 14px; color: #383838;">${escape(letterTitle)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(56,56,56,0.1);">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 4px;">${m.labels.deliveryMethod}</div>
                          <div style="font-size: 14px; color: #383838;">${methodText}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666; margin-bottom: 4px;">${m.labels.recipient}</div>
                          <div style="font-size: 14px; color: #383838;">${escape(recipientEmail)}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Buttons -->
	                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
	                      <tr>
	                        <td style="padding-right: 12px;">
	                          <a href="${letterUrl}" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
	                            ${m.buttons.viewDetails}
	                          </a>
	                        </td>
	                        <td>
	                          <a href="${scheduleUrl}" style="display: inline-block; background-color: #ffffff; color: #383838; padding: 14px 24px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
	                            ${m.buttons.editDelivery}
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
              <div style="font-size: 11px; color: #666666;">
                <a href="${lettersUrl}" style="color: #383838; text-decoration: none;">${m.nav.letters}</a>
                <span style="margin: 0 8px; color: #383838;">&#183;</span>
                <a href="${journeyUrl}" style="color: #383838; text-decoration: none;">${m.nav.journey}</a>
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

export async function generateDeliveryScheduledEmailText(data: DeliveryScheduledEmailData): Promise<string> {
  const {
    letterTitle,
    deliveryDate,
    deliveryMethod,
    recipientEmail,
    userFirstName,
    letterUrl,
    scheduleUrl,
    lettersUrl,
    journeyUrl,
    locale = defaultLocale,
  } = data

  const messages = await loadMessages(locale)
  const m = messages.emails.deliveryScheduled

  const greeting = userFirstName
    ? m.greeting.replace("{name}", userFirstName)
    : m.greetingDefault
  const methodText = m.methods[deliveryMethod]

  return `
CAPSULE NOTE
${m.tagline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${m.headline}

${greeting}, ${m.bodySummary}

${m.text.deliveryTimeline}
─────────────────
● ${m.timeline.now}: ${m.timeline.nowDescription}
│
○ ${m.timeline.delivery}: ${deliveryDate}

${m.text.details}
─────────────────
${m.labels.letter}: ${letterTitle}
${m.labels.deliveryMethod}: ${methodText}
${m.labels.recipient}: ${recipientEmail}

${m.text.viewUrl}: ${letterUrl}
${m.text.editUrl}: ${scheduleUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${m.nav.letters}: ${lettersUrl}
${m.nav.journey}: ${journeyUrl}

${m.footer.sentWith}
${m.footer.tagline}
  `.trim()
}

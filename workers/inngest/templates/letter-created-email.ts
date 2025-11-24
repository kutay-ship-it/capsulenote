/**
 * HTML email template for letter creation confirmation
 *
 * Mobile-first, accessible design compatible with major email clients
 */

import { escape } from "html-escaper"

export interface LetterCreatedEmailProps {
  letterTitle: string
  letterId: string
  userFirstName?: string
  letterUrl: string
  dashboardUrl: string
}

export function generateLetterCreatedEmail({
  letterTitle,
  letterId,
  userFirstName,
  letterUrl,
  dashboardUrl,
}: LetterCreatedEmailProps): string {
  // Sanitize user-provided content to prevent XSS
  const sanitizedTitle = escape(letterTitle)
  const sanitizedFirstName = userFirstName ? escape(userFirstName) : null

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Letter Created - Capsule Note</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Wrapper table for email client compatibility -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header with logo -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
                Capsule Note
              </div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                Letters to Your Future Self
              </div>
            </td>
          </tr>

          <!-- Success icon and headline -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <!-- Success checkmark icon -->
              <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">
                Your Letter Has Been Created
              </h1>

              <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                ${sanitizedFirstName ? `Hi ${sanitizedFirstName}, your` : 'Your'} letter has been safely saved and encrypted.
              </p>
            </td>
          </tr>

          <!-- Letter title box -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
                <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">
                  Letter Title
                </div>
                <div style="font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">
                  "${sanitizedTitle}"
                </div>
              </div>
            </td>
          </tr>

          <!-- Security reassurance -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;" width="33%">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        Encrypted &amp; Secure
                      </div>
                    </div>
                  </td>
                  <td style="padding: 8px 0; vertical-align: top;" width="33%">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        Only You Can Access
                      </div>
                    </div>
                  </td>
                  <td style="padding: 8px 0; vertical-align: top;" width="33%">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        Schedule Anytime
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${letterUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                View Your Letter
              </a>
            </td>
          </tr>

          <!-- Next steps section -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                  What's Next?
                </h2>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0;">
                      <div style="font-size: 15px; color: #374151; line-height: 1.6;">
                        📧 <strong>Schedule delivery</strong> to receive your letter at the perfect time
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <div style="font-size: 15px; color: #374151; line-height: 1.6;">
                        ✏️ <strong>Edit or add details</strong> whenever inspiration strikes
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <div style="font-size: 15px; color: #374151; line-height: 1.6;">
                        ➕ <strong>Create more letters</strong> for different future dates
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; color: #1a1a1a; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 24px; border: 2px solid #e5e7eb; border-radius: 6px;">
                Go to Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <div style="font-size: 13px; color: #6b7280; text-align: center; line-height: 1.6;">
                You're receiving this email because you created a letter on Capsule Note.<br>
                <a href="${dashboardUrl}/settings/notifications" style="color: #1a1a1a; text-decoration: underline;">Manage email preferences</a>
              </div>
              <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
                © 2025 Capsule Note. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
        <!-- End main container -->

      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generate plain text version of the email for clients that don't support HTML
 */
export function generateLetterCreatedEmailText({
  letterTitle,
  userFirstName,
  letterUrl,
  dashboardUrl,
}: LetterCreatedEmailProps): string {
  const greeting = userFirstName ? `Hi ${userFirstName}` : 'Hello'

  return `
${greeting},

Your Letter Has Been Created ✓

Your letter "${letterTitle}" has been safely saved and encrypted. It's ready whenever you want to schedule delivery to your future self.

🔒 Your letter is encrypted and secure
📝 Only you can access it
📅 Schedule delivery anytime

View your letter: ${letterUrl}

What's Next?
• Schedule delivery to receive your letter at the perfect time
• Edit or add details whenever inspiration strikes
• Create more letters for different future dates

Go to Dashboard: ${dashboardUrl}

---
You're receiving this email because you created a letter on Capsule Note.
Manage email preferences: ${dashboardUrl}/settings/notifications

© 2025 Capsule Note. All rights reserved.
`.trim()
}

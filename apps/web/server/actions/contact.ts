"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { ratelimit } from "@/server/lib/redis"
import { sendEmail } from "@/server/providers/email"
import { env } from "@/env.mjs"
import { ErrorCodes, type ActionResult } from "@dearme/types"

/**
 * Contact form validation schema
 */
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.enum(["general", "support", "sales", "press", "other"], {
    errorMap: () => ({ message: "Please select a subject" }),
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

/**
 * Contact form submission result
 */
export type ContactFormResult = ActionResult<{ messageId: string }>

/**
 * Human-readable subject labels
 */
const subjectLabels: Record<ContactFormInput["subject"], string> = {
  general: "General Inquiry",
  support: "Support Request",
  sales: "Sales Inquiry",
  press: "Press Inquiry",
  other: "Other",
}

/**
 * Submit contact form
 *
 * Rate limited to 5 requests per hour per IP address.
 * Sends email to support@capsulenote.com via the email provider.
 */
export async function submitContactForm(
  input: ContactFormInput
): Promise<ContactFormResult> {
  try {
    // 1. Rate limiting by IP
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim() ?? "127.0.0.1"

    const { success: rateLimitOk } = await ratelimit.contactForm.limit(ip)
    if (!rateLimitOk) {
      return {
        success: false,
        error: {
          code: ErrorCodes.RATE_LIMIT_EXCEEDED,
          message:
            "You have sent too many messages. Please try again in an hour.",
        },
      }
    }

    // 2. Validate form data
    const validated = contactFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Please check your form inputs",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const { name, email, subject, message } = validated.data
    const subjectLabel = subjectLabels[subject]

    // 3. Send email to support
    const result = await sendEmail({
      from: env.EMAIL_FROM,
      to: "support@capsulenote.com",
      subject: `[Contact Form] ${subjectLabel}: ${name}`,
      replyTo: email,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Contact Form Submission</title>
          </head>
          <body style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace; line-height: 1.6; color: #383838; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="border: 2px solid #383838; padding: 24px; border-radius: 2px;">
              <h2 style="margin: 0 0 20px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.05em;">
                New Contact Form Submission
              </h2>

              <div style="margin-bottom: 16px; padding: 12px; background-color: #6FC2FF20; border-left: 4px solid #6FC2FF;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #666;">From</p>
                <p style="margin: 4px 0 0 0; font-weight: bold;">${escapeHtml(name)}</p>
                <p style="margin: 2px 0 0 0;"><a href="mailto:${escapeHtml(email)}" style="color: #6FC2FF;">${escapeHtml(email)}</a></p>
              </div>

              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #666;">Subject</p>
                <p style="margin: 4px 0 0 0;">${escapeHtml(subjectLabel)}</p>
              </div>

              <div style="border-top: 2px dashed #38383820; padding-top: 16px; margin-top: 16px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #666;">Message</p>
                <div style="white-space: pre-wrap; background-color: #f8f8f7; padding: 16px; border-radius: 2px;">
${escapeHtml(message)}
                </div>
              </div>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
              Reply directly to this email to respond to ${escapeHtml(name)}.
            </p>
          </body>
        </html>
      `,
      text: `
New Contact Form Submission
===========================

From: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
      `.trim(),
    })

    if (!result.success) {
      console.error("[Contact] Email send failed:", result.error)
      return {
        success: false,
        error: {
          code: ErrorCodes.EMAIL_SEND_FAILED,
          message:
            "Failed to send your message. Please try again or email us directly at support@capsulenote.com",
        },
      }
    }

    console.log(`[Contact] Message sent successfully from ${email}, ID: ${result.id}`)

    return {
      success: true,
      data: { messageId: result.id },
    }
  } catch (error) {
    console.error("[Contact] Unexpected error:", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message:
          "An unexpected error occurred. Please try again or email us directly at support@capsulenote.com",
      },
    }
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

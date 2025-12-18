"use server"

import { createLetter } from "./letters"
import { scheduleDelivery } from "./deliveries"
import { redirect } from "next/navigation"
import { fromZonedTime } from "date-fns-tz"
import { getLocale } from "next-intl/server"
import { getUserTimezone } from "@/lib/utils"

export interface CreateLetterFormState {
  error?: string
  fieldErrors?: {
    title?: string
    body?: string
    recipientEmail?: string
    deliveryDate?: string
  }
}

/**
 * Form action for creating a letter with scheduling
 * Compatible with useActionState for progressive enhancement
 */
export async function createLetterFormAction(
  prevState: CreateLetterFormState,
  formData: FormData
): Promise<CreateLetterFormState> {
  const title = formData.get("title") as string
  const body = formData.get("body") as string
  const recipientEmail = formData.get("recipientEmail") as string
  const deliveryDate = formData.get("deliveryDate") as string
  const deliveryType = (formData.get("deliveryType") as string) || "email"
  const timezone = (formData.get("timezone") as string) || getUserTimezone()

  // Client-side validation (mirror of letter-editor-form validation)
  const fieldErrors: CreateLetterFormState["fieldErrors"] = {}

  if (!title?.trim()) {
    fieldErrors.title = "Title is required"
  }

  if (!body?.trim()) {
    fieldErrors.body = "Letter content is required"
  }

  if (!recipientEmail?.trim()) {
    fieldErrors.recipientEmail = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    fieldErrors.recipientEmail = "Invalid email format"
  }

  if (!deliveryDate) {
    fieldErrors.deliveryDate = "Delivery date is required"
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  // Convert plain text body to TipTap JSON and HTML
  const paragraphs = body.split('\n').filter(p => p.trim()).map(p => ({
    type: 'paragraph',
    content: [{ type: 'text', text: p }]
  }))

  const bodyRich = {
    type: 'doc',
    content: paragraphs.length > 0 ? paragraphs : [
      { type: 'paragraph', content: [{ type: 'text', text: body }] }
    ]
  }

  const bodyHtml = body
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('')

  // Create the letter
  const result = await createLetter({
    title,
    bodyRich,
    bodyHtml,
    tags: [],
    visibility: 'private' as const,
  })

  if (!result.success) {
    return { error: result.error.message }
  }

  const letterId = result.data.letterId

  // Schedule delivery if date provided
  if (deliveryDate) {
    try {
      const deliverAt = fromZonedTime(`${deliveryDate}T09:00`, timezone)

      await scheduleDelivery({
        letterId,
        channel: deliveryType === "physical" ? "mail" : "email",
        deliverAt,
        timezone,
        toEmail: recipientEmail,
      })
    } catch (scheduleError) {
      // Letter created but scheduling failed - still redirect to letter
      console.error("[createLetterFormAction] Scheduling failed:", scheduleError)
    }
  }

  // Redirect to the created letter
  const locale = await getLocale()
  const prefix = locale === "en" ? "" : `/${locale}`
  redirect(`${prefix}/letters/${letterId}`)
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char)
}

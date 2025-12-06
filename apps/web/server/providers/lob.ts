/**
 * Lob Physical Mail Provider
 *
 * Handles physical letter delivery via Lob's Print & Mail API.
 *
 * Key concepts:
 * - use_type: Required field - "operational" for transactional mail (letters to self),
 *   "marketing" for promotional mail
 * - Test vs Live: Test API keys create mock mail (no actual delivery)
 * - Address verification: Validate addresses before sending to reduce bounce rates
 * - Webhooks: Track mail through USPS (in_transit, processed_for_delivery, delivered)
 * - Templates: V3-branded letter templates with variable substitution
 *
 * @see https://docs.lob.com/ for full API documentation
 * @see scripts/test-lob-api.ts for proof of concept tests
 */

import { format } from "date-fns"
import Lob from "lob"
import { env } from "@/env.mjs"
import {
  renderLetter,
  sanitizeLetterContentForPrint,
  getProductionSenderAddress,
  getEnvelopeConfig,
  type RenderLetterOptions,
} from "@/server/templates/mail"

const lobApiKey = env.LOB_API_KEY
const lobTemplateId = env.LOB_TEMPLATE_ID
const lobTemplateVersionId = env.LOB_TEMPLATE_VERSION_ID
const LOB_HTML_CHAR_LIMIT = 10000

// Debug: Log template config on module load
console.log("[Lob] Module initialized", {
  hasApiKey: !!lobApiKey,
  templateId: lobTemplateId || "(not set)",
  templateVersionId: lobTemplateVersionId || "(not set)",
})

export const lob = lobApiKey ? new Lob(lobApiKey) : null

type LobApiError = Error & {
  statusCode?: number
  lobMessage?: string
}

export interface MailingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface MailOptions {
  to: MailingAddress
  html?: string
  color?: boolean
  doubleSided?: boolean
  description?: string
  /** Mail type classification - defaults to "operational" for Capsule Note letters */
  useType?: "marketing" | "operational"
  /** USPS mail class - defaults to first_class for faster delivery */
  mailType?: "usps_first_class" | "usps_standard"
  /** Idempotency key to prevent duplicate sends on retry (format: delivery-{id}-attempt-{n}) */
  idempotencyKey?: string
  /**
   * Scheduled send date (Lob holds until this date)
   * Max 180 days in future. Format: Date object or YYYY-MM-DD string.
   * Letters with send_date are cancellable until the send date.
   */
  sendDate?: Date | string
  /** Use a stored Lob template instead of inline HTML */
  lobTemplateId?: string
  lobTemplateVersionId?: string
  mergeVariables?: Record<string, unknown>
}

export interface SendLetterResult {
  id: string
  url: string
  expectedDeliveryDate: string
  /** Scheduled send date if letter was created with sendDate */
  sendDate?: string
  carrier: string
  trackingNumber?: string
  thumbnails?: { small: string; medium: string; large: string }[]
}

export interface AddressVerificationResult {
  isValid: boolean
  deliverability: string
  suggestedAddress?: {
    primaryLine: string
    secondaryLine?: string
    city: string
    state: string
    zipCode: string
    zipCodePlus4?: string
  }
  error?: string
}

/**
 * Get the sender address for Lob API calls
 * Uses production overrides from env vars if configured
 */
function getSenderAddress() {
  return getProductionSenderAddress()
}

export async function sendLetter(options: MailOptions): Promise<SendLetterResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  const envelopeConfig = getEnvelopeConfig()

  try {
    // Build request params
    const params: Parameters<typeof lob.letters.create>[0] = {
      description: options.description || "Letter to Future Self",
      to: {
        name: options.to.name,
        address_line1: options.to.line1,
        address_line2: options.to.line2,
        address_city: options.to.city,
        address_state: options.to.state,
        address_zip: options.to.postalCode,
        address_country: options.to.country,
      },
      from: getSenderAddress(),
      color: options.color ?? false,
      double_sided: options.doubleSided ?? false,
      address_placement: envelopeConfig.address_placement,
      mail_type: options.mailType ?? "usps_first_class",
      use_type: options.useType ?? "operational", // Required by Lob API
    }

    // Choose between inline HTML and stored template
    // IMPORTANT: Lob requires template_id to be passed as the 'file' parameter, NOT as 'template_id'
    if (options.lobTemplateId) {
      // Pass template_id as the file parameter (Lob API requirement)
      params.file = options.lobTemplateId
      if (options.mergeVariables) {
        params.merge_variables = options.mergeVariables
      }
      console.log("[Lob] Request params with template:", {
        file: params.file,
        merge_variables_keys: params.merge_variables ? Object.keys(params.merge_variables) : [],
        apiKeyPrefix: lobApiKey?.substring(0, 10),
      })
    } else if (options.html) {
      params.file = options.html
    } else {
      throw new Error("Missing Lob letter content (HTML or template)")
    }

    // Add scheduled send date if provided (Lob holds letter until this date)
    if (options.sendDate) {
      const sendDate = options.sendDate instanceof Date
        ? options.sendDate.toISOString().split("T")[0]
        : options.sendDate
      params.send_date = sendDate
    }

    // Pass idempotency key via header (payload rejects idempotency_key)
    const headers: Record<string, string> = {}
    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey
    }

    const letter = await lob.letters.create(params, headers)

    return {
      id: letter.id,
      url: letter.url,
      expectedDeliveryDate: letter.expected_delivery_date,
      sendDate: letter.send_date,
      carrier: letter.carrier,
      trackingNumber: (letter as { tracking_number?: string }).tracking_number,
      thumbnails: letter.thumbnails as unknown as { small: string; medium: string; large: string }[],
    }
  } catch (error: any) {
    const statusCode = error?.status_code
    const lobMessage =
      error?.message ||
      error?._response?.body?.error?.message ||
      (typeof error === "string" ? error : "Unknown Lob error")

    console.error("Lob API error:", lobMessage, {
      statusCode,
      details: error?._response?.body?.error?.details,
    })

    const normalizedError = new Error(
      statusCode === 422 ? `Lob validation error: ${lobMessage || "Invalid request"}` : "Failed to send letter via Lob"
    ) as LobApiError
    normalizedError.name = statusCode === 422 ? "LobValidationError" : "LobApiError"
    normalizedError.statusCode = statusCode
    normalizedError.lobMessage = lobMessage

    throw normalizedError
  }
}

/**
 * Verify a US address using Lob's US Verification API
 */
export async function verifyUsAddress(
  address: Omit<MailingAddress, "name" | "country">
): Promise<AddressVerificationResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  try {
    const verification = await lob.usVerifications.verify({
      primary_line: address.line1,
      secondary_line: address.line2,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
    })

    const isDeliverable =
      verification.deliverability === "deliverable" ||
      verification.deliverability === "deliverable_unnecessary_unit" ||
      verification.deliverability === "deliverable_incorrect_unit" ||
      verification.deliverability === "deliverable_missing_unit"

    return {
      isValid: isDeliverable,
      deliverability: verification.deliverability,
      suggestedAddress: isDeliverable
        ? {
            primaryLine: verification.primary_line,
            secondaryLine: verification.secondary_line,
            city: verification.components?.city ?? address.city,
            state: verification.components?.state ?? address.state,
            zipCode: verification.components?.zip_code ?? address.postalCode,
            zipCodePlus4: verification.components?.zip_code_plus_4,
          }
        : undefined,
      error: !isDeliverable ? verification.deliverability : undefined,
    }
  } catch (error: any) {
    console.error("US address verification error:", error?.message || error)
    return {
      isValid: false,
      deliverability: "verification_failed",
      error: error?.message || "Verification failed",
    }
  }
}

/**
 * Verify an international address using Lob's International Verification API
 */
export async function verifyIntlAddress(
  address: Omit<MailingAddress, "name">
): Promise<AddressVerificationResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  try {
    const verification = await lob.intlVerifications.verify({
      primary_line: address.line1,
      secondary_line: address.line2,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country,
    })

    const isDeliverable =
      verification.deliverability === "deliverable" ||
      verification.deliverability === "deliverable_missing_info"

    return {
      isValid: isDeliverable,
      deliverability: verification.deliverability,
      suggestedAddress: isDeliverable
        ? {
            primaryLine: verification.primary_line,
            secondaryLine: verification.secondary_line,
            city: verification.components?.city ?? address.city,
            state: verification.components?.state ?? address.state,
            zipCode: verification.components?.postal_code ?? address.postalCode,
          }
        : undefined,
      error: !isDeliverable ? verification.deliverability : undefined,
    }
  } catch (error: any) {
    console.error("International address verification error:", error?.message || error)
    return {
      isValid: false,
      deliverability: "verification_failed",
      error: error?.message || "Verification failed",
    }
  }
}

/**
 * Unified address verification - auto-routes to US or International based on country
 */
export async function verifyAddress(
  address: Omit<MailingAddress, "name">
): Promise<AddressVerificationResult> {
  // Route to appropriate verification endpoint based on country
  const { country, ...usAddressFields } = address
  if (country === "US" || country === "USA" || country === "United States") {
    return verifyUsAddress(usAddressFields)
  }
  return verifyIntlAddress(address)
}

/**
 * Retrieve a letter by ID to check tracking status
 */
export async function getLetter(letterId: string) {
  if (!lob) {
    throw new Error("Lob API key not configured")
  }

  try {
    const letter = await lob.letters.retrieve(letterId)
    return {
      id: letter.id,
      status: letter.deleted ? "deleted" : "active",
      expectedDeliveryDate: letter.expected_delivery_date,
      trackingEvents: letter.tracking_events || [],
      url: letter.url,
    }
  } catch (error: any) {
    console.error("Get letter error:", error?.message || error)
    throw new Error(`Failed to retrieve letter: ${error?.message || "Unknown error"}`)
  }
}

/**
 * Cancel a letter if it hasn't been processed yet
 * Note: Only works for letters that haven't been sent to the print queue
 */
export async function cancelLetter(letterId: string) {
  if (!lob) {
    throw new Error("Lob API key not configured")
  }

  try {
    // Lob SDK v6 uses delete method to cancel letters
    const result = await lob.letters.delete(letterId)
    return {
      id: result.id,
      deleted: result.deleted,
    }
  } catch (error: any) {
    console.error("Cancel letter error:", error?.message || error)
    throw new Error(`Failed to cancel letter: ${error?.message || "Unknown error"}`)
  }
}

/**
 * Check if Lob is properly configured
 */
export function isLobConfigured(): boolean {
  return !!lob
}

// =============================================================================
// Templated Letter Functions (V3 Branding)
// =============================================================================

/**
 * Options for sending a templated letter with V3 branding
 */
export interface TemplatedLetterOptions {
  /** Recipient mailing address */
  to: MailingAddress
  /** Letter content as HTML (from Tiptap editor) */
  letterContent: string
  /** Date the letter was written */
  writtenDate: Date
  /** Date the letter is being delivered (defaults to today) */
  deliveryDate?: Date
  /** Optional letter title */
  letterTitle?: string
  /** Recipient name displayed in greeting (defaults to "Future Self") */
  recipientName?: string
  /** Print in color (costs more) */
  color?: boolean
  /** Print on both sides */
  doubleSided?: boolean
  /** Custom description for Lob dashboard */
  description?: string
  /** USPS mail class */
  mailType?: "usps_first_class" | "usps_standard"
  /** Use minimal template (smaller file size) */
  minimalTemplate?: boolean
  /** Idempotency key to prevent duplicate sends on retry (format: delivery-{id}-attempt-{n}) */
  idempotencyKey?: string
  /**
   * Scheduled send date (Lob holds until this date)
   * Max 180 days in future. Letters are cancellable until send date.
   */
  sendDate?: Date | string
}

/**
 * Create a normalized error for Lob HTML size violations
 */
function createLobHtmlTooLargeError(length: number, originalLength?: number) {
  const error = new Error(
    `LOB_HTML_TOO_LARGE: Rendered letter HTML is ${length} characters; Lob accepts a maximum of ${LOB_HTML_CHAR_LIMIT}. Please shorten or simplify the letter for physical mail.`
  ) as Error & {
    code?: string
    details?: Record<string, unknown>
  }
  error.name = "LobHtmlTooLargeError"
  error.code = "LOB_HTML_TOO_LARGE"
  error.details = {
    length,
    limit: LOB_HTML_CHAR_LIMIT,
    originalLength: originalLength ?? length,
  }
  return error
}

/**
 * Ensure rendered HTML fits Lob's 10k character limit, falling back to
 * the minimal template when possible.
 */
function chooseTemplateHtml(
  options: RenderLetterOptions & { minimal?: boolean }
): { html: string; length: number; minimalApplied: boolean } {
  const primaryHtml = renderLetter(options)
  const primaryLength = primaryHtml.length
  let html = primaryHtml
  let length = primaryLength
  let minimalApplied = options.minimal ?? false

  // If over limit and not already minimal, try minimal template automatically
  if (!minimalApplied && primaryLength > LOB_HTML_CHAR_LIMIT) {
    const minimalHtml = renderLetter({ ...options, minimal: true })
    const minimalLength = minimalHtml.length

    if (minimalLength < primaryLength) {
      minimalApplied = true
      html = minimalHtml
      length = minimalLength
      console.warn("[Lob] Falling back to minimal template to fit size limit", {
        primaryLength,
        minimalLength,
      })
    }
  }

  if (length > LOB_HTML_CHAR_LIMIT) {
    throw createLobHtmlTooLargeError(length, primaryLength)
  }

  return { html, length, minimalApplied }
}

function getConfiguredLobTemplate() {
  if (!lobTemplateId) {
    console.log("[Lob] No template ID configured, will use inline HTML")
    return null
  }
  console.log("[Lob] Template configured", {
    templateId: lobTemplateId,
    templateVersionId: lobTemplateVersionId || "latest",
  })
  return {
    templateId: lobTemplateId,
    templateVersionId: lobTemplateVersionId || undefined,
  }
}

function buildLobMergeVariables(options: TemplatedLetterOptions) {
  const formattedWrittenDate = format(options.writtenDate, "MMMM d, yyyy")
  const formattedDeliveryDate = format(options.deliveryDate ?? new Date(), "MMMM d, yyyy")

  return {
    // Note: 'variable_name' is required by the Lob template but not used in output
    // It exists in the template merge_variables.keys so we must provide it
    variable_name: "",
    recipient_name: options.recipientName ?? "Future Self",
    letter_content: sanitizeLetterContentForPrint(options.letterContent),
    written_date: formattedWrittenDate,
    delivery_date: formattedDeliveryDate,
    // Use empty string instead of null to avoid Lob printing "null"
    // The Lob template should handle empty strings appropriately
    letter_title: options.letterTitle ?? "",
  }
}

/**
 * Send a letter using the V3 Capsule Note branded template
 *
 * This is the recommended function for sending physical letters.
 * It automatically renders the letter with proper branding and styling.
 *
 * @example
 * ```typescript
 * const result = await sendTemplatedLetter({
 *   to: {
 *     name: "John Doe",
 *     line1: "123 Main St",
 *     city: "San Francisco",
 *     state: "CA",
 *     postalCode: "94107",
 *     country: "US",
 *   },
 *   letterContent: "<p>Dear Future Self, remember to...</p>",
 *   writtenDate: new Date("2024-01-01"),
 *   letterTitle: "New Year Reflections",
 * })
 * ```
 */
export async function sendTemplatedLetter(
  options: TemplatedLetterOptions
): Promise<SendLetterResult> {
  const templateConfig = getConfiguredLobTemplate()

  const sendInlineLetter = () => {
    console.log("[Lob] Sending letter with inline HTML template")
    const { html: renderedHtml, length, minimalApplied } = chooseTemplateHtml({
      recipientName: options.recipientName,
      letterContent: options.letterContent,
      writtenDate: options.writtenDate,
      deliveryDate: options.deliveryDate,
      letterTitle: options.letterTitle,
      minimal: options.minimalTemplate,
    })

    console.log("[Lob] Inline HTML prepared", {
      htmlLength: length,
      minimalApplied,
      charLimit: LOB_HTML_CHAR_LIMIT,
    })

    return sendLetter({
      to: options.to,
      html: renderedHtml,
      color: options.color,
      doubleSided: options.doubleSided,
      description:
        options.description || `Capsule Note: ${options.letterTitle || "Letter to Future Self"}`,
      mailType: options.mailType,
      useType: "operational",
      idempotencyKey: options.idempotencyKey,
      sendDate: options.sendDate,
    })
  }

  // Prefer stored Lob template to avoid inline size limits
  if (templateConfig) {
    const mergeVariables = buildLobMergeVariables(options)

    console.log("[Lob] Sending letter with stored template", {
      templateId: templateConfig.templateId,
      templateVersionId: templateConfig.templateVersionId,
      mergeVariableKeys: Object.keys(mergeVariables),
      recipientName: mergeVariables.recipient_name,
      letterTitle: mergeVariables.letter_title || "(none)",
      contentLength: (mergeVariables.letter_content as string).length,
    })

    try {
      const result = await sendLetter({
        to: options.to,
        color: options.color,
        doubleSided: options.doubleSided,
        description:
          options.description || `Capsule Note: ${options.letterTitle || "Letter to Future Self"}`,
        mailType: options.mailType,
        useType: "operational", // Capsule Note letters are always operational
        idempotencyKey: options.idempotencyKey,
        sendDate: options.sendDate,
        lobTemplateId: templateConfig.templateId,
        lobTemplateVersionId: templateConfig.templateVersionId,
        mergeVariables,
      })

      console.log("[Lob] Template letter sent successfully", {
        letterId: result.id,
        expectedDelivery: result.expectedDeliveryDate,
      })

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const statusCode = (error as LobApiError)?.statusCode
      const shouldFallbackToInline =
        statusCode === 422 && message.toLowerCase().includes("file is required")

      if (shouldFallbackToInline) {
        console.warn("[Lob] Template send failed, falling back to inline HTML", {
          reason: message,
          templateId: templateConfig.templateId,
          templateVersionId: templateConfig.templateVersionId,
        })
        return sendInlineLetter()
      }

      throw error
    }
  }

  // Fallback: Render inline HTML (auto-fallback to minimal if oversized)
  return sendInlineLetter()
}

/**
 * Preview a templated letter without sending
 *
 * Returns the rendered HTML for display in the browser.
 * Useful for showing users what their letter will look like.
 */
export function previewTemplatedLetter(
  options: Omit<TemplatedLetterOptions, "to">
): string {
  return renderLetter({
    recipientName: options.recipientName,
    letterContent: options.letterContent,
    writtenDate: options.writtenDate,
    deliveryDate: options.deliveryDate,
    letterTitle: options.letterTitle,
    minimal: options.minimalTemplate,
  })
}

// Re-export template utilities for convenience
export { renderLetter, type RenderLetterOptions } from "@/server/templates/mail"

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
import {
  stripHtmlTags,
  estimatePageCount,
  LOB_MAX_PAGES,
  FIXED_TEMPLATE_PAGES,
  CONTENT_PAGE_LIMIT,
} from "@/lib/page-estimation"

const lobApiKey = env.LOB_API_KEY
const lobTemplateId = env.LOB_TEMPLATE_ID
const lobTemplateVersionId = env.LOB_TEMPLATE_VERSION_ID
const LOB_HTML_CHAR_LIMIT = 10000

// Debug: Log template config on module load (avoid noisy logs in production builds)
if (process.env.NODE_ENV !== "production") {
  console.log("[Lob] Module initialized", {
    hasApiKey: !!lobApiKey,
    templateId: lobTemplateId || "(not set)",
    templateVersionId: lobTemplateVersionId || "(not set)",
  })
}

export const lob = lobApiKey ? new Lob(lobApiKey) : null

type LobApiError = Error & {
  statusCode?: number
  lobMessage?: string
}

type LobSdkError = {
  status_code?: unknown
  message?: unknown
  _response?: {
    body?: {
      error?: {
        message?: unknown
        details?: unknown
      }
    }
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (!error || typeof error !== "object") return "Unknown error"
  const message = (error as { message?: unknown }).message
  return typeof message === "string" ? message : "Unknown error"
}

function getLobErrorInfo(error: unknown): { statusCode?: number; message: string; details?: unknown } {
  if (!error || typeof error !== "object") {
    return { message: getErrorMessage(error) }
  }

  const err = error as LobSdkError
  const statusCode = typeof err.status_code === "number" ? err.status_code : undefined
  const responseMessage = err._response?.body?.error?.message
  const message =
    typeof err.message === "string"
      ? err.message
      : typeof responseMessage === "string"
        ? responseMessage
        : getErrorMessage(error)

  return { statusCode, message, details: err._response?.body?.error?.details }
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
  /**
   * Recipient address - either a MailingAddress object or a Lob address ID (adr_xxx).
   * Using address IDs is recommended for international mail to avoid formatting issues.
   */
  to: MailingAddress | string
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
    // Determine if 'to' is a Lob address ID or inline address
    const toAddress: Parameters<typeof lob.letters.create>[0]["to"] =
      typeof options.to === "string"
        ? options.to // Use Lob address ID directly (adr_xxx)
        : {
            // Build inline address object
            name: options.to.name,
            address_line1: options.to.line1,
            address_line2: options.to.line2,
            address_city: options.to.city,
            address_state: options.to.state,
            address_zip: options.to.postalCode,
            address_country: options.to.country,
          }

    // Log which approach is being used
    if (typeof options.to === "string") {
      console.log("[Lob] Using address ID for recipient:", options.to)
    }

    // Build request params
    const params: Parameters<typeof lob.letters.create>[0] = {
      description: options.description || "Letter to Future Self",
      to: toAddress,
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
  } catch (error) {
    const { statusCode, message: lobMessage, details } = getLobErrorInfo(error)

    console.error("Lob API error:", lobMessage, {
      statusCode,
      details,
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
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("US address verification error:", message)
    return {
      isValid: false,
      deliverability: "verification_failed",
      error: message || "Verification failed",
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
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("International address verification error:", message)
    return {
      isValid: false,
      deliverability: "verification_failed",
      error: message || "Verification failed",
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

// =============================================================================
// Lob Address Object Functions (Address ID System)
// =============================================================================
// Using Lob Address IDs (adr_xxx) instead of inline addresses prevents
// address formatting issues that occur with international addresses.
// The Address ID system lets Lob normalize and store addresses properly.

/**
 * Character limits for Lob addresses
 * @see https://docs.lob.com/#tag/Addresses/operation/address_create
 */
export const LOB_ADDRESS_LIMITS = {
  /** Max chars for name field (US addresses) */
  NAME_US: 40,
  /** Max chars for name field (international) */
  NAME_INTL: 50,
  /** Max chars for address_line1 */
  ADDRESS_LINE1: 64,
  /** Max chars for address_line2 */
  ADDRESS_LINE2: 64,
  /** Max chars for city */
  CITY: 200,
  /** Max chars for state */
  STATE: 200,
  /** Max chars for postal code */
  POSTAL_CODE: 40,
  /** Legacy: Combined limit for address_line1 + address_line2 for inline addresses */
  COMBINED_ADDRESS_LINES_LEGACY: 50,
}

/**
 * Result of Lob address creation
 */
export interface LobAddressResult {
  /** Lob address ID (adr_xxx format) */
  id: string
  /** Normalized address components */
  normalized: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  /** ISO timestamp of creation */
  dateCreated: string
}

/**
 * Address validation result
 */
export interface AddressValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a mailing address against Lob's character limits
 *
 * IMPORTANT: This checks the individual field limits, not the legacy
 * combined 50-char limit. The Address ID system has more generous limits.
 */
export function validateAddressForLob(
  address: MailingAddress
): AddressValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const isUS = address.country === "US" || address.country === "USA"
  const nameLimit = isUS ? LOB_ADDRESS_LIMITS.NAME_US : LOB_ADDRESS_LIMITS.NAME_INTL

  // Check name
  if (!address.name || address.name.trim().length === 0) {
    errors.push("Name is required")
  } else if (address.name.length > nameLimit) {
    errors.push(`Name exceeds ${nameLimit} character limit (${address.name.length} chars)`)
  }

  // Check line1
  if (!address.line1 || address.line1.trim().length === 0) {
    errors.push("Address line 1 is required")
  } else if (address.line1.length > LOB_ADDRESS_LIMITS.ADDRESS_LINE1) {
    errors.push(`Address line 1 exceeds ${LOB_ADDRESS_LIMITS.ADDRESS_LINE1} character limit (${address.line1.length} chars)`)
  }

  // Check line2 (optional)
  if (address.line2 && address.line2.length > LOB_ADDRESS_LIMITS.ADDRESS_LINE2) {
    errors.push(`Address line 2 exceeds ${LOB_ADDRESS_LIMITS.ADDRESS_LINE2} character limit (${address.line2.length} chars)`)
  }

  // Check city
  if (!address.city || address.city.trim().length === 0) {
    errors.push("City is required")
  } else if (address.city.length > LOB_ADDRESS_LIMITS.CITY) {
    errors.push(`City exceeds ${LOB_ADDRESS_LIMITS.CITY} character limit (${address.city.length} chars)`)
  }

  // Check state
  if (!address.state || address.state.trim().length === 0) {
    warnings.push("State/province is empty (may be required for some countries)")
  } else if (address.state.length > LOB_ADDRESS_LIMITS.STATE) {
    errors.push(`State exceeds ${LOB_ADDRESS_LIMITS.STATE} character limit (${address.state.length} chars)`)
  }

  // Check postal code
  if (!address.postalCode || address.postalCode.trim().length === 0) {
    errors.push("Postal code is required")
  } else if (address.postalCode.length > LOB_ADDRESS_LIMITS.POSTAL_CODE) {
    errors.push(`Postal code exceeds ${LOB_ADDRESS_LIMITS.POSTAL_CODE} character limit (${address.postalCode.length} chars)`)
  }

  // Check country
  if (!address.country || address.country.trim().length === 0) {
    errors.push("Country is required")
  } else if (address.country.length !== 2) {
    warnings.push("Country should be a 2-letter ISO code (e.g., 'US', 'TR')")
  }

  // Warn about legacy combined limit (for information)
  const combinedLength = (address.line1?.length || 0) + (address.line2?.length || 0)
  if (combinedLength > LOB_ADDRESS_LIMITS.COMBINED_ADDRESS_LINES_LEGACY) {
    warnings.push(
      `Combined address lines (${combinedLength} chars) exceed legacy 50-char inline limit. ` +
      `Using Address ID system to avoid formatting issues.`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Create a Lob address object and return its ID
 *
 * This stores the address in Lob's system and returns an address ID (adr_xxx)
 * that can be used in letter creation. Using address IDs avoids formatting
 * issues that occur with inline addresses, especially for international mail.
 *
 * @example
 * ```typescript
 * const address = await createLobAddress({
 *   name: "John Doe",
 *   line1: "North Istanbul Sitesi E Blok Daire 8",
 *   line2: "Zekeriyaköy Mahallesi",
 *   city: "Sarıyer",
 *   state: "İstanbul",
 *   postalCode: "34450",
 *   country: "TR",
 * })
 *
 * // Use address.id (adr_xxx) in letter creation
 * ```
 */
export async function createLobAddress(
  address: MailingAddress,
  options?: {
    /** Optional description for the address */
    description?: string
    /** Custom metadata (max 20 keys) */
    metadata?: Record<string, string>
  }
): Promise<LobAddressResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  // Validate address before sending to Lob
  const validation = validateAddressForLob(address)
  if (!validation.isValid) {
    const error = new Error(`Invalid address: ${validation.errors.join("; ")}`) as Error & {
      code?: string
      validationErrors?: string[]
    }
    error.name = "LobAddressValidationError"
    error.code = "ADDRESS_VALIDATION_FAILED"
    error.validationErrors = validation.errors
    throw error
  }

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn("[Lob] Address validation warnings:", validation.warnings)
  }

  try {
    const lobAddress = await lob.addresses.create({
      name: address.name,
      address_line1: address.line1,
      address_line2: address.line2,
      address_city: address.city,
      address_state: address.state,
      address_zip: address.postalCode,
      address_country: address.country,
      description: options?.description,
      metadata: options?.metadata,
    })

    console.log("[Lob] Address created successfully", {
      id: lobAddress.id,
      name: lobAddress.name,
      city: lobAddress.address_city,
      country: lobAddress.address_country,
    })

    return {
      id: lobAddress.id,
      normalized: {
        name: lobAddress.name,
        line1: lobAddress.address_line1,
        line2: lobAddress.address_line2,
        city: lobAddress.address_city,
        state: lobAddress.address_state,
        postalCode: lobAddress.address_zip,
        country: lobAddress.address_country,
      },
      dateCreated: lobAddress.date_created,
    }
  } catch (error) {
    const { statusCode, message: lobMessage } = getLobErrorInfo(error)

    console.error("[Lob] Address creation error:", lobMessage, {
      statusCode,
      address: {
        name: address.name,
        city: address.city,
        country: address.country,
      },
    })

    const normalizedError = new Error(
      statusCode === 422
        ? `Lob address validation error: ${lobMessage}`
        : `Failed to create Lob address: ${lobMessage}`
    ) as LobApiError
    normalizedError.name = statusCode === 422 ? "LobValidationError" : "LobApiError"
    normalizedError.statusCode = statusCode
    normalizedError.lobMessage = lobMessage

    throw normalizedError
  }
}

/**
 * Retrieve a Lob address by ID
 */
export async function getLobAddress(addressId: string): Promise<LobAddressResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  if (!addressId.startsWith("adr_")) {
    throw new Error(`Invalid Lob address ID format: ${addressId}. Expected format: adr_xxx`)
  }

  try {
    const lobAddress = await lob.addresses.retrieve(addressId)

    return {
      id: lobAddress.id,
      normalized: {
        name: lobAddress.name,
        line1: lobAddress.address_line1,
        line2: lobAddress.address_line2,
        city: lobAddress.address_city,
        state: lobAddress.address_state,
        postalCode: lobAddress.address_zip,
        country: lobAddress.address_country,
      },
      dateCreated: lobAddress.date_created,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("[Lob] Get address error:", message)
    throw new Error(`Failed to retrieve Lob address: ${message}`)
  }
}

/**
 * Delete a Lob address (soft delete)
 */
export async function deleteLobAddress(addressId: string): Promise<{ id: string; deleted: boolean }> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  if (!addressId.startsWith("adr_")) {
    throw new Error(`Invalid Lob address ID format: ${addressId}. Expected format: adr_xxx`)
  }

  try {
    const result = await lob.addresses.delete(addressId)
    console.log("[Lob] Address deleted", { id: result.id, deleted: result.deleted })
    return {
      id: result.id,
      deleted: result.deleted,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("[Lob] Delete address error:", message)
    throw new Error(`Failed to delete Lob address: ${message}`)
  }
}

/**
 * Check if a string is a Lob address ID
 */
export function isLobAddressId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("adr_")
}

// =============================================================================
// Address Normalization Functions
// =============================================================================
// These functions fix common address field mapping issues that occur with
// international addresses, particularly Turkish addresses where:
// - Neighborhoods (mahalle) and districts (ilçe) get combined in line2
// - City field incorrectly contains province instead of district
// - State field correctly has province but duplicates city
//
// Turkish Address Hierarchy (correct mapping):
// - line2: Mahalle (neighborhood) - e.g., "Zekeriyaköy Mahallesi"
// - city: İlçe (district) - e.g., "Sarıyer"
// - state: İl (province) - e.g., "İstanbul"

/**
 * Result of address normalization
 */
export interface AddressNormalizationResult {
  /** The normalized address */
  address: MailingAddress
  /** Whether any normalization was applied */
  wasNormalized: boolean
  /** Description of what was changed */
  changes: string[]
}

/**
 * Turkish districts (ilçe) by province
 * Used to detect when a district name is incorrectly placed in line2
 */
const TURKISH_DISTRICTS: Record<string, string[]> = {
  // İstanbul districts (most common)
  "İstanbul": [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
    "Eyüp", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy",
    "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe",
    "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli",
    "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"
  ],
  // Ankara districts
  "Ankara": [
    "Akyurt", "Altındağ", "Ayaş", "Balâ", "Beypazarı", "Çamlıdere", "Çankaya",
    "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana",
    "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan",
    "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"
  ],
  // İzmir districts
  "İzmir": [
    "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova",
    "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe",
    "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz",
    "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar",
    "Selçuk", "Tire", "Torbalı", "Urla"
  ],
}

/**
 * Common Turkish neighborhood suffixes
 */
const TURKISH_NEIGHBORHOOD_SUFFIXES = [
  "Mahallesi", "Mah.", "Mah", "Köyü", "Sitesi", "Evleri"
]

/**
 * Normalize an address for Lob API
 *
 * This function fixes common address field mapping issues, particularly for
 * Turkish addresses where:
 * - Neighborhoods and districts are combined in line2
 * - City incorrectly contains province instead of district
 *
 * @example
 * ```typescript
 * // BEFORE (incorrect):
 * const address = {
 *   name: "Kutay Sakallıoğlu",
 *   line1: "North Istanbul Sitesi E Blok Daire 8",
 *   line2: "Zekeriyaköy Mahallesi, Sarıyer",  // District mixed in
 *   city: "İstanbul",                          // Province, not district
 *   state: "İstanbul",                         // Correct
 *   postalCode: "34450",
 *   country: "TR",
 * }
 *
 * // AFTER (normalized):
 * const { address: normalized } = normalizeAddressForLob(address)
 * // normalized = {
 * //   name: "Kutay Sakallıoğlu",
 * //   line1: "North Istanbul Sitesi E Blok Daire 8",
 * //   line2: "Zekeriyaköy Mahallesi",         // Just neighborhood
 * //   city: "Sarıyer",                         // District extracted
 * //   state: "İstanbul",                       // Province unchanged
 * //   postalCode: "34450",
 * //   country: "TR",
 * // }
 * ```
 */
export function normalizeAddressForLob(
  address: MailingAddress
): AddressNormalizationResult {
  const changes: string[] = []
  let normalized = { ...address }

  // Only normalize Turkish addresses for now
  if (address.country !== "TR") {
    return {
      address: normalized,
      wasNormalized: false,
      changes: [],
    }
  }

  console.log("[Lob] Normalizing Turkish address", {
    originalLine2: address.line2,
    originalCity: address.city,
    originalState: address.state,
  })

  // Detect the common problem pattern: city === state (both are province)
  // This indicates the district was likely put in line2 instead of city
  const cityEqualsState = normalizeString(address.city) === normalizeString(address.state)

  if (cityEqualsState && address.line2) {
    // Try to extract district from line2
    const extractedDistrict = extractDistrictFromLine2(address.line2, address.state)

    if (extractedDistrict) {
      // Move district to city, update line2 to just neighborhood
      normalized.city = extractedDistrict.district
      normalized.line2 = extractedDistrict.neighborhood || undefined

      changes.push(
        `Extracted district "${extractedDistrict.district}" from line2 to city`,
        `Updated line2 to "${extractedDistrict.neighborhood || "(empty)"}"`
      )

      console.log("[Lob] Turkish address normalized", {
        extractedDistrict: extractedDistrict.district,
        newLine2: normalized.line2,
        newCity: normalized.city,
      })
    }
  }

  // Also check if line2 contains a district name even if city !== state
  // This handles cases where the data has a different issue
  if (!changes.length && address.line2) {
    const districtInLine2 = findDistrictInString(address.line2, address.state || address.city)

    if (districtInLine2 && normalizeString(address.city) !== normalizeString(districtInLine2)) {
      // District found in line2 but city is different - extract it
      const cleanedLine2 = removeDistrictFromLine2(address.line2, districtInLine2)

      if (cleanedLine2 !== address.line2) {
        // Check if current city looks like a province (common large cities)
        const largeCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"]
        const cityIsProvince = largeCities.some(
          lc => normalizeString(lc) === normalizeString(address.city)
        )

        if (cityIsProvince) {
          normalized.city = districtInLine2
          normalized.line2 = cleanedLine2 || undefined

          changes.push(
            `Extracted district "${districtInLine2}" from line2 to city`,
            `Updated line2 to "${cleanedLine2 || "(empty)"}"`
          )
        }
      }
    }
  }

  return {
    address: normalized,
    wasNormalized: changes.length > 0,
    changes,
  }
}

/**
 * Normalize string for comparison (lowercase, remove diacritics)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ı/g, "i")  // Turkish dotless i
    .replace(/ş/g, "s")  // Turkish s with cedilla
    .replace(/ğ/g, "g")  // Turkish soft g
    .replace(/ü/g, "u")  // Turkish u with umlaut
    .replace(/ö/g, "o")  // Turkish o with umlaut
    .replace(/ç/g, "c")  // Turkish c with cedilla
    .trim()
}

/**
 * Extract district and neighborhood from line2
 *
 * Common patterns:
 * - "Zekeriyaköy Mahallesi, Sarıyer" → { neighborhood: "Zekeriyaköy Mahallesi", district: "Sarıyer" }
 * - "Zekeriyaköy, Sarıyer" → { neighborhood: "Zekeriyaköy", district: "Sarıyer" }
 * - "Sarıyer" (just district) → { neighborhood: null, district: "Sarıyer" }
 */
function extractDistrictFromLine2(
  line2: string,
  province: string
): { neighborhood: string | null; district: string } | null {
  // Get districts for this province
  const districts = getDistrictsForProvince(province)
  if (!districts.length) {
    // If we don't have district list, try to parse by comma
    return parseByComma(line2)
  }

  // Check if line2 contains a district name
  const foundDistrict = districts.find(district => {
    const normalizedDistrict = normalizeString(district)
    const normalizedLine2 = normalizeString(line2)
    return normalizedLine2.includes(normalizedDistrict)
  })

  if (!foundDistrict) {
    // No known district found, try comma parsing
    return parseByComma(line2)
  }

  // Extract the neighborhood part (everything except the district)
  const neighborhood = removeDistrictFromLine2(line2, foundDistrict)

  return {
    neighborhood: neighborhood || null,
    district: foundDistrict,
  }
}

/**
 * Parse line2 by comma to extract neighborhood and district
 */
function parseByComma(line2: string): { neighborhood: string | null; district: string } | null {
  // Check for comma separation: "Neighborhood, District"
  const commaParts = line2.split(",").map(p => p.trim())

  if (commaParts.length >= 2) {
    // Last part is likely the district
    const possibleDistrict = commaParts[commaParts.length - 1]!
    const neighborhood = commaParts.slice(0, -1).join(", ")

    // Basic validation: district shouldn't contain neighborhood suffixes
    const isNeighborhood = TURKISH_NEIGHBORHOOD_SUFFIXES.some(
      suffix => possibleDistrict.includes(suffix)
    )

    if (!isNeighborhood && possibleDistrict.length > 2) {
      return {
        neighborhood: neighborhood || null,
        district: possibleDistrict,
      }
    }
  }

  return null
}

/**
 * Find a district name within a string
 */
function findDistrictInString(str: string, province: string): string | null {
  const districts = getDistrictsForProvince(province)

  for (const district of districts) {
    if (normalizeString(str).includes(normalizeString(district))) {
      return district
    }
  }

  return null
}

/**
 * Remove district name from line2, returning the neighborhood part
 */
function removeDistrictFromLine2(line2: string, district: string): string {
  // Try various patterns to remove the district
  const patterns = [
    new RegExp(`,\\s*${escapeRegex(district)}\\s*$`, "i"),  // ", District" at end
    new RegExp(`\\s*${escapeRegex(district)}\\s*,`, "i"),   // "District ," anywhere
    new RegExp(`\\s*${escapeRegex(district)}\\s*$`, "i"),   // "District" at end
    new RegExp(`^\\s*${escapeRegex(district)}\\s*,`, "i"),  // "District, " at start
  ]

  let result = line2
  for (const pattern of patterns) {
    result = result.replace(pattern, "")
  }

  return result.trim()
}

/**
 * Get districts for a given province
 */
function getDistrictsForProvince(province: string): string[] {
  // Normalize the province name for lookup
  const normalizedProvince = normalizeString(province)

  for (const [prov, districts] of Object.entries(TURKISH_DISTRICTS)) {
    if (normalizeString(prov) === normalizedProvince) {
      return districts
    }
  }

  return []
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
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
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Get letter error:", message)
    throw new Error(`Failed to retrieve letter: ${message}`)
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
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Cancel letter error:", message)
    throw new Error(`Failed to cancel letter: ${message}`)
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
  /**
   * Recipient address - either a MailingAddress object or a Lob address ID (adr_xxx).
   * Using address IDs is recommended for international mail to avoid formatting issues.
   */
  to: MailingAddress | string
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
 * Create a normalized error for Lob page limit violations
 */
function createLobPageLimitExceededError(
  contentPages: number,
  totalPages: number
) {
  const error = new Error(
    `LOB_PAGE_LIMIT_EXCEEDED: Letter would be approximately ${totalPages} pages (${contentPages} content + ${FIXED_TEMPLATE_PAGES} fixed). Lob allows a maximum of ${LOB_MAX_PAGES} pages (${CONTENT_PAGE_LIMIT} content pages). Please shorten your letter.`
  ) as Error & {
    code?: string
    details?: Record<string, unknown>
  }
  error.name = "LobPageLimitExceededError"
  error.code = "LOB_PAGE_LIMIT_EXCEEDED"
  error.details = {
    contentPages,
    totalPages,
    maxTotalPages: LOB_MAX_PAGES,
    maxContentPages: CONTENT_PAGE_LIMIT,
    fixedTemplatePages: FIXED_TEMPLATE_PAGES,
  }
  return error
}

/**
 * Validate that letter content doesn't exceed Lob's page limit
 */
function validatePageLimit(letterContent: string): void {
  const plainText = stripHtmlTags(letterContent)
  const contentPages = estimatePageCount(plainText)
  const totalPages = FIXED_TEMPLATE_PAGES + contentPages

  if (totalPages > LOB_MAX_PAGES) {
    console.warn("[Lob] Letter exceeds page limit", {
      contentPages,
      totalPages,
      maxPages: LOB_MAX_PAGES,
      characterCount: plainText.length,
    })
    throw createLobPageLimitExceededError(contentPages, totalPages)
  }
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
  // Validate page limit before proceeding (final safety check)
  validatePageLimit(options.letterContent)

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

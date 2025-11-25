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
 *
 * @see https://docs.lob.com/ for full API documentation
 * @see scripts/test-lob-api.ts for proof of concept tests
 */

import Lob from "lob"
import { env } from "@/env.mjs"

const lobApiKey = env.LOB_API_KEY

export const lob = lobApiKey ? new Lob(lobApiKey) : null

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
  html: string
  color?: boolean
  doubleSided?: boolean
  description?: string
  /** Mail type classification - defaults to "operational" for Capsule Note letters */
  useType?: "marketing" | "operational"
  /** USPS mail class - defaults to first_class for faster delivery */
  mailType?: "usps_first_class" | "usps_standard"
}

export interface SendLetterResult {
  id: string
  url: string
  expectedDeliveryDate: string
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

// Capsule Note sender address - should be configured for production
const SENDER_ADDRESS = {
  name: "Capsule Note",
  address_line1: "185 Berry Street", // Example address - configure for production
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94107",
  address_country: "US",
}

export async function sendLetter(options: MailOptions): Promise<SendLetterResult> {
  if (!lob) {
    throw new Error("Lob API key not configured - set LOB_API_KEY environment variable")
  }

  try {
    const letter = await lob.letters.create({
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
      from: SENDER_ADDRESS,
      file: options.html,
      color: options.color ?? false,
      double_sided: options.doubleSided ?? false,
      address_placement: "top_first_page",
      mail_type: options.mailType ?? "usps_first_class",
      use_type: options.useType ?? "operational", // Required by Lob API
    })

    return {
      id: letter.id,
      url: letter.url,
      expectedDeliveryDate: letter.expected_delivery_date,
      carrier: letter.carrier,
      trackingNumber: letter.tracking_number,
      thumbnails: letter.thumbnails,
    }
  } catch (error: any) {
    console.error("Lob API error:", error?.message || error)
    if (error?.status_code === 422) {
      throw new Error(`Lob validation error: ${error?.message || "Invalid request"}`)
    }
    throw new Error("Failed to send letter via Lob")
  }
}

export async function verifyAddress(
  address: Omit<MailingAddress, "name">
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
            city: verification.components?.city,
            state: verification.components?.state,
            zipCode: verification.components?.zip_code,
            zipCodePlus4: verification.components?.zip_code_plus_4,
          }
        : undefined,
      error: !isDeliverable ? verification.deliverability : undefined,
    }
  } catch (error: any) {
    console.error("Address verification error:", error?.message || error)
    return {
      isValid: false,
      deliverability: "verification_failed",
      error: error?.message || "Verification failed",
    }
  }
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

/**
 * Clerk User Metadata Schemas
 *
 * Type-safe schemas for Clerk user metadata fields.
 * These are used to pass data from client-side signup flows
 * to server-side webhook/auto-provision handlers.
 *
 * @module clerk-metadata
 */

import { z } from "zod"

/**
 * IANA timezone schema
 * Validates that the string is a valid IANA timezone identifier
 */
const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  },
  { message: "Invalid IANA timezone identifier" }
)

/**
 * Clerk Public Metadata Schema
 *
 * Public metadata is visible to the frontend and in JWTs.
 * Use for non-sensitive data that the client needs access to.
 */
export const clerkPublicMetadataSchema = z.object({
  /** Email address locked for checkout flow */
  lockedEmail: z.string().email().optional(),
})

export type ClerkPublicMetadata = z.infer<typeof clerkPublicMetadataSchema>

/**
 * Clerk Unsafe Metadata Schema
 *
 * Unsafe metadata can be written by the client but is not
 * included in JWTs. Use for client-detected values that
 * need to be passed to server-side handlers.
 */
export const clerkUnsafeMetadataSchema = z.object({
  /** Email address locked for checkout flow */
  lockedEmail: z.string().email().optional(),

  /**
   * Browser-detected timezone (IANA format)
   *
   * Set by TimezoneDetector component during signup.
   * Read by Clerk webhook and auto-provision handlers.
   *
   * @example "Europe/Istanbul", "America/New_York"
   */
  detectedTimezone: timezoneSchema.optional(),
})

export type ClerkUnsafeMetadata = z.infer<typeof clerkUnsafeMetadataSchema>

/**
 * Parse and validate Clerk unsafe metadata
 *
 * @param metadata - Raw metadata from Clerk user object
 * @returns Validated metadata or null if invalid
 *
 * @example
 * const metadata = parseClerkUnsafeMetadata(clerkUser.unsafeMetadata)
 * const timezone = metadata?.detectedTimezone || "UTC"
 */
export function parseClerkUnsafeMetadata(
  metadata: unknown
): ClerkUnsafeMetadata | null {
  const result = clerkUnsafeMetadataSchema.safeParse(metadata)
  return result.success ? result.data : null
}

/**
 * Extract detected timezone from Clerk metadata
 *
 * Safely extracts and validates the detected timezone.
 * Returns null if metadata is invalid or timezone not set.
 *
 * @param metadata - Raw unsafe_metadata from Clerk
 * @returns Validated timezone string or null
 *
 * @example
 * const timezone = getDetectedTimezoneFromMetadata(evt.data.unsafe_metadata)
 * const profileTimezone = timezone || "UTC"
 */
export function getDetectedTimezoneFromMetadata(
  metadata: unknown
): string | null {
  const parsed = parseClerkUnsafeMetadata(metadata)
  return parsed?.detectedTimezone ?? null
}

/**
 * Validate a timezone string
 *
 * @param timezone - String to validate
 * @returns true if valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  return timezoneSchema.safeParse(timezone).success
}

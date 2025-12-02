/**
 * Secure Token Generation
 *
 * Provides cryptographically secure token generation for:
 * - Share link tokens (256-bit)
 * - Idempotency keys
 * - Session tokens
 *
 * @module lib/tokens
 */

import { randomBytes, randomUUID } from "crypto"

/**
 * Generate a cryptographically secure share token
 *
 * Creates a 256-bit (32 byte) token encoded as URL-safe base64.
 * This provides significantly more entropy than UUID v4 (~122 bits).
 *
 * Entropy: 2^256 combinations (vs UUID's 2^122)
 *
 * @returns URL-safe base64 encoded token (43 characters)
 *
 * @example
 * const token = generateSecureShareToken()
 * // Returns: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v"
 */
export function generateSecureShareToken(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * Generate a secure random string of specified length
 *
 * @param length - Number of bytes (output will be ~1.33x this in base64)
 * @returns URL-safe base64 encoded string
 */
export function generateSecureToken(length: number = 32): string {
  if (length < 16) {
    throw new Error("Token length must be at least 16 bytes for security")
  }
  return randomBytes(length).toString("base64url")
}

/**
 * Generate an idempotency key for API operations
 *
 * Creates a deterministic key based on the provided components,
 * ensuring the same inputs always produce the same key.
 *
 * @param prefix - Operation type prefix (e.g., "delivery", "payment")
 * @param parts - Unique identifiers (e.g., deliveryId, attemptCount)
 * @returns Idempotency key string
 *
 * @example
 * const key = generateIdempotencyKey("delivery", deliveryId, String(attemptCount))
 * // Returns: "delivery-abc123-1-1704067200000"
 */
export function generateIdempotencyKey(
  prefix: string,
  ...parts: string[]
): string {
  const timestamp = Date.now()
  return `${prefix}-${parts.join("-")}-${timestamp}`
}

/**
 * Generate a time-based idempotency key
 *
 * Creates a key that expires after the specified TTL.
 * Useful for operations that should be idempotent within a time window.
 *
 * @param prefix - Operation type prefix
 * @param identifier - Unique identifier
 * @param ttlSeconds - Time-to-live in seconds (default: 3600 = 1 hour)
 * @returns Idempotency key with time bucket
 *
 * @example
 * const key = generateTimedIdempotencyKey("email", "user123", 3600)
 * // All calls within the same hour produce the same key
 */
export function generateTimedIdempotencyKey(
  prefix: string,
  identifier: string,
  ttlSeconds: number = 3600
): string {
  const timeBucket = Math.floor(Date.now() / (ttlSeconds * 1000))
  return `${prefix}-${identifier}-${timeBucket}`
}

/**
 * Generate a UUID v4
 *
 * Standard UUID for database IDs and non-security-critical tokens.
 *
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  return randomUUID()
}

/**
 * Validate that a token meets minimum entropy requirements
 *
 * @param token - Token to validate
 * @param minBytes - Minimum expected bytes (default: 32)
 * @returns true if token has sufficient entropy
 */
export function isValidSecureToken(
  token: string,
  minBytes: number = 32
): boolean {
  if (!token || typeof token !== "string") {
    return false
  }

  // base64url encoded string is ~1.33x the byte length
  const expectedMinLength = Math.ceil((minBytes * 4) / 3)
  return token.length >= expectedMinLength
}

/**
 * Generate a verification code (6 digits)
 *
 * For OTP, email verification, etc.
 *
 * @returns 6-digit string code
 */
export function generateVerificationCode(): string {
  const buffer = randomBytes(4)
  const num = buffer.readUInt32BE(0) % 1000000
  return num.toString().padStart(6, "0")
}

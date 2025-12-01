import { timingSafeEqual } from "crypto"

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * Timing attacks exploit the fact that string comparison with === returns
 * early when characters don't match, leaking information about secret values.
 *
 * This function uses Node.js's timingSafeEqual which compares in constant time.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 *
 * @example
 * // Use for secret validation
 * if (secureCompare(providedSecret, expectedSecret)) {
 *   // Authorized
 * }
 */
export function secureCompare(a: string, b: string): boolean {
  // Handle null/undefined
  if (!a || !b) {
    return false
  }

  // timingSafeEqual requires buffers of equal length
  // If lengths differ, pad the shorter one to prevent timing leak
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  // If lengths differ, we still need constant-time behavior
  // We compare with a dummy to avoid timing leak on length
  if (aBuffer.length !== bBuffer.length) {
    // Compare with itself to take same time as real comparison
    timingSafeEqual(aBuffer, aBuffer)
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

/**
 * Validate cron secret using constant-time comparison
 *
 * @param authHeader - Authorization header value
 * @param expectedSecret - Expected CRON_SECRET value
 * @returns true if valid, false otherwise
 */
export function validateCronSecret(
  authHeader: string | null,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) {
    console.error("[Cron] CRON_SECRET not configured")
    return false
  }

  if (!authHeader) {
    return false
  }

  const expectedHeader = `Bearer ${expectedSecret}`
  return secureCompare(authHeader, expectedHeader)
}

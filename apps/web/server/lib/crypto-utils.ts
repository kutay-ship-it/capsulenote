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
  // Handle null/undefined - still need constant-time behavior
  if (!a || !b) {
    // Always perform some comparison to prevent timing leak on empty check
    const dummy = Buffer.from("x")
    timingSafeEqual(dummy, dummy)
    return false
  }

  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  // Constant-time comparison regardless of length difference
  // Pad shorter buffer to match longer length for comparison
  const maxLen = Math.max(aBuffer.length, bBuffer.length)
  const aPadded = Buffer.alloc(maxLen)
  const bPadded = Buffer.alloc(maxLen)
  aBuffer.copy(aPadded)
  bBuffer.copy(bPadded)

  // Always perform full comparison, then check length equality
  // This ensures constant time regardless of length mismatch
  const contentEqual = timingSafeEqual(aPadded, bPadded)
  const lengthEqual = aBuffer.length === bBuffer.length

  return contentEqual && lengthEqual
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

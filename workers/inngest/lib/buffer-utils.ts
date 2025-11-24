/**
 * Buffer Serialization Utilities for Inngest Steps
 *
 * When data crosses Inngest step boundaries, Node.js Buffer objects get
 * JSON-serialized to { type: "Buffer", data: [...] } format. These utilities
 * handle conversion back to proper Buffer instances.
 *
 * IMPORTANT: These utilities are a DEFENSIVE LAYER. The primary fix should be
 * to fetch encrypted data fresh inside the step that needs it, avoiding
 * Buffer serialization entirely. Use these utilities as a safety net.
 *
 * Usage:
 * ```typescript
 * import { toBuffer, assertRealBuffer } from "../lib/buffer-utils"
 *
 * // Defensive conversion (handles both real and serialized Buffers)
 * const buffer = toBuffer(maybeSerializedBuffer, "bodyCiphertext")
 *
 * // Assertion (throws if serialized - use after fresh DB fetch)
 * assertRealBuffer(freshlyFetchedBuffer, "bodyCiphertext")
 * ```
 */

/**
 * Shape of a JSON-serialized Buffer object
 *
 * When Buffer objects are serialized to JSON (e.g., crossing Inngest step boundaries),
 * they become objects with this shape.
 */
export interface SerializedBuffer {
  type: "Buffer"
  data: number[]
}

/**
 * Type guard to check if a value is a serialized Buffer object
 *
 * @param value - Value to check
 * @returns True if value matches the serialized Buffer shape
 */
export function isSerializedBuffer(value: unknown): value is SerializedBuffer {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as Record<string, unknown>).type === "Buffer" &&
    "data" in value &&
    Array.isArray((value as Record<string, unknown>).data)
  )
}

/**
 * Convert a value that may be a Buffer, serialized Buffer, or Uint8Array to a Buffer
 *
 * This handles the case where Buffer objects get JSON-serialized between Inngest steps.
 * After serialization, a Buffer becomes { type: "Buffer", data: [byte, byte, ...] }.
 *
 * WARNING: If this function detects a serialized Buffer, it logs a warning because
 * this indicates data crossed a step boundary improperly. The architectural fix
 * should be to fetch encrypted data fresh inside the step that needs it.
 *
 * @param value - A Buffer, serialized Buffer object, Uint8Array, or unknown value
 * @param fieldName - Name of the field (for error messages and logging)
 * @returns A proper Node.js Buffer instance
 * @throws Error if value cannot be converted to a Buffer
 *
 * @example
 * // Direct Buffer (from Prisma in same step) - ideal case
 * toBuffer(Buffer.from([1, 2, 3]), "bodyCiphertext")
 *
 * // Serialized Buffer (from previous Inngest step) - logs warning
 * toBuffer({ type: "Buffer", data: [1, 2, 3] }, "bodyCiphertext")
 *
 * // Uint8Array
 * toBuffer(new Uint8Array([1, 2, 3]), "nonce")
 */
export function toBuffer(
  value: Buffer | SerializedBuffer | Uint8Array | unknown,
  fieldName: string = "buffer"
): Buffer {
  // Already a Buffer - ideal case, no conversion needed
  if (Buffer.isBuffer(value)) {
    return value
  }

  // Serialized Buffer from JSON (Inngest step boundary)
  // This is a WARNING case - data shouldn't cross step boundaries
  if (isSerializedBuffer(value)) {
    console.warn(
      JSON.stringify({
        level: "warn",
        message: "Detected serialized Buffer - data crossed step boundary",
        fieldName,
        dataLength: value.data.length,
        recommendation: "Fetch encrypted data fresh inside the step that needs it",
        timestamp: new Date().toISOString(),
        service: "inngest-worker",
      })
    )
    return Buffer.from(value.data)
  }

  // Uint8Array (also valid input)
  if (value instanceof Uint8Array) {
    return Buffer.from(value)
  }

  // Unknown type - throw with helpful message
  throw new Error(
    `Cannot convert ${fieldName} to Buffer: expected Buffer, serialized Buffer, or Uint8Array, ` +
    `got ${value === null ? "null" : typeof value}. ` +
    `This may indicate data crossed an Inngest step boundary improperly.`
  )
}

/**
 * Assert that a value is a real Buffer (not serialized)
 *
 * Use this after fetching data fresh from the database to verify that
 * Prisma returned a proper Buffer. This is a sanity check that should
 * always pass if the architectural pattern is followed correctly.
 *
 * @param value - Value to check
 * @param fieldName - Name of the field (for error messages)
 * @throws Error if value is a serialized Buffer or not a Buffer at all
 *
 * @example
 * // After fresh database fetch
 * const letter = await prisma.letter.findUnique({ ... })
 * assertRealBuffer(letter.bodyCiphertext, "bodyCiphertext") // Should pass
 *
 * // After data crosses step boundary (would throw)
 * const serialized = { type: "Buffer", data: [1, 2, 3] }
 * assertRealBuffer(serialized, "bodyCiphertext") // Throws!
 */
export function assertRealBuffer(
  value: unknown,
  fieldName: string = "buffer"
): asserts value is Buffer {
  if (isSerializedBuffer(value)) {
    throw new Error(
      `${fieldName} is a serialized Buffer. ` +
      `Encrypted data should be fetched fresh inside the step that needs it, ` +
      `not passed across step boundaries.`
    )
  }

  if (!Buffer.isBuffer(value)) {
    throw new Error(
      `${fieldName} is not a Buffer: got ${value === null ? "null" : typeof value}. ` +
      `Ensure encrypted data is fetched from the database with proper Bytes type.`
    )
  }
}

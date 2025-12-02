import { env } from "@/env.mjs"
import { webcrypto } from "crypto"
import { logger } from "./logger"

const crypto = webcrypto as unknown as Crypto

/**
 * Module-level counter for nonce generation
 * Combined with random bytes to ensure uniqueness within process lifetime
 * This provides defense-in-depth against nonce reuse
 */
let nonceCounter = 0n

/**
 * Get the current (latest) key version for new encryptions
 * Defaults to 1 if not configured
 */
function getCurrentKeyVersion(): number {
  return parseInt(process.env.CRYPTO_CURRENT_KEY_VERSION || "1", 10)
}

/**
 * Get master key by version for encryption key rotation support
 *
 * Environment variables expected:
 * - CRYPTO_MASTER_KEY (or CRYPTO_MASTER_KEY_V1): Key version 1 (legacy/default)
 * - CRYPTO_MASTER_KEY_V2: Key version 2 (after first rotation)
 * - CRYPTO_MASTER_KEY_V3: Key version 3 (after second rotation)
 * - CRYPTO_CURRENT_KEY_VERSION: Active version for new encryptions
 *
 * @param keyVersion - Key version to retrieve (defaults to current version)
 * @returns Decoded 32-byte master key
 * @throws Error if key version is not found
 */
function getMasterKey(keyVersion?: number): Uint8Array {
  const version = keyVersion ?? getCurrentKeyVersion()
  const runtimeOnly = process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY === "true"

  // Map of key versions to environment variable names
  const keyEnvVars: Record<number, string | undefined> = {
    1: process.env.CRYPTO_MASTER_KEY_V1 || process.env.CRYPTO_MASTER_KEY,
    2: process.env.CRYPTO_MASTER_KEY_V2,
    3: process.env.CRYPTO_MASTER_KEY_V3,
    4: process.env.CRYPTO_MASTER_KEY_V4,
    5: process.env.CRYPTO_MASTER_KEY_V5,
  }

  let base64Key = keyEnvVars[version]

  // Allow fallback to env snapshot unless explicitly disabled
  if (!base64Key && !runtimeOnly && version === 1) {
    base64Key = env.CRYPTO_MASTER_KEY
  }

  if (!base64Key) {
    throw new Error(
      `Encryption key version ${version} not found. ` +
      `Set CRYPTO_MASTER_KEY_V${version} environment variable.`
    )
  }

  const keyBuffer = Buffer.from(base64Key, "base64")

  // Validate key length (must be exactly 32 bytes for AES-256)
  if (keyBuffer.length !== 32) {
    throw new Error(
      `Invalid key length for version ${version}: ${keyBuffer.length} bytes. ` +
      `Expected 32 bytes for AES-256.`
    )
  }

  return keyBuffer
}

/**
 * Generate a nonce for AES-GCM encryption
 * Uses counter + random bytes hybrid approach for nonce uniqueness:
 * - First 8 bytes: incrementing counter (ensures uniqueness within process)
 * - Last 4 bytes: random (adds entropy and uniqueness across processes)
 *
 * This provides defense-in-depth against nonce reuse:
 * - Counter prevents collision within same process
 * - Random bytes add protection across process restarts
 */
function generateNonce(): Uint8Array {
  const nonce = new Uint8Array(12) // 96-bit nonce for AES-GCM

  // First 8 bytes: incrementing counter (big-endian)
  const counter = nonceCounter++
  const view = new DataView(nonce.buffer)
  view.setBigUint64(0, counter, false)

  // Last 4 bytes: random for additional entropy
  const randomPart = crypto.getRandomValues(new Uint8Array(4))
  nonce.set(randomPart, 8)

  return nonce
}

/**
 * Validate nonce for security requirements
 * @throws Error if nonce is invalid
 */
export function validateNonce(nonce: Uint8Array | Buffer): void {
  if (nonce.length !== 12) {
    throw new Error(`Invalid nonce length: ${nonce.length} bytes. Must be 12 bytes for AES-GCM.`)
  }
}

/**
 * Encrypt data using AES-256-GCM
 *
 * Always uses the current (latest) key version for new encryptions.
 * The keyVersion parameter is ignored and exists only for backward compatibility.
 *
 * @param plaintext - String data to encrypt
 * @param _keyVersion - Deprecated, ignored (kept for backward compatibility)
 * @returns Object containing ciphertext, nonce, and the key version used
 */
export async function encrypt(plaintext: string, _keyVersion?: number): Promise<{
  ciphertext: Buffer
  nonce: Buffer
  keyVersion: number
}> {
  // Always use current key version for new encryptions
  const currentVersion = getCurrentKeyVersion()

  try {
    const masterKey = getMasterKey(currentVersion)
    const nonce = generateNonce()

    // Import master key - cast to ArrayBuffer to satisfy BufferSource type
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      masterKey.buffer.slice(masterKey.byteOffset, masterKey.byteOffset + masterKey.byteLength) as ArrayBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    )

    // Encrypt
    const plaintextBuffer = new TextEncoder().encode(plaintext)
    const nonceView = new Uint8Array(nonce.buffer.slice(nonce.byteOffset, nonce.byteOffset + nonce.byteLength))
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonceView as unknown as BufferSource },
      cryptoKey,
      plaintextBuffer
    )

    return {
      ciphertext: Buffer.from(ciphertextBuffer),
      nonce: Buffer.from(nonce),
      keyVersion: currentVersion,
    }
  } catch (error) {
    // Log error metadata only (no sensitive data)
    await logger.error("[Encryption] Failed to encrypt data", error, {
      keyVersion: currentVersion,
    })
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt data using AES-256-GCM
 *
 * Uses the specified key version to decrypt data. This allows reading
 * data encrypted with old keys after key rotation.
 *
 * @param ciphertext - Encrypted data buffer
 * @param nonce - 96-bit nonce used during encryption
 * @param keyVersion - Key version used to encrypt the data (defaults to 1 for legacy data)
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails or key version not found
 */
export async function decrypt(
  ciphertext: Buffer,
  nonce: Buffer,
  keyVersion: number = 1
): Promise<string> {
  try {
    // Get the specific key version used to encrypt this data
    const masterKey = getMasterKey(keyVersion)

    // Import master key - cast to ArrayBuffer to satisfy BufferSource type
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      masterKey.buffer.slice(masterKey.byteOffset, masterKey.byteOffset + masterKey.byteLength) as ArrayBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    )

    // Decrypt - ensure proper ArrayBuffer types for nonce and ciphertext
    const nonceView = new Uint8Array(nonce.buffer.slice(nonce.byteOffset, nonce.byteOffset + nonce.byteLength))
    const ciphertextView = new Uint8Array(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength))
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonceView as unknown as BufferSource },
      cryptoKey,
      ciphertextView as unknown as BufferSource
    )

    return new TextDecoder().decode(plaintextBuffer)
  } catch (error) {
    // Log error metadata only (no sensitive data)
    await logger.error("[Encryption] Failed to decrypt data", error, {
      keyVersion,
      ciphertextLength: ciphertext.length,
      nonceLength: nonce.length,
    })
    throw new Error("Failed to decrypt data")
  }
}

/**
 * Generate a new 256-bit encryption key (for rotation)
 * Returns base64-encoded key
 */
export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32)) // 256 bits
  return Buffer.from(key).toString("base64")
}

/**
 * Encrypt letter content (includes both rich and HTML formats)
 */
export async function encryptLetter(content: {
  bodyRich: Record<string, unknown>
  bodyHtml: string
}): Promise<{
  bodyCiphertext: Buffer
  bodyNonce: Buffer
  keyVersion: number
}> {
  const plaintext = JSON.stringify(content)
  const { ciphertext, nonce, keyVersion } = await encrypt(plaintext)
  return {
    bodyCiphertext: ciphertext,
    bodyNonce: nonce,
    keyVersion,
  }
}

/**
 * Decrypt letter content
 */
export async function decryptLetter(
  bodyCiphertext: Buffer,
  bodyNonce: Buffer,
  keyVersion: number = 1
): Promise<{
  bodyRich: Record<string, unknown>
  bodyHtml: string
}> {
  const plaintext = await decrypt(bodyCiphertext, bodyNonce, keyVersion)
  return JSON.parse(plaintext)
}

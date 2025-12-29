import { env } from "@/env.mjs"
import { webcrypto } from "crypto"
import { logger } from "./logger"

const crypto = webcrypto as unknown as Crypto

/**
 * Module-level counter for nonce generation
 * Combined with timestamp and random bytes to ensure uniqueness
 * This provides defense-in-depth against nonce reuse
 */
let nonceCounter = 0n

/**
 * HKDF threshold version - key versions >= this value use HKDF derivation
 * Versions below this use raw master key (backward compatibility)
 *
 * To enable HKDF for new encryptions:
 * 1. Set CRYPTO_MASTER_KEY_V100 environment variable
 * 2. Set CRYPTO_CURRENT_KEY_VERSION=100
 * 3. Existing data with keyVersion < 100 will still decrypt correctly
 */
export const HKDF_VERSION_THRESHOLD = 100

/**
 * Fixed salt for HKDF derivation (application-specific)
 * This provides domain separation between different applications
 */
const HKDF_SALT = new TextEncoder().encode("capsulenote-v1")

/**
 * Derive an AES-256-GCM key from master key using HKDF
 *
 * HKDF provides:
 * - Key derivation from high-entropy input
 * - Purpose-specific subkeys via 'info' parameter
 * - Defense-in-depth: master key compromise doesn't directly expose derived keys
 *
 * @param masterKey - Raw 32-byte master key
 * @param purpose - Purpose string for key derivation (e.g., "letter-encryption")
 * @returns CryptoKey suitable for AES-GCM operations
 */
async function deriveKeyWithHKDF(
  masterKey: Uint8Array,
  purpose: string
): Promise<CryptoKey> {
  // Import master key as HKDF base key
  const baseKey = await crypto.subtle.importKey(
    "raw",
    masterKey.buffer.slice(masterKey.byteOffset, masterKey.byteOffset + masterKey.byteLength) as ArrayBuffer,
    "HKDF",
    false,
    ["deriveKey"]
  )

  // Derive AES-GCM key using HKDF-SHA256
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: HKDF_SALT,
      info: new TextEncoder().encode(purpose),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Import raw master key directly as AES-GCM key (legacy mode)
 * Used for backward compatibility with existing encrypted data
 *
 * @param masterKey - Raw 32-byte master key
 * @param usage - Key usage: "encrypt" | "decrypt" | "both"
 * @returns CryptoKey suitable for AES-GCM operations
 */
async function importRawKey(
  masterKey: Uint8Array,
  usage: "encrypt" | "decrypt" | "both" = "both"
): Promise<CryptoKey> {
  const keyUsages: KeyUsage[] = usage === "both"
    ? ["encrypt", "decrypt"]
    : [usage]

  return crypto.subtle.importKey(
    "raw",
    masterKey.buffer.slice(masterKey.byteOffset, masterKey.byteOffset + masterKey.byteLength) as ArrayBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsages
  )
}

/**
 * Get encryption key for the given version
 * - Versions < HKDF_VERSION_THRESHOLD: Use raw master key (backward compat)
 * - Versions >= HKDF_VERSION_THRESHOLD: Use HKDF-derived key
 *
 * @param keyVersion - Key version number
 * @param usage - Key usage type
 * @returns CryptoKey for encryption/decryption
 */
async function getEncryptionKey(
  keyVersion: number,
  usage: "encrypt" | "decrypt" | "both" = "both"
): Promise<CryptoKey> {
  const masterKey = getMasterKey(keyVersion)

  if (keyVersion >= HKDF_VERSION_THRESHOLD) {
    // New HKDF-based key derivation
    return deriveKeyWithHKDF(masterKey, "letter-encryption")
  }

  // Legacy: raw key import for backward compatibility
  return importRawKey(masterKey, usage)
}

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
 * - CRYPTO_MASTER_KEY_V{N}: Key version N (dynamically discovered)
 * - CRYPTO_CURRENT_KEY_VERSION: Active version for new encryptions
 *
 * Note: No hardcoded version limit - supports unlimited key versions
 *
 * @param keyVersion - Key version to retrieve (defaults to current version)
 * @returns Decoded 32-byte master key
 * @throws Error if key version is not found
 */
function getMasterKey(keyVersion?: number): Uint8Array {
  const version = keyVersion ?? getCurrentKeyVersion()
  const runtimeOnly = process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY === "true"

  // Dynamic key lookup - no hardcoded version limit
  let base64Key: string | undefined

  if (version === 1) {
    // Version 1 has legacy support for CRYPTO_MASTER_KEY without suffix
    base64Key = process.env.CRYPTO_MASTER_KEY_V1 || process.env.CRYPTO_MASTER_KEY
  } else {
    // All other versions use versioned environment variable
    base64Key = process.env[`CRYPTO_MASTER_KEY_V${version}`]
  }

  // Allow fallback to env snapshot unless explicitly disabled (version 1 only)
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
 * Uses timestamp + counter + random hybrid approach for nonce uniqueness:
 * - Bytes 0-3: Unix timestamp (seconds) - uniqueness across process restarts
 * - Bytes 4-7: Incrementing counter - uniqueness within same second
 * - Bytes 8-11: Random bytes - additional entropy
 *
 * This provides defense-in-depth against nonce reuse:
 * - Timestamp ensures different nonces after process restart
 * - Counter prevents collision within same second
 * - Random bytes add protection against identical timestamps
 *
 * Collision probability:
 * - Same second + same counter value: only if random 32 bits collide (~1 in 4 billion)
 * - Different seconds: guaranteed unique prefix
 */
function generateNonce(): Uint8Array {
  const nonce = new Uint8Array(12) // 96-bit nonce for AES-GCM
  const view = new DataView(nonce.buffer)

  // Bytes 0-3: Unix timestamp in seconds (big-endian)
  const timestamp = Math.floor(Date.now() / 1000)
  view.setUint32(0, timestamp, false)

  // Bytes 4-7: Incrementing counter (big-endian, wraps at 32 bits)
  const counter = Number(nonceCounter++ & 0xFFFFFFFFn)
  view.setUint32(4, counter, false)

  // Bytes 8-11: Random for additional entropy
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
 * Key derivation mode is determined by key version:
 * - Versions < 100: Raw master key (backward compatibility)
 * - Versions >= 100: HKDF-derived key (enhanced security)
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
    // Get encryption key (uses HKDF if version >= 100)
    const cryptoKey = await getEncryptionKey(currentVersion, "encrypt")
    const nonce = generateNonce()

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
      usesHKDF: currentVersion >= HKDF_VERSION_THRESHOLD,
    })
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt data using AES-256-GCM
 *
 * Key derivation mode is determined by key version:
 * - Versions < 100: Raw master key (backward compatibility)
 * - Versions >= 100: HKDF-derived key (enhanced security)
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
    // Get decryption key (uses HKDF if version >= 100)
    const cryptoKey = await getEncryptionKey(keyVersion, "decrypt")

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
      usesHKDF: keyVersion >= HKDF_VERSION_THRESHOLD,
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

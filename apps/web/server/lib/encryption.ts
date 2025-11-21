import { env } from "@/env.mjs"
import { webcrypto } from "crypto"

const crypto = webcrypto as unknown as Crypto

/**
 * Key Version Map
 *
 * Maps key versions to their corresponding environment variables.
 * When rotating keys, add new versions here and keep old keys for decryption.
 *
 * Example rotation process:
 * 1. Generate new key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 * 2. Add to environment: CRYPTO_MASTER_KEY_V2=<new-key>
 * 3. Update CRYPTO_CURRENT_KEY_VERSION=2
 * 4. Run re-encryption script for existing data (see rotateLetterKey below)
 * 5. After all data re-encrypted, can remove old key
 */
const KEY_VERSION_MAP: Record<number, string | undefined> = {
  1: env.CRYPTO_MASTER_KEY,
  // Future versions: Add new keys here during rotation
  // 2: process.env.CRYPTO_MASTER_KEY_V2,
  // 3: process.env.CRYPTO_MASTER_KEY_V3,
}

/**
 * Get current active key version for new encryptions
 * Defaults to version 1 if not specified
 */
function getCurrentKeyVersion(): number {
  return parseInt(process.env.CRYPTO_CURRENT_KEY_VERSION || "1", 10)
}

/**
 * Get master key for a specific version
 * Supports key rotation by maintaining multiple key versions
 *
 * @param keyVersion - Version of the key to retrieve (defaults to current)
 * @throws Error if key version not found
 */
function getMasterKey(keyVersion?: number): Uint8Array {
  const version = keyVersion ?? getCurrentKeyVersion()
  const base64Key = KEY_VERSION_MAP[version]

  if (!base64Key) {
    throw new Error(
      `Encryption key version ${version} not found. ` +
      `Available versions: ${Object.keys(KEY_VERSION_MAP).join(", ")}. ` +
      `Ensure CRYPTO_MASTER_KEY${version > 1 ? `_V${version}` : ""} is set in environment.`
    )
  }

  return Buffer.from(base64Key, "base64")
}

// Generate a random nonce
function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)) // 96-bit nonce for AES-GCM
}

/**
 * Encrypt data using AES-256-GCM
 *
 * @param plaintext - Data to encrypt
 * @param keyVersion - Key version to use (defaults to current version)
 * @returns Encrypted data with nonce and key version
 */
export async function encrypt(plaintext: string, keyVersion?: number): Promise<{
  ciphertext: Buffer
  nonce: Buffer
  keyVersion: number
}> {
  try {
    // Use specified version or current active version
    const actualKeyVersion = keyVersion ?? getCurrentKeyVersion()
    const masterKey = getMasterKey(actualKeyVersion)
    const nonce = generateNonce()

    // Import master key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      masterKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    )

    // Encrypt
    const plaintextBuffer = new TextEncoder().encode(plaintext)
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      plaintextBuffer
    )

    return {
      ciphertext: Buffer.from(ciphertextBuffer),
      nonce: Buffer.from(nonce),
      keyVersion: actualKeyVersion,
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt data using AES-256-GCM
 *
 * @param ciphertext - Encrypted data
 * @param nonce - Nonce used during encryption
 * @param keyVersion - Key version that was used to encrypt (required)
 * @returns Decrypted plaintext
 * @throws Error if key version not found or decryption fails
 */
export async function decrypt(
  ciphertext: Buffer,
  nonce: Buffer,
  keyVersion: number = 1
): Promise<string> {
  try {
    // Use the SPECIFIC key version that was used to encrypt
    const masterKey = getMasterKey(keyVersion)

    // Import master key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      masterKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    )

    // Decrypt
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      ciphertext
    )

    return new TextDecoder().decode(plaintextBuffer)
  } catch (error) {
    console.error("Decryption error:", {
      error: error instanceof Error ? error.message : String(error),
      keyVersion,
    })
    throw new Error(`Failed to decrypt data with key version ${keyVersion}`)
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
 * Includes validation to ensure encryption succeeded correctly
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

  // VALIDATION: Ensure encryption produced valid output
  if (!ciphertext || ciphertext.length === 0) {
    throw new Error("Encryption produced empty ciphertext - data would be lost")
  }

  if (!nonce || nonce.length !== 12) {
    throw new Error(`Encryption produced invalid nonce (expected 12 bytes, got ${nonce?.length || 0})`)
  }

  // VALIDATION: Round-trip test to ensure data can be decrypted
  try {
    const decrypted = await decrypt(ciphertext, nonce, keyVersion)
    const parsed = JSON.parse(decrypted)

    // Verify structure matches original
    if (!parsed.bodyRich || !parsed.bodyHtml) {
      throw new Error("Decryption produced invalid structure - missing bodyRich or bodyHtml")
    }

    // Verify content matches (basic sanity check on HTML length)
    if (typeof parsed.bodyHtml !== 'string' || Math.abs(parsed.bodyHtml.length - content.bodyHtml.length) > 10) {
      throw new Error("Decryption produced corrupted data - HTML length mismatch")
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Encryption validation failed (round-trip test): ${message}`)
  }

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

/**
 * Rotate letter encryption key
 *
 * Re-encrypts a letter with a new key version. Used during key rotation to
 * migrate existing encrypted data to new encryption keys.
 *
 * Process:
 * 1. Decrypt with old key (oldKeyVersion)
 * 2. Re-encrypt with new key (newKeyVersion)
 * 3. Return new ciphertext, nonce, and key version
 *
 * @param oldCiphertext - Existing encrypted data
 * @param oldNonce - Existing nonce
 * @param oldKeyVersion - Key version used for current encryption
 * @param newKeyVersion - New key version to use (defaults to current version)
 * @returns New encrypted data with updated key version
 *
 * @example
 * // Rotate a letter from key v1 to v2
 * const rotated = await rotateLetterKey(
 *   letter.bodyCiphertext,
 *   letter.bodyNonce,
 *   1,  // old key version
 *   2   // new key version
 * )
 *
 * await prisma.letter.update({
 *   where: { id: letter.id },
 *   data: {
 *     bodyCiphertext: rotated.bodyCiphertext,
 *     bodyNonce: rotated.bodyNonce,
 *     keyVersion: rotated.keyVersion,
 *   }
 * })
 */
export async function rotateLetterKey(
  oldCiphertext: Buffer,
  oldNonce: Buffer,
  oldKeyVersion: number,
  newKeyVersion?: number
): Promise<{
  bodyCiphertext: Buffer
  bodyNonce: Buffer
  keyVersion: number
}> {
  try {
    // Step 1: Decrypt with old key
    const decrypted = await decryptLetter(oldCiphertext, oldNonce, oldKeyVersion)

    // Step 2: Re-encrypt with new key
    const reEncrypted = await encryptLetter(decrypted)

    return {
      bodyCiphertext: reEncrypted.bodyCiphertext,
      bodyNonce: reEncrypted.bodyNonce,
      keyVersion: reEncrypted.keyVersion,
    }
  } catch (error) {
    console.error("Key rotation failed:", {
      error: error instanceof Error ? error.message : String(error),
      oldKeyVersion,
      newKeyVersion: newKeyVersion ?? getCurrentKeyVersion(),
    })
    throw new Error(
      `Failed to rotate encryption key from v${oldKeyVersion} to v${newKeyVersion ?? getCurrentKeyVersion()}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

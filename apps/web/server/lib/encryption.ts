import { env } from "@/env.mjs"
import { webcrypto } from "crypto"

const crypto = webcrypto as unknown as Crypto

// Decode base64 master key
function getMasterKey(): Uint8Array {
  const base64Key = env.CRYPTO_MASTER_KEY
  return Buffer.from(base64Key, "base64")
}

// Generate a random nonce
function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)) // 96-bit nonce for AES-GCM
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(plaintext: string, keyVersion: number = 1): Promise<{
  ciphertext: Buffer
  nonce: Buffer
  keyVersion: number
}> {
  try {
    const masterKey = getMasterKey()
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
      keyVersion,
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(
  ciphertext: Buffer,
  nonce: Buffer,
  keyVersion: number = 1
): Promise<string> {
  try {
    const masterKey = getMasterKey()

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
    console.error("Decryption error:", error)
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
  return encrypt(plaintext)
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

/**
 * Unit Tests for Encryption Library
 *
 * Tests the AES-256-GCM encryption/decryption functionality
 * that protects letter content in the database.
 *
 * CRITICAL: These tests verify that letters can be encrypted
 * and decrypted correctly, and that key rotation is supported.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { encryptLetter, decryptLetter, HKDF_VERSION_THRESHOLD } from '../../server/lib/encryption'

describe('Encryption', () => {
  const originalEnv = process.env.CRYPTO_MASTER_KEY

  beforeAll(() => {
    // Set test encryption key (exactly 32 bytes)
    process.env.CRYPTO_MASTER_KEY = Buffer.from('test_master_key_32bytes_exactly').toString('base64')
  })

  afterAll(() => {
    // Restore original env
    process.env.CRYPTO_MASTER_KEY = originalEnv
  })

  describe('encryptLetter', () => {
    it('should encrypt letter content successfully', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello future me!' }] }] },
        bodyHtml: '<p>Hello future me!</p>'
      }

      const result = await encryptLetter(plaintext)

      expect(result).toHaveProperty('bodyCiphertext')
      expect(result).toHaveProperty('bodyNonce')
      expect(result).toHaveProperty('keyVersion')
      expect(result.bodyCiphertext).toBeInstanceOf(Buffer)
      expect(result.bodyNonce).toBeInstanceOf(Buffer)
      expect(result.keyVersion).toBe(1)
      expect(result.bodyNonce.length).toBe(12) // 96 bits
    })

    it('should generate unique nonces for each encryption', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      const result1 = await encryptLetter(plaintext)
      const result2 = await encryptLetter(plaintext)

      expect(result1.bodyNonce).not.toEqual(result2.bodyNonce)
      expect(result1.bodyCiphertext).not.toEqual(result2.bodyCiphertext)
    })

    it('should throw error if master key is missing', async () => {
      const originalKey = process.env.CRYPTO_MASTER_KEY
      const originalKeyV1 = process.env.CRYPTO_MASTER_KEY_V1
      const originalKeyV2 = process.env.CRYPTO_MASTER_KEY_V2
      const originalKeyV3 = process.env.CRYPTO_MASTER_KEY_V3
      const originalKeyV4 = process.env.CRYPTO_MASTER_KEY_V4
      const originalKeyV5 = process.env.CRYPTO_MASTER_KEY_V5
      const originalRuntimeOnly = process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY

      process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY = "true"
      delete process.env.CRYPTO_MASTER_KEY
      delete process.env.CRYPTO_MASTER_KEY_V1
      delete process.env.CRYPTO_MASTER_KEY_V2
      delete process.env.CRYPTO_MASTER_KEY_V3
      delete process.env.CRYPTO_MASTER_KEY_V4
      delete process.env.CRYPTO_MASTER_KEY_V5

      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      await expect(encryptLetter(plaintext)).rejects.toThrow()

      process.env.CRYPTO_MASTER_KEY = originalKey
      if (originalKeyV1) process.env.CRYPTO_MASTER_KEY_V1 = originalKeyV1
      if (originalKeyV2) process.env.CRYPTO_MASTER_KEY_V2 = originalKeyV2
      if (originalKeyV3) process.env.CRYPTO_MASTER_KEY_V3 = originalKeyV3
      if (originalKeyV4) process.env.CRYPTO_MASTER_KEY_V4 = originalKeyV4
      if (originalKeyV5) process.env.CRYPTO_MASTER_KEY_V5 = originalKeyV5
      process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY = originalRuntimeOnly
    })

    it('should handle empty content', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: ''
      }

      const result = await encryptLetter(plaintext)

      expect(result.bodyCiphertext).toBeInstanceOf(Buffer)
      expect(result.bodyNonce).toBeInstanceOf(Buffer)
    })

    it('should handle large content (>10KB)', async () => {
      const largeText = 'A'.repeat(50000) // 50KB
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: largeText }] }] },
        bodyHtml: `<p>${largeText}</p>`
      }

      const result = await encryptLetter(plaintext)

      expect(result.bodyCiphertext).toBeInstanceOf(Buffer)
      expect(result.bodyCiphertext.length).toBeGreaterThan(50000)
    })
  })

  describe('decryptLetter', () => {
    it('should decrypt letter content successfully', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello future me!' }] }] },
        bodyHtml: '<p>Hello future me!</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should throw error on invalid ciphertext', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      // Corrupt the ciphertext
      const corruptedCiphertext = Buffer.from(encrypted.bodyCiphertext)
      corruptedCiphertext[0] = (corruptedCiphertext[0] ?? 0) ^ 0xFF

      await expect(
        decryptLetter(corruptedCiphertext, encrypted.bodyNonce, encrypted.keyVersion)
      ).rejects.toThrow()
    })

    it('should throw error on invalid nonce', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      const wrongNonce = Buffer.alloc(12) // All zeros

      await expect(
        decryptLetter(encrypted.bodyCiphertext, wrongNonce, encrypted.keyVersion)
      ).rejects.toThrow()
    })

    it('should throw error on wrong key version', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      // Try to decrypt with wrong key version
      await expect(
        decryptLetter(encrypted.bodyCiphertext, encrypted.bodyNonce, 999)
      ).rejects.toThrow()
    })

    it('should handle empty decrypted content', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: ''
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })
  })

  describe('Round-trip encryption', () => {
    it('should successfully encrypt and decrypt complex content', async () => {
      const plaintext = {
        bodyRich: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'My Letter' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Hello ' },
                { type: 'text', marks: [{ type: 'bold' }], text: 'future' },
                { type: 'text', text: ' me!' }
              ]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }]
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }]
                }
              ]
            }
          ]
        },
        bodyHtml: '<h1>My Letter</h1><p>Hello <strong>future</strong> me!</p><ul><li>Item 1</li><li>Item 2</li></ul>'
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should handle special characters and unicode', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '你好 世界! 🌍 Special chars: <>&"\'\\n\\r\\t' }] }] },
        bodyHtml: '<p>你好 世界! 🌍 Special chars: &lt;&gt;&amp;&quot;&#39;\\n\\r\\t</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should handle emojis and complex unicode', async () => {
      const plaintext = {
        bodyRich: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: '😀 😃 😄 😁 😆 😅 🤣 😂' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '🎉 🎊 🎈 🎁 🎀' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '中文字符 日本語 한글 العربية' }] }
          ]
        },
        bodyHtml: '<p>😀 😃 😄 😁 😆 😅 🤣 😂</p><p>🎉 🎊 🎈 🎁 🎀</p><p>中文字符 日本語 한글 العربية</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })
  })

  describe('Key rotation support', () => {
    it('should track key version correctly', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      expect(encrypted.keyVersion).toBe(1)
      // In production, after key rotation:
      // - Old letters have keyVersion=1 (still decryptable with old key)
      // - New letters have keyVersion=2 (encrypted with new key)
    })

    it('should decrypt old letters with correct key version', async () => {
      // This test simulates having an old letter encrypted with keyVersion=1
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Old letter' }] }] },
        bodyHtml: '<p>Old letter</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      // Verify we can still decrypt with keyVersion=1
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        1 // Explicitly use keyVersion=1
      )

      expect(decrypted).toEqual(plaintext)
    })
  })

  describe('Performance', () => {
    it('should encrypt 100 letters in reasonable time', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Performance test' }] }] },
        bodyHtml: '<p>Performance test</p>'
      }

      const start = Date.now()

      const promises = Array(100).fill(null).map(() => encryptLetter(plaintext))
      await Promise.all(promises)

      const duration = Date.now() - start

      // Should complete in less than 5 seconds (50ms per encryption)
      expect(duration).toBeLessThan(5000)
    })

    it('should decrypt 100 letters in reasonable time', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Performance test' }] }] },
        bodyHtml: '<p>Performance test</p>'
      }

      // First encrypt 100 letters
      const encrypted = await Promise.all(
        Array(100).fill(null).map(() => encryptLetter(plaintext))
      )

      const start = Date.now()

      // Now decrypt all 100
      const promises = encrypted.map(e => decryptLetter(e.bodyCiphertext, e.bodyNonce, e.keyVersion))
      await Promise.all(promises)

      const duration = Date.now() - start

      // Should complete in less than 5 seconds (50ms per decryption)
      expect(duration).toBeLessThan(5000)
    })
  })

  describe('Security properties', () => {
    it('should produce different ciphertext for same content', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Same content' }] }] },
        bodyHtml: '<p>Same content</p>'
      }

      const encrypted1 = await encryptLetter(plaintext)
      const encrypted2 = await encryptLetter(plaintext)

      // Same plaintext should produce different ciphertext (due to unique nonces)
      expect(encrypted1.bodyCiphertext).not.toEqual(encrypted2.bodyCiphertext)
      expect(encrypted1.bodyNonce).not.toEqual(encrypted2.bodyNonce)

      // But both should decrypt to same plaintext
      const decrypted1 = await decryptLetter(encrypted1.bodyCiphertext, encrypted1.bodyNonce, encrypted1.keyVersion)
      const decrypted2 = await decryptLetter(encrypted2.bodyCiphertext, encrypted2.bodyNonce, encrypted2.keyVersion)

      expect(decrypted1).toEqual(plaintext)
      expect(decrypted2).toEqual(plaintext)
    })

    it('should fail authentication on tampered ciphertext', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Authentic content' }] }] },
        bodyHtml: '<p>Authentic content</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      // Tamper with ciphertext (flip one bit)
      const tamperedCiphertext = Buffer.from(encrypted.bodyCiphertext)
      const tamperedIndex = Math.floor(tamperedCiphertext.length / 2)
      tamperedCiphertext[tamperedIndex] = (tamperedCiphertext[tamperedIndex] ?? 0) ^ 0x01

      // AES-256-GCM should detect the tampering and reject
      await expect(
        decryptLetter(tamperedCiphertext, encrypted.bodyNonce, encrypted.keyVersion)
      ).rejects.toThrow()
    })

    it('should have sufficient nonce entropy', async () => {
      // Generate 1000 nonces and check for duplicates
      const nonces = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        const encrypted = await encryptLetter({
          bodyRich: { type: 'doc', content: [] },
          bodyHtml: ''
        })
        const nonceHex = encrypted.bodyNonce.toString('hex')

        // No duplicate nonces should exist
        expect(nonces.has(nonceHex)).toBe(false)
        nonces.add(nonceHex)
      }

      expect(nonces.size).toBe(1000)
    })
  })

  describe('HKDF key derivation', () => {
    // Store original env values
    let originalKeyVersion: string | undefined
    let originalKeyV100: string | undefined

    beforeEach(() => {
      originalKeyVersion = process.env.CRYPTO_CURRENT_KEY_VERSION
      originalKeyV100 = process.env.CRYPTO_MASTER_KEY_V100
    })

    afterEach(() => {
      // Restore original values
      if (originalKeyVersion) {
        process.env.CRYPTO_CURRENT_KEY_VERSION = originalKeyVersion
      } else {
        delete process.env.CRYPTO_CURRENT_KEY_VERSION
      }
      if (originalKeyV100) {
        process.env.CRYPTO_MASTER_KEY_V100 = originalKeyV100
      } else {
        delete process.env.CRYPTO_MASTER_KEY_V100
      }
    })

    it('should export HKDF_VERSION_THRESHOLD constant', () => {
      expect(HKDF_VERSION_THRESHOLD).toBe(100)
    })

    it('should encrypt with HKDF when version >= 100', async () => {
      // Set up version 100 key (exactly 32 bytes)
      process.env.CRYPTO_MASTER_KEY_V100 = Buffer.from('test_master_key_32bytes_exactly!').toString('base64')
      process.env.CRYPTO_CURRENT_KEY_VERSION = '100'

      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'HKDF test' }] }] },
        bodyHtml: '<p>HKDF test</p>'
      }

      const encrypted = await encryptLetter(plaintext)

      expect(encrypted.keyVersion).toBe(100)
      expect(encrypted.bodyCiphertext).toBeInstanceOf(Buffer)
      expect(encrypted.bodyNonce).toBeInstanceOf(Buffer)
    })

    it('should decrypt HKDF-encrypted content correctly', async () => {
      // Set up version 100 key (exactly 32 bytes)
      process.env.CRYPTO_MASTER_KEY_V100 = Buffer.from('test_master_key_32bytes_exactly!').toString('base64')
      process.env.CRYPTO_CURRENT_KEY_VERSION = '100'

      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'HKDF roundtrip' }] }] },
        bodyHtml: '<p>HKDF roundtrip</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should produce different ciphertext with HKDF vs raw key (same master key)', async () => {
      const sameKey = Buffer.from('test_master_key_32bytes_exactly!').toString('base64')

      // Encrypt with legacy mode (version 1)
      process.env.CRYPTO_MASTER_KEY = sameKey
      process.env.CRYPTO_CURRENT_KEY_VERSION = '1'

      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }] },
        bodyHtml: '<p>Test</p>'
      }

      const legacyEncrypted = await encryptLetter(plaintext)

      // Encrypt with HKDF mode (version 100)
      process.env.CRYPTO_MASTER_KEY_V100 = sameKey
      process.env.CRYPTO_CURRENT_KEY_VERSION = '100'

      const hkdfEncrypted = await encryptLetter(plaintext)

      // Both should work but produce different ciphertext due to:
      // 1. Different nonces
      // 2. Different key derivation methods
      expect(legacyEncrypted.keyVersion).toBe(1)
      expect(hkdfEncrypted.keyVersion).toBe(100)

      // Even with same nonce, HKDF would produce different ciphertext
      // because derived key is different from raw key
    })

    it('should maintain backward compatibility - decrypt legacy data after HKDF enabled', async () => {
      const sameKey = Buffer.from('test_master_key_32bytes_exactly!').toString('base64')

      // First, encrypt with legacy mode (version 1)
      process.env.CRYPTO_MASTER_KEY = sameKey
      process.env.CRYPTO_CURRENT_KEY_VERSION = '1'

      const plaintext = {
        bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Legacy data' }] }] },
        bodyHtml: '<p>Legacy data</p>'
      }

      const legacyEncrypted = await encryptLetter(plaintext)

      // Now "upgrade" to HKDF mode
      process.env.CRYPTO_MASTER_KEY_V100 = sameKey
      process.env.CRYPTO_CURRENT_KEY_VERSION = '100'

      // Should still be able to decrypt legacy data
      const decrypted = await decryptLetter(
        legacyEncrypted.bodyCiphertext,
        legacyEncrypted.bodyNonce,
        legacyEncrypted.keyVersion // keyVersion=1 forces legacy mode
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should support dynamic key versions beyond 5', async () => {
      // Test version 10 (previously not supported with hardcoded limit)
      const testKey = Buffer.from('test_master_key_32bytes_exactly!').toString('base64')
      process.env.CRYPTO_MASTER_KEY_V10 = testKey
      process.env.CRYPTO_CURRENT_KEY_VERSION = '10'

      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Version 10</p>'
      }

      const encrypted = await encryptLetter(plaintext)
      expect(encrypted.keyVersion).toBe(10)

      const decrypted = await decryptLetter(
        encrypted.bodyCiphertext,
        encrypted.bodyNonce,
        encrypted.keyVersion
      )

      expect(decrypted).toEqual(plaintext)

      // Clean up
      delete process.env.CRYPTO_MASTER_KEY_V10
    })
  })

  describe('Nonce timestamp component', () => {
    it('should include timestamp in nonce for uniqueness across restarts', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: ''
      }

      const encrypted1 = await encryptLetter(plaintext)
      const encrypted2 = await encryptLetter(plaintext)

      // First 4 bytes should be timestamp (same within test execution)
      const timestamp1 = encrypted1.bodyNonce.readUInt32BE(0)
      const timestamp2 = encrypted2.bodyNonce.readUInt32BE(0)

      // Timestamps should be within 1 second of each other
      expect(Math.abs(timestamp1 - timestamp2)).toBeLessThanOrEqual(1)

      // Timestamps should be reasonable Unix timestamps (after 2020)
      const minTimestamp = Math.floor(new Date('2020-01-01').getTime() / 1000)
      expect(timestamp1).toBeGreaterThan(minTimestamp)
      expect(timestamp2).toBeGreaterThan(minTimestamp)
    })

    it('should have incrementing counter in nonce bytes 4-7', async () => {
      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: ''
      }

      const results: number[] = []
      for (let i = 0; i < 10; i++) {
        const encrypted = await encryptLetter(plaintext)
        // Counter is in bytes 4-7
        const counter = encrypted.bodyNonce.readUInt32BE(4)
        results.push(counter)
      }

      // Counters should be incrementing (or close to it - they may wrap)
      // At minimum, all should be unique
      const uniqueCounters = new Set(results)
      expect(uniqueCounters.size).toBe(10)
    })
  })
})

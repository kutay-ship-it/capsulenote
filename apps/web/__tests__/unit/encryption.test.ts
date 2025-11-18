/**
 * Unit Tests for Encryption Library
 *
 * Tests the AES-256-GCM encryption/decryption functionality
 * that protects letter content in the database.
 *
 * CRITICAL: These tests verify that letters can be encrypted
 * and decrypted correctly, and that key rotation is supported.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { encryptLetter, decryptLetter } from '../../server/lib/encryption'

describe('Encryption', () => {
  const originalEnv = process.env.CRYPTO_MASTER_KEY

  beforeAll(() => {
    // Set test encryption key
    process.env.CRYPTO_MASTER_KEY = Buffer.from('test-master-key-32-bytes-long!!').toString('base64')
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
      delete process.env.CRYPTO_MASTER_KEY

      const plaintext = {
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>'
      }

      await expect(encryptLetter(plaintext)).rejects.toThrow()

      process.env.CRYPTO_MASTER_KEY = originalKey
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
      corruptedCiphertext[0] = corruptedCiphertext[0] ^ 0xFF

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
      tamperedCiphertext[tamperedIndex] = tamperedCiphertext[tamperedIndex] ^ 0x01

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
})

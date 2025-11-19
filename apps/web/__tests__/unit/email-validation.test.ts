/**
 * Unit Tests for Email Validation
 *
 * Tests email validation using Zod schemas from delivery types.
 * Ensures email addresses are properly validated before scheduling deliveries.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Email validation schema (from packages/types/schemas/delivery.ts)
const emailSchema = z.string().email()

describe('Email Validation', () => {
  describe('Valid Email Addresses', () => {
    it('should accept standard email format', () => {
      const result = emailSchema.safeParse('user@example.com')

      expect(result.success).toBe(true)
    })

    it('should accept email with subdomain', () => {
      const result = emailSchema.safeParse('user@mail.example.com')

      expect(result.success).toBe(true)
    })

    it('should accept email with plus addressing', () => {
      const result = emailSchema.safeParse('user+tag@example.com')

      expect(result.success).toBe(true)
    })

    it('should accept email with dots in local part', () => {
      const result = emailSchema.safeParse('first.last@example.com')

      expect(result.success).toBe(true)
    })

    it('should accept email with numbers', () => {
      const result = emailSchema.safeParse('user123@example456.com')

      expect(result.success).toBe(true)
    })
  })

  describe('Invalid Email Addresses', () => {
    it('should reject email without @ symbol', () => {
      const result = emailSchema.safeParse('userexample.com')

      expect(result.success).toBe(false)
    })

    it('should reject email without domain', () => {
      const result = emailSchema.safeParse('user@')

      expect(result.success).toBe(false)
    })

    it('should reject email without local part', () => {
      const result = emailSchema.safeParse('@example.com')

      expect(result.success).toBe(false)
    })

    it('should reject email with spaces', () => {
      const result = emailSchema.safeParse('user name@example.com')

      expect(result.success).toBe(false)
    })

    it('should reject email with multiple @ symbols', () => {
      const result = emailSchema.safeParse('user@@example.com')

      expect(result.success).toBe(false)
    })

    it('should reject empty string', () => {
      const result = emailSchema.safeParse('')

      expect(result.success).toBe(false)
    })

    it('should reject non-string values', () => {
      const resultNumber = emailSchema.safeParse(123)
      const resultNull = emailSchema.safeParse(null)
      const resultUndefined = emailSchema.safeParse(undefined)

      expect(resultNumber.success).toBe(false)
      expect(resultNull.success).toBe(false)
      expect(resultUndefined.success).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should accept email with hyphen in domain', () => {
      const result = emailSchema.safeParse('user@my-domain.com')

      expect(result.success).toBe(true)
    })

    it('should accept email with long TLD', () => {
      const result = emailSchema.safeParse('user@example.museum')

      expect(result.success).toBe(true)
    })

    it('should handle international characters correctly', () => {
      // Note: Zod's email validation may have limitations with international chars
      // This test documents the current behavior
      const result = emailSchema.safeParse('user@münchen.de')

      // Zod's default email validation follows RFC 5322
      // International domains should use punycode encoding
      expect(result.success).toBe(false)
    })
  })
})

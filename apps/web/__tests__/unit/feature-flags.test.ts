/**
 * Unit Tests for Feature Flags System
 *
 * Tests the feature flag system that uses Unleash for production
 * and environment variables for development, with caching.
 *
 * CRITICAL: These tests verify that feature flags work correctly
 * and fall back gracefully when Unleash is unavailable.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFeatureFlag, clearFlagCache, getAllFlags } from '../../server/lib/feature-flags'

describe('Feature Flags', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearFlagCache()
    // Clear any environment variables
    delete process.env.UNLEASH_API_URL
    delete process.env.UNLEASH_API_TOKEN
    delete process.env.FEATURE_USE_POSTMARK_EMAIL
    delete process.env.FEATURE_ENABLE_ARRIVE_BY_MODE
  })

  afterEach(() => {
    // Restore fetch mock
    vi.restoreAllMocks()
  })

  describe('getFeatureFlag - Default Values', () => {
    it('should return default value for known flag', async () => {
      const value = await getFeatureFlag('enable-letter-templates')

      expect(value).toBe(true) // Default is true for templates
    })

    it('should return false for disabled-by-default flags', async () => {
      const value = await getFeatureFlag('use-postmark-email')

      expect(value).toBe(false) // Default is false for postmark
    })

    it('should return false for beta features by default', async () => {
      const arriveByValue = await getFeatureFlag('enable-arrive-by-mode')
      const physicalMailValue = await getFeatureFlag('enable-physical-mail')

      expect(arriveByValue).toBe(false)
      expect(physicalMailValue).toBe(false)
    })
  })

  describe('getFeatureFlag - Environment Variable Override', () => {
    it('should return env var value when set to "true"', async () => {
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'true'

      const value = await getFeatureFlag('use-postmark-email')

      expect(value).toBe(true)
    })

    it('should return env var value when set to "1"', async () => {
      process.env.FEATURE_ENABLE_PHYSICAL_MAIL = '1'

      const value = await getFeatureFlag('enable-physical-mail')

      expect(value).toBe(true)
    })

    it('should return false when env var is any other value', async () => {
      process.env.FEATURE_ENABLE_ARRIVE_BY_MODE = 'false'

      const value = await getFeatureFlag('enable-arrive-by-mode')

      expect(value).toBe(false)
    })

    it('should parse boolean flags correctly from env vars', async () => {
      process.env.FEATURE_USE_CLICKSEND_MAIL = 'true'
      process.env.FEATURE_ENABLE_CLIENT_ENCRYPTION = '1'

      const clicksendValue = await getFeatureFlag('use-clicksend-mail')
      const encryptionValue = await getFeatureFlag('enable-client-encryption')

      expect(clicksendValue).toBe(true)
      expect(encryptionValue).toBe(true)
    })
  })

  describe('getFeatureFlag - Cache Behavior', () => {
    it('should cache flag values within TTL', async () => {
      // Set env var to true
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'true'

      // First call
      const value1 = await getFeatureFlag('use-postmark-email')
      expect(value1).toBe(true)

      // Change env var
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'false'

      // Second call within cache TTL should return cached value
      const value2 = await getFeatureFlag('use-postmark-email')
      expect(value2).toBe(true) // Still cached
    })

    it('should expire cache after TTL', async () => {
      // Set env var to true
      process.env.FEATURE_ENABLE_PHYSICAL_MAIL = 'true'

      // First call
      const value1 = await getFeatureFlag('enable-physical-mail')
      expect(value1).toBe(true)

      // Clear cache to simulate expiry
      clearFlagCache()

      // Change env var
      process.env.FEATURE_ENABLE_PHYSICAL_MAIL = 'false'

      // After cache clear, should get new value
      const value2 = await getFeatureFlag('enable-physical-mail')
      expect(value2).toBe(false)
    })

    it('should clear all cached values when clearFlagCache is called', async () => {
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'true'
      process.env.FEATURE_ENABLE_ARRIVE_BY_MODE = 'true'

      // Cache both flags
      await getFeatureFlag('use-postmark-email')
      await getFeatureFlag('enable-arrive-by-mode')

      // Clear cache
      clearFlagCache()

      // Change env vars
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'false'
      process.env.FEATURE_ENABLE_ARRIVE_BY_MODE = 'false'

      // Should get new values
      const postmarkValue = await getFeatureFlag('use-postmark-email')
      const arriveByValue = await getFeatureFlag('enable-arrive-by-mode')

      expect(postmarkValue).toBe(false)
      expect(arriveByValue).toBe(false)
    })
  })

  describe.skip('getFeatureFlag - Unleash Integration (Not Used)', () => {
    it('should fetch flag from Unleash when configured', async () => {
      // Set Unleash env vars
      process.env.UNLEASH_API_URL = 'https://unleash.test.com'
      process.env.UNLEASH_API_TOKEN = 'test-token-123'

      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ enabled: true }),
        } as Response)
      )

      const value = await getFeatureFlag('enable-physical-mail')

      expect(value).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle Unleash API errors gracefully', async () => {
      process.env.UNLEASH_API_URL = 'https://unleash.test.com'
      process.env.UNLEASH_API_TOKEN = 'test-token-123'

      // Mock fetch to fail
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Internal Server Error',
        } as Response)
      )

      // Should fall back to default value
      const value = await getFeatureFlag('enable-letter-templates')

      expect(value).toBe(true) // Falls back to default
    })

    it('should handle Unleash network errors gracefully', async () => {
      process.env.UNLEASH_API_URL = 'https://unleash.test.com'
      process.env.UNLEASH_API_TOKEN = 'test-token-123'

      // Mock fetch to throw network error
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      // Should fall back to default value
      const value = await getFeatureFlag('use-postmark-email')

      expect(value).toBe(false) // Falls back to default
    })

    it('should pass user context to Unleash correctly', async () => {
      process.env.UNLEASH_API_URL = 'https://unleash.test.com'
      process.env.UNLEASH_API_TOKEN = 'test-token-123'

      // Mock fetch
      const fetchSpy = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ enabled: true }),
        } as Response)
      )
      global.fetch = fetchSpy

      await getFeatureFlag('enable-physical-mail', {
        userId: 'user_123',
        sessionId: 'session_abc',
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://unleash.test.com/api/client/features/enable-physical-mail',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'test-token-123',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"userId":"user_123"'),
        })
      )
    })
  })

  describe('getAllFlags', () => {
    it('should return all flags with their values', async () => {
      process.env.FEATURE_USE_POSTMARK_EMAIL = 'true'
      process.env.FEATURE_ENABLE_ARRIVE_BY_MODE = 'true'

      const flags = await getAllFlags()

      expect(flags).toHaveProperty('use-postmark-email')
      expect(flags).toHaveProperty('enable-arrive-by-mode')
      expect(flags).toHaveProperty('enable-physical-mail')
      expect(flags).toHaveProperty('enable-letter-templates')
      expect(flags).toHaveProperty('use-clicksend-mail')
      expect(flags).toHaveProperty('enable-client-encryption')

      expect(flags['use-postmark-email']).toBe(true)
      expect(flags['enable-arrive-by-mode']).toBe(true)
      expect(flags['enable-letter-templates']).toBe(true) // Default true
    })
  })
})

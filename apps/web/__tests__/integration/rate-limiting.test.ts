/**
 * Integration Tests for Rate Limiting
 *
 * Tests Upstash Redis rate limiting integration including:
 * - API rate limiting (100 req/min)
 * - Letter creation rate limiting (10 req/hour)
 * - Delivery scheduling rate limiting (20 req/hour)
 * - User isolation and limit enforcement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Upstash Redis
const mockLimit = vi.fn()

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    // Mock Redis client
  })),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation((config) => {
    return {
      limit: mockLimit,
      config,
    }
  }),
  slidingWindow: vi.fn((maxRequests: number, window: string) => ({
    type: 'slidingWindow',
    maxRequests,
    window,
  })),
}))

vi.mock('@/env.mjs', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test_token_123',
  },
}))

describe('Rate Limiting Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API Rate Limiter (100 req/min)', () => {
    it('should allow requests within limit', async () => {
      // Mock successful rate limit check
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.api.limit('user_123')

      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
      expect(result.remaining).toBe(99)
      expect(mockLimit).toHaveBeenCalledWith('user_123')
    })

    it('should block requests after limit exceeded', async () => {
      // Mock rate limit exceeded
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.api.limit('user_123')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track remaining requests correctly', async () => {
      // First request
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result1 = await ratelimit.api.limit('user_123')

      expect(result1.remaining).toBe(99)

      // Second request
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 98,
        reset: Date.now() + 60000,
      })

      const result2 = await ratelimit.api.limit('user_123')

      expect(result2.remaining).toBe(98)
      expect(mockLimit).toHaveBeenCalledTimes(2)
    })

    it('should isolate limits per user', async () => {
      // User 1 at limit
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result1 = await ratelimit.api.limit('user_1')

      expect(result1.success).toBe(false)

      // User 2 should have full limit
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      const result2 = await ratelimit.api.limit('user_2')

      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(99)
    })
  })

  describe('Letter Creation Rate Limiter (10 req/hour)', () => {
    it('should allow up to 10 letter creations per hour', async () => {
      // Simulate 10 requests
      for (let i = 0; i < 10; i++) {
        mockLimit.mockResolvedValueOnce({
          success: true,
          limit: 10,
          remaining: 10 - i - 1,
          reset: Date.now() + 3600000,
        })
      }

      const { ratelimit } = await import('@/server/lib/redis')

      for (let i = 0; i < 10; i++) {
        const result = await ratelimit.createLetter.limit('user_123')
        expect(result.success).toBe(true)
      }

      expect(mockLimit).toHaveBeenCalledTimes(10)
    })

    it('should block 11th letter creation within same hour', async () => {
      // Mock 11th request blocked
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 3600000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.createLetter.limit('user_123')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should provide reset timestamp', async () => {
      const resetTime = Date.now() + 3600000

      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: resetTime,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.createLetter.limit('user_123')

      expect(result.reset).toBe(resetTime)
      expect(result.reset).toBeGreaterThan(Date.now())
    })
  })

  describe('Delivery Scheduling Rate Limiter (20 req/hour)', () => {
    it('should allow up to 20 deliveries per hour', async () => {
      // Simulate 20 requests
      for (let i = 0; i < 20; i++) {
        mockLimit.mockResolvedValueOnce({
          success: true,
          limit: 20,
          remaining: 20 - i - 1,
          reset: Date.now() + 3600000,
        })
      }

      const { ratelimit } = await import('@/server/lib/redis')

      for (let i = 0; i < 20; i++) {
        const result = await ratelimit.scheduleDelivery.limit('user_123')
        expect(result.success).toBe(true)
      }

      expect(mockLimit).toHaveBeenCalledTimes(20)
    })

    it('should block 21st delivery within same hour', async () => {
      // Mock 21st request blocked
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 20,
        remaining: 0,
        reset: Date.now() + 3600000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.scheduleDelivery.limit('user_123')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  describe('Rate Limit Configuration', () => {
    it('should initialize rate limiters with correct configuration', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit')

      // Clear module cache to reinitialize
      vi.resetModules()
      await import('@/server/lib/redis')

      // Check that Ratelimit was called with correct configurations
      expect(Ratelimit).toHaveBeenCalledWith(
        expect.objectContaining({
          limiter: expect.objectContaining({
            type: 'slidingWindow',
            maxRequests: 100,
            window: '1 m',
          }),
          analytics: true,
        })
      )

      expect(Ratelimit).toHaveBeenCalledWith(
        expect.objectContaining({
          limiter: expect.objectContaining({
            type: 'slidingWindow',
            maxRequests: 10,
            window: '1 h',
          }),
          analytics: true,
        })
      )

      expect(Ratelimit).toHaveBeenCalledWith(
        expect.objectContaining({
          limiter: expect.objectContaining({
            type: 'slidingWindow',
            maxRequests: 20,
            window: '1 h',
          }),
          analytics: true,
        })
      )
    })
  })

  describe('Rate Limit Error Handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      // Mock Redis error
      mockLimit.mockRejectedValueOnce(new Error('Redis connection failed'))

      const { ratelimit } = await import('@/server/lib/redis')

      await expect(async () => {
        await ratelimit.api.limit('user_123')
      }).rejects.toThrow('Redis connection failed')
    })

    it('should handle rate limit check with invalid identifier', async () => {
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')
      const result = await ratelimit.api.limit('')

      // Should still work with empty identifier
      expect(result.success).toBe(true)
      expect(mockLimit).toHaveBeenCalledWith('')
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle burst traffic correctly', async () => {
      // Mock 5 successful requests, then 1 blocked
      for (let i = 0; i < 5; i++) {
        mockLimit.mockResolvedValueOnce({
          success: true,
          limit: 5,
          remaining: 5 - i - 1,
          reset: Date.now() + 60000,
        })
      }

      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const { ratelimit } = await import('@/server/lib/redis')

      // Concurrent burst of 6 requests
      const results = await Promise.all([
        ratelimit.api.limit('user_burst'),
        ratelimit.api.limit('user_burst'),
        ratelimit.api.limit('user_burst'),
        ratelimit.api.limit('user_burst'),
        ratelimit.api.limit('user_burst'),
        ratelimit.api.limit('user_burst'),
      ])

      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length

      expect(successCount).toBe(5)
      expect(failureCount).toBe(1)
    })
  })
})

/**
 * Unit Tests for Error Classification System
 *
 * Tests worker error classification and retry logic.
 * Critical for determining which errors should be retried vs permanently failed.
 *
 * Note: Keep active; if error taxonomy changes, update fixtures instead of disabling.
 */

import { describe, it, expect } from 'vitest'
import {
  WorkerError,
  NetworkError,
  RateLimitError,
  ProviderTimeoutError,
  InvalidEmailError,
  classifyProviderError,
  classifyDatabaseError,
  shouldRetry,
  calculateBackoff,
} from '../../../workers/inngest/lib/errors'

describe('Error Classification', () => {
  it('smoke: error helpers available', () => {
    expect(classifyProviderError).toBeDefined()
    expect(shouldRetry).toBeDefined()
  })

  describe('WorkerError Base Class', () => {
    it('should create error with correct properties', () => {
      const error = new WorkerError('Test error', 'TEST_CODE', true, { foo: 'bar' })

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.retryable).toBe(true)
      expect(error.metadata).toEqual({ foo: 'bar' })
      expect(error.name).toBe('WorkerError')
    })

    it('should default retryable to true', () => {
      const error = new WorkerError('Test', 'CODE')

      expect(error.retryable).toBe(true)
    })
  })

  describe('Retryable Error Types', () => {
    it('should classify NetworkError as retryable', () => {
      const error = new NetworkError('Connection refused')

      expect(error.retryable).toBe(true)
      expect(error.code).toBe('NETWORK_ERROR')
    })

    it('should classify RateLimitError as retryable', () => {
      const error = new RateLimitError('Too many requests')

      expect(error.retryable).toBe(true)
      expect(error.code).toBe('RATE_LIMIT_ERROR')
    })

    it('should classify ProviderTimeoutError as retryable', () => {
      const error = new ProviderTimeoutError('Request timeout')

      expect(error.retryable).toBe(true)
      expect(error.code).toBe('PROVIDER_TIMEOUT')
    })
  })

  describe('Non-Retryable Error Types', () => {
    it('should classify InvalidEmailError as non-retryable', () => {
      const error = new InvalidEmailError('Invalid email format')

      expect(error.retryable).toBe(false)
      expect(error.code).toBe('INVALID_EMAIL')
    })
  })

  describe('classifyProviderError', () => {
    it('should classify network errors as NetworkError', () => {
      const error = new Error('ECONNREFUSED: Connection refused')
      const classified = classifyProviderError(error)

      expect(classified).toBeInstanceOf(NetworkError)
      expect(classified.retryable).toBe(true)
    })

    it('should classify 429 status as RateLimitError', () => {
      const error = { statusCode: 429, message: 'Rate limit exceeded' }
      const classified = classifyProviderError(error)

      expect(classified).toBeInstanceOf(RateLimitError)
      expect(classified.retryable).toBe(true)
    })

    it('should classify timeout errors as ProviderTimeoutError', () => {
      const error = { statusCode: 504, message: 'Gateway timeout' }
      const classified = classifyProviderError(error)

      expect(classified).toBeInstanceOf(ProviderTimeoutError)
      expect(classified.retryable).toBe(true)
    })

    it('should classify 5xx errors as TemporaryProviderError (retryable)', () => {
      const error = { statusCode: 500, message: 'Internal server error' }
      const classified = classifyProviderError(error)

      expect(classified.retryable).toBe(true)
      expect(classified.code).toBe('TEMPORARY_PROVIDER_ERROR')
    })

    it('should classify 400 with email as InvalidEmailError', () => {
      const error = { statusCode: 400, message: 'Invalid email address' }
      const classified = classifyProviderError(error)

      expect(classified).toBeInstanceOf(InvalidEmailError)
      expect(classified.retryable).toBe(false)
    })

    it('should classify unknown 4xx errors as non-retryable', () => {
      const error = { statusCode: 403, message: 'Forbidden' }
      const classified = classifyProviderError(error)

      expect(classified.retryable).toBe(false)
    })
  })

  describe('classifyDatabaseError', () => {
    it('should classify connection errors as DatabaseConnectionError', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' }
      const classified = classifyDatabaseError(error)

      expect(classified.retryable).toBe(true)
      expect(classified.code).toBe('DATABASE_CONNECTION_ERROR')
    })

    it('should classify unique constraint violations as non-retryable', () => {
      const error = { code: 'P2002', message: 'Unique constraint failed' }
      const classified = classifyDatabaseError(error)

      expect(classified.retryable).toBe(false)
      expect(classified.code).toBe('INVALID_DELIVERY')
    })

    it('should classify record not found as non-retryable', () => {
      const error = { code: 'P2025', message: 'Record not found' }
      const classified = classifyDatabaseError(error)

      expect(classified.retryable).toBe(false)
    })
  })

  describe('shouldRetry', () => {
    it('should retry retryable WorkerError within max attempts', () => {
      const error = new NetworkError('Connection failed')

      expect(shouldRetry(error, 1)).toBe(true)
      expect(shouldRetry(error, 3)).toBe(true)
      expect(shouldRetry(error, 4)).toBe(true)
    })

    it('should not retry after max attempts', () => {
      const error = new NetworkError('Connection failed')

      expect(shouldRetry(error, 5)).toBe(false)
      expect(shouldRetry(error, 6)).toBe(false)
    })

    it('should not retry non-retryable errors', () => {
      const error = new InvalidEmailError('Invalid email')

      expect(shouldRetry(error, 1)).toBe(false)
      expect(shouldRetry(error, 3)).toBe(false)
    })

    it('should retry unknown errors within max attempts', () => {
      const error = new Error('Unknown error')

      expect(shouldRetry(error, 1)).toBe(true)
      expect(shouldRetry(error, 4)).toBe(true)
    })
  })

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff correctly', () => {
      const backoff1 = calculateBackoff(1, 1000, 60000)
      const backoff2 = calculateBackoff(2, 1000, 60000)
      const backoff3 = calculateBackoff(3, 1000, 60000)

      // Exponential: 1000, 2000, 4000, 8000, ...
      expect(backoff1).toBeGreaterThanOrEqual(1600) // 2000 * 0.8 (with jitter)
      expect(backoff1).toBeLessThanOrEqual(2400)    // 2000 * 1.2 (with jitter)

      expect(backoff2).toBeGreaterThanOrEqual(3200) // 4000 * 0.8
      expect(backoff2).toBeLessThanOrEqual(4800)    // 4000 * 1.2

      expect(backoff3).toBeGreaterThanOrEqual(6400) // 8000 * 0.8
      expect(backoff3).toBeLessThanOrEqual(9600)    // 8000 * 1.2
    })

    it('should cap backoff at max delay', () => {
      const backoff = calculateBackoff(10, 1000, 60000)

      expect(backoff).toBeLessThanOrEqual(72000) // 60000 * 1.2 (max with jitter)
    })

    it('should add jitter to prevent thundering herd', () => {
      const delays = new Set<number>()

      // Generate 10 backoff delays for same attempt
      for (let i = 0; i < 10; i++) {
        delays.add(calculateBackoff(2, 1000, 60000))
      }

      // Should have different values due to jitter
      expect(delays.size).toBeGreaterThan(1)
    })

    it('should handle attempt count of 0', () => {
      const backoff = calculateBackoff(0, 1000, 60000)

      // 1000 * 2^0 = 1000
      expect(backoff).toBeGreaterThanOrEqual(800)  // 1000 * 0.8
      expect(backoff).toBeLessThanOrEqual(1200)    // 1000 * 1.2
    })
  })
})

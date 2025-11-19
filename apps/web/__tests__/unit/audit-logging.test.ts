/**
 * Unit Tests for Audit Logging System
 *
 * Tests audit event creation and sensitive data redaction.
 * Critical for compliance (GDPR, SOC 2) and security monitoring.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuditEvent, redactSensitiveData, AuditEventType } from '../../server/lib/audit'

// Mock Prisma
const mockCreate = vi.fn()
vi.mock('../../server/lib/db', () => ({
  prisma: {
    auditEvent: {
      create: mockCreate,
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

describe('Audit Logging System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAuditEvent', () => {
    it('should create audit event with all parameters', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'audit_123',
        userId: 'user_123',
        type: AuditEventType.LETTER_CREATED,
        data: { letterId: 'letter_123' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      })

      const result = await createAuditEvent({
        userId: 'user_123',
        type: AuditEventType.LETTER_CREATED,
        data: { letterId: 'letter_123' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          type: AuditEventType.LETTER_CREATED,
          data: { letterId: 'letter_123' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      })
      expect(result).toBeTruthy()
    })

    it('should create audit event without optional parameters', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'audit_123',
        userId: 'user_123',
        type: AuditEventType.SUBSCRIPTION_CREATED,
        data: {},
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      })

      await createAuditEvent({
        userId: 'user_123',
        type: AuditEventType.SUBSCRIPTION_CREATED,
        data: {},
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          type: AuditEventType.SUBSCRIPTION_CREATED,
          data: {},
          ipAddress: undefined,
          userAgent: undefined,
        },
      })
    })

    it('should handle null userId for system events', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'audit_123',
        userId: null,
        type: AuditEventType.DATA_EXPORT_COMPLETED,
        data: {},
        createdAt: new Date(),
      })

      await createAuditEvent({
        userId: null,
        type: AuditEventType.DATA_EXPORT_COMPLETED,
        data: {},
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: null,
          type: AuditEventType.DATA_EXPORT_COMPLETED,
          data: {},
          ipAddress: undefined,
          userAgent: undefined,
        },
      })
    })

    it('should not throw on database error (graceful degradation)', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Database connection failed'))

      const result = await createAuditEvent({
        userId: 'user_123',
        type: AuditEventType.LETTER_CREATED,
        data: {},
      })

      expect(result).toBeNull()
    })
  })

  describe('redactSensitiveData', () => {
    it('should redact password field', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
      }

      const redacted = redactSensitiveData(data)

      expect(redacted.username).toBe('john')
      expect(redacted.password).toBe('[REDACTED]')
      expect(redacted.email).toBe('john@example.com')
    })

    it('should redact apiKey field', () => {
      const data = {
        service: 'stripe',
        apiKey: 'sk_live_abc123',
      }

      const redacted = redactSensitiveData(data)

      expect(redacted.service).toBe('stripe')
      expect(redacted.apiKey).toBe('[REDACTED]')
    })

    it('should redact api_key field (snake_case)', () => {
      const data = {
        api_key: 'key_123',
        api_url: 'https://api.example.com',
      }

      const redacted = redactSensitiveData(data)

      expect(redacted.api_key).toBe('[REDACTED]')
      expect(redacted.api_url).toBe('https://api.example.com') // Not sensitive
    })

    it('should redact multiple sensitive fields', () => {
      const data = {
        password: 'pass123',
        secret: 'secret_key',
        token: 'bearer_token',
        cardNumber: '4242424242424242',
        cvv: '123',
      }

      const redacted = redactSensitiveData(data)

      expect(redacted.password).toBe('[REDACTED]')
      expect(redacted.secret).toBe('[REDACTED]')
      expect(redacted.token).toBe('[REDACTED]')
      expect(redacted.cardNumber).toBe('[REDACTED]')
      expect(redacted.cvv).toBe('[REDACTED]')
    })

    it('should not modify non-sensitive fields', () => {
      const data = {
        userId: 'user_123',
        email: 'user@example.com',
        timestamp: '2024-01-15T12:00:00Z',
        metadata: { foo: 'bar' },
      }

      const redacted = redactSensitiveData(data)

      expect(redacted).toEqual(data)
    })

    it('should return new object (not mutate original)', () => {
      const original = {
        username: 'john',
        password: 'secret',
      }

      const redacted = redactSensitiveData(original)

      expect(original.password).toBe('secret') // Original unchanged
      expect(redacted.password).toBe('[REDACTED]') // Redacted copy
      expect(redacted).not.toBe(original) // Different object
    })

    it('should handle empty object', () => {
      const data = {}

      const redacted = redactSensitiveData(data)

      expect(redacted).toEqual({})
    })

    it('should redact SSN field', () => {
      const data = {
        name: 'John Doe',
        ssn: '123-45-6789',
      }

      const redacted = redactSensitiveData(data)

      expect(redacted.name).toBe('John Doe')
      expect(redacted.ssn).toBe('[REDACTED]')
    })
  })

  describe('Audit Event Types', () => {
    it('should have GDPR event types', () => {
      expect(AuditEventType.DATA_EXPORT_REQUESTED).toBe('gdpr.data_export.requested')
      expect(AuditEventType.DATA_EXPORT_COMPLETED).toBe('gdpr.data_export.completed')
      expect(AuditEventType.DATA_DELETION_REQUESTED).toBe('gdpr.data_deletion.requested')
      expect(AuditEventType.DATA_DELETION_COMPLETED).toBe('gdpr.data_deletion.completed')
    })

    it('should have security event types', () => {
      expect(AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT).toBe('security.unauthorized_access')
      expect(AuditEventType.RATE_LIMIT_EXCEEDED).toBe('security.rate_limit_exceeded')
      expect(AuditEventType.SUSPICIOUS_ACTIVITY).toBe('security.suspicious_activity')
    })

    it('should have billing event types', () => {
      expect(AuditEventType.CHECKOUT_SESSION_CREATED).toBe('checkout.session.created')
      expect(AuditEventType.PAYMENT_SUCCEEDED).toBe('payment.succeeded')
      expect(AuditEventType.SUBSCRIPTION_CREATED).toBe('subscription.created')
    })

    it('should have letter/delivery event types', () => {
      expect(AuditEventType.LETTER_CREATED).toBe('letter.created')
      expect(AuditEventType.DELIVERY_SCHEDULED).toBe('delivery.scheduled')
      expect(AuditEventType.DELIVERY_SENT).toBe('delivery.sent')
    })
  })
})

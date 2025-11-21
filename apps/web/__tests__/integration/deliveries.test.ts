/**
 * Integration Tests for Deliveries
 *
 * Tests delivery scheduling, updating, and cancellation workflows
 * including entitlements, mail credits, and Inngest event triggering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scheduleDelivery, updateDelivery, cancelDelivery } from '../../server/actions/deliveries'
import { ErrorCodes } from '@dearme/types'

// Mock dependencies
vi.mock('../../server/lib/auth', () => ({
  requireUser: vi.fn(() => Promise.resolve({
    id: 'user_test_123',
    email: 'test@example.com',
    clerkUserId: 'clerk_test_123',
  })),
}))

vi.mock('../../server/lib/entitlements', () => ({
  getEntitlements: vi.fn(() => Promise.resolve({
    userId: 'user_test_123',
    plan: 'pro',
    status: 'active',
    features: {
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: true,
      emailDeliveriesIncluded: 'unlimited',
      mailCreditsPerMonth: 2,
    },
    usage: {
      emailsThisMonth: 5,
      mailCreditsRemaining: 2,
    },
    limits: {
      emailsReached: false,
      mailCreditsExhausted: false,
    },
  })),
  trackEmailDelivery: vi.fn(() => Promise.resolve()),
  deductMailCredit: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../server/lib/db', () => ({
  prisma: {
    delivery: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    letter: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../server/lib/audit', () => ({
  createAuditEvent: vi.fn(() => Promise.resolve({ id: 'audit_123' })),
  AuditEventType: {
    DELIVERY_SCHEDULED: 'delivery.scheduled',
    DELIVERY_CANCELED: 'delivery.canceled',
  },
}))

vi.mock('../../server/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../server/lib/trigger-inngest', () => ({
  triggerInngestEvent: vi.fn(() => Promise.resolve({ ids: ['event_123'] })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Deliveries Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scheduleDelivery', () => {
    it('should schedule email delivery successfully for Pro user', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { triggerInngestEvent } = await import('../../server/lib/trigger-inngest')

      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'user_test_123',
        title: 'Test Letter',
        bodyCiphertext: Buffer.from('encrypted'),
        bodyNonce: Buffer.from('nonce'),
        bodyFormat: 'rich',
        keyVersion: 1,
        visibility: 'private',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      vi.mocked(prisma.delivery.create).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'scheduled',
        deliverAt: new Date('2025-01-15T12:00:00Z'),
        timezone: 'America/New_York',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: null,
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await scheduleDelivery({
        letterId: 'letter_123',
        channel: 'email',
        deliverAt: new Date('2025-01-15T12:00:00Z'),
        timezone: 'America/New_York',
        toEmail: 'test@example.com',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.deliveryId).toBe('delivery_123')
      }
      expect(triggerInngestEvent).toHaveBeenCalledWith('delivery/scheduled', expect.any(Object))
    })

    it('should reject scheduling for free tier users', async () => {
      const { getEntitlements } = await import('../../server/lib/entitlements')

      vi.mocked(getEntitlements).mockResolvedValueOnce({
        userId: 'user_free_123',
        plan: 'none',
        status: 'none',
        features: {
          canScheduleDeliveries: false, // Free tier cannot schedule
          canSchedulePhysicalMail: false,
          emailDeliveriesIncluded: 0,
          mailCreditsPerMonth: 0,
        },
        usage: {
          emailsThisMonth: 0,
          mailCreditsRemaining: 0,
        },
        limits: {
          emailsReached: false,
          mailCreditsExhausted: true,
        },
      })

      const result = await scheduleDelivery({
        letterId: 'letter_123',
        channel: 'email',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.SUBSCRIPTION_REQUIRED)
      }
    })

    it('should enforce mail credits for physical mail deliveries', async () => {
      const { getEntitlements } = await import('../../server/lib/entitlements')

      vi.mocked(getEntitlements).mockResolvedValueOnce({
        userId: 'user_test_123',
        plan: 'pro',
        status: 'active',
        features: {
          canScheduleDeliveries: true,
          canSchedulePhysicalMail: true,
          mailCreditsPerMonth: 2,
        },
        usage: {
          mailCreditsRemaining: 0, // No credits
        },
        limits: {
          mailCreditsExhausted: true,
        },
      })

      const result = await scheduleDelivery({
        letterId: 'letter_123',
        channel: 'mail',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        shippingAddressId: 'address_123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.INSUFFICIENT_CREDITS)
      }
    })

    it('should deduct mail credit when scheduling physical mail', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { deductMailCredit } = await import('../../server/lib/entitlements')

      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'user_test_123',
        title: 'Test Letter',
        bodyCiphertext: Buffer.from('encrypted'),
        bodyNonce: Buffer.from('nonce'),
        bodyFormat: 'rich',
        keyVersion: 1,
        visibility: 'private',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      vi.mocked(prisma.delivery.create).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'mail',
        status: 'scheduled',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: null,
        toAddress: 'address_123',
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: null,
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await scheduleDelivery({
        letterId: 'letter_123',
        channel: 'mail',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        shippingAddressId: 'address_123',
      })

      expect(deductMailCredit).toHaveBeenCalledWith('user_test_123')
    })

    it('should track email delivery for usage metrics', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { trackEmailDelivery } = await import('../../server/lib/entitlements')

      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'user_test_123',
        title: 'Test Letter',
        bodyCiphertext: Buffer.from('encrypted'),
        bodyNonce: Buffer.from('nonce'),
        bodyFormat: 'rich',
        keyVersion: 1,
        visibility: 'private',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      vi.mocked(prisma.delivery.create).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'scheduled',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: null,
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await scheduleDelivery({
        letterId: 'letter_123',
        channel: 'email',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
      })

      expect(trackEmailDelivery).toHaveBeenCalledWith('user_test_123')
    })

    it('should reject invalid input with validation error', async () => {
      const result = await scheduleDelivery({
        // Missing required fields
        letterId: 'invalid',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED)
      }
    })
  })

  describe('updateDelivery', () => {
    it('should update delivery successfully', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.delivery.findUnique).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'scheduled',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: null,
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.delivery.update).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'scheduled',
        deliverAt: new Date('2025-01-20'), // Updated date
        timezone: 'America/New_York',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: null,
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await updateDelivery({
        deliveryId: 'delivery_123',
        deliverAt: new Date('2025-01-20'),
        timezone: 'America/New_York',
      })

      expect(result.success).toBe(true)
      expect(prisma.delivery.update).toHaveBeenCalled()
    })
  })

  describe('cancelDelivery', () => {
    it('should cancel scheduled delivery successfully', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.delivery.findUnique).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'scheduled',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: 'inngest_run_123',
        providerMessageId: null,
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.delivery.update).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'canceled',
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 0,
        lastAttemptAt: null,
        inngestRunId: 'inngest_run_123',
        providerMessageId: null,
        canceledAt: new Date(),
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await cancelDelivery({ deliveryId: 'delivery_123' })

      expect(result.success).toBe(true)
      expect(prisma.delivery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'canceled',
            canceledAt: expect.any(Date),
          }),
        })
      )
    })

    it('should prevent canceling already sent deliveries', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.delivery.findUnique).mockResolvedValueOnce({
        id: 'delivery_123',
        userId: 'user_test_123',
        letterId: 'letter_123',
        channel: 'email',
        status: 'sent', // Already sent
        deliverAt: new Date('2025-01-15'),
        timezone: 'UTC',
        toEmail: 'test@example.com',
        toAddress: null,
        attemptCount: 1,
        lastAttemptAt: new Date(),
        inngestRunId: null,
        providerMessageId: 'msg_123',
        canceledAt: null,
        failureReason: null,
        failureCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await cancelDelivery({ deliveryId: 'delivery_123' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.INVALID_STATE)
      }
    })
  })
})

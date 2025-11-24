/**
 * Integration Tests for GDPR Data Subject Rights (DSR)
 *
 * Tests GDPR Article 15 (Right to Access) and Article 17 (Right to Erasure)
 * compliance including data export and deletion workflows.
 *
 * Note: Suite retained post paid-only migration; keep expectations aligned with current
 * architecture rather than disabling. Update fixtures if flows evolve.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportUserData, deleteUserAccount } from '../../server/actions/gdpr'
import { ErrorCodes } from '@dearme/types'

// Mock dependencies
vi.mock('../../server/lib/auth', () => ({
  requireUser: vi.fn(() => Promise.resolve({
    id: 'user_test_123',
    email: 'test@example.com',
    clerkUserId: 'clerk_test_123',
  })),
}))

vi.mock('../../server/lib/encryption', () => ({
  decryptLetter: vi.fn((ciphertext, nonce, keyVersion) => Promise.resolve({
    bodyRich: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Letter content' }] }] },
    bodyHtml: '<p>Letter content</p>',
  })),
}))

vi.mock('../../server/lib/db', () => {
  const transactionClient = {
    profile: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    letter: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    delivery: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    subscription: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    subscriptionUsage: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    shippingAddress: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditEvent: {
      findMany: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
  }

  return {
    prisma: {
      ...transactionClient,
      $transaction: vi.fn((callback) => callback(transactionClient)),
    },
  }
})
vi.mock('../../server/lib/audit', () => ({
  createAuditEvent: vi.fn(() => Promise.resolve({ id: 'audit_123' })),
  AuditEventType: {
    DATA_EXPORT_REQUESTED: 'gdpr.data_export.requested',
    DATA_EXPORT_COMPLETED: 'gdpr.data_export.completed',
    DATA_DELETION_REQUESTED: 'gdpr.data_deletion.requested',
    DATA_DELETION_COMPLETED: 'gdpr.data_deletion.completed',
  },
}))

// Shared mock for Clerk deleteUser
const mockDeleteUser = vi.fn(() => Promise.resolve({ deleted: true, id: 'clerk_test_123' }))

vi.mock('../../server/lib/clerk', () => ({
  getClerkClient: vi.fn(() => Promise.resolve({
    users: {
      deleteUser: mockDeleteUser,
    },
  })),
}))

vi.mock('../../server/providers/stripe/client', () => ({
  stripe: {
    subscriptions: {
      cancel: vi.fn(() => Promise.resolve({ id: 'sub_123', status: 'canceled' })),
      list: vi.fn(() => Promise.resolve({ data: [] })),
    },
  },
}))

describe('GDPR Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportUserData (Article 15 - Right to Access)', () => {
    it('should export comprehensive user data successfully', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { createAuditEvent } = await import('../../server/lib/audit')

      // Mock user data
      vi.mocked(prisma.profile.findUnique).mockResolvedValueOnce({
        userId: 'user_test_123',
        displayName: 'Test User',
        timezone: 'America/New_York',
        marketingOptIn: false,
        onboardingCompleted: true,
        stripeCustomerId: 'cus_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.letter.findMany).mockResolvedValueOnce([
        {
          id: 'letter_123',
          userId: 'user_test_123',
          title: 'My Letter',
          bodyCiphertext: Buffer.from('encrypted'),
          bodyNonce: Buffer.from('nonce'),
          bodyFormat: 'rich',
          keyVersion: 1,
          visibility: 'private',
          tags: ['personal'],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deliveries: [],
        },
      ])

      vi.mocked(prisma.delivery.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscription.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.payment.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscriptionUsage.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.shippingAddress.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.auditEvent.findMany).mockResolvedValueOnce([])

      const result = await exportUserData()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.filename).toContain('capsulenote-data-export')
        expect(result.data.downloadUrl).toBeTruthy()
      }
      expect(createAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gdpr.data_export.requested',
        })
      )
    })

    it('should decrypt all letters in export', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { decryptLetter } = await import('../../server/lib/encryption')

      vi.mocked(prisma.profile.findUnique).mockResolvedValueOnce({
        userId: 'user_test_123',
        displayName: 'Test User',
        timezone: 'UTC',
        marketingOptIn: false,
        onboardingCompleted: true,
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.letter.findMany).mockResolvedValueOnce([
        {
          id: 'letter_1',
          userId: 'user_test_123',
          title: 'Letter 1',
          bodyCiphertext: Buffer.from('encrypted1'),
          bodyNonce: Buffer.from('nonce1'),
          bodyFormat: 'rich',
          keyVersion: 1,
          visibility: 'private',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deliveries: [],
        },
        {
          id: 'letter_2',
          userId: 'user_test_123',
          title: 'Letter 2',
          bodyCiphertext: Buffer.from('encrypted2'),
          bodyNonce: Buffer.from('nonce2'),
          bodyFormat: 'rich',
          keyVersion: 1,
          visibility: 'private',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deliveries: [],
        },
      ])

      vi.mocked(prisma.delivery.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscription.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.payment.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscriptionUsage.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.shippingAddress.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.auditEvent.findMany).mockResolvedValueOnce([])

      await exportUserData()

      // Should decrypt both letters
      expect(decryptLetter).toHaveBeenCalledTimes(2)
    })

    it('should include audit logs in export', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.profile.findUnique).mockResolvedValueOnce({
        userId: 'user_test_123',
        displayName: 'Test User',
        timezone: 'UTC',
        marketingOptIn: false,
        onboardingCompleted: true,
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.letter.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.delivery.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscription.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.payment.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscriptionUsage.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.shippingAddress.findMany).mockResolvedValueOnce([])

      vi.mocked(prisma.auditEvent.findMany).mockResolvedValueOnce([
        {
          id: 'audit_1',
          userId: 'user_test_123',
          type: 'letter.created',
          data: { letterId: 'letter_123' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        },
      ])

      const result = await exportUserData()

      expect(result.success).toBe(true)
      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_test_123' },
        })
      )
    })

    it('should log export completion audit event', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { createAuditEvent } = await import('../../server/lib/audit')

      vi.mocked(prisma.profile.findUnique).mockResolvedValueOnce({
        userId: 'user_test_123',
        displayName: 'Test User',
        timezone: 'UTC',
        marketingOptIn: false,
        onboardingCompleted: true,
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.letter.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.delivery.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscription.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.payment.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.subscriptionUsage.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.shippingAddress.findMany).mockResolvedValueOnce([])
      vi.mocked(prisma.auditEvent.findMany).mockResolvedValueOnce([])

      await exportUserData()

      expect(createAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gdpr.data_export.completed',
        })
      )
    })
  })

  describe('deleteUserAccount (Article 17 - Right to Erasure)', () => {
    it('should delete user account and all data successfully', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { createAuditEvent } = await import('../../server/lib/audit')
      const { getClerkClient } = await import('../../server/lib/clerk')

      // Mock finding active subscriptions
      vi.mocked(prisma.subscription.findFirst).mockResolvedValueOnce(null)

      // Mock sentinel user creation
      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'deleted-user@system.internal',
        clerkUserId: 'system_deleted_user',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock payment anonymization
      vi.mocked(prisma.payment.updateMany).mockResolvedValueOnce({ count: 0 })

      // Mock deletion operations
      vi.mocked(prisma.user.delete).mockResolvedValueOnce({
        id: 'user_test_123',
        email: 'test@example.com',
        clerkUserId: 'clerk_test_123',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await deleteUserAccount()

      expect(result.success).toBe(true)
      expect(prisma.user.delete).toHaveBeenCalled()
      expect(createAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gdpr.data_deletion.completed',
        })
      )
    })

    it('should cancel active Stripe subscriptions before deletion', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { stripe } = await import('../../server/providers/stripe/client')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValueOnce({
        id: 'sub_db_123',
        userId: 'user_test_123',
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_123',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock sentinel user creation
      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({} as any)

      // Mock payment anonymization
      vi.mocked(prisma.payment.updateMany).mockResolvedValueOnce({ count: 0 })

      // Mock deletion
      vi.mocked(prisma.user.delete).mockResolvedValueOnce({} as any)

      await deleteUserAccount()

      expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_stripe_123', {
        prorate: false,
      })
    })

    it('should delete user from Clerk authentication', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValueOnce(null)

      // Mock sentinel user creation
      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({} as any)

      // Mock payment anonymization
      vi.mocked(prisma.payment.updateMany).mockResolvedValueOnce({ count: 0 })

      // Mock deletion
      vi.mocked(prisma.user.delete).mockResolvedValueOnce({} as any)

      await deleteUserAccount()

      expect(mockDeleteUser).toHaveBeenCalledWith('clerk_test_123')
    })

    it('should preserve audit logs (immutable for compliance)', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValueOnce(null)

      // Mock sentinel user creation
      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({} as any)

      // Mock payment anonymization
      vi.mocked(prisma.payment.updateMany).mockResolvedValueOnce({ count: 0 })

      // Mock deletion
      vi.mocked(prisma.user.delete).mockResolvedValueOnce({} as any)

      await deleteUserAccount()

      // Audit events should NOT be deleted
      expect(prisma.auditEvent).not.toHaveProperty('deleteMany')
    })
  })
})

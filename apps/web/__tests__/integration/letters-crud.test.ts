/**
 * Integration Tests for Letters CRUD Operations
 *
 * Tests the complete flow of letter creation, reading, updating, and deletion
 * including authentication, encryption, entitlements, and database operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLetter, updateLetter, deleteLetter, getLetterById } from '../../server/actions/letters'
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
  encryptLetter: vi.fn((data) => Promise.resolve({
    bodyCiphertext: Buffer.from('encrypted_content'),
    bodyNonce: Buffer.from('test_nonce_12'),
    keyVersion: 1,
  })),
  decryptLetter: vi.fn((ciphertext, nonce, keyVersion) => Promise.resolve({
    bodyRich: { type: 'doc', content: [] },
    bodyHtml: '<p>Test content</p>',
  })),
}))

vi.mock('../../server/lib/entitlements', () => ({
  getEntitlements: vi.fn(() => Promise.resolve({
    userId: 'user_test_123',
    plan: 'pro',
    status: 'active',
    features: {
      canCreateLetters: true,
      canScheduleDeliveries: true,
      maxLettersPerMonth: 'unlimited',
    },
    usage: {
      lettersThisMonth: 5,
    },
    limits: {
      lettersReached: false,
    },
  })),
  trackLetterCreation: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../server/lib/db', () => ({
  prisma: {
    letter: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    delivery: {
      count: vi.fn(),
    },
  },
}))

vi.mock('../../server/lib/audit', () => ({
  createAuditEvent: vi.fn(() => Promise.resolve({ id: 'audit_123' })),
  AuditEventType: {
    LETTER_CREATED: 'letter.created',
    LETTER_UPDATED: 'letter.updated',
    LETTER_DELETED: 'letter.deleted',
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

describe('Letters CRUD Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createLetter', () => {
    it('should create letter successfully with valid input', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { createAuditEvent } = await import('../../server/lib/audit')

      vi.mocked(prisma.letter.create).mockResolvedValueOnce({
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

      const result = await createLetter({
        title: 'Test Letter',
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>',
        visibility: 'private',
        tags: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.letterId).toBe('letter_123')
      }
      expect(prisma.letter.create).toHaveBeenCalled()
      expect(createAuditEvent).toHaveBeenCalled()
    })

    it('should reject invalid input with validation error', async () => {
      const result = await createLetter({
        // Missing required fields
        title: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED)
      }
    })

    it('should enforce quota for free tier users', async () => {
      const { getEntitlements } = await import('../../server/lib/entitlements')

      vi.mocked(getEntitlements).mockResolvedValueOnce({
        userId: 'user_free_123',
        plan: 'none',
        status: 'none',
        features: {
          canCreateLetters: false, // Quota exceeded
          canScheduleDeliveries: false,
          maxLettersPerMonth: 5,
        },
        usage: {
          lettersThisMonth: 5,
        },
        limits: {
          lettersReached: true,
        },
      })

      const result = await createLetter({
        title: 'Test Letter',
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>',
        visibility: 'private',
        tags: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.QUOTA_EXCEEDED)
        expect(result.error.message).toContain('Free plan limit reached')
      }
    })

    it('should handle encryption failure gracefully', async () => {
      const { encryptLetter } = await import('../../server/lib/encryption')

      vi.mocked(encryptLetter).mockRejectedValueOnce(new Error('Encryption failed'))

      const result = await createLetter({
        title: 'Test Letter',
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>',
        visibility: 'private',
        tags: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.ENCRYPTION_FAILED)
      }
    })

    it('should track letter creation for pro users', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { trackLetterCreation } = await import('../../server/lib/entitlements')

      vi.mocked(prisma.letter.create).mockResolvedValueOnce({
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

      await createLetter({
        title: 'Test Letter',
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>',
        visibility: 'private',
        tags: [],
      })

      expect(trackLetterCreation).toHaveBeenCalledWith('user_test_123')
    })

    it('should trigger Inngest event for letter created email', async () => {
      const { prisma } = await import('../../server/lib/db')
      const { triggerInngestEvent } = await import('../../server/lib/trigger-inngest')

      vi.mocked(prisma.letter.create).mockResolvedValueOnce({
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

      await createLetter({
        title: 'Test Letter',
        bodyRich: { type: 'doc', content: [] },
        bodyHtml: '<p>Test</p>',
        visibility: 'private',
        tags: [],
      })

      expect(triggerInngestEvent).toHaveBeenCalledWith('letter/created', expect.objectContaining({
        letterId: 'letter_123',
      }))
    })
  })

  describe('getLetterById', () => {
    it('should retrieve and decrypt letter successfully', async () => {
      const { prisma } = await import('../../server/lib/db')

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

      vi.mocked(prisma.delivery.count).mockResolvedValueOnce(2)

      const result = await getLetterById('letter_123')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.letter.id).toBe('letter_123')
        expect(result.data.letter.title).toBe('Test Letter')
      }
    })

    it('should return error for non-existent letter', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce(null)

      const result = await getLetterById('non_existent')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.NOT_FOUND)
      }
    })

    it('should enforce ownership check', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'different_user', // Different user
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

      const result = await getLetterById('letter_123')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.FORBIDDEN)
      }
    })
  })

  describe('updateLetter', () => {
    it('should update letter successfully', async () => {
      const { prisma } = await import('../../server/lib/db')

      // Mock finding existing letter
      vi.mocked(prisma.letter.findUnique).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'user_test_123',
        title: 'Old Title',
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

      // Mock update operation
      vi.mocked(prisma.letter.update).mockResolvedValueOnce({
        id: 'letter_123',
        userId: 'user_test_123',
        title: 'Updated Title',
        bodyCiphertext: Buffer.from('new_encrypted'),
        bodyNonce: Buffer.from('new_nonce'),
        bodyFormat: 'rich',
        keyVersion: 1,
        visibility: 'private',
        tags: ['updated'],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const result = await updateLetter({
        letterId: 'letter_123',
        title: 'Updated Title',
        tags: ['updated'],
      })

      expect(result.success).toBe(true)
      expect(prisma.letter.update).toHaveBeenCalled()
    })
  })

  describe('deleteLetter', () => {
    it('should soft delete letter successfully', async () => {
      const { prisma } = await import('../../server/lib/db')

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

      vi.mocked(prisma.letter.update).mockResolvedValueOnce({
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
        deletedAt: new Date(), // Soft deleted
      })

      const result = await deleteLetter('letter_123')

      expect(result.success).toBe(true)
      expect(prisma.letter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        })
      )
    })
  })
})

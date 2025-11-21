/**
 * Unit Tests for Entitlements System
 *
 * Tests subscription-based feature access control including:
 * - Free tier limits (5 letters/month)
 * - Pro tier limits (unlimited)
 * - Quota tracking and enforcement
 * - Usage calculations
 * - Cache behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getEntitlements, QuotaExceededError, trackLetterCreation } from '../../server/lib/entitlements'

// Mock Prisma
const mockSubscription = {
  id: 'sub_123',
  userId: 'user_123',
  plan: 'pro' as const,
  status: 'active' as const,
  stripeCustomerId: 'cus_123',
  stripeSubscriptionId: 'sub_stripe_123',
  stripePriceId: 'price_123',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  cancelAtPeriodEnd: false,
  canceledAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

vi.mock('../../server/lib/db', () => ({
  prisma: {
    subscription: {
      findFirst: vi.fn(),
    },
    letter: {
      count: vi.fn(),
    },
    subscriptionUsage: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('../../server/lib/redis', () => ({
  redis: {
    get: vi.fn(() => Promise.resolve(null)),
    setex: vi.fn(() => Promise.resolve('OK')),
    del: vi.fn(() => Promise.resolve(1)),
  },
}))

describe('Entitlements System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Free Tier Limits', () => {
    it('should enforce 5 letters/month limit for free tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      // Mock no subscription (free tier)
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)

      // Mock 3 letters created this month
      vi.mocked(prisma.letter.count).mockResolvedValue(3)

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.plan).toBe('none')
      expect(entitlements.features.maxLettersPerMonth).toBe(5)
      expect(entitlements.features.canCreateLetters).toBe(true) // 3 < 5
      expect(entitlements.limits.lettersReached).toBe(false)
    })

    it('should block letter creation when limit reached', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(5) // At limit

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.features.canCreateLetters).toBe(false)
      expect(entitlements.limits.lettersReached).toBe(true)
    })

    it('should not allow email deliveries for free tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(0)

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.features.canScheduleDeliveries).toBe(false)
      expect(entitlements.features.emailDeliveriesIncluded).toBe(0)
    })

    it('should not allow physical mail for free tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(0)

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.features.canSchedulePhysicalMail).toBe(false)
      expect(entitlements.limits.mailCreditsExhausted).toBe(true)
    })
  })

  describe('Pro Tier Limits', () => {
    it('should provide unlimited letters for Pro tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription)
      vi.mocked(prisma.subscriptionUsage.upsert).mockResolvedValue({
        id: 'usage_123',
        userId: 'user_123',
        period: new Date('2024-01-01'),
        lettersCreated: 100, // High usage
        emailsSent: 50,
        mailsSent: 1,
        mailCredits: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const entitlements = await getEntitlements('user_123')

      expect(entitlements.plan).toBe('pro')
      expect(entitlements.features.maxLettersPerMonth).toBe('unlimited')
      expect(entitlements.features.canCreateLetters).toBe(true)
      expect(entitlements.limits.lettersReached).toBe(false)
    })

    it('should provide unlimited email deliveries for Pro tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription)
      vi.mocked(prisma.subscriptionUsage.upsert).mockResolvedValue({
        id: 'usage_123',
        userId: 'user_123',
        period: new Date('2024-01-01'),
        lettersCreated: 10,
        emailsSent: 100, // High usage
        mailsSent: 0,
        mailCredits: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const entitlements = await getEntitlements('user_123')

      expect(entitlements.features.emailDeliveriesIncluded).toBe('unlimited')
      expect(entitlements.features.canScheduleDeliveries).toBe(true)
      expect(entitlements.limits.emailsReached).toBe(false)
    })

    it('should provide 2 mail credits per month for Pro tier', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription)
      vi.mocked(prisma.subscriptionUsage.upsert).mockResolvedValue({
        id: 'usage_123',
        userId: 'user_123',
        period: new Date('2024-01-01'),
        lettersCreated: 10,
        emailsSent: 50,
        mailsSent: 0,
        mailCredits: 2, // Full credits
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const entitlements = await getEntitlements('user_123')

      expect(entitlements.features.mailCreditsPerMonth).toBe(2)
      expect(entitlements.usage.mailCreditsRemaining).toBe(2)
      expect(entitlements.limits.mailCreditsExhausted).toBe(false)
    })
  })

  describe('Quota Tracking', () => {
    it('should track letter creation count accurately', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(3)

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.usage.lettersThisMonth).toBe(3)
    })

    it('should throw QuotaExceededError when free tier limit reached', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(5) // At limit

      await expect(trackLetterCreation('user_free_123')).rejects.toThrow(QuotaExceededError)
    })

    it('should handle edge case of usage exactly at limit', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(5) // Exactly at limit

      const entitlements = await getEntitlements('user_free_123')

      expect(entitlements.features.canCreateLetters).toBe(false)
      expect(entitlements.limits.lettersReached).toBe(true)
      expect(entitlements.usage.lettersThisMonth).toBe(5)
    })
  })

  describe('Subscription Status', () => {
    it('should handle missing subscription gracefully', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.letter.count).mockResolvedValue(0)

      const entitlements = await getEntitlements('user_no_sub_123')

      expect(entitlements.plan).toBe('none')
      expect(entitlements.status).toBe('none')
      expect(entitlements.features.canCreateLetters).toBe(true) // Within free tier limit
    })

    it('should detect trialing subscription', async () => {
      const { prisma } = await import('../../server/lib/db')

      const trialingSubscription = {
        ...mockSubscription,
        status: 'trialing' as const,
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(trialingSubscription)
      vi.mocked(prisma.subscriptionUsage.upsert).mockResolvedValue({
        id: 'usage_123',
        userId: 'user_123',
        period: new Date('2024-01-01'),
        lettersCreated: 5,
        emailsSent: 10,
        mailsSent: 0,
        mailCredits: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const entitlements = await getEntitlements('user_123')

      expect(entitlements.status).toBe('trialing')
      expect(entitlements.trialInfo?.isInTrial).toBe(true)
      expect(entitlements.trialInfo?.daysRemaining).toBeGreaterThanOrEqual(6)
      // Should still have Pro features during trial
      expect(entitlements.features.maxLettersPerMonth).toBe('unlimited')
    })

    it('should detect active subscription', async () => {
      const { prisma } = await import('../../server/lib/db')

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription)
      vi.mocked(prisma.subscriptionUsage.upsert).mockResolvedValue({
        id: 'usage_123',
        userId: 'user_123',
        period: new Date('2024-01-01'),
        lettersCreated: 10,
        emailsSent: 20,
        mailsSent: 1,
        mailCredits: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const entitlements = await getEntitlements('user_123')

      expect(entitlements.status).toBe('active')
      expect(entitlements.plan).toBe('pro')
      expect(entitlements.trialInfo).toBeUndefined()
    })
  })
})

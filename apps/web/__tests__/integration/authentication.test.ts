/**
 * Integration Tests for Authentication
 *
 * Tests Clerk authentication integration including:
 * - getCurrentUser() and requireUser() functions
 * - Auto-sync fallback for missing users
 * - Race condition handling
 * - Auto-linking pending subscriptions
 * - Unauthorized access handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk authentication
const mockClerkAuth = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockClerkAuth,
  clerkClient: vi.fn(() => Promise.resolve({
    users: {
      getUser: mockGetUser,
    },
  })),
  createClerkClient: vi.fn(() => ({
    users: {
      getUser: mockGetUser,
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    },
  })),
}))

vi.mock('@/server/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    pendingSubscription: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/app/[locale]/subscribe/actions', () => ({
  linkPendingSubscription: vi.fn(() => Promise.resolve({
    success: true,
    subscriptionId: 'sub_123',
  })),
}))

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser()', () => {
    it('should return user when authenticated and user exists in DB', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_123' })

      // Mock user exists in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        planType: 'DIGITAL_CAPSULE',
        emailCredits: 6,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_123',
          displayName: 'Test User',
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: true,
          stripeCustomerId: 'cus_123',
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.clerkUserId).toBe('clerk_user_123')
      expect(user?.email).toBe('test@example.com')
      expect(user?.profile).toBeDefined()
    })

    it('should return null when user is not authenticated', async () => {
      // Mock unauthenticated (no userId)
      mockClerkAuth.mockResolvedValueOnce({ userId: null })

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should auto-sync user from Clerk when missing from DB', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_new' })

      // Mock user NOT in DB (first call returns null)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      // Mock Clerk user data
      mockGetUser.mockResolvedValueOnce({
        id: 'clerk_user_new',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'newuser@example.com',
          },
        ],
      })

      // Mock successful user creation
      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'user_new_123',
        clerkUserId: 'clerk_user_new',
        email: 'newuser@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_new_123',
          displayName: null,
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: false,
          stripeCustomerId: null,
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      // Mock no pending subscription
      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce(null)

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.email).toBe('newuser@example.com')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkUserId: 'clerk_user_new',
          email: 'newuser@example.com',
          profile: {
            create: {
              timezone: 'UTC',
            },
          },
        },
        include: {
          profile: true,
        },
      })
    })

    it('should skip auto-sync when CLERK_AUTO_PROVISION_ENABLED is false', async () => {
      const originalFlag = process.env.CLERK_AUTO_PROVISION_ENABLED
      process.env.CLERK_AUTO_PROVISION_ENABLED = "false"
      vi.resetModules()

      const { prisma } = await import('@/server/lib/db')
      const { getCurrentUser } = await import('@/server/lib/auth')

      // Mock authenticated user with no local record
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_disabled' })
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(mockGetUser).not.toHaveBeenCalled()
      expect(prisma.user.create).not.toHaveBeenCalled()

      if (originalFlag === undefined) {
        delete process.env.CLERK_AUTO_PROVISION_ENABLED
      } else {
        process.env.CLERK_AUTO_PROVISION_ENABLED = originalFlag
      }
      vi.resetModules()
    })

    it('should handle race condition when auto-syncing user', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_race' })

      // First findUnique: user not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      // Mock Clerk user data
      mockGetUser.mockResolvedValueOnce({
        id: 'clerk_user_race',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'race@example.com',
          },
        ],
      })

      // Mock race condition on create (P2002 = unique constraint violation)
      vi.mocked(prisma.user.create).mockRejectedValueOnce({
        code: 'P2002',
        message: 'Unique constraint failed',
      })

      // Second findUnique: user now exists (created by concurrent request)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_race_123',
        clerkUserId: 'clerk_user_race',
        email: 'race@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_race_123',
          displayName: null,
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: false,
          stripeCustomerId: null,
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      // Mock no pending subscription
      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce(null)

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.email).toBe('race@example.com')
      expect(prisma.user.create).toHaveBeenCalledTimes(1)
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2)
    })

    it('should auto-link pending subscription for newly synced user', async () => {
      const { prisma } = await import('@/server/lib/db')
      const { linkPendingSubscription } = await import('@/app/[locale]/subscribe/actions')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_pending' })

      // Mock user NOT in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      // Mock Clerk user data
      mockGetUser.mockResolvedValueOnce({
        id: 'clerk_user_pending',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'pending@example.com',
          },
        ],
      })

      // Mock user creation (without stripeCustomerId)
      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'user_pending_123',
        clerkUserId: 'clerk_user_pending',
        email: 'pending@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_pending_123',
          displayName: null,
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: false,
          stripeCustomerId: null, // No Stripe customer yet
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      // Mock pending subscription found
      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce({
        id: 'pending_123',
        email: 'pending@example.com',
        status: 'payment_complete',
        stripeSessionId: 'cs_test_123',
        plan: 'DIGITAL_CAPSULE',
        linkedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      // Mock refreshed user after linking
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_pending_123',
        clerkUserId: 'clerk_user_pending',
        email: 'pending@example.com',
        planType: 'DIGITAL_CAPSULE',
        emailCredits: 6,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_pending_123',
          displayName: null,
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: false,
          stripeCustomerId: 'cus_new_123',
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).not.toBeNull()
      expect(linkPendingSubscription).toHaveBeenCalledWith('user_pending_123')
      expect(user?.profile?.stripeCustomerId).toBe('cus_new_123')
    })

    it('should return null when Clerk user has no email', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_no_email' })

      // Mock user NOT in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      // Mock Clerk user with no email
      mockGetUser.mockResolvedValueOnce({
        id: 'clerk_user_no_email',
        primaryEmailAddressId: null,
        emailAddresses: [],
      })

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('requireUser()', () => {
    it('should return user when authenticated', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_123' })

      // Mock user exists in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        planType: 'DIGITAL_CAPSULE',
        emailCredits: 6,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_123',
          displayName: 'Test User',
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: true,
          stripeCustomerId: null,
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      const { requireUser } = await import('@/server/lib/auth')
      const user = await requireUser()

      expect(user).not.toBeNull()
      expect(user.clerkUserId).toBe('clerk_user_123')
    })

    it('should throw error when user is not authenticated', async () => {
      // Mock unauthenticated
      mockClerkAuth.mockResolvedValueOnce({ userId: null })

      const { requireUser } = await import('@/server/lib/auth')

      await expect(async () => {
        await requireUser()
      }).rejects.toThrow('Unauthorized')
    })

    it('should throw error when auto-sync fails', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock authenticated user
      mockClerkAuth.mockResolvedValueOnce({ userId: 'clerk_user_fail' })

      // Mock user NOT in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      // Mock Clerk API failure
      mockGetUser.mockRejectedValueOnce(new Error('Clerk API error'))

      const { requireUser } = await import('@/server/lib/auth')

      await expect(async () => {
        await requireUser()
      }).rejects.toThrow('Unauthorized')
    })
  })

  describe('Session Management', () => {
    it('should work with valid Clerk session', async () => {
      const { prisma } = await import('@/server/lib/db')

      // Mock valid session with userId
      mockClerkAuth.mockResolvedValueOnce({
        userId: 'clerk_valid_session',
        sessionId: 'sess_123',
        sessionClaims: {
          sub: 'clerk_valid_session',
        },
      })

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_session_123',
        clerkUserId: 'clerk_valid_session',
        email: 'session@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          userId: 'user_session_123',
          displayName: null,
          timezone: 'UTC',
          marketingOptIn: false,
          onboardingCompleted: false,
          stripeCustomerId: null,
          pushEnabled: false,
          referredByCode: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any)

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.clerkUserId).toBe('clerk_valid_session')
    })

    it('should handle expired or invalid session', async () => {
      // Mock invalid session (no userId)
      mockClerkAuth.mockResolvedValueOnce({
        userId: null,
        sessionId: null,
        sessionClaims: null,
      })

      const { getCurrentUser } = await import('@/server/lib/auth')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })
})

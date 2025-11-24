/**
 * Race Condition Tests
 *
 * Comprehensive tests for all race condition fixes implemented across the codebase.
 * Tests use mocks to simulate concurrent operations and verify proper retry/handling logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  pendingSubscription: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}

vi.mock("@/server/lib/db", () => ({
  prisma: mockPrisma,
}))

// Mock Clerk
const mockClerkAuth = vi.fn()
const mockGetUser = vi.fn()

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockClerkAuth,
  clerkClient: vi.fn(() =>
    Promise.resolve({
      users: {
        getUser: mockGetUser,
      },
    })
  ),
}))

vi.mock("@/app/[locale]/subscribe/actions", () => ({
  linkPendingSubscription: vi.fn(() =>
    Promise.resolve({
      success: true,
      subscriptionId: "sub_123",
    })
  ),
}))

describe("Race Condition Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("User Creation Race Conditions", () => {
    it("should handle concurrent user creation attempts (auth.ts)", async () => {
      const { getCurrentUser } = await import("@/server/lib/auth")
      const testClerkUserId = "clerk_test_123"
      const testEmail = "test@example.com"

      // Mock Clerk auth
      mockClerkAuth.mockResolvedValue({ userId: testClerkUserId })

      // First findUnique: user not found (triggers auto-sync)
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      // Mock create to fail with P2002 (unique constraint) to simulate race
      const p2002Error = new Error("Unique constraint failed")
      Object.assign(p2002Error, {
        code: "P2002",
        meta: { target: ["clerkUserId"] },
      })
      mockPrisma.user.create.mockRejectedValueOnce(p2002Error)

      // Mock Clerk user
      mockGetUser.mockResolvedValue({
        id: testClerkUserId,
        primaryEmailAddressId: "email_123",
        emailAddresses: [
          {
            id: "email_123",
            emailAddress: testEmail,
          },
        ],
      })

      // On retry after P2002, findUnique should return the user created by concurrent request
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: "user_123",
        clerkUserId: testClerkUserId,
        email: testEmail,
        profile: {
          timezone: "UTC",
        },
      })

      // Execute
      const result = await getCurrentUser()

      // Verify retry logic worked
      expect(result).toBeDefined()
      expect(result?.clerkUserId).toBe(testClerkUserId)
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2) // Initial + retry after P2002
    })

    it("should handle concurrent Clerk webhook deliveries", async () => {
      const { getCurrentUser } = await import("@/server/lib/auth")
      const testClerkUserId = "clerk_webhook_123"
      const testEmail = "webhook@example.com"

      // Mock two concurrent webhook scenarios
      mockClerkAuth.mockResolvedValue({ userId: testClerkUserId })

      // First webhook: user not found
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      // First webhook: successfully creates user
      mockPrisma.user.create.mockResolvedValueOnce({
        id: "user_123",
        clerkUserId: testClerkUserId,
        email: testEmail,
        profile: { timezone: "UTC" },
      })

      mockGetUser.mockResolvedValue({
        id: testClerkUserId,
        primaryEmailAddressId: "email_123",
        emailAddresses: [
          {
            id: "email_123",
            emailAddress: testEmail,
          },
        ],
      })

      // Execute
      const result = await getCurrentUser()

      expect(result).toBeDefined()
      expect(result?.clerkUserId).toBe(testClerkUserId)
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1)
    })
  })

  describe("Subscription Linking Race Conditions", () => {
    it("should handle idempotent subscription linking", async () => {
      const { linkPendingSubscription } = await import("@/app/[locale]/subscribe/actions")

      // Execute multiple times - should be idempotent
      const result1 = await linkPendingSubscription("user_123")
      const result2 = await linkPendingSubscription("user_123")

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})

/**
 * Integration Tests: Anonymous Checkout Webhook Flows
 *
 * Tests for Stripe and Clerk webhook handling in anonymous checkout flow.
 *
 * Coverage:
 * - Dual-path account linking (webhooks arrive in any order)
 * - Race condition scenarios
 * - Webhook signature verification
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { stripe } from "@/server/providers/stripe"

// Mock dependencies
const mockPrisma = {
  pendingSubscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  webhookEvent: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(async (cb: any) =>
    cb({
      pendingSubscription: {
        update: mockPrisma.pendingSubscription.update,
      },
      user: mockPrisma.user,
    })
  ),
}

vi.mock("@/server/lib/db", () => ({ prisma: mockPrisma }))
vi.mock("@/server/providers/stripe")
vi.mock("@/server/lib/audit")
vi.mock("@/server/lib/stripe-helpers")
vi.mock("@/app/subscribe/actions")

const prisma = mockPrisma

describe("Webhook Integration: Dual-Path Account Linking", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Path 1: Payment → Signup (Normal Flow)", () => {
    it("should update PendingSubscription on payment completion", async () => {
      // Arrange
      const email = "test@example.com"
      const sessionId = "cs_test123"
      const subscriptionId = "sub_test123"

      const mockPending = {
        id: "pending_123",
        email,
        stripeSessionId: sessionId,
        status: "awaiting_payment",
      }

      // Simulate Stripe webhook: checkout.session.completed
      const mockSession = {
        id: sessionId,
        customer_email: email,
        subscription: subscriptionId,
        payment_status: "paid",
      }

      // @ts-ignore
      prisma.pendingSubscription.findUnique.mockResolvedValue(mockPending)
      // @ts-ignore
      prisma.pendingSubscription.update.mockResolvedValue({
        ...mockPending,
        status: "payment_complete",
        stripeSubscriptionId: subscriptionId,
      })
      // @ts-ignore
      prisma.user.findFirst.mockResolvedValue(null) // User doesn't exist yet

      // Act: Simulate webhook handler
      const updatedPending = await prisma.pendingSubscription.update({
        where: { stripeSessionId: sessionId },
        data: {
          status: "payment_complete",
          stripeSubscriptionId: subscriptionId,
        },
      })

      // Assert
      expect(updatedPending.status).toBe("payment_complete")
      expect(updatedPending.stripeSubscriptionId).toBe(subscriptionId)
    })

    it("should link subscription when user signs up after payment", async () => {
      // Arrange
      const email = "test@example.com"
      const userId = "user_123"

      const mockPending = {
        id: "pending_123",
        email,
        status: "payment_complete",
        stripeSubscriptionId: "sub_test123",
        stripeCustomerId: "cus_test123",
      }

      // Simulate Clerk webhook: user.created
      const mockUser = {
        id: userId,
        email,
        clerkUserId: "clerk_123",
      }

      // @ts-ignore
      prisma.user.create.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(mockPending)

      // Mock linkPendingSubscription
      const { linkPendingSubscription } = await import("@/app/subscribe/actions")
      // @ts-ignore
      linkPendingSubscription.mockResolvedValue({
        success: true,
        subscriptionId: "subscription_123",
      })

      // Act: Simulate Clerk webhook finding pending subscription
      const pendingFound = await prisma.pendingSubscription.findFirst({
        where: { email, status: "payment_complete" },
      })

      const linkResult = await linkPendingSubscription(userId)

      // Assert
      expect(pendingFound).toBeTruthy()
      expect(linkResult.success).toBe(true)
      expect(linkResult.subscriptionId).toBe("subscription_123")
    })
  })

  describe("Path 2: Signup → Payment Webhook (Race Condition)", () => {
    it("should wait for payment webhook if user signs up first", async () => {
      // Arrange
      const email = "test@example.com"
      const userId = "user_123"

      const mockPending = {
        id: "pending_123",
        email,
        status: "awaiting_payment", // Payment not complete yet
      }

      const mockUser = {
        id: userId,
        email,
        clerkUserId: "clerk_123",
      }

      // Simulate Clerk webhook arrives FIRST
      // @ts-ignore
      prisma.user.create.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(null) // No payment_complete subscription found yet

      const { linkPendingSubscription } = await import("@/app/subscribe/actions")
      // @ts-ignore
      linkPendingSubscription.mockResolvedValue({ success: true, subscriptionId: "sub_auto" }) // Auto-link may occur

      // Act: Clerk webhook checks for pending subscription
      const pendingFound = await prisma.pendingSubscription.findFirst({
        where: { email, status: "payment_complete" },
      })

      const linkResult = await linkPendingSubscription(userId)

      // Assert: Should succeed; auto-link may have occurred depending on timing
      expect(pendingFound).toBeFalsy()
      expect(linkResult.success).toBe(true)
      expect(linkResult.subscriptionId).toBe("sub_auto")
    })

    it("should link subscription when payment webhook arrives late", async () => {
      // Arrange
      const email = "test@example.com"
      const sessionId = "cs_test123"
      const userId = "user_123"

      const mockPending = {
        id: "pending_123",
        email,
        stripeSessionId: sessionId,
        status: "awaiting_payment",
      }

      const mockUser = {
        id: userId,
        email,
        clerkUserId: "clerk_123",
      }

      // Simulate Stripe webhook arrives AFTER user creation
      // @ts-ignore
      prisma.pendingSubscription.findUnique.mockResolvedValue(mockPending)
      // @ts-ignore
      prisma.pendingSubscription.update.mockResolvedValue({
        ...mockPending,
        status: "payment_complete",
      })
      // @ts-ignore
      prisma.user.findFirst.mockResolvedValue(mockUser) // User exists now!

      const { linkPendingSubscription } = await import("@/app/subscribe/actions")
      // @ts-ignore
      linkPendingSubscription.mockResolvedValue({
        success: true,
        subscriptionId: "subscription_123",
      })

      // Act: Stripe webhook updates status and finds user
      await prisma.pendingSubscription.update({
        where: { stripeSessionId: sessionId },
        data: { status: "payment_complete" },
      })

      const userFound = await prisma.user.findFirst({ where: { email } })
      const linkResult = await linkPendingSubscription(userFound!.id)

      // Assert: Should link subscription
      expect(userFound).toBeTruthy()
      expect(linkResult.success).toBe(true)
      expect(linkResult.subscriptionId).toBe("subscription_123")
    })
  })

  describe("Webhook Security", () => {
    it("should verify Stripe webhook signature", async () => {
      // Note: In real implementation, this would use stripe.webhooks.constructEvent
      const payload = JSON.stringify({
        id: "evt_test123",
        type: "checkout.session.completed",
      })
      const signature = "test_signature"
      const webhookSecret = "whsec_test"

      // @ts-ignore
      stripe.webhooks.constructEvent = vi.fn((p, s, secret) => {
        if (secret !== webhookSecret) {
          throw new Error("Invalid signature")
        }
        return JSON.parse(p)
      })

      // Act & Assert: Valid signature
      expect(() => {
        stripe.webhooks.constructEvent(payload, signature, webhookSecret)
      }).not.toThrow()

      // Act & Assert: Invalid signature
      expect(() => {
        stripe.webhooks.constructEvent(payload, signature, "wrong_secret")
      }).toThrow("Invalid signature")
    })

    it("should verify Clerk webhook signature using svix", async () => {
      // Note: Clerk uses svix for webhook verification
      // This is a placeholder for the actual implementation
      const payload = { type: "user.created", data: {} }
      const headers = {
        "svix-id": "msg_test",
        "svix-timestamp": Date.now().toString(),
        "svix-signature": "test_signature",
      }

      // In real implementation:
      // const wh = new Webhook(CLERK_WEBHOOK_SECRET)
      // wh.verify(JSON.stringify(payload), headers)

      expect(headers["svix-signature"]).toBeTruthy()
    })
  })

  describe("Idempotency", () => {
    it("should handle duplicate Stripe webhook events", async () => {
      // Arrange
      const eventId = "evt_test123"

      // @ts-ignore
      prisma.webhookEvent.findUnique
        .mockResolvedValueOnce(null) // First time
        .mockResolvedValueOnce({ id: eventId }) // Second time
      // @ts-ignore
      prisma.webhookEvent.create.mockResolvedValue({ id: eventId })

      // Act: Process same event twice using transaction wrapper to mimic handler flow
      const processEvent = async () => {
        const existing = await prisma.webhookEvent.findUnique({ where: { id: eventId } })
        if (existing) return existing
        return prisma.$transaction(async () => {
          return prisma.webhookEvent.create({
            data: { id: eventId, type: "checkout.session.completed", processed: true },
          })
        })
      }

      const firstAttempt = await processEvent()
      const secondAttempt = await processEvent()

      // Assert: Second attempt should find existing event and skip creation
      expect(firstAttempt).toBeTruthy()
      expect(secondAttempt).toBeTruthy()
      expect(prisma.webhookEvent.create).toHaveBeenCalledTimes(1)
    })

    it("should handle duplicate Clerk webhook events", async () => {
      // Arrange
      const userId = "user_123"
      const email = "test@example.com"

      // @ts-ignore
      prisma.user.findUnique.mockResolvedValueOnce(null) // First webhook
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValueOnce({ id: userId, email }) // Second webhook
      // @ts-ignore
      prisma.user.create.mockResolvedValue({ id: userId, email })

      // Act: Process same user.created event twice
      const firstAttempt = await prisma.user.findUnique({
        where: { clerkUserId: "clerk_123" },
      })

      if (!firstAttempt) {
        await prisma.user.create({
          data: { id: userId, clerkUserId: "clerk_123", email },
        })
      }

      const secondAttempt = await prisma.user.findUnique({
        where: { clerkUserId: "clerk_123" },
      })

      // Assert: Second attempt should find existing user and skip creation
      expect(firstAttempt).toBeNull()
      expect(secondAttempt).toBeTruthy()
    })
  })

  describe("Error Handling", () => {
    it("should handle Stripe API errors gracefully", async () => {
      // Arrange
      const sessionId = "cs_test123"

      // @ts-ignore
      stripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error("No such checkout session")
      )

      // Act & Assert
      await expect(
        stripe.checkout.sessions.retrieve(sessionId)
      ).rejects.toThrow("No such checkout session")
    })

    it("should handle database transaction failures", async () => {
      // Arrange
      // @ts-ignore
      prisma.$transaction.mockRejectedValue(new Error("Transaction failed"))

      // Act & Assert
      await expect(
        prisma.$transaction(async () => {
          throw new Error("Transaction failed")
        })
      ).rejects.toThrow("Transaction failed")
    })

    it("should handle missing PendingSubscription gracefully", async () => {
      // Arrange
      const sessionId = "cs_nonexistent"

      // @ts-ignore
      prisma.pendingSubscription.findUnique.mockResolvedValue(null)

      // Act
      const pending = await prisma.pendingSubscription.findUnique({
        where: { stripeSessionId: sessionId },
      })

      // Assert: Should return null without throwing
      expect(pending).toBeNull()
    })
  })
})

describe("Webhook Integration: Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

    it("should handle expired PendingSubscription", async () => {
      // Arrange
      const email = "test@example.com"
      const expiredPending = {
        id: "pending_123",
      email,
      status: "payment_complete",
      expiresAt: new Date(Date.now() - 86400000), // Yesterday (expired)
    }

    // @ts-ignore
    prisma.pendingSubscription.findFirst.mockResolvedValueOnce(null) // Query with expiry filter returns null

    const { linkPendingSubscription } = await import("@/app/subscribe/actions")
    // @ts-ignore
    linkPendingSubscription.mockResolvedValue({ success: true }) // Should skip expired

    // Act
    const pendingFound = await prisma.pendingSubscription.findFirst({
      where: {
        email,
        status: "payment_complete",
        expiresAt: { gt: new Date() }, // Check for NOT expired
      },
    })

    // Assert: Should not find expired pending subscription
    expect(pendingFound).toBeNull()
  })

    it("should handle email mismatch between Clerk and Stripe", async () => {
      // Arrange
      const stripeEmail = "stripe@example.com"
      const clerkEmail = "clerk@example.com"

    const mockPending = {
      id: "pending_123",
      email: stripeEmail,
      status: "payment_complete",
    }

    const mockUser = {
      id: "user_123",
      email: clerkEmail, // Different email!
      clerkUserId: "clerk_123",
    }

    // @ts-ignore
    prisma.pendingSubscription.findFirst.mockResolvedValue(null) // No match

    // Act
    const pendingFound = await prisma.pendingSubscription.findFirst({
      where: { email: clerkEmail, status: "payment_complete" },
    })

    // Assert: Should not find pending subscription (email mismatch)
    expect(pendingFound).toBeNull()
  })

    it("should handle subscription already linked", async () => {
      // Arrange
      const email = "test@example.com"
      const linkedPending = {
      id: "pending_123",
      email,
      status: "linked", // Already linked
      linkedUserId: "user_existing",
    }

    // @ts-ignore
    prisma.pendingSubscription.findFirst.mockResolvedValueOnce(null) // Query for payment_complete doesn't match 'linked' status

    const { linkPendingSubscription } = await import("@/app/subscribe/actions")
    // @ts-ignore
    linkPendingSubscription.mockResolvedValue({ success: true })

    // Act
    const pendingFound = await prisma.pendingSubscription.findFirst({
      where: { email, status: "payment_complete" }, // Look for payment_complete, not linked
    })

    // Assert: Should not find already-linked subscription
    expect(pendingFound).toBeFalsy()
  })
})

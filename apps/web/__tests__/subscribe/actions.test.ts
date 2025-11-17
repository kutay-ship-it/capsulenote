/**
 * Unit Tests: Anonymous Checkout Server Actions
 *
 * Tests for createAnonymousCheckout and linkPendingSubscription functions.
 *
 * Coverage:
 * - Happy path scenarios
 * - Error cases (validation, duplicate payments, missing data)
 * - Edge cases (race conditions, expired sessions)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { createAnonymousCheckout, linkPendingSubscription } from "@/app/subscribe/actions"
import { prisma } from "@/server/lib/db"
import { stripe } from "@/server/providers/stripe"
import { clerkClient } from "@clerk/nextjs/server"
import { isValidPriceId } from "@/server/providers/stripe/client"

// Mock external dependencies
vi.mock("@/server/lib/db")
vi.mock("@/server/providers/stripe")
vi.mock("@clerk/nextjs/server")
vi.mock("@/server/lib/audit")
vi.mock("@/server/lib/stripe-helpers")
vi.mock("@/server/providers/stripe/client", () => ({
  isValidPriceId: vi.fn(() => true),
}))

describe("createAnonymousCheckout", () => {
  const mockedIsValidPriceId = vi.mocked(isValidPriceId)

  beforeEach(() => {
    vi.clearAllMocks()
    mockedIsValidPriceId.mockReturnValue(true)
  })

  describe("Happy Path", () => {
    it("should create checkout session with locked email for new user", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        priceId: "price_test123",
        letterId: "letter_abc",
        metadata: { source: "letter_form" },
      }

      const mockCustomer = { id: "cus_test123", email: input.email }
      const mockPrice = {
        id: input.priceId,
        product: "prod_test",
        unit_amount: 1999,
        currency: "usd",
      }
      const mockProduct = { id: "prod_test", name: "Pro" }
      const mockSession = {
        id: "cs_test123",
        url: "https://checkout.stripe.com/session/cs_test123",
        status: "open",
      }

      // @ts-ignore - Mock Prisma
      prisma.pendingSubscription.findFirst.mockResolvedValue(null)
      // @ts-ignore
      prisma.pendingSubscription.create.mockResolvedValue({})

      // @ts-ignore - Mock Stripe
      stripe.customers.create.mockResolvedValue(mockCustomer)
      // @ts-ignore
      stripe.prices.retrieve.mockResolvedValue(mockPrice)
      // @ts-ignore
      stripe.products.retrieve.mockResolvedValue(mockProduct)
      // @ts-ignore
      stripe.checkout.sessions.create.mockResolvedValue(mockSession)

      // Act
      const result = await createAnonymousCheckout(input)

      // Assert
      expect(result).toEqual({
        sessionId: mockSession.id,
        sessionUrl: mockSession.url,
        customerId: mockCustomer.id,
      })

      // Verify customer created BEFORE checkout session
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: input.email,
        metadata: {
          source: "anonymous_checkout",
          letterId: input.letterId,
          ...input.metadata,
        },
      })

      // Verify checkout session uses customer ID (locks email)
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: mockCustomer.id,
          mode: "subscription",
        })
      )

      // Verify PendingSubscription created
      expect(prisma.pendingSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: input.email,
            stripeCustomerId: mockCustomer.id,
            stripeSessionId: mockSession.id,
            status: "awaiting_payment",
          }),
        })
      )
    })
  })

  describe("Resume Checkout", () => {
    it("should resume existing checkout if session still valid", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        priceId: "price_test123",
      }

      const existingPending = {
        id: "pending_123",
        email: input.email,
        status: "awaiting_payment",
        stripeSessionId: "cs_existing",
        stripeCustomerId: "cus_existing",
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
      }

      const mockSession = {
        id: "cs_existing",
        url: "https://checkout.stripe.com/session/cs_existing",
        status: "open",
      }

      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(existingPending)
      // @ts-ignore
      stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession)

      // Act
      const result = await createAnonymousCheckout(input)

      // Assert
      expect(result).toEqual({
        sessionId: mockSession.id,
        sessionUrl: mockSession.url,
        customerId: existingPending.stripeCustomerId,
      })

      // Should NOT create new customer or session
      expect(stripe.customers.create).not.toHaveBeenCalled()
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it("should create new checkout if existing session expired", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        priceId: "price_test123",
      }

      const existingPending = {
        id: "pending_123",
        email: input.email,
        status: "awaiting_payment",
        stripeSessionId: "cs_expired",
        stripeCustomerId: "cus_existing",
        expiresAt: new Date(Date.now() + 86400000),
      }

      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(existingPending)
      // @ts-ignore - Simulate expired session
      stripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error("No such checkout session: cs_expired")
      )

      // Setup mocks for new checkout
      const mockCustomer = { id: "cus_new", email: input.email }
      const mockPrice = { id: input.priceId, product: "prod_test", unit_amount: 1999, currency: "usd" }
      const mockProduct = { id: "prod_test", name: "Pro" }
      const mockSession = { id: "cs_new", url: "https://checkout.stripe.com/new", status: "open" }

      // @ts-ignore
      stripe.customers.create.mockResolvedValue(mockCustomer)
      // @ts-ignore
      stripe.prices.retrieve.mockResolvedValue(mockPrice)
      // @ts-ignore
      stripe.products.retrieve.mockResolvedValue(mockProduct)
      // @ts-ignore
      stripe.checkout.sessions.create.mockResolvedValue(mockSession)
      // @ts-ignore
      prisma.pendingSubscription.create.mockResolvedValue({})

      // Act
      const result = await createAnonymousCheckout(input)

      // Assert
      expect(result.sessionId).toBe("cs_new")
      expect(stripe.customers.create).toHaveBeenCalled()
      expect(stripe.checkout.sessions.create).toHaveBeenCalled()
    })
  })

  describe("Error Cases", () => {
    it("should reject invalid price id", async () => {
      const input = {
        email: "test@example.com",
        priceId: "price_invalid",
      }

      mockedIsValidPriceId.mockReturnValue(false)

      await expect(createAnonymousCheckout(input)).rejects.toThrow(
        "Invalid pricing plan selected"
      )
    })

    it("should throw ALREADY_PAID error if payment already completed", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        priceId: "price_test123",
      }

      const existingPending = {
        id: "pending_123",
        email: input.email,
        status: "payment_complete",
        expiresAt: new Date(Date.now() + 86400000),
      }

      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(existingPending)

      // Act & Assert
      await expect(createAnonymousCheckout(input)).rejects.toThrow("ALREADY_PAID")
    })

    it("should reject invalid email", async () => {
      // Arrange
      const input = {
        email: "invalid-email",
        priceId: "price_test123",
      }

      // Act & Assert
      await expect(createAnonymousCheckout(input)).rejects.toThrow()
    })

    it("should handle Stripe API errors gracefully", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        priceId: "price_test123",
      }

      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(null)
      // @ts-ignore
      stripe.customers.create.mockRejectedValue(new Error("Stripe API error"))

      // Act & Assert
      await expect(createAnonymousCheckout(input)).rejects.toThrow("Stripe API error")
    })
  })
})

describe("linkPendingSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Happy Path", () => {
    it("should link pending subscription to user account", async () => {
      // Arrange
      const userId = "user_123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        clerkUserId: "clerk_123",
        profile: { id: "profile_123", userId },
      }

      const mockPending = {
        id: "pending_123",
        email: mockUser.email,
        status: "payment_complete",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        plan: "pro",
        expiresAt: new Date(Date.now() + 86400000),
      }

      const mockStripeSubscription = {
        id: "sub_123",
        status: "active",
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
        cancel_at_period_end: false,
      }

      const mockClerkUser = {
        id: "clerk_123",
        primaryEmailAddressId: "email_123",
        emailAddresses: [
          {
            id: "email_123",
            emailAddress: mockUser.email,
            verification: { status: "verified" },
          },
        ],
      }

      const mockSubscription = {
        id: "subscription_123",
        userId,
        stripeSubscriptionId: "sub_123",
      }

      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(mockPending)
      // @ts-ignore
      prisma.$transaction.mockImplementation((callback) => callback(prisma))
      // @ts-ignore
      prisma.subscription.create.mockResolvedValue(mockSubscription)
      // @ts-ignore
      prisma.profile.update.mockResolvedValue({})
      // @ts-ignore
      prisma.pendingSubscription.update.mockResolvedValue({})

      // @ts-ignore
      stripe.subscriptions.retrieve.mockResolvedValue(mockStripeSubscription)

      const mockClerk = {
        users: {
          getUser: vi.fn().mockResolvedValue(mockClerkUser),
        },
      }
      // @ts-ignore
      clerkClient.mockResolvedValue(mockClerk)

      // Act
      const result = await linkPendingSubscription(userId)

      // Assert
      expect(result.success).toBe(true)
      expect(result.subscriptionId).toBe(mockSubscription.id)

      // Verify subscription created
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          stripeSubscriptionId: mockPending.stripeSubscriptionId,
          status: "active",
          plan: mockPending.plan,
        }),
      })

      // Verify profile updated with Stripe customer ID
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId },
        data: { stripeCustomerId: mockPending.stripeCustomerId },
      })

      // Verify pending subscription marked as linked
      expect(prisma.pendingSubscription.update).toHaveBeenCalledWith({
        where: { id: mockPending.id },
        data: expect.objectContaining({
          status: "linked",
          linkedUserId: userId,
        }),
      })
    })
  })

  describe("Error Cases", () => {
    it("should return error if user not found", async () => {
      // Arrange
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(null)

      // Act
      const result = await linkPendingSubscription("nonexistent_user")

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe("User not found")
    })

    it("should return success if no pending subscription found", async () => {
      // Arrange
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        profile: {},
      }

      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(null)

      // Act
      const result = await linkPendingSubscription("user_123")

      // Assert
      expect(result.success).toBe(true)
      expect(result.subscriptionId).toBeUndefined()
    })

    it("should reject if email not verified", async () => {
      // Arrange
      const userId = "user_123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        clerkUserId: "clerk_123",
        profile: {},
      }

      const mockPending = {
        id: "pending_123",
        email: mockUser.email,
        status: "payment_complete",
        expiresAt: new Date(Date.now() + 86400000),
      }

      const mockClerkUser = {
        id: "clerk_123",
        primaryEmailAddressId: "email_123",
        emailAddresses: [
          {
            id: "email_123",
            emailAddress: mockUser.email,
            verification: { status: "unverified" }, // Not verified!
          },
        ],
      }

      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(mockPending)

      const mockClerk = {
        users: {
          getUser: vi.fn().mockResolvedValue(mockClerkUser),
        },
      }
      // @ts-ignore
      clerkClient.mockResolvedValue(mockClerk)

      // Act
      const result = await linkPendingSubscription(userId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe("Email not verified")

      // Should NOT create subscription
      expect(prisma.subscription.create).not.toHaveBeenCalled()
    })
  })

  describe("Race Condition Handling", () => {
    it("should handle idempotent linking (already linked)", async () => {
      // Arrange
      const userId = "user_123"
      const mockUser = {
        id: userId,
        email: "test@example.com",
        profile: {},
      }

      const mockPending = {
        id: "pending_123",
        email: mockUser.email,
        status: "linked", // Already linked
        expiresAt: new Date(Date.now() + 86400000),
      }

      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.pendingSubscription.findFirst.mockResolvedValue(mockPending)

      // Act
      const result = await linkPendingSubscription(userId)

      // Assert
      expect(result.success).toBe(true)
      // Should not attempt to link again
      expect(prisma.subscription.create).not.toHaveBeenCalled()
    })
  })
})

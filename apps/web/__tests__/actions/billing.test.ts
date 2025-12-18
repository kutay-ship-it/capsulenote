/**
 * Billing Server Actions Tests
 *
 * Tests for billing.ts server actions covering:
 * - createCheckoutSession
 * - createBillingPortalSession
 * - checkSubscriptionStatus
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  createCheckoutSession,
  createBillingPortalSession,
  checkSubscriptionStatus,
} from "@/server/actions/billing"
import { ErrorCodes } from "@dearme/types"
import { createMockUserWithProfile, createMockSubscription } from "../utils/mock-factories"

// ============================================================================
// Mocks
// ============================================================================

// Mock auth
const mockRequireUser = vi.fn()
vi.mock("@/server/lib/auth", () => ({
  requireUser: () => mockRequireUser(),
}))

// Mock prisma
const mockSubscriptionFindFirst = vi.fn()
const mockProfileUpdate = vi.fn()
vi.mock("@/server/lib/db", () => ({
  prisma: {
    subscription: {
      findFirst: (...args: any[]) => mockSubscriptionFindFirst(...args),
    },
    profile: {
      update: (...args: any[]) => mockProfileUpdate(...args),
    },
  },
}))

// Mock audit
const mockCreateAuditEvent = vi.fn()
vi.mock("@/server/lib/audit", () => ({
  createAuditEvent: (...args: any[]) => mockCreateAuditEvent(...args),
  AuditEventType: {
    CHECKOUT_SESSION_CREATED: "checkout_session.created",
    BILLING_PORTAL_SESSION_CREATED: "billing_portal_session.created",
  },
}))

// Mock Stripe functions
const mockGetOrCreateCustomer = vi.fn()
const mockCreateStripeCheckoutSession = vi.fn()
const mockCreateStripeBillingPortalSession = vi.fn()
vi.mock("@/server/providers/stripe/checkout", () => ({
  getOrCreateCustomer: (...args: any[]) => mockGetOrCreateCustomer(...args),
  createCheckoutSession: (...args: any[]) => mockCreateStripeCheckoutSession(...args),
  createBillingPortalSession: (...args: any[]) => mockCreateStripeBillingPortalSession(...args),
}))

// Mock price validation
const mockIsValidPriceId = vi.fn()
vi.mock("@/server/providers/stripe/client", () => ({
  isValidPriceId: (...args: any[]) => mockIsValidPriceId(...args),
}))

// ============================================================================
// Tests
// ============================================================================

describe("Billing Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateAuditEvent.mockResolvedValue({})
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // --------------------------------------------------------------------------
  // createCheckoutSession Tests
  // --------------------------------------------------------------------------

  describe("createCheckoutSession", () => {
    const validPriceId = "price_valid_123"

    describe("Authentication", () => {
      it("should return UNAUTHORIZED when user is not authenticated", async () => {
        mockRequireUser.mockRejectedValue(new Error("Unauthorized"))

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED)
        }
      })

      it("should proceed when user is authenticated", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(true)
        expect(mockRequireUser).toHaveBeenCalled()
      })
    })

    describe("Price Validation", () => {
      it("should return INVALID_INPUT for invalid price ID", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(false)

        const result = await createCheckoutSession({ priceId: "price_invalid" })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.INVALID_INPUT)
          expect(result.error.message).toContain("Invalid plan")
        }
      })

      it("should proceed with valid price ID", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(true)
        expect(mockIsValidPriceId).toHaveBeenCalledWith(validPriceId)
      })
    })

    describe("Existing Subscription Check", () => {
      it("should return ALREADY_SUBSCRIBED when user has active subscription", async () => {
        const user = createMockUserWithProfile()
        const existingSubscription = createMockSubscription({
          id: "sub_existing",
          status: "active",
        })
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(existingSubscription)

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.ALREADY_SUBSCRIBED)
          expect((result.error.details as any)?.subscriptionId).toBe("sub_existing")
          expect((result.error.details as any)?.manageUrl).toBe("/settings?tab=billing")
        }
      })

      it("should return ALREADY_SUBSCRIBED when user has trialing subscription", async () => {
        const user = createMockUserWithProfile()
        const trialingSubscription = createMockSubscription({
          id: "sub_trial",
          status: "trialing",
        })
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(trialingSubscription)

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.ALREADY_SUBSCRIBED)
        }
      })

      it("should check for active or trialing subscriptions only", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockSubscriptionFindFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              userId: user.id,
              status: { in: ["active", "trialing"] },
            }),
          })
        )
      })
    })

    describe("Stripe Customer Management", () => {
      it("should call getOrCreateCustomer with correct params", async () => {
        const user = createMockUserWithProfile({
          user: { email: "test@example.com", clerkUserId: "clerk_123" },
          profile: { stripeCustomerId: "cus_existing" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_existing")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockGetOrCreateCustomer).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "test@example.com",
            userId: user.id,
            clerkUserId: "clerk_123",
            existingCustomerId: "cus_existing",
          })
        )
      })

      it("should update profile when customer ID is newly created", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: null },
        })
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_new_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockProfileUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: user.id },
            data: { stripeCustomerId: "cus_new_123" },
          })
        )
      })

      it("should not update profile when customer ID already exists", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_existing_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_existing_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockProfileUpdate).not.toHaveBeenCalled()
      })

      it("should return PAYMENT_PROVIDER_ERROR when customer creation fails", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockRejectedValue(new Error("Stripe API error"))

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.PAYMENT_PROVIDER_ERROR)
          expect(result.error.message).toContain("Failed to initialize payment")
        }
      })
    })

    describe("Checkout Session Creation", () => {
      it("should create checkout session with correct params", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockCreateStripeCheckoutSession).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: "cus_test_123",
            priceId: validPriceId,
            userId: user.id,
          })
        )
      })

      it("should return PAYMENT_PROVIDER_ERROR when session creation fails", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockRejectedValue(new Error("Stripe error"))

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.PAYMENT_PROVIDER_ERROR)
          expect(result.error.message).toContain("Failed to create checkout session")
        }
      })

      it("should return PAYMENT_PROVIDER_ERROR when session has no URL", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: null, // Missing URL
        })

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.PAYMENT_PROVIDER_ERROR)
          expect(result.error.message).toContain("Failed to generate checkout URL")
        }
      })

      it("should return session URL on success", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_session",
          url: "https://checkout.stripe.com/c/pay/test_session",
        })

        const result = await createCheckoutSession({ priceId: validPriceId })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.url).toBe("https://checkout.stripe.com/c/pay/test_session")
        }
      })
    })

    describe("Audit Logging", () => {
      it("should create audit event on successful checkout session", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_audit_test",
          url: "https://checkout.stripe.com/test",
        })

        await createCheckoutSession({ priceId: validPriceId })

        expect(mockCreateAuditEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: user.id,
            type: "checkout_session.created",
            data: expect.objectContaining({
              sessionId: "cs_audit_test",
              priceId: validPriceId,
              customerId: "cus_test_123",
            }),
          })
        )
      })

      it("should succeed even if audit logging fails", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockIsValidPriceId.mockReturnValue(true)
        mockSubscriptionFindFirst.mockResolvedValue(null)
        mockGetOrCreateCustomer.mockResolvedValue("cus_test_123")
        mockCreateStripeCheckoutSession.mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        })
        mockCreateAuditEvent.mockRejectedValue(new Error("Audit failed"))

        const result = await createCheckoutSession({ priceId: validPriceId })

        // Should still succeed
        expect(result.success).toBe(true)
      })
    })
  })

  // --------------------------------------------------------------------------
  // createBillingPortalSession Tests
  // --------------------------------------------------------------------------

  describe("createBillingPortalSession", () => {
    describe("Authentication", () => {
      it("should return UNAUTHORIZED when user is not authenticated", async () => {
        mockRequireUser.mockRejectedValue(new Error("Unauthorized"))

        const result = await createBillingPortalSession()

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED)
        }
      })
    })

    describe("Customer Requirement", () => {
      it("should return NO_CUSTOMER when user has no Stripe customer ID", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: null },
        })
        mockRequireUser.mockResolvedValue(user)

        const result = await createBillingPortalSession()

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.NO_CUSTOMER)
          expect(result.error.message).toContain("No billing account found")
          expect((result.error.details as any)?.action).toBe("subscribe")
          expect((result.error.details as any)?.url).toBe("/pricing")
        }
      })

      it("should proceed when user has Stripe customer ID", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_existing_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockResolvedValue({
          id: "bps_test_123",
          url: "https://billing.stripe.com/test",
        })

        const result = await createBillingPortalSession()

        expect(result.success).toBe(true)
      })
    })

    describe("Portal Session Creation", () => {
      it("should call createBillingPortalSession with customer ID", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_portal_test" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockResolvedValue({
          id: "bps_test_123",
          url: "https://billing.stripe.com/test",
        })

        await createBillingPortalSession()

        expect(mockCreateStripeBillingPortalSession).toHaveBeenCalledWith("cus_portal_test")
      })

      it("should return PAYMENT_PROVIDER_ERROR when portal creation fails", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_test_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockRejectedValue(new Error("Stripe error"))

        const result = await createBillingPortalSession()

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.PAYMENT_PROVIDER_ERROR)
          expect(result.error.message).toContain("Failed to access billing portal")
        }
      })

      it("should return portal URL on success", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_test_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockResolvedValue({
          id: "bps_success_test",
          url: "https://billing.stripe.com/session/test_portal",
        })

        const result = await createBillingPortalSession()

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.url).toBe("https://billing.stripe.com/session/test_portal")
        }
      })
    })

    describe("Audit Logging", () => {
      it("should create audit event on successful portal session", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_test_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockResolvedValue({
          id: "bps_audit_test",
          url: "https://billing.stripe.com/test",
        })

        await createBillingPortalSession()

        expect(mockCreateAuditEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: user.id,
            type: "billing_portal_session.created",
            data: { sessionId: "bps_audit_test" },
          })
        )
      })

      it("should succeed even if audit logging fails", async () => {
        const user = createMockUserWithProfile({
          profile: { stripeCustomerId: "cus_test_123" },
        })
        mockRequireUser.mockResolvedValue(user)
        mockCreateStripeBillingPortalSession.mockResolvedValue({
          id: "bps_test_123",
          url: "https://billing.stripe.com/test",
        })
        mockCreateAuditEvent.mockRejectedValue(new Error("Audit failed"))

        const result = await createBillingPortalSession()

        expect(result.success).toBe(true)
      })
    })
  })

  // --------------------------------------------------------------------------
  // checkSubscriptionStatus Tests
  // --------------------------------------------------------------------------

  describe("checkSubscriptionStatus", () => {
    describe("Authentication", () => {
      it("should return INTERNAL_ERROR when authentication fails", async () => {
        mockRequireUser.mockRejectedValue(new Error("Auth error"))

        const result = await checkSubscriptionStatus()

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR)
        }
      })
    })

    describe("Subscription Check", () => {
      it("should return hasSubscription true when user has active subscription", async () => {
        const user = createMockUserWithProfile()
        const subscription = createMockSubscription({ status: "active" })
        mockRequireUser.mockResolvedValue(user)
        mockSubscriptionFindFirst.mockResolvedValue(subscription)

        const result = await checkSubscriptionStatus()

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.hasSubscription).toBe(true)
        }
      })

      it("should return hasSubscription true when user has trialing subscription", async () => {
        const user = createMockUserWithProfile()
        const subscription = createMockSubscription({ status: "trialing" })
        mockRequireUser.mockResolvedValue(user)
        mockSubscriptionFindFirst.mockResolvedValue(subscription)

        const result = await checkSubscriptionStatus()

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.hasSubscription).toBe(true)
        }
      })

      it("should return hasSubscription false when user has no subscription", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockSubscriptionFindFirst.mockResolvedValue(null)

        const result = await checkSubscriptionStatus()

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.hasSubscription).toBe(false)
        }
      })

      it("should query for active or trialing subscriptions only", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockSubscriptionFindFirst.mockResolvedValue(null)

        await checkSubscriptionStatus()

        expect(mockSubscriptionFindFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              userId: user.id,
              status: { in: ["active", "trialing"] },
            }),
          })
        )
      })
    })

    describe("Error Handling", () => {
      it("should return INTERNAL_ERROR when database query fails", async () => {
        const user = createMockUserWithProfile()
        mockRequireUser.mockResolvedValue(user)
        mockSubscriptionFindFirst.mockRejectedValue(new Error("Database error"))

        const result = await checkSubscriptionStatus()

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR)
          expect(result.error.message).toContain("Failed to check subscription status")
        }
      })
    })
  })
})

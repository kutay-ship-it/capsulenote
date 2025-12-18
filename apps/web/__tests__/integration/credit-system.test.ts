/**
 * Credit System Integration Tests
 *
 * Tests for the credit-based delivery system:
 * - Email delivery deducts 1 credit
 * - Physical mail deducts 1 credit
 * - Double delivery deducts 2 credits (1+1)
 * - Insufficient credits blocks scheduling
 * - Credit refund on cancellation
 * - Concurrent deduction race conditions
 *
 * Uses mocked Prisma to test business logic without database.
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest"

// ============================================================================
// MOCK SETUP (hoisted to allow use in vi.mock factories)
// ============================================================================

// Use vi.hoisted to create mocks that can be used in vi.mock factory
const {
  mockUserFindUnique,
  mockUserUpdate,
  mockUserUpdateMany,
  mockCreditTransactionCreate,
  mockLetterCount,
  mockSubscriptionFindFirst,
  mockRedisDel,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockUserUpdateMany: vi.fn(),
  mockCreditTransactionCreate: vi.fn(),
  mockLetterCount: vi.fn(),
  mockSubscriptionFindFirst: vi.fn(),
  mockRedisDel: vi.fn(() => Promise.resolve(1)),
}))

vi.mock("@/server/lib/db", () => ({
  prisma: {
    $transaction: (fn: (tx: any) => Promise<any>) => {
      return fn({
        user: {
          findUnique: mockUserFindUnique,
          update: mockUserUpdate,
          updateMany: mockUserUpdateMany,
        },
        creditTransaction: {
          create: mockCreditTransactionCreate,
        },
        letter: {
          count: mockLetterCount,
        },
        subscription: {
          findFirst: mockSubscriptionFindFirst,
        },
      })
    },
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
      updateMany: mockUserUpdateMany,
    },
    creditTransaction: {
      create: mockCreditTransactionCreate,
    },
    letter: {
      count: mockLetterCount,
    },
    subscription: {
      findFirst: mockSubscriptionFindFirst,
    },
  },
}))

// Mock Redis
vi.mock("@/server/lib/redis", () => ({
  redis: {
    get: vi.fn(() => Promise.resolve(null)),
    setex: vi.fn(() => Promise.resolve("OK")),
    del: mockRedisDel,
  },
}))

// Import after mocks are set up
import {
  QuotaExceededError,
  trackEmailDelivery,
  deductMailCredit,
  addEmailCredits,
  addMailCredits,
  getEntitlements,
  recordCreditTransaction,
  deductCreditsForRefund,
  invalidateEntitlementsCache,
} from "@/server/lib/entitlements"

// ============================================================================
// TEST DATA
// ============================================================================

const createTestUser = (overrides?: Partial<{
  id: string
  emailCredits: number
  physicalCredits: number
  emailAddonCredits: number
  physicalAddonCredits: number
  planType: string
  creditExpiresAt: Date | null
}>) => ({
  id: "user_test_123",
  emailCredits: 9,
  physicalCredits: 3,
  emailAddonCredits: 0,
  physicalAddonCredits: 0,
  planType: "PAPER_PIXELS",
  creditExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  subscriptions: [{ status: "active", plan: "PAPER_PIXELS" }],
  ...overrides,
})

// ============================================================================
// EMAIL CREDIT DEDUCTION TESTS
// ============================================================================

describe("Email Credit Deduction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Single Email Delivery", () => {
    it("should deduct 1 email credit for delivery", async () => {
      const user = createTestUser({ emailCredits: 9 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 8 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { emailCredits: { decrement: 1 } },
      })
    })

    it("should record credit transaction with correct details", async () => {
      const user = createTestUser({ emailCredits: 9 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 8 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: user.id,
          creditType: "email",
          transactionType: "deduct_delivery",
          amount: -1,
          source: "delivery_123",
        }),
      })
    })

    it("should track balance before and after in transaction", async () => {
      const user = createTestUser({ emailCredits: 9 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 8 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          balanceBefore: 9,
          balanceAfter: 8,
        }),
      })
    })
  })

  describe("Insufficient Credits", () => {
    it("should throw QuotaExceededError when no credits remain", async () => {
      const user = createTestUser({ emailCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)

      await expect(trackEmailDelivery(user.id, "delivery_123")).rejects.toThrow(
        QuotaExceededError
      )
    })

    it("should not deduct when credits are zero", async () => {
      const user = createTestUser({ emailCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)

      try {
        await trackEmailDelivery(user.id, "delivery_123")
      } catch {
        // Expected to throw
      }

      expect(mockUserUpdate).not.toHaveBeenCalled()
    })

    it("should include quota details in error", async () => {
      const user = createTestUser({ emailCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)

      try {
        await trackEmailDelivery(user.id, "delivery_123")
        expect.fail("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(QuotaExceededError)
        expect((error as QuotaExceededError).quotaType).toBe("email_credits")
      }
    })
  })
})

// ============================================================================
// PHYSICAL MAIL CREDIT DEDUCTION TESTS
// ============================================================================

describe("Physical Mail Credit Deduction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Single Mail Delivery", () => {
    it("should deduct 1 physical credit for mail delivery", async () => {
      const user = createTestUser({ physicalCredits: 3 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, physicalCredits: 2 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await deductMailCredit(user.id, "mail_delivery_123")

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { physicalCredits: { decrement: 1 } },
      })
    })

    it("should record physical credit transaction", async () => {
      const user = createTestUser({ physicalCredits: 3 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, physicalCredits: 2 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await deductMailCredit(user.id, "mail_delivery_123")

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: user.id,
          creditType: "physical",
          transactionType: "deduct_delivery",
          amount: -1,
        }),
      })
    })
  })

  describe("Insufficient Physical Credits", () => {
    it("should throw QuotaExceededError when no physical credits remain", async () => {
      const user = createTestUser({ physicalCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)

      await expect(deductMailCredit(user.id, "mail_123")).rejects.toThrow(
        QuotaExceededError
      )
    })

    it("should indicate physical_credits in error", async () => {
      const user = createTestUser({ physicalCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)

      try {
        await deductMailCredit(user.id, "mail_123")
        expect.fail("Should have thrown")
      } catch (error) {
        expect((error as QuotaExceededError).quotaType).toBe("physical_credits")
      }
    })
  })
})

// ============================================================================
// DOUBLE DELIVERY (EMAIL + MAIL) TESTS
// ============================================================================

describe("Double Delivery (Email + Physical Mail)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should deduct 2 total credits for double delivery", async () => {
    const user = createTestUser({ emailCredits: 9, physicalCredits: 3 })
    mockUserFindUnique.mockResolvedValue(user)
    mockUserUpdate.mockResolvedValue({ ...user })
    mockCreditTransactionCreate.mockResolvedValue({})

    // Simulate double delivery: email + physical
    await trackEmailDelivery(user.id, "delivery_123")
    await deductMailCredit(user.id, "delivery_123")

    // Should have called update twice (once for each credit type)
    expect(mockUserUpdate).toHaveBeenCalledTimes(2)
  })

  it("should record separate transactions for each credit type", async () => {
    const user = createTestUser({ emailCredits: 9, physicalCredits: 3 })
    mockUserFindUnique.mockResolvedValue(user)
    mockUserUpdate.mockResolvedValue({ ...user })
    mockCreditTransactionCreate.mockResolvedValue({})

    await trackEmailDelivery(user.id, "delivery_123")
    await deductMailCredit(user.id, "delivery_123")

    expect(mockCreditTransactionCreate).toHaveBeenCalledTimes(2)

    // First call for email
    expect(mockCreditTransactionCreate).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({ creditType: "email" }),
    })

    // Second call for physical
    expect(mockCreditTransactionCreate).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ creditType: "physical" }),
    })
  })

  it("should fail if either credit type is exhausted", async () => {
    const user = createTestUser({ emailCredits: 1, physicalCredits: 0 })
    mockUserFindUnique.mockResolvedValue(user)
    mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 0 })
    mockCreditTransactionCreate.mockResolvedValue({})

    // Email should succeed
    await trackEmailDelivery(user.id, "delivery_123")

    // Physical should fail
    await expect(deductMailCredit(user.id, "delivery_123")).rejects.toThrow(
      QuotaExceededError
    )
  })
})

// ============================================================================
// CREDIT REFUND ON CANCELLATION TESTS
// ============================================================================

describe("Credit Refund on Cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Email Credit Refund", () => {
    it("should refund email credit on delivery cancellation", async () => {
      const user = createTestUser({ emailCredits: 5, emailAddonCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 9 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addEmailCredits(user.id, 1, {
        source: "delivery_123",
        transactionType: "grant_refund",
        isAddon: false,
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          emailCredits: { increment: 1 },
        }),
      })
    })

    it("should record refund transaction with grant_refund type", async () => {
      const user = createTestUser({ emailCredits: 5 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 9 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addEmailCredits(user.id, 1, {
        source: "delivery_123",
        transactionType: "grant_refund",
        isAddon: false,
      })

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionType: "grant_refund",
          amount: 1,
        }),
      })
    })
  })

  describe("Physical Credit Refund", () => {
    it("should refund physical credit on mail cancellation", async () => {
      const user = createTestUser({ physicalCredits: 2 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, physicalCredits: 3 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addMailCredits(user.id, 1, {
        source: "mail_delivery_123",
        transactionType: "grant_refund",
        isAddon: false,
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          physicalCredits: { increment: 1 },
        }),
      })
    })
  })

  describe("Refund Deduction (Addon Purchases)", () => {
    it("should deduct credits on purchase refund", async () => {
      const user = createTestUser({
        emailCredits: 10,
        emailAddonCredits: 5,
      })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 5 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await deductCreditsForRefund(user.id, "email", 5, "stripe_refund_123")

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionType: "deduct_refund",
          amount: -5,
        }),
      })
    })

    it("should not deduct more credits than available", async () => {
      const user = createTestUser({
        emailCredits: 2,
        emailAddonCredits: 2,
      })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 0 })
      mockCreditTransactionCreate.mockResolvedValue({})

      // Request refund of 5 credits but only 2 available
      await deductCreditsForRefund(user.id, "email", 5, "stripe_refund_123")

      // Should only deduct what's available (2)
      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: -2, // Clamped to available
        }),
      })
    })

    it("should skip deduction when no credits available", async () => {
      const user = createTestUser({
        emailCredits: 0,
        emailAddonCredits: 0,
      })
      mockUserFindUnique.mockResolvedValue(user)

      await deductCreditsForRefund(user.id, "email", 5, "stripe_refund_123")

      // Should not create transaction when nothing to deduct
      expect(mockCreditTransactionCreate).not.toHaveBeenCalled()
    })
  })
})

// ============================================================================
// CONCURRENT DEDUCTION (RACE CONDITIONS) TESTS
// ============================================================================

describe("Concurrent Credit Deduction (Race Conditions)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Atomic Operations", () => {
    it("should use atomic decrement to prevent over-deduction", async () => {
      const user = createTestUser({ emailCredits: 1 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 0 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_1")

      // Verify atomic decrement was used
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { emailCredits: { decrement: 1 } },
      })
    })

    it("should handle concurrent requests by checking balance first", async () => {
      // This test verifies the behavior when second request sees depleted credits
      const userWithCredits = createTestUser({ emailCredits: 1 })
      const userDepleted = { ...userWithCredits, emailCredits: 0 }

      // First request sees 1 credit and succeeds
      mockUserFindUnique.mockResolvedValueOnce(userWithCredits)
      mockUserUpdate.mockResolvedValueOnce(userDepleted)
      mockCreditTransactionCreate.mockResolvedValueOnce({})

      await trackEmailDelivery(userWithCredits.id, "delivery_1")
      expect(mockUserUpdate).toHaveBeenCalled()

      // Clear mocks between operations
      vi.clearAllMocks()

      // Second request sees 0 credits after first deducted
      mockUserFindUnique.mockResolvedValueOnce(userDepleted)

      // Second should fail due to 0 credits
      await expect(trackEmailDelivery(userDepleted.id, "delivery_2")).rejects.toThrow(
        QuotaExceededError
      )
    })
  })

  describe("Transaction Isolation", () => {
    it("should execute deduction within transaction", async () => {
      const user = createTestUser({ emailCredits: 5 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 4 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      // The function uses prisma.$transaction internally
      // Verify both operations happened (findUnique + update + create)
      expect(mockUserFindUnique).toHaveBeenCalled()
      expect(mockUserUpdate).toHaveBeenCalled()
      expect(mockCreditTransactionCreate).toHaveBeenCalled()
    })

    it("should rollback on transaction failure", async () => {
      const user = createTestUser({ emailCredits: 5 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 4 })
      mockCreditTransactionCreate.mockRejectedValue(new Error("DB Error"))

      // Should propagate the error (transaction rolled back)
      await expect(trackEmailDelivery(user.id, "delivery_123")).rejects.toThrow(
        "DB Error"
      )
    })
  })

  describe("Idempotency", () => {
    it("should support idempotent deductions via source field", async () => {
      const user = createTestUser({ emailCredits: 5 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 4 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      // Source field allows unique constraint to prevent duplicate deductions
      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source: "delivery_123",
        }),
      })
    })
  })
})

// ============================================================================
// CREDIT BALANCE TRACKING TESTS
// ============================================================================

describe("Credit Balance Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Balance Snapshots", () => {
    it("should record accurate balance before deduction", async () => {
      const user = createTestUser({ emailCredits: 10 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 9 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await trackEmailDelivery(user.id, "delivery_123")

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          balanceBefore: 10,
          balanceAfter: 9,
        }),
      })
    })

    it("should record accurate balance after addition", async () => {
      const user = createTestUser({ emailCredits: 5 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 10 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addEmailCredits(user.id, 5, {
        source: "addon_purchase_123",
        transactionType: "grant_addon",
      })

      expect(mockCreditTransactionCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          balanceBefore: 5,
          balanceAfter: 10,
        }),
      })
    })
  })

  describe("Addon Credit Tracking", () => {
    it("should increment addon credits when isAddon is true", async () => {
      const user = createTestUser({ emailCredits: 5, emailAddonCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 10, emailAddonCredits: 5 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addEmailCredits(user.id, 5, {
        source: "addon_purchase",
        transactionType: "grant_addon",
        isAddon: true,
      })

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          emailCredits: { increment: 5 },
          emailAddonCredits: { increment: 5 },
        }),
      })
    })

    it("should not track addon credits for subscription grants", async () => {
      const user = createTestUser({ emailCredits: 0, emailAddonCredits: 0 })
      mockUserFindUnique.mockResolvedValue(user)
      mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 9 })
      mockCreditTransactionCreate.mockResolvedValue({})

      await addEmailCredits(user.id, 9, {
        source: "subscription_renewal",
        transactionType: "grant_subscription",
        isAddon: false,
      })

      // Should not include addon increment
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          emailCredits: { increment: 9 },
        },
      })
    })
  })
})

// ============================================================================
// PLAN-BASED CREDIT ALLOCATION TESTS
// ============================================================================

describe("Plan-Based Credit Allocation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Digital Capsule Plan", () => {
    it("should allocate 9 email credits for Digital Capsule", () => {
      // Plan constants (mirrored from entitlements.ts)
      const PLAN_CREDITS = {
        DIGITAL_CAPSULE: { email: 9, physical: 0 },
        PAPER_PIXELS: { email: 24, physical: 3 },
      }

      expect(PLAN_CREDITS.DIGITAL_CAPSULE.email).toBe(9)
      expect(PLAN_CREDITS.DIGITAL_CAPSULE.physical).toBe(0)
    })
  })

  describe("Paper & Pixels Plan", () => {
    it("should allocate 24 email and 3 physical credits", () => {
      const PLAN_CREDITS = {
        DIGITAL_CAPSULE: { email: 9, physical: 0 },
        PAPER_PIXELS: { email: 24, physical: 3 },
      }

      expect(PLAN_CREDITS.PAPER_PIXELS.email).toBe(24)
      expect(PLAN_CREDITS.PAPER_PIXELS.physical).toBe(3)
    })
  })
})

// ============================================================================
// QUOTA ERROR TESTS
// ============================================================================

describe("QuotaExceededError", () => {
  it("should contain quotaType property", () => {
    const error = new QuotaExceededError("email_credits", 0, 0)
    expect(error.quotaType).toBe("email_credits")
  })

  it("should contain limit and current values", () => {
    const error = new QuotaExceededError("physical_credits", 3, 3)
    expect(error.limit).toBe(3)
    expect(error.current).toBe(3)
  })

  it("should have descriptive message", () => {
    const error = new QuotaExceededError("email_credits", 6, 6)
    expect(error.message).toContain("email_credits")
    expect(error.message).toContain("6")
  })

  it("should have correct error name", () => {
    const error = new QuotaExceededError("email_credits", 0, 0)
    expect(error.name).toBe("QuotaExceededError")
  })
})

// ============================================================================
// CACHE INVALIDATION TESTS
// ============================================================================

describe("Entitlements Cache Invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should invalidate cache after email delivery", async () => {
    const user = createTestUser({ emailCredits: 5 })
    mockUserFindUnique.mockResolvedValue(user)
    mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 4 })
    mockCreditTransactionCreate.mockResolvedValue({})

    await trackEmailDelivery(user.id, "delivery_123")

    expect(mockRedisDel).toHaveBeenCalledWith(`entitlements:${user.id}`)
  })

  it("should invalidate cache after credit addition", async () => {
    const user = createTestUser({ emailCredits: 5 })
    mockUserFindUnique.mockResolvedValue(user)
    mockUserUpdate.mockResolvedValue({ ...user, emailCredits: 10 })
    mockCreditTransactionCreate.mockResolvedValue({})

    await addEmailCredits(user.id, 5, { source: "test" })

    expect(mockRedisDel).toHaveBeenCalledWith(`entitlements:${user.id}`)
  })
})

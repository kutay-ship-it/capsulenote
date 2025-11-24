/**
 * Entitlements & Credit Tracking Tests
 *
 * Aligns with paid-only model:
 * - No free tier; users without active subscription cannot schedule.
 * - Credits stored on User (emailCredits, physicalCredits).
 * - Redis cache used for entitlements; tests mock to isolate Prisma logic.
 *
 * Note: Keep this suite active; adjust fixtures if entitlements rules change instead of skipping.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  getEntitlements,
  trackEmailDelivery,
  deductMailCredit,
  QuotaExceededError,
  invalidateEntitlementsCache,
} from "../../server/lib/entitlements"

const { mockPrisma, mockRedis } = vi.hoisted(() => {
  const prismaMock = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    letter: {
      count: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
  }

  const redisMock = {
    get: vi.fn(() => Promise.resolve(null)),
    setex: vi.fn(() => Promise.resolve("OK")),
    del: vi.fn(() => Promise.resolve(1)),
  }
  return { mockPrisma: prismaMock, mockRedis: redisMock }
})

vi.mock("../../server/lib/db", () => ({
  prisma: mockPrisma,
}))

vi.mock("../../server/lib/redis", () => ({
  redis: mockRedis,
}))

const baseUser = {
  id: "user_123",
  planType: null,
  emailCredits: 0,
  physicalCredits: 0,
  subscriptions: [],
}

describe("Entitlements (paid-only)", () => {
  it("smoke: entitlements functions available", () => {
    expect(getEntitlements).toBeDefined()
    expect(trackEmailDelivery).toBeDefined()
    expect(deductMailCredit).toBeDefined()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockRedis.get.mockResolvedValue(null)
    mockPrisma.subscription.findFirst.mockResolvedValue(null)
  })

  it("returns plan none when user has no active subscription", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      subscriptions: [],
      emailCredits: 0,
      physicalCredits: 0,
    })
    mockPrisma.letter.count.mockResolvedValue(0)

    const entitlements = await getEntitlements(baseUser.id)

    expect(entitlements.plan).toBe("none")
    expect(entitlements.features.canScheduleDeliveries).toBe(false)
    expect(entitlements.limits.emailsReached).toBe(true)
    expect(entitlements.limits.mailCreditsExhausted).toBe(true)
  })

  it("returns DIGITAL_CAPSULE entitlements when subscription active", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      emailCredits: 6,
      physicalCredits: 0,
      subscriptions: [
        {
          plan: "DIGITAL_CAPSULE",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 86400000),
        },
      ],
    })
    mockPrisma.letter.count.mockResolvedValue(2)

    const entitlements = await getEntitlements(baseUser.id)

    expect(entitlements.plan).toBe("DIGITAL_CAPSULE")
    expect(entitlements.features.canScheduleDeliveries).toBe(true)
    expect(entitlements.features.canSchedulePhysicalMail).toBe(false)
    expect(entitlements.usage.lettersThisMonth).toBe(2)
    expect(entitlements.limits.emailsReached).toBe(false)
  })

  it("allows physical mail only for PAPER_PIXELS", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      emailCredits: 24,
      physicalCredits: 3,
      subscriptions: [
        {
          plan: "PAPER_PIXELS",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 86400000),
        },
      ],
    })
    mockPrisma.letter.count.mockResolvedValue(0)

    const entitlements = await getEntitlements(baseUser.id)
    expect(entitlements.features.canSchedulePhysicalMail).toBe(true)
    expect(entitlements.usage.mailCreditsRemaining).toBe(3)
  })

  it("throws QuotaExceededError when email credits are depleted", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      emailCredits: 0,
    })

    await expect(trackEmailDelivery(baseUser.id)).rejects.toBeInstanceOf(QuotaExceededError)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it("deducts email credit and invalidates cache", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      emailCredits: 2,
    })
    mockPrisma.user.update.mockResolvedValue({})

    await trackEmailDelivery(baseUser.id)

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { emailCredits: { decrement: 1 } },
    })
    expect(mockRedis.del).toHaveBeenCalledWith(`entitlements:${baseUser.id}`)
  })

  it("throws QuotaExceededError when physical credits are depleted", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      physicalCredits: 0,
    })

    await expect(deductMailCredit(baseUser.id)).rejects.toBeInstanceOf(QuotaExceededError)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it("deducts physical credit and invalidates cache", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      physicalCredits: 1,
    })
    mockPrisma.user.update.mockResolvedValue({})

    await deductMailCredit(baseUser.id)

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { physicalCredits: { decrement: 1 } },
    })
    expect(mockRedis.del).toHaveBeenCalledWith(`entitlements:${baseUser.id}`)
  })

  it("reads from cache when present", async () => {
    // Mock subscription.findFirst to return matching subscription
    mockPrisma.subscription.findFirst.mockResolvedValue({
      status: "active",
      plan: "DIGITAL_CAPSULE",
      updatedAt: new Date(),
    })

    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        ...baseUser,
        plan: "DIGITAL_CAPSULE",
        status: "active",
        features: { canCreateLetters: true, canScheduleDeliveries: true, canSchedulePhysicalMail: false, maxLettersPerMonth: "unlimited", emailDeliveriesIncluded: 3, mailCreditsPerMonth: 0 },
        usage: { lettersThisMonth: 1, emailsThisMonth: 0, mailCreditsRemaining: 0 },
        limits: { lettersReached: false, emailsReached: false, mailCreditsExhausted: true },
      })
    )

    const entitlements = await getEntitlements(baseUser.id)
    expect(entitlements.plan).toBe("DIGITAL_CAPSULE")
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it("refreshes cache when subscription state changes", async () => {
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        ...baseUser,
        plan: "none",
        status: "none",
        features: { canCreateLetters: true, canScheduleDeliveries: false, canSchedulePhysicalMail: false, maxLettersPerMonth: "unlimited", emailDeliveriesIncluded: 0, mailCreditsPerMonth: 0 },
        usage: { lettersThisMonth: 0, emailsThisMonth: 0, mailCreditsRemaining: 0 },
        limits: { lettersReached: false, emailsReached: true, mailCreditsExhausted: true },
      })
    )
    mockPrisma.subscription.findFirst.mockResolvedValue({
      status: "active",
      plan: "DIGITAL_CAPSULE",
      updatedAt: new Date(),
    })
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      emailCredits: 6,
      physicalCredits: 0,
      subscriptions: [
        {
          plan: "DIGITAL_CAPSULE",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 86400000),
        },
      ],
    })
    mockPrisma.letter.count.mockResolvedValue(0)

    const entitlements = await getEntitlements(baseUser.id)
    expect(entitlements.plan).toBe("DIGITAL_CAPSULE")
    expect(mockPrisma.user.findUnique).toHaveBeenCalled()
  })
})

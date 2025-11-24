/**
 * Delivery Actions Integration Tests (with mocks)
 *
 * Validates scheduling, update, and cancel behaviors against current
 * entitlements and credit model.
 *
 * Note: Retained post paid-only migration; update expectations to match current delivery rules
 * rather than skipping/removing.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { scheduleDelivery, updateDelivery, cancelDelivery } from "../../server/actions/deliveries"
import { ErrorCodes } from "@dearme/types"

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    id: "user_test_123",
    email: "test@example.com",
    clerkUserId: "clerk_test_123",
  }
}))

vi.mock("../../server/lib/auth", () => ({
  requireUser: vi.fn(() => Promise.resolve(mockUser)),
}))

const { mockEntitlements, mockEntitlementsModule, mockPrisma } = vi.hoisted(() => {
  const baseEntitlements = {
    userId: mockUser.id,
    plan: "DIGITAL_CAPSULE",
    status: "active",
    features: {
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: false,
      emailDeliveriesIncluded: 6,
      mailCreditsPerMonth: 0,
    },
    usage: {
      emailsThisMonth: 0,
      mailCreditsRemaining: 0,
    },
    limits: {
      emailsReached: false,
      mailCreditsExhausted: true,
    },
  }

  const entitlementsModule = {
    getEntitlements: vi.fn(() => Promise.resolve(baseEntitlements)),
    trackEmailDelivery: vi.fn(() => Promise.resolve()),
    deductMailCredit: vi.fn(() => Promise.resolve()),
  }

  const prismaMock: any = {
    letter: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    delivery: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    emailDelivery: {
      create: vi.fn(),
    },
    mailDelivery: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    pendingSubscription: {
      findFirst: vi.fn(),
    },
  }
  prismaMock.$transaction = vi.fn(async (cb: any) =>
    cb({
      delivery: prismaMock.delivery,
      emailDelivery: prismaMock.emailDelivery,
      mailDelivery: prismaMock.mailDelivery,
      letter: prismaMock.letter,
    })
  )

  return { mockEntitlements: baseEntitlements, mockEntitlementsModule: entitlementsModule, mockPrisma: prismaMock }
})

vi.mock("../../server/lib/entitlements", () => mockEntitlementsModule)

vi.mock("../../server/lib/db", () => ({ prisma: mockPrisma }))

vi.mock("../../server/lib/audit", () => ({
  createAuditEvent: vi.fn(() => Promise.resolve({ id: "audit_123" })),
}))

vi.mock("../../server/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("../../server/lib/trigger-inngest", () => ({
  triggerInngestEvent: vi.fn(() => Promise.resolve({ ids: ["event_123"] })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Deliveries", () => {
  it("smoke: delivery actions available", () => {
    expect(scheduleDelivery).toBeDefined()
    expect(updateDelivery).toBeDefined()
    expect(cancelDelivery).toBeDefined()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.pendingSubscription.findFirst.mockResolvedValue(null)
  })

  it("schedules email delivery successfully", async () => {
    mockPrisma.letter.findFirst.mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      userId: mockUser.id,
      title: "Test",
      deletedAt: null,
    })

    mockPrisma.delivery.create.mockResolvedValueOnce({
      id: "delivery_123",
      channel: "email",
    })
    mockPrisma.emailDelivery.create.mockResolvedValueOnce({})

    const result = await scheduleDelivery({
      letterId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      timezone: "UTC",
      toEmail: mockUser.email,
    })

    expect(result.success).toBe(true)
    expect(mockEntitlementsModule.trackEmailDelivery).toHaveBeenCalled()
  })

  it("blocks scheduling when subscription missing", async () => {
    mockEntitlementsModule.getEntitlements.mockResolvedValueOnce({
      ...mockEntitlements,
      features: { ...mockEntitlements.features, canScheduleDeliveries: false },
      plan: "none",
      status: "none",
    })

    const result = await scheduleDelivery({
      letterId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      timezone: "UTC",
      toEmail: mockUser.email,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.SUBSCRIPTION_REQUIRED)
    }
  })

  it("surfaces pending subscription reason when payment exists but not linked", async () => {
    mockEntitlementsModule.getEntitlements.mockResolvedValueOnce({
      ...mockEntitlements,
      features: { ...mockEntitlements.features, canScheduleDeliveries: false },
      plan: "none",
      status: "none",
    })
    const expiresAt = new Date(Date.now() + 86400000)
    mockPrisma.pendingSubscription.findFirst.mockResolvedValueOnce({
      id: "pending_test",
      expiresAt,
    })

    const result = await scheduleDelivery({
      letterId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      timezone: "UTC",
      toEmail: mockUser.email,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.SUBSCRIPTION_REQUIRED)
      expect((result.error as any).details?.reason).toBe("pending_subscription")
      expect((result.error as any).details?.pendingSubscriptionId).toBe("pending_test")
      expect((result.error as any).details?.pendingExpiresAt).toBe(expiresAt.toISOString())
    }
  })

  it("returns insufficient credits when mail credits exhausted", async () => {
    mockEntitlementsModule.getEntitlements.mockResolvedValueOnce({
      ...mockEntitlements,
      plan: "PAPER_PIXELS",
      features: {
        ...mockEntitlements.features,
        canScheduleDeliveries: true,
        canSchedulePhysicalMail: true,
      },
      limits: { ...mockEntitlements.limits, mailCreditsExhausted: true },
      usage: { ...mockEntitlements.usage, mailCreditsRemaining: 0 },
    })

    const result = await scheduleDelivery({
      letterId: "11111111-1111-4111-8111-111111111111",
      channel: "mail",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      timezone: "UTC",
      shippingAddressId: "22222222-2222-4222-8222-222222222222",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.INSUFFICIENT_CREDITS)
    }
  })

  it("updates delivery status", async () => {
    const deliveryId = "33333333-3333-4333-8333-333333333333"
    mockPrisma.delivery.findFirst.mockResolvedValueOnce({
      id: deliveryId,
      userId: mockUser.id,
      status: "scheduled",
      channel: "email",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      letter: {
        id: "11111111-1111-4111-8111-111111111111",
      },
    })
    mockPrisma.delivery.update.mockResolvedValueOnce({ id: deliveryId, status: "sent" })

    const result = await updateDelivery({
      deliveryId,
      status: "sent",
    })

    if (!result.success) {
      console.error("updateDelivery still failing:", JSON.stringify(result.error, null, 2))
    }
    expect(result.success).toBe(true)
  })

  it("cancels delivery", async () => {
    const deliveryId = "44444444-4444-4444-8444-444444444444"
    mockPrisma.delivery.findFirst.mockResolvedValueOnce({
      id: deliveryId,
      userId: mockUser.id,
      status: "scheduled",
      channel: "email",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      letter: {
        id: "11111111-1111-4111-8111-111111111111",
      },
    })
    mockPrisma.delivery.update.mockResolvedValueOnce({
      id: deliveryId,
      status: "canceled",
    })

    const result = await cancelDelivery({
      deliveryId,
    })

    expect(result.success).toBe(true)
  })
})

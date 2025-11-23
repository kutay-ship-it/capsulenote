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

const mockUser = {
  id: "user_test_123",
  email: "test@example.com",
  clerkUserId: "clerk_test_123",
}

vi.mock("../../server/lib/auth", () => ({
  requireUser: vi.fn(() => Promise.resolve(mockUser)),
}))

const mockEntitlements = {
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

const mockEntitlementsModule = {
  getEntitlements: vi.fn(() => Promise.resolve(mockEntitlements)),
  trackEmailDelivery: vi.fn(() => Promise.resolve()),
  deductMailCredit: vi.fn(() => Promise.resolve()),
}

vi.mock("../../server/lib/entitlements", () => mockEntitlementsModule)

const mockPrisma = {
  letter: {
    findFirst: vi.fn(),
  },
  delivery: {
    create: vi.fn(),
    findUnique: vi.fn(),
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
  $transaction: vi.fn(async (cb: any) =>
    cb({
      delivery: mockPrisma.delivery,
      emailDelivery: mockPrisma.emailDelivery,
      mailDelivery: mockPrisma.mailDelivery,
    })
  ),
}

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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("schedules email delivery successfully", async () => {
    mockPrisma.letter.findFirst.mockResolvedValueOnce({
      id: "letter_123",
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
      letterId: "letter_123",
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
      letterId: "letter_123",
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
      letterId: "letter_123",
      channel: "mail",
      deliverAt: new Date(Date.now() + 10 * 60 * 1000),
      timezone: "UTC",
      shippingAddressId: "addr_123",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.INSUFFICIENT_CREDITS)
    }
  })

  it("updates delivery status", async () => {
    mockPrisma.delivery.findUnique.mockResolvedValueOnce({
      id: "delivery_123",
      userId: mockUser.id,
      status: "scheduled",
      channel: "email",
    })
    mockPrisma.delivery.update.mockResolvedValueOnce({ id: "delivery_123", status: "sent" })

    const result = await updateDelivery({
      deliveryId: "delivery_123",
      status: "sent",
    })

    expect(result.success).toBe(true)
  })

  it("cancels delivery", async () => {
    mockPrisma.delivery.findUnique.mockResolvedValueOnce({
      id: "delivery_123",
      userId: mockUser.id,
      status: "scheduled",
      channel: "email",
    })
    mockPrisma.delivery.update.mockResolvedValueOnce({
      id: "delivery_123",
      status: "canceled",
    })

    const result = await cancelDelivery({
      deliveryId: "delivery_123",
    })

    expect(result.success).toBe(true)
  })
})

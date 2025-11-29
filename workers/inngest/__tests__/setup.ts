/**
 * Inngest Worker Test Setup
 *
 * Global test setup for Inngest worker tests.
 * Provides mocks, utilities, and test fixtures.
 */

import { vi } from "vitest"

// ============================================================================
// Environment Setup
// ============================================================================

// Set test environment variables
process.env.NODE_ENV = "test"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
process.env.RESEND_API_KEY = "re_test_key"
process.env.EMAIL_FROM_DELIVERY = "Capsule Note <delivery@test.capsulenote.com>"

// ============================================================================
// Prisma Mock
// ============================================================================

export const mockPrismaDelivery = {
  findUnique: vi.fn(),
  update: vi.fn(),
  findFirst: vi.fn(),
}

export const mockPrismaLetter = {
  findUnique: vi.fn(),
}

export const mockPrismaEmailDelivery = {
  update: vi.fn(),
}

export const mockPrismaDeliveryAttempt = {
  create: vi.fn(),
}

export const mockPrismaAuditEvent = {
  create: vi.fn(),
}

export const mockPrismaProfile = {
  findUnique: vi.fn(),
}

export const mockPrismaTransaction = vi.fn()

vi.mock("@dearme/prisma", () => ({
  prisma: {
    delivery: mockPrismaDelivery,
    letter: mockPrismaLetter,
    emailDelivery: mockPrismaEmailDelivery,
    deliveryAttempt: mockPrismaDeliveryAttempt,
    auditEvent: mockPrismaAuditEvent,
    profile: mockPrismaProfile,
    $transaction: (...args: any[]) => mockPrismaTransaction(...args),
  },
}))

// ============================================================================
// Email Provider Mock
// ============================================================================

export const mockEmailProviderSend = vi.fn()

export const createMockEmailProvider = (name: string = "Resend") => ({
  getName: () => name,
  send: mockEmailProviderSend,
})

// ============================================================================
// Encryption Mock
// ============================================================================

export const mockDecrypt = vi.fn()

vi.mock("../../../apps/web/server/lib/encryption", () => ({
  decrypt: (...args: any[]) => mockDecrypt(...args),
}))

// ============================================================================
// Email Config Mock
// ============================================================================

export const mockGetEmailSender = vi.fn()

vi.mock("../lib/email-config", () => ({
  getEmailSender: (type: string) => {
    if (type === "delivery") {
      return {
        from: "Capsule Note <delivery@test.capsulenote.com>",
        email: "delivery@test.capsulenote.com",
        displayName: "Capsule Note",
      }
    }
    return mockGetEmailSender(type)
  },
}))

// ============================================================================
// Push Notification Mock
// ============================================================================

export const mockSendDeliveryCompletedNotification = vi.fn()

vi.mock("../../../apps/web/server/providers/push", () => ({
  sendDeliveryCompletedNotification: (...args: any[]) =>
    mockSendDeliveryCompletedNotification(...args),
}))

// ============================================================================
// Test Fixtures
// ============================================================================

export function createMockDelivery(overrides: Partial<any> = {}) {
  return {
    id: `del_${Math.random().toString(36).slice(2)}`,
    userId: `user_${Math.random().toString(36).slice(2)}`,
    letterId: `let_${Math.random().toString(36).slice(2)}`,
    channel: "email",
    status: "scheduled",
    deliverAt: new Date(Date.now() + 1000), // 1 second in future
    attemptCount: 0,
    inngestRunId: null,
    providerMessageId: null,
    canceledAt: null,
    failureReason: null,
    failureCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockLetter(overrides: Partial<any> = {}) {
  return {
    id: `let_${Math.random().toString(36).slice(2)}`,
    userId: `user_${Math.random().toString(36).slice(2)}`,
    title: "Test Letter",
    shareLinkToken: `share_${Math.random().toString(36).slice(2)}`,
    keyVersion: 1,
    visibility: "private",
    tags: [],
    bodyFormat: "rich",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockLetterWithEncryption(overrides: Partial<any> = {}) {
  return {
    ...createMockLetter(overrides),
    bodyCiphertext: Buffer.from("encrypted_content"),
    bodyNonce: Buffer.from("test_nonce_12"),
  }
}

export function createMockEmailDelivery(overrides: Partial<any> = {}) {
  return {
    deliveryId: `del_${Math.random().toString(36).slice(2)}`,
    toEmail: "recipient@example.com",
    subject: "A Letter from Your Past Self",
    resendMessageId: null,
    openedAt: null,
    openCount: 0,
    clickedAt: null,
    clickCount: 0,
    ...overrides,
  }
}

export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: `user_${Math.random().toString(36).slice(2)}`,
    email: "user@example.com",
    clerkUserId: `clerk_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      pushEnabled: false,
      ...overrides.profile,
    },
    ...overrides,
  }
}

export function createMockDeliveryWithRelations(overrides: Partial<any> = {}) {
  const delivery = createMockDelivery(overrides.delivery)
  const letter = createMockLetter({ id: delivery.letterId, ...overrides.letter })
  const emailDelivery = createMockEmailDelivery({
    deliveryId: delivery.id,
    ...overrides.emailDelivery,
  })
  const user = createMockUser({ id: delivery.userId, ...overrides.user })

  return {
    ...delivery,
    letter,
    emailDelivery,
    user,
  }
}

export function createMockDecryptedContent() {
  return {
    bodyRich: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello from the past!" }],
        },
      ],
    },
    bodyHtml: "<p>Hello from the past!</p>",
  }
}

// ============================================================================
// Reset All Mocks
// ============================================================================

export function resetAllMocks() {
  vi.clearAllMocks()
  mockPrismaDelivery.findUnique.mockReset()
  mockPrismaDelivery.update.mockReset()
  mockPrismaDelivery.findFirst.mockReset()
  mockPrismaLetter.findUnique.mockReset()
  mockPrismaEmailDelivery.update.mockReset()
  mockPrismaDeliveryAttempt.create.mockReset()
  mockPrismaAuditEvent.create.mockReset()
  mockPrismaProfile.findUnique.mockReset()
  mockPrismaTransaction.mockReset()
  mockEmailProviderSend.mockReset()
  mockDecrypt.mockReset()
  mockSendDeliveryCompletedNotification.mockReset()
}

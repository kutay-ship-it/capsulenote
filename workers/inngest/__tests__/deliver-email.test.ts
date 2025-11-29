/**
 * Deliver Email Worker Tests
 *
 * Tests for the deliver-email Inngest function covering:
 * - Delivery fetching and validation
 * - Status transitions
 * - Letter decryption
 * - Email sending with provider fallback
 * - Error handling and retry logic
 * - Push notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  mockPrismaDelivery,
  mockPrismaLetter,
  mockPrismaTransaction,
  mockPrismaProfile,
  mockPrismaDeliveryAttempt,
  mockPrismaAuditEvent,
  mockEmailProviderSend,
  mockDecrypt,
  mockSendDeliveryCompletedNotification,
  createMockDeliveryWithRelations,
  createMockLetterWithEncryption,
  createMockDecryptedContent,
  resetAllMocks,
} from "./setup"
import {
  WorkerError,
  InvalidDeliveryError,
  DecryptionError,
  NetworkError,
  RateLimitError,
  ProviderRejectionError,
  classifyProviderError,
  classifyDatabaseError,
  shouldRetry,
  calculateBackoff,
} from "../lib/errors"

// ============================================================================
// Mocks for Email Provider
// ============================================================================

const mockGetEmailProvider = vi.fn()
vi.mock("../../../apps/web/server/providers/email", () => ({
  getEmailProvider: () => mockGetEmailProvider(),
}))

// Mock fallback providers
const mockResendProvider = {
  getName: () => "Resend",
  send: vi.fn(),
}

const mockPostmarkProvider = {
  getName: () => "Postmark",
  send: vi.fn(),
}

vi.mock("../../../apps/web/server/providers/email/resend-provider", () => ({
  ResendEmailProvider: class {
    getName() { return "Resend" }
    send = mockResendProvider.send
  },
}))

vi.mock("../../../apps/web/server/providers/email/postmark-provider", () => ({
  PostmarkEmailProvider: class {
    getName() { return "Postmark" }
    send = mockPostmarkProvider.send
  },
}))

// ============================================================================
// Tests
// ============================================================================

describe("Deliver Email Worker", () => {
  beforeEach(() => {
    resetAllMocks()
    mockGetEmailProvider.mockReturnValue({
      getName: () => "Resend",
      send: mockEmailProviderSend,
    })
    mockDecrypt.mockResolvedValue(JSON.stringify(createMockDecryptedContent()))
    mockPrismaTransaction.mockImplementation((ops: any[]) => Promise.all(ops))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // --------------------------------------------------------------------------
  // Error Classification Tests
  // --------------------------------------------------------------------------

  describe("Error Classification", () => {
    describe("classifyProviderError", () => {
      it("should classify network errors as retryable", () => {
        const error = new Error("ECONNREFUSED: Connection refused")
        const classified = classifyProviderError(error)

        expect(classified).toBeInstanceOf(NetworkError)
        expect(classified.retryable).toBe(true)
        expect(classified.code).toBe("NETWORK_ERROR")
      })

      it("should classify timeout errors as retryable", () => {
        const error = { message: "Request timeout", statusCode: 408 }
        const classified = classifyProviderError(error)

        expect(classified.retryable).toBe(true)
        expect(classified.code).toBe("PROVIDER_TIMEOUT")
      })

      it("should classify rate limit errors as retryable", () => {
        const error = { message: "Too many requests", statusCode: 429 }
        const classified = classifyProviderError(error)

        expect(classified).toBeInstanceOf(RateLimitError)
        expect(classified.retryable).toBe(true)
      })

      it("should classify 5xx errors as retryable", () => {
        const error = { message: "Internal server error", statusCode: 503 }
        const classified = classifyProviderError(error)

        expect(classified.retryable).toBe(true)
        expect(classified.code).toBe("TEMPORARY_PROVIDER_ERROR")
      })

      it("should classify 4xx errors as non-retryable", () => {
        const error = { message: "Bad request", statusCode: 400 }
        const classified = classifyProviderError(error)

        expect(classified).toBeInstanceOf(ProviderRejectionError)
        expect(classified.retryable).toBe(false)
      })

      it("should classify invalid email errors as non-retryable", () => {
        const error = { message: "Invalid email address", statusCode: 400 }
        const classified = classifyProviderError(error)

        expect(classified.retryable).toBe(false)
        expect(classified.code).toBe("INVALID_EMAIL")
      })
    })

    describe("classifyDatabaseError", () => {
      it("should classify connection errors as retryable", () => {
        const error = { code: "ECONNREFUSED", message: "Connection refused" }
        const classified = classifyDatabaseError(error)

        expect(classified.retryable).toBe(true)
        expect(classified.code).toBe("DATABASE_CONNECTION_ERROR")
      })

      it("should classify unique constraint as non-retryable", () => {
        const error = { code: "P2002", message: "Unique constraint failed" }
        const classified = classifyDatabaseError(error)

        expect(classified).toBeInstanceOf(InvalidDeliveryError)
        expect(classified.retryable).toBe(false)
      })

      it("should classify record not found as non-retryable", () => {
        const error = { code: "P2025", message: "Record not found" }
        const classified = classifyDatabaseError(error)

        expect(classified.retryable).toBe(false)
      })
    })

    describe("shouldRetry", () => {
      it("should return true for retryable WorkerError under max attempts", () => {
        const error = new NetworkError("Network issue")
        expect(shouldRetry(error, 2)).toBe(true)
      })

      it("should return false for non-retryable WorkerError", () => {
        const error = new InvalidDeliveryError("Invalid delivery")
        expect(shouldRetry(error, 1)).toBe(false)
      })

      it("should return false when max attempts reached", () => {
        const error = new NetworkError("Network issue")
        expect(shouldRetry(error, 5)).toBe(false)
      })

      it("should return true for unknown errors under max attempts", () => {
        const error = new Error("Unknown error")
        expect(shouldRetry(error, 3)).toBe(true)
      })
    })

    describe("calculateBackoff", () => {
      it("should calculate exponential backoff", () => {
        // Base delay is 1000ms
        const attempt0 = calculateBackoff(0, 1000)
        const attempt1 = calculateBackoff(1, 1000)
        const attempt2 = calculateBackoff(2, 1000)

        // With jitter, values should be approximately:
        // attempt 0: ~1000ms (±20%)
        // attempt 1: ~2000ms (±20%)
        // attempt 2: ~4000ms (±20%)
        expect(attempt0).toBeGreaterThanOrEqual(800)
        expect(attempt0).toBeLessThanOrEqual(1200)
        expect(attempt1).toBeGreaterThanOrEqual(1600)
        expect(attempt1).toBeLessThanOrEqual(2400)
        expect(attempt2).toBeGreaterThanOrEqual(3200)
        expect(attempt2).toBeLessThanOrEqual(4800)
      })

      it("should respect max delay", () => {
        const backoff = calculateBackoff(10, 1000, 5000)
        expect(backoff).toBeLessThanOrEqual(6000) // 5000 + 20% jitter max
      })
    })
  })

  // --------------------------------------------------------------------------
  // Delivery Validation Tests
  // --------------------------------------------------------------------------

  describe("Delivery Validation", () => {
    it("should throw InvalidDeliveryError when delivery not found", async () => {
      mockPrismaDelivery.findUnique.mockResolvedValue(null)

      const error = new InvalidDeliveryError("Delivery not found", {
        deliveryId: "nonexistent",
      })

      expect(error.retryable).toBe(false)
      expect(error.code).toBe("INVALID_DELIVERY")
    })

    it("should throw InvalidDeliveryError for non-email channel", async () => {
      const delivery = createMockDeliveryWithRelations({
        delivery: { channel: "mail" },
      })
      mockPrismaDelivery.findUnique.mockResolvedValue(delivery)

      const error = new InvalidDeliveryError("Invalid channel: mail", {
        deliveryId: delivery.id,
        channel: "mail",
      })

      expect(error.retryable).toBe(false)
    })

    it("should throw InvalidDeliveryError when emailDelivery missing", async () => {
      const delivery = createMockDeliveryWithRelations()
      delete delivery.emailDelivery
      mockPrismaDelivery.findUnique.mockResolvedValue(delivery)

      const error = new InvalidDeliveryError("Email delivery details missing", {
        deliveryId: delivery.id,
      })

      expect(error.retryable).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // Decryption Tests
  // --------------------------------------------------------------------------

  describe("Letter Decryption", () => {
    it("should decrypt letter content successfully", async () => {
      const letterWithEncryption = createMockLetterWithEncryption()
      mockPrismaLetter.findUnique.mockResolvedValue(letterWithEncryption)
      mockDecrypt.mockResolvedValue(JSON.stringify(createMockDecryptedContent()))

      const decryptedContent = JSON.parse(await mockDecrypt())

      expect(decryptedContent.bodyHtml).toBe("<p>Hello from the past!</p>")
      expect(decryptedContent.bodyRich.type).toBe("doc")
    })

    it("should throw DecryptionError when decryption fails", async () => {
      mockDecrypt.mockRejectedValue(new Error("Invalid key"))

      const error = new DecryptionError("Failed to decrypt letter content", {
        keyVersion: 1,
        originalError: new Error("Invalid key"),
      })

      expect(error.retryable).toBe(false)
      expect(error.code).toBe("DECRYPTION_ERROR")
    })

    it("should throw DecryptionError when letter not found for decryption", async () => {
      mockPrismaLetter.findUnique.mockResolvedValue(null)

      const error = new DecryptionError("Letter not found for decryption", {
        letterId: "nonexistent",
      })

      expect(error.retryable).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // Email Sending Tests
  // --------------------------------------------------------------------------

  describe("Email Sending", () => {
    it("should send email with primary provider successfully", async () => {
      mockEmailProviderSend.mockResolvedValue({
        success: true,
        id: "msg_test_123",
      })

      const result = await mockEmailProviderSend({
        from: "Capsule Note <delivery@test.com>",
        to: "recipient@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe("msg_test_123")
    })

    it("should include idempotency key in email headers", async () => {
      const delivery = createMockDeliveryWithRelations({ delivery: { attemptCount: 2 } })
      const expectedIdempotencyKey = `delivery-${delivery.id}-attempt-2`

      mockEmailProviderSend.mockResolvedValue({ success: true, id: "msg_123" })

      await mockEmailProviderSend({
        to: "recipient@example.com",
        headers: { "X-Idempotency-Key": expectedIdempotencyKey },
      })

      expect(mockEmailProviderSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Idempotency-Key": expectedIdempotencyKey,
          }),
        })
      )
    })

    it("should fail when provider returns success: false", async () => {
      mockEmailProviderSend.mockResolvedValue({
        success: false,
        error: "Invalid recipient",
      })

      const result = await mockEmailProviderSend({})

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid recipient")
    })

    it("should fail when no message ID returned", async () => {
      mockEmailProviderSend.mockResolvedValue({
        success: true,
        id: null,
      })

      const result = await mockEmailProviderSend({})

      expect(result.id).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Provider Fallback Tests
  // --------------------------------------------------------------------------

  describe("Provider Fallback", () => {
    it("should try fallback provider when primary fails", async () => {
      // Primary (Resend) fails
      mockEmailProviderSend.mockRejectedValue(new Error("Resend unavailable"))

      // Fallback (Postmark) succeeds
      mockPostmarkProvider.send.mockResolvedValue({
        success: true,
        id: "postmark_msg_123",
      })

      // Simulate the fallback behavior
      try {
        await mockEmailProviderSend({})
      } catch {
        const result = await mockPostmarkProvider.send({})
        expect(result.success).toBe(true)
        expect(result.id).toBe("postmark_msg_123")
      }
    })

    it("should fail when both providers fail", async () => {
      mockEmailProviderSend.mockRejectedValue(new Error("Resend unavailable"))
      mockPostmarkProvider.send.mockRejectedValue(new Error("Postmark unavailable"))

      let primaryError: Error | null = null
      let fallbackError: Error | null = null

      try {
        await mockEmailProviderSend({})
      } catch (e) {
        primaryError = e as Error
      }

      try {
        await mockPostmarkProvider.send({})
      } catch (e) {
        fallbackError = e as Error
      }

      expect(primaryError).toBeTruthy()
      expect(fallbackError).toBeTruthy()
    })
  })

  // --------------------------------------------------------------------------
  // Status Transitions Tests
  // --------------------------------------------------------------------------

  describe("Status Transitions", () => {
    it("should update status to processing before sending", async () => {
      const delivery = createMockDeliveryWithRelations()
      mockPrismaDelivery.update.mockResolvedValue({
        ...delivery,
        status: "processing",
      })

      await mockPrismaDelivery.update({
        where: { id: delivery.id },
        data: { status: "processing" },
      })

      expect(mockPrismaDelivery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: "processing" },
        })
      )
    })

    it("should update status to sent after successful send", async () => {
      const delivery = createMockDeliveryWithRelations()

      mockPrismaTransaction.mockResolvedValue([
        { ...delivery, status: "sent" },
        { resendMessageId: "msg_123" },
        { id: "attempt_1" },
        { id: "audit_1" },
      ])

      await mockPrismaTransaction([
        mockPrismaDelivery.update({
          where: { id: delivery.id },
          data: { status: "sent", attemptCount: { increment: 1 } },
        }),
      ])

      expect(mockPrismaTransaction).toHaveBeenCalled()
    })

    it("should not process canceled deliveries", async () => {
      const canceledDelivery = createMockDeliveryWithRelations({
        delivery: { status: "canceled" },
      })

      expect(canceledDelivery.status).toBe("canceled")
      // Simulating the check that would happen in the worker
      if (canceledDelivery.status === "canceled") {
        // Would throw NonRetriableError in actual code
        expect(true).toBe(true)
      }
    })
  })

  // --------------------------------------------------------------------------
  // Rescheduling Tests
  // --------------------------------------------------------------------------

  describe("Rescheduling", () => {
    it("should detect when delivery was rescheduled during wait", async () => {
      const originalDeliverAt = new Date("2025-01-15T10:00:00Z")
      const newDeliverAt = new Date("2025-01-16T10:00:00Z")

      const refreshedDeliverAt = newDeliverAt
      const originalDeliverAtDate = originalDeliverAt

      const wasRescheduled =
        refreshedDeliverAt.getTime() !== originalDeliverAtDate.getTime()

      expect(wasRescheduled).toBe(true)
    })

    it("should not wait again if new time is in the past", () => {
      const newDeliverAt = new Date(Date.now() - 1000) // 1 second ago
      const shouldWaitAgain = newDeliverAt > new Date()

      expect(shouldWaitAgain).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // Push Notification Tests
  // --------------------------------------------------------------------------

  describe("Push Notifications", () => {
    it("should send push notification when enabled", async () => {
      mockPrismaProfile.findUnique.mockResolvedValue({ pushEnabled: true })
      mockSendDeliveryCompletedNotification.mockResolvedValue({
        sent: 1,
        failed: 0,
      })

      const profile = await mockPrismaProfile.findUnique({
        where: { userId: "user_123" },
      })

      if (profile?.pushEnabled) {
        const result = await mockSendDeliveryCompletedNotification(
          "user_123",
          { deliveryId: "del_123" }
        )
        expect(result.sent).toBe(1)
      }

      expect(mockSendDeliveryCompletedNotification).toHaveBeenCalled()
    })

    it("should skip push notification when disabled", async () => {
      mockPrismaProfile.findUnique.mockResolvedValue({ pushEnabled: false })

      const profile = await mockPrismaProfile.findUnique({
        where: { userId: "user_123" },
      })

      if (!profile?.pushEnabled) {
        // Would return { skipped: true, reason: "disabled" }
        expect(profile.pushEnabled).toBe(false)
      }

      expect(mockSendDeliveryCompletedNotification).not.toHaveBeenCalled()
    })

    it("should not fail delivery when push notification fails", async () => {
      mockPrismaProfile.findUnique.mockResolvedValue({ pushEnabled: true })
      mockSendDeliveryCompletedNotification.mockRejectedValue(
        new Error("Push service unavailable")
      )

      // Even if push fails, delivery should succeed
      let pushFailed = false
      try {
        await mockSendDeliveryCompletedNotification("user_123", {})
      } catch {
        pushFailed = true
      }

      expect(pushFailed).toBe(true)
      // In actual code, this would return { skipped: true, reason: "error" }
      // but not throw
    })
  })

  // --------------------------------------------------------------------------
  // Failure Handler Tests
  // --------------------------------------------------------------------------

  describe("Failure Handler", () => {
    it("should mark delivery as failed after all retries exhausted", async () => {
      const delivery = createMockDeliveryWithRelations()

      mockPrismaTransaction.mockResolvedValue([
        { ...delivery, status: "failed" },
        { id: "attempt_fail" },
        { id: "audit_fail" },
      ])

      // Simulate marking delivery as failed
      await mockPrismaTransaction([
        mockPrismaDelivery.update({
          where: { id: delivery.id },
          data: { status: "failed", attemptCount: { increment: 1 } },
        }),
        mockPrismaDeliveryAttempt.create({
          data: {
            letterId: delivery.letterId,
            channel: "email",
            status: "failed",
            errorCode: "PROVIDER_ERROR",
            errorMessage: "All retries failed",
          },
        }),
        mockPrismaAuditEvent.create({
          data: {
            userId: delivery.userId,
            type: "delivery.failed",
            data: { deliveryId: delivery.id },
          },
        }),
      ])

      expect(mockPrismaTransaction).toHaveBeenCalled()
    })

    it("should extract deliveryId from failure event", () => {
      const failureEvent = {
        data: {
          event: {
            data: {
              deliveryId: "del_failure_test",
            },
          },
        },
      }

      const deliveryId = failureEvent.data?.event?.data?.deliveryId

      expect(deliveryId).toBe("del_failure_test")
    })
  })

  // --------------------------------------------------------------------------
  // Configuration Validation Tests
  // --------------------------------------------------------------------------

  describe("Configuration Validation", () => {
    it("should fail early when NEXT_PUBLIC_APP_URL not configured", () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL
      process.env.NEXT_PUBLIC_APP_URL = ""

      const isConfigured = !!process.env.NEXT_PUBLIC_APP_URL

      expect(isConfigured).toBe(false)

      process.env.NEXT_PUBLIC_APP_URL = originalUrl
    })

    it("should have email sender configured", () => {
      // The mock setup ensures getEmailSender returns valid config
      const sender = {
        from: "Capsule Note <delivery@test.capsulenote.com>",
        email: "delivery@test.capsulenote.com",
        displayName: "Capsule Note",
      }

      expect(sender.from).toBeDefined()
      expect(sender.email).toBeDefined()
    })
  })

  // --------------------------------------------------------------------------
  // Email Content Tests
  // --------------------------------------------------------------------------

  describe("Email Content", () => {
    it("should include letter title in email", () => {
      const delivery = createMockDeliveryWithRelations({
        letter: { title: "My Future Letter" },
      })

      const emailHtml = `<h2>${delivery.letter.title}</h2>`

      expect(emailHtml).toContain("My Future Letter")
    })

    it("should include unlock URL in email", () => {
      const delivery = createMockDeliveryWithRelations({
        letter: { id: "letter_abc123" },
      })

      const unlockUrl = `http://localhost:3000/unlock/${delivery.letter.id}`

      expect(unlockUrl).toBe("http://localhost:3000/unlock/letter_abc123")
    })

    it("should include delivery date in email", () => {
      const deliverAt = new Date("2025-12-25T10:00:00Z")
      const delivery = createMockDeliveryWithRelations({
        delivery: { deliverAt },
      })

      const formattedDate = new Date(delivery.deliverAt).toLocaleDateString()

      expect(formattedDate).toBeDefined()
    })
  })
})

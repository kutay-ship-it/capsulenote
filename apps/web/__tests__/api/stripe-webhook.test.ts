/**
 * Stripe Webhook API Route Tests
 *
 * Tests for /api/webhooks/stripe endpoint covering:
 * - Signature verification
 * - Event age validation
 * - Inngest event queueing
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { POST } from "@/app/api/webhooks/stripe/route"
import {
  createMockStripeEvent,
  createMockStripeCheckoutSession,
  createMockStripeSubscription,
  createMockStripeInvoice,
} from "../utils/mock-factories"

// ============================================================================
// Mocks
// ============================================================================

// Mock headers() from next/headers
const mockHeaders = vi.fn()
vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}))

// Mock Stripe client
const mockConstructEvent = vi.fn()
vi.mock("@/server/providers/stripe/client", () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: any[]) => mockConstructEvent(...args),
    },
  },
}))

// Mock env
vi.mock("@/env.mjs", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
  },
}))

// Mock Inngest trigger
const mockTriggerInngestEvent = vi.fn()
vi.mock("@/server/lib/trigger-inngest", () => ({
  triggerInngestEvent: (...args: any[]) => mockTriggerInngestEvent(...args),
}))

// ============================================================================
// Test Utilities
// ============================================================================

function createMockRequest(body: string, signature?: string): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  }
  if (signature) {
    headers["stripe-signature"] = signature
  }

  return new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  })
}

// ============================================================================
// Tests
// ============================================================================

describe("Stripe Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTriggerInngestEvent.mockResolvedValue({ ids: ["test_event_id"] })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // Signature Verification Tests
  // --------------------------------------------------------------------------

  describe("Signature Verification", () => {
    it("should reject request with missing signature header", async () => {
      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue(null),
      })

      const request = createMockRequest("{}")
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe("Missing signature")
    })

    it("should reject request with invalid signature", async () => {
      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("invalid_signature"),
      })

      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature")
      })

      const request = createMockRequest("{}", "invalid_signature")
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toContain("Invalid signature")
    })

    it("should accept request with valid signature", async () => {
      const event = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession()
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockConstructEvent).toHaveBeenCalledWith(
        expect.any(String),
        "valid_signature",
        "whsec_test_secret"
      )
    })
  })

  // --------------------------------------------------------------------------
  // Event Age Validation Tests
  // --------------------------------------------------------------------------

  describe("Event Age Validation", () => {
    it("should reject events older than 5 minutes", async () => {
      const oldEvent = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession(),
        {
          // Event created 10 minutes ago
          created: Math.floor(Date.now() / 1000) - 600,
        }
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(oldEvent)

      const request = createMockRequest(
        JSON.stringify(oldEvent),
        "valid_signature"
      )
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe("Event too old")
    })

    it("should accept recent events (within 5 minutes)", async () => {
      const recentEvent = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession(),
        {
          // Event created 2 minutes ago
          created: Math.floor(Date.now() / 1000) - 120,
        }
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(recentEvent)

      const request = createMockRequest(
        JSON.stringify(recentEvent),
        "valid_signature"
      )
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it("should accept events created just now", async () => {
      const newEvent = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession()
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(newEvent)

      const request = createMockRequest(
        JSON.stringify(newEvent),
        "valid_signature"
      )
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  // --------------------------------------------------------------------------
  // Event Queueing Tests
  // --------------------------------------------------------------------------

  describe("Event Queueing", () => {
    it("should queue checkout.session.completed to Inngest", async () => {
      const session = createMockStripeCheckoutSession()
      const event = createMockStripeEvent("checkout.session.completed", session)

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should queue customer.subscription.created to Inngest", async () => {
      const subscription = createMockStripeSubscription()
      const event = createMockStripeEvent(
        "customer.subscription.created",
        subscription
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should queue customer.subscription.updated to Inngest", async () => {
      const subscription = createMockStripeSubscription({ status: "past_due" })
      const event = createMockStripeEvent(
        "customer.subscription.updated",
        subscription
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should queue customer.subscription.deleted to Inngest", async () => {
      const subscription = createMockStripeSubscription({ status: "canceled" })
      const event = createMockStripeEvent(
        "customer.subscription.deleted",
        subscription
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should queue invoice.payment_succeeded to Inngest", async () => {
      const invoice = createMockStripeInvoice({ status: "paid" })
      const event = createMockStripeEvent("invoice.payment_succeeded", invoice)

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should queue invoice.payment_failed to Inngest", async () => {
      const invoice = createMockStripeInvoice({ status: "open" })
      const event = createMockStripeEvent("invoice.payment_failed", invoice)

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "stripe/webhook.received",
        { event }
      )
    })

    it("should return 200 immediately after queueing", async () => {
      const event = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession()
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      const response = await POST(request)

      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toBe("Webhook queued")
    })
  })

  // --------------------------------------------------------------------------
  // Error Handling Tests
  // --------------------------------------------------------------------------

  describe("Error Handling", () => {
    it("should return 500 when Inngest queueing fails", async () => {
      const event = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession()
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)
      mockTriggerInngestEvent.mockRejectedValue(new Error("Inngest unavailable"))

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      const response = await POST(request)

      expect(response.status).toBe(500)
      const text = await response.text()
      expect(text).toBe("Failed to queue webhook")
    })

    it("should handle malformed JSON body gracefully", async () => {
      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid payload")
      })

      const request = createMockRequest("not valid json", "valid_signature")
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it("should log signature verification failures", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("bad_signature"),
      })

      mockConstructEvent.mockImplementation(() => {
        throw new Error("No signatures found matching the expected signature")
      })

      const request = createMockRequest("{}", "bad_signature")
      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Stripe Webhook] Signature verification failed:",
        expect.objectContaining({
          error: expect.any(String),
        })
      )

      consoleSpy.mockRestore()
    })

    it("should log successful event queueing", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

      const event = createMockStripeEvent(
        "checkout.session.completed",
        createMockStripeCheckoutSession()
      )

      mockHeaders.mockReturnValue({
        get: vi.fn().mockReturnValue("valid_signature"),
      })

      mockConstructEvent.mockReturnValue(event)

      const request = createMockRequest(JSON.stringify(event), "valid_signature")
      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Stripe Webhook] Event queued successfully",
        expect.objectContaining({
          eventId: event.id,
          eventType: event.type,
        })
      )

      consoleSpy.mockRestore()
    })
  })

  // --------------------------------------------------------------------------
  // Event Type Coverage Tests
  // --------------------------------------------------------------------------

  describe("Event Type Coverage", () => {
    const eventTypes = [
      "checkout.session.completed",
      "checkout.session.expired",
      "customer.created",
      "customer.updated",
      "customer.deleted",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "customer.subscription.trial_will_end",
      "customer.subscription.paused",
      "customer.subscription.resumed",
      "invoice.paid",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
      "payment_method.attached",
      "payment_method.detached",
    ]

    eventTypes.forEach((eventType) => {
      it(`should queue ${eventType} events`, async () => {
        const event = createMockStripeEvent(eventType, {})

        mockHeaders.mockReturnValue({
          get: vi.fn().mockReturnValue("valid_signature"),
        })

        mockConstructEvent.mockReturnValue(event)

        const request = createMockRequest(
          JSON.stringify(event),
          "valid_signature"
        )
        const response = await POST(request)

        expect(response.status).toBe(200)
        expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
          "stripe/webhook.received",
          { event }
        )
      })
    })
  })
})

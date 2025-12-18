/**
 * Reconcile Deliveries Cron Job Tests
 *
 * Tests for /api/cron/reconcile-deliveries endpoint covering:
 * - Authorization (CRON_SECRET validation)
 * - Stuck delivery detection
 * - Re-enqueueing to Inngest
 * - Alerting thresholds
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GET } from "@/app/api/cron/reconcile-deliveries/route"
import { NextRequest } from "next/server"

// ============================================================================
// Mocks
// ============================================================================

// Mock env
vi.mock("@/env.mjs", () => ({
  env: {
    CRON_SECRET: "test_cron_secret",
  },
}))

// Mock prisma
const mockQueryRaw = vi.fn()
const mockTxDeliveryFindUnique = vi.fn()
const mockTxDeliveryUpdate = vi.fn()
const mockDeliveryCount = vi.fn()
vi.mock("@/server/lib/db", () => ({
  prisma: {
    $queryRaw: (...args: any[]) => mockQueryRaw(...args),
    $transaction: (callback: any) =>
      callback({
        delivery: {
          findUnique: (...args: any[]) => mockTxDeliveryFindUnique(...args),
          update: (...args: any[]) => mockTxDeliveryUpdate(...args),
        },
      }),
    delivery: {
      count: (...args: any[]) => mockDeliveryCount(...args),
    },
  },
}))

// Mock audit logging
const mockCreateAuditEvent = vi.fn()
vi.mock("@/server/lib/audit", () => ({
  createAuditEvent: (...args: any[]) => mockCreateAuditEvent(...args),
}))

// Mock Inngest trigger
const mockTriggerInngestEvent = vi.fn()
vi.mock("@/server/lib/trigger-inngest", () => ({
  triggerInngestEvent: (...args: any[]) => mockTriggerInngestEvent(...args),
}))

// ============================================================================
// Test Utilities
// ============================================================================

function createMockRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (authHeader) {
    headers["authorization"] = authHeader
  }

  return new NextRequest("http://localhost:3000/api/cron/reconcile-deliveries", {
    method: "GET",
    headers,
  })
}

function createStuckDelivery(overrides: Partial<{
  id: string
  deliver_at: Date
  attempt_count: number
}> = {}) {
  return {
    id: `del_${Math.random().toString(36).slice(2)}`,
    deliver_at: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
    attempt_count: 0,
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe("Reconcile Deliveries Cron Job", () => {
  // Store original env
  const originalEnv = process.env.CRON_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = "test_cron_secret"
    mockTriggerInngestEvent.mockResolvedValue({ ids: ["test_event_id"] })
    mockTxDeliveryFindUnique.mockResolvedValue({
      status: "scheduled",
      updatedAt: new Date(0),
    })
    mockTxDeliveryUpdate.mockResolvedValue({})
    mockDeliveryCount.mockResolvedValue(100_000)
    mockCreateAuditEvent.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = originalEnv
  })

  // --------------------------------------------------------------------------
  // Authorization Tests
  // --------------------------------------------------------------------------

  describe("Authorization", () => {
    it("should reject request without authorization header", async () => {
      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("should reject request with invalid authorization header", async () => {
      const request = createMockRequest("Bearer wrong_secret")
      const response = await GET(request)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("should reject request with malformed authorization header", async () => {
      const request = createMockRequest("test_cron_secret") // Missing "Bearer "
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it("should reject request when CRON_SECRET is not set", async () => {
      process.env.CRON_SECRET = ""
      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it("should accept request with valid authorization header", async () => {
      mockQueryRaw.mockResolvedValue([])

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  // --------------------------------------------------------------------------
  // Stuck Delivery Detection Tests
  // --------------------------------------------------------------------------

  describe("Stuck Delivery Detection", () => {
    it("should return success with zero count when no stuck deliveries", async () => {
      mockQueryRaw.mockResolvedValue([])

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.success).toBe(true)
      expect(json.count).toBe(0)
      expect(json.message).toBe("No stuck deliveries found")
    })

    it("should detect deliveries older than 5 minutes with scheduled status", async () => {
      const stuckDelivery = createStuckDelivery()
      mockQueryRaw.mockResolvedValue([stuckDelivery])

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.count).toBe(1)
      expect(mockQueryRaw).toHaveBeenCalled()
    })

    it("should process multiple stuck deliveries", async () => {
      const stuckDeliveries = [
        createStuckDelivery({ id: "del_1" }),
        createStuckDelivery({ id: "del_2" }),
        createStuckDelivery({ id: "del_3" }),
      ]
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.count).toBe(3)
      expect(mockTriggerInngestEvent).toHaveBeenCalledTimes(3)
    })

    it("should respect the 100 delivery limit", async () => {
      // Create 100 stuck deliveries
      const stuckDeliveries = Array.from({ length: 100 }, (_, i) =>
        createStuckDelivery({ id: `del_${i}` })
      )
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.count).toBe(100)
      expect(mockTriggerInngestEvent).toHaveBeenCalledTimes(100)
    })
  })

  // --------------------------------------------------------------------------
  // Re-enqueueing Tests
  // --------------------------------------------------------------------------

  describe("Re-enqueueing", () => {
    it("should trigger Inngest event for each stuck delivery", async () => {
      const stuckDelivery = createStuckDelivery({ id: "del_test_123" })
      mockQueryRaw.mockResolvedValue([stuckDelivery])

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(mockTriggerInngestEvent).toHaveBeenCalledWith(
        "delivery.scheduled",
        { deliveryId: "del_test_123" }
      )
    })

    it("should increment attemptCount for reconciled deliveries", async () => {
      const stuckDelivery = createStuckDelivery({ id: "del_test_456", attempt_count: 2 })
      mockQueryRaw.mockResolvedValue([stuckDelivery])

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(mockTxDeliveryUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "del_test_456" },
          data: expect.objectContaining({
            attemptCount: { increment: 1 },
          }),
        })
      )
    })

    it("should create audit event for each reconciled delivery", async () => {
      const stuckDelivery = createStuckDelivery({
        id: "del_audit_test",
        deliver_at: new Date("2025-01-15T10:00:00Z"),
        attempt_count: 1,
      })
      mockQueryRaw.mockResolvedValue([stuckDelivery])

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(mockCreateAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          type: "delivery.reconciled",
          data: expect.objectContaining({
            deliveryId: "del_audit_test",
            attemptCount: 2, // incremented from 1
          }),
        })
      )
    })

    it("should return results array with re-enqueued status", async () => {
      const stuckDeliveries = [
        createStuckDelivery({ id: "del_1" }),
        createStuckDelivery({ id: "del_2" }),
      ]
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      const json = await response.json()
      expect(json.results).toHaveLength(2)
      expect(json.results[0]).toMatchObject({
        deliveryId: "del_1",
        status: "re-enqueued",
      })
      expect(json.results[1]).toMatchObject({
        deliveryId: "del_2",
        status: "re-enqueued",
      })
    })
  })

  // --------------------------------------------------------------------------
  // Alerting Threshold Tests
  // --------------------------------------------------------------------------

  describe("Alerting Thresholds", () => {
    it("should log warning and create audit event when >10 stuck deliveries", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      // Create 15 stuck deliveries
      const stuckDeliveries = Array.from({ length: 15 }, (_, i) =>
        createStuckDelivery({ id: `del_${i}` })
      )
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("15 stuck deliveries")
      )

      expect(mockCreateAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          type: "system.reconciler_high_volume",
          data: {
            count: 15,
            threshold: 10,
          },
        })
      )

      consoleSpy.mockRestore()
    })

    it("should not log warning when <=10 stuck deliveries", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      const stuckDeliveries = Array.from({ length: 10 }, (_, i) =>
        createStuckDelivery({ id: `del_${i}` })
      )
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      // Should not have warned about high volume
      const highVolumeWarnings = consoleSpy.mock.calls.filter(call =>
        call[0]?.includes?.("stuck deliveries")
      )
      expect(highVolumeWarnings).toHaveLength(0)

      consoleSpy.mockRestore()
    })

    it("should calculate and return reconciliation rate", async () => {
      const stuckDeliveries = Array.from({ length: 5 }, (_, i) =>
        createStuckDelivery({ id: `del_${i}` })
      )
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      const json = await response.json()
      expect(json.reconciliationRate).toBeDefined()
      expect(json.reconciliationRate).toMatch(/^\d+\.\d+%$/)
    })

    it("should log error when reconciliation rate exceeds 0.1%", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      // More than 0.1 deliveries (0.1% of 100) = any > 0 based on current logic
      // Actually the current formula: (count/100)*100 = count%, so >0.1 means count > 0.001
      // With count=1, rate = 1%, which is > 0.1%
      const stuckDeliveries = [createStuckDelivery({ id: "del_1" })]
      mockQueryRaw.mockResolvedValue(stuckDeliveries)
      mockDeliveryCount.mockResolvedValueOnce(100)

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Reconciliation rate too high")
      )

      consoleSpy.mockRestore()
    })
  })

  // --------------------------------------------------------------------------
  // Error Handling Tests
  // --------------------------------------------------------------------------

  describe("Error Handling", () => {
    it("should return 500 when database query fails", async () => {
      mockQueryRaw.mockRejectedValue(new Error("Database connection failed"))

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe("Database connection failed")
    })

    it("should continue processing other deliveries when one fails", async () => {
      const stuckDeliveries = [
        createStuckDelivery({ id: "del_1" }),
        createStuckDelivery({ id: "del_2" }),
        createStuckDelivery({ id: "del_3" }),
      ]
      mockQueryRaw.mockResolvedValue(stuckDeliveries)

      // First and third succeed, second fails
      mockTriggerInngestEvent
        .mockResolvedValueOnce({ ids: ["id_1"] })
        .mockRejectedValueOnce(new Error("Inngest unavailable"))
        .mockResolvedValueOnce({ ids: ["id_3"] })

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.count).toBe(3)
      expect(json.results).toHaveLength(3)
      expect(json.results[0].status).toBe("re-enqueued")
      expect(json.results[1].status).toBe("error")
      expect(json.results[1].error).toBe("Inngest unavailable")
      expect(json.results[2].status).toBe("re-enqueued")
    })

    it("should handle delivery update failures gracefully", async () => {
      const stuckDelivery = createStuckDelivery({ id: "del_update_fail" })
      mockQueryRaw.mockResolvedValue([stuckDelivery])
      mockTxDeliveryUpdate.mockRejectedValueOnce(new Error("Update failed"))

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.results[0].status).toBe("error")
      expect(json.results[0].error).toBe("Update failed")
    })

    it("should log individual delivery reconciliation failures", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const stuckDelivery = createStuckDelivery({ id: "del_log_test" })
      mockQueryRaw.mockResolvedValue([stuckDelivery])
      mockTriggerInngestEvent.mockRejectedValue(new Error("Trigger failed"))

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to reconcile delivery del_log_test"),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it("should handle unknown error types", async () => {
      mockQueryRaw.mockRejectedValue("String error")

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json.error).toBe("Unknown error")
    })
  })

  // --------------------------------------------------------------------------
  // SQL Query Behavior Tests
  // --------------------------------------------------------------------------

  describe("SQL Query Behavior", () => {
    it("should query for deliveries with scheduled status", async () => {
      mockQueryRaw.mockResolvedValue([])

      const request = createMockRequest("Bearer test_cron_secret")
      await GET(request)

      // The queryRaw uses tagged template literal, check it was called
      expect(mockQueryRaw).toHaveBeenCalled()
    })

    it("should order deliveries by deliver_at ASC then attempt_count ASC", async () => {
      // Verify ordering by checking processing order in results
      const oldDelivery = createStuckDelivery({
        id: "del_old",
        deliver_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        attempt_count: 0,
      })
      const newDelivery = createStuckDelivery({
        id: "del_new",
        deliver_at: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
        attempt_count: 0,
      })

      // Database returns them in correct order (old first)
      mockQueryRaw.mockResolvedValue([oldDelivery, newDelivery])

      const request = createMockRequest("Bearer test_cron_secret")
      const response = await GET(request)

      const json = await response.json()
      expect(json.results[0].deliveryId).toBe("del_old")
      expect(json.results[1].deliveryId).toBe("del_new")
    })
  })
})

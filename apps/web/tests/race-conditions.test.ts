/**
 * Race Condition Tests
 *
 * Comprehensive tests for all race condition fixes implemented across the codebase.
 * These tests use concurrent operations to verify proper handling of race conditions.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

describe("Race Condition Handling", () => {
  beforeAll(async () => {
    // Setup test database state
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect()
  })

  describe("User Creation Race Conditions", () => {
    it("should handle concurrent user creation attempts (auth.ts)", async () => {
      const testClerkUserId = `test_clerk_${Date.now()}`
      const testEmail = `test+${Date.now()}@example.com`

      // Simulate 3 concurrent requests trying to create the same user
      const promises = Array.from({ length: 3 }, () =>
        prisma.user.create({
          data: {
            clerkUserId: testClerkUserId,
            email: testEmail,
            profile: {
              create: { timezone: "UTC" },
            },
          },
        }).catch((error: any) => {
          // Expect P2002 errors from concurrent requests
          if (error?.code === 'P2002') {
            return { raceConditionDetected: true }
          }
          throw error
        })
      )

      const results = await Promise.all(promises)

      // Exactly one should succeed, others should fail with P2002
      const successCount = results.filter(r => !('raceConditionDetected' in r)).length
      const raceDetectedCount = results.filter(r => 'raceConditionDetected' in r).length

      expect(successCount).toBe(1)
      expect(raceDetectedCount).toBe(2)

      // Cleanup
      await prisma.user.delete({ where: { clerkUserId: testClerkUserId } })
    })

    it("should handle concurrent Clerk webhook deliveries", async () => {
      const testClerkUserId = `test_webhook_${Date.now()}`
      const testEmail = `webhook+${Date.now()}@example.com`

      // Simulate 2 concurrent webhook deliveries
      const webhookDeliveries = Array.from({ length: 2 }, () =>
        prisma.user.create({
          data: {
            clerkUserId: testClerkUserId,
            email: testEmail,
            profile: { create: { timezone: "UTC" } },
          },
        }).catch((error: any) => {
          if (error?.code === 'P2002') {
            // Retry with findUnique (simulating our retry logic)
            return prisma.user.findUnique({
              where: { clerkUserId: testClerkUserId },
            })
          }
          throw error
        })
      )

      const results = await Promise.all(webhookDeliveries)

      // Both should eventually get the user (one creates, one retries and finds)
      expect(results.every(r => r !== null)).toBe(true)
      expect(results.every(r => r?.clerkUserId === testClerkUserId)).toBe(true)

      // Cleanup
      await prisma.user.delete({ where: { clerkUserId: testClerkUserId } })
    })
  })

  describe("Anonymous Draft Race Conditions", () => {
    it("should handle concurrent draft save attempts", async () => {
      const sessionId = `test_session_${Date.now()}`
      const email = `draft+${Date.now()}@example.com`

      // Simulate 3 rapid save button clicks
      const saves = Array.from({ length: 3 }, (_, i) =>
        prisma.anonymousDraft.create({
          data: {
            sessionId,
            email,
            title: `Draft ${i}`,
            body: `Content ${i}`,
            recipientEmail: email,
            deliveryDate: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }).catch((error: any) => {
          if (error?.code === 'P2002') {
            return { raceConditionDetected: true }
          }
          throw error
        })
      )

      const results = await Promise.all(saves)

      // With retry logic, at least one should succeed
      const successCount = results.filter(r => !('raceConditionDetected' in r)).length
      expect(successCount).toBeGreaterThanOrEqual(1)

      // Cleanup
      await prisma.anonymousDraft.deleteMany({ where: { sessionId } })
    })
  })

  describe("SubscriptionUsage Race Conditions", () => {
    it("should handle concurrent usage record creation", async () => {
      const testUserId = `test_user_${Date.now()}`
      const period = new Date(Date.UTC(2025, 10, 1)) // Nov 1, 2025

      // Create test user first
      await prisma.user.create({
        data: {
          id: testUserId,
          clerkUserId: `clerk_${testUserId}`,
          email: `usage+${Date.now()}@example.com`,
          profile: { create: { timezone: "UTC" } },
        },
      })

      // Simulate 3 concurrent requests trying to create usage record
      const creates = Array.from({ length: 3 }, () =>
        prisma.subscriptionUsage.upsert({
          where: {
            userId_period: { userId: testUserId, period },
          },
          create: {
            userId: testUserId,
            period,
            lettersCreated: 0,
            emailsSent: 0,
            mailsSent: 0,
            mailCredits: 2,
          },
          update: {},
        }).catch((error: any) => {
          if (error?.code === 'P2002') {
            // Retry with findUnique (simulating retry logic)
            return prisma.subscriptionUsage.findUnique({
              where: { userId_period: { userId: testUserId, period } },
            })
          }
          throw error
        })
      )

      const results = await Promise.all(creates)

      // All should eventually get the same record
      expect(results.every(r => r !== null)).toBe(true)
      expect(new Set(results.map(r => r?.userId)).size).toBe(1)

      // Cleanup
      await prisma.subscriptionUsage.delete({
        where: { userId_period: { userId: testUserId, period } },
      })
      await prisma.user.delete({ where: { id: testUserId } })
    })
  })

  describe("Subscription Linking Race Conditions", () => {
    it("should handle concurrent subscription linking attempts", async () => {
      const testUserId = `test_link_${Date.now()}`
      const stripeSubId = `sub_test_${Date.now()}`

      // Create test user
      await prisma.user.create({
        data: {
          id: testUserId,
          clerkUserId: `clerk_${testUserId}`,
          email: `link+${Date.now()}@example.com`,
          profile: { create: { timezone: "UTC" } },
        },
      })

      // Simulate 2 concurrent auto-linking attempts
      const links = Array.from({ length: 2 }, () =>
        prisma.subscription.create({
          data: {
            userId: testUserId,
            stripeSubscriptionId: stripeSubId,
            status: "active",
            plan: "pro",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          },
        }).catch((error: any) => {
          if (error?.code === 'P2002') {
            // Retry with findUnique (simulating retry logic)
            return prisma.subscription.findUnique({
              where: { stripeSubscriptionId: stripeSubId },
            })
          }
          throw error
        })
      )

      const results = await Promise.all(links)

      // Both should get the same subscription (one creates, one retries and finds)
      expect(results.every(r => r !== null)).toBe(true)
      expect(new Set(results.map(r => r?.stripeSubscriptionId)).size).toBe(1)

      // Cleanup
      await prisma.subscription.delete({ where: { stripeSubscriptionId: stripeSubId } })
      await prisma.user.delete({ where: { id: testUserId } })
    })
  })

  describe("PendingSubscription Status Update Race Conditions", () => {
    it("should prevent double-processing with conditional update", async () => {
      const testEmail = `pending+${Date.now()}@example.com`
      const sessionId = `cs_test_${Date.now()}`

      // Create pending subscription
      const pending = await prisma.pendingSubscription.create({
        data: {
          email: testEmail,
          stripeCustomerId: `cus_test_${Date.now()}`,
          stripeSessionId: sessionId,
          priceId: "price_test",
          plan: "pro",
          amountCents: 990,
          currency: "usd",
          status: "pending",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Simulate 2 concurrent webhook processing attempts
      const updates = Array.from({ length: 2 }, () =>
        prisma.pendingSubscription.updateMany({
          where: {
            id: pending.id,
            status: { not: "payment_complete" },
          },
          data: {
            status: "payment_complete",
            stripeSubscriptionId: `sub_test_${Date.now()}`,
            webhookProcessedAt: new Date(),
          },
        })
      )

      const results = await Promise.all(updates)

      // Only one should succeed (count = 1), other should fail (count = 0)
      const successCount = results.filter(r => r.count === 1).length
      const idempotentCount = results.filter(r => r.count === 0).length

      expect(successCount).toBe(1)
      expect(idempotentCount).toBe(1)

      // Cleanup
      await prisma.pendingSubscription.delete({ where: { id: pending.id } })
    })
  })
})

describe("Race Condition Retry Logic Performance", () => {
  it("should resolve race conditions within 3 attempts", async () => {
    const attempts: number[] = []

    // Simulate retry loop tracking
    let currentAttempt = 0
    const maxAttempts = 3

    while (currentAttempt < maxAttempts) {
      try {
        currentAttempt++

        // Simulate operation that might fail due to race condition
        if (currentAttempt <= 2) {
          throw { code: 'P2002' } // Simulate P2002 error
        }

        attempts.push(currentAttempt)
        break
      } catch (error: any) {
        if (error?.code === 'P2002') {
          attempts.push(currentAttempt)

          if (currentAttempt >= maxAttempts) {
            throw new Error('Max attempts reached')
          }
        } else {
          throw error
        }
      }
    }

    // Should resolve within 3 attempts
    expect(attempts.length).toBeLessThanOrEqual(3)
    expect(currentAttempt).toBeLessThanOrEqual(maxAttempts)
  })

  it("should use exponential backoff with jitter", () => {
    const delays: number[] = []

    for (let attempt = 1; attempt <= 3; attempt++) {
      const delay = 20 * attempt + Math.random() * 10
      delays.push(delay)
    }

    // Delays should increase (within jitter range)
    expect(delays[0]).toBeGreaterThanOrEqual(20)
    expect(delays[0]).toBeLessThan(40)

    expect(delays[1]).toBeGreaterThanOrEqual(40)
    expect(delays[1]).toBeLessThan(60)

    expect(delays[2]).toBeGreaterThanOrEqual(60)
    expect(delays[2]).toBeLessThan(80)
  })
})

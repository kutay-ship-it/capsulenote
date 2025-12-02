import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { validateCronSecret } from "@/server/lib/crypto-utils"
import { PlanType } from "@dearme/prisma"

/**
 * Usage Period Rollover Cron Job
 *
 * Runs daily at midnight UTC to:
 * 1. Find subscriptions with periods ending today
 * 2. Create new usage records for next period
 * 3. Reset quotas (letters, emails, mails)
 * 4. Replenish mail credits for Pro users (2 credits)
 *
 * Performance: Processes up to 1000 subscriptions per run
 * Monitoring: Alerts if processing fails or takes >30s
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Verify cron secret using constant-time comparison (prevents timing attacks)
  const authHeader = request.headers.get("authorization")
  if (!validateCronSecret(authHeader, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find active subscriptions with periods ending today
    // We check for periods ending in the next 24 hours to catch all timezones
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const subscriptionsToRollover = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] },
        currentPeriodEnd: {
          gte: now,
          lte: tomorrow
        }
      },
      take: 1000, // Process max 1000 per run
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        currentPeriodEnd: true
      }
    })

    if (subscriptionsToRollover.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions need rollover today",
        count: 0,
        processingTimeMs: Date.now() - startTime
      })
    }

    console.log(`📊 Rolling over usage for ${subscriptionsToRollover.length} subscriptions`)

    // Calculate next period start (beginning of next month)
    const nextPeriod = getStartOfNextMonth(now)

    // Mail credits per month by plan - type-safe against PlanType enum
    // DIGITAL_CAPSULE = email-only plan (no mail credits)
    // PAPER_PIXELS = physical mail plan (2 credits/month)
    const mailCreditsMap: Record<PlanType, number> = {
      [PlanType.DIGITAL_CAPSULE]: 0,
      [PlanType.PAPER_PIXELS]: 2,
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const subscription of subscriptionsToRollover) {
      try {
        // Get mail credits for this plan
        const mailCredits = mailCreditsMap[subscription.plan] || 0

        // Use transaction to ensure all updates succeed or fail together
        await prisma.$transaction(async (tx) => {
          // 1. Create/update usage record for next period (for tracking purposes)
          await tx.subscriptionUsage.upsert({
            where: {
              userId_period: {
                userId: subscription.userId,
                period: nextPeriod
              }
            },
            create: {
              userId: subscription.userId,
              period: nextPeriod,
              lettersCreated: 0,
              emailsSent: 0,
              mailsSent: 0,
              mailCredits
            },
            update: {
              // If record exists, reset counters and replenish credits
              lettersCreated: 0,
              emailsSent: 0,
              mailsSent: 0,
              mailCredits
            }
          })

          // 2. CRITICAL: Replenish User.physicalCredits (the actual balance used by entitlements)
          // Only replenish if this plan includes mail credits
          if (mailCredits > 0) {
            // Get current balance for audit trail
            const currentUser = await tx.user.findUnique({
              where: { id: subscription.userId },
              select: { physicalCredits: true }
            })

            const balanceBefore = currentUser?.physicalCredits ?? 0

            // Add monthly credits to user's balance
            await tx.user.update({
              where: { id: subscription.userId },
              data: {
                physicalCredits: { increment: mailCredits }
              }
            })

            // 3. Create credit transaction for audit trail
            await tx.creditTransaction.create({
              data: {
                userId: subscription.userId,
                creditType: "physical",
                transactionType: "grant_subscription",
                amount: mailCredits,
                balanceBefore,
                balanceAfter: balanceBefore + mailCredits,
                source: subscription.id,
                metadata: {
                  plan: subscription.plan,
                  period: nextPeriod.toISOString(),
                  reason: "monthly_replenishment"
                }
              }
            })
          }
        })

        results.push({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          plan: subscription.plan,
          status: 'rolled_over',
          mailCreditsReplenished: mailCredits,
          periodStart: nextPeriod.toISOString()
        })

        successCount++

        // Log audit event for monitoring
        await createAuditEvent({
          userId: subscription.userId,
          type: "subscription.usage_rollover",
          data: {
            subscriptionId: subscription.id,
            plan: subscription.plan,
            period: nextPeriod.toISOString(),
            mailCreditsReplenished: mailCredits
          }
        })
      } catch (error) {
        console.error(`Failed to rollover usage for subscription ${subscription.id}:`, error)

        results.push({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          status: 'error',
          error: error instanceof Error ? error.message : "Unknown error"
        })

        errorCount++
      }
    }

    const processingTimeMs = Date.now() - startTime

    // Alert if processing took too long (>30s)
    if (processingTimeMs > 30000) {
      console.warn(`⚠️ Usage rollover took ${processingTimeMs}ms - consider optimization!`)

      await createAuditEvent({
        userId: null,
        type: "system.rollover_slow",
        data: {
          processingTimeMs,
          subscriptionCount: subscriptionsToRollover.length,
          threshold: 30000
        }
      })
    }

    // Alert if error rate is high (>5%)
    const errorRate = (errorCount / subscriptionsToRollover.length) * 100
    if (errorRate > 5) {
      console.error(`❌ Usage rollover error rate too high: ${errorRate.toFixed(2)}%`)

      await createAuditEvent({
        userId: null,
        type: "system.rollover_high_error_rate",
        data: {
          errorRate,
          errorCount,
          totalCount: subscriptionsToRollover.length
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Rolled over usage for ${successCount} subscriptions`,
      summary: {
        totalProcessed: subscriptionsToRollover.length,
        successCount,
        errorCount,
        errorRate: `${errorRate.toFixed(2)}%`,
        processingTimeMs,
        nextPeriodStart: nextPeriod.toISOString()
      },
      results: process.env.NODE_ENV === 'development' ? results : undefined // Only return details in dev
    })
  } catch (error) {
    const processingTimeMs = Date.now() - startTime

    console.error("Usage rollover error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processingTimeMs
      },
      { status: 500 }
    )
  }
}

/**
 * Get start of next month in UTC
 */
function getStartOfNextMonth(date: Date): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()

  // If December, roll over to January next year
  if (month === 11) {
    return new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0))
  }

  return new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
}

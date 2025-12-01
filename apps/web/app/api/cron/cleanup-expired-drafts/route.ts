import { NextRequest, NextResponse } from "next/server"
import { cleanupExpiredDrafts } from "@/server/lib/drafts"
import { logger } from "@/server/lib/logger"
import { validateCronSecret } from "@/server/lib/crypto-utils"

/**
 * Draft Cleanup Cron Job
 *
 * Runs daily to delete drafts older than 30 days with no deliveries.
 *
 * Called by Vercel Cron (see vercel.json)
 * Secured by CRON_SECRET environment variable
 *
 * Schedule: Daily at 2 AM UTC
 * Purpose: Prevent database bloat from abandoned drafts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret using constant-time comparison (prevents timing attacks)
    const authHeader = request.headers.get("authorization")
    if (!validateCronSecret(authHeader, process.env.CRON_SECRET)) {
      await logger.warn("Unauthorized cron request", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Run cleanup
    const startTime = Date.now()
    const deletedCount = await cleanupExpiredDrafts()
    const duration = Date.now() - startTime

    await logger.info("Draft cleanup cron completed", {
      deletedCount,
      durationMs: duration,
    })

    return NextResponse.json({
      success: true,
      deletedCount,
      durationMs: duration,
    })
  } catch (error) {
    await logger.error("Draft cleanup cron failed", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

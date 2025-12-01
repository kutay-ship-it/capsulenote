/**
 * Cleanup Anonymous Drafts Cron Job
 *
 * Runs daily to delete expired anonymous drafts (>7 days old, unclaimed)
 *
 * Scheduled via Vercel Cron: Daily at 3am UTC
 * Security: Verifies CRON_SECRET header
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"
import { validateCronSecret } from "@/server/lib/crypto-utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  // Verify cron secret using constant-time comparison (prevents timing attacks)
  const authHeader = request.headers.get("authorization")
  if (!validateCronSecret(authHeader, env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[Cleanup Cron] Starting cleanup of expired anonymous drafts")

  try {
    // Delete expired, unclaimed drafts
    const result = await prisma.anonymousDraft.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        claimedAt: null, // Only delete unclaimed drafts
      }
    })

    console.log(`[Cleanup Cron] Deleted ${result.count} expired anonymous drafts`)

    // Alert if cleanup rate is unusually high
    if (result.count > 100) {
      console.warn(
        `[Cleanup Cron] High draft cleanup volume: ${result.count} drafts. ` +
        `This may indicate issues with the signup flow.`
      )
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (error) {
    console.error("[Cleanup Cron] Fatal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

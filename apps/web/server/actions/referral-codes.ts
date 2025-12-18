"use server"

import { Prisma } from "@prisma/client"
import { prisma } from "@/server/lib/db"
import { requireUser } from "@/server/lib/auth"

/**
 * Generate a unique referral code
 * Format: 8 alphanumeric characters (e.g., "JANE42XY")
 */
function generateCode(): string {
  // Generate 8 character alphanumeric code
  // Using custom alphabet without confusing characters (0/O, 1/I/l)
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

const REFERRAL_CODE_SELECT = {
  code: true,
  clickCount: true,
  signupCount: true,
  convertCount: true,
  isActive: true,
  createdAt: true,
} as const

type ReferralCodeResult = {
  code: string
  clickCount: number
  signupCount: number
  convertCount: number
  isActive: boolean
  createdAt: Date
}

/**
 * Get or create a referral code for the current user
 *
 * Uses a create-or-fetch-on-P2002 pattern to handle concurrent calls safely.
 * This prevents race conditions when multiple parallel requests try to create
 * a referral code for the same user (e.g., settings page loading multiple tabs).
 */
export async function getOrCreateReferralCode(): Promise<ReferralCodeResult> {
  const user = await requireUser()

  // First, try to get existing code (fast path)
  const existingCode = await prisma.referralCode.findUnique({
    where: { userId: user.id },
    select: REFERRAL_CODE_SELECT,
  })

  if (existingCode) {
    return existingCode
  }

  // No existing code, attempt to create one
  // Use retry loop to handle both code collision and userId race condition
  const maxAttempts = 5

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode()

    try {
      const referralCode = await prisma.referralCode.create({
        data: {
          userId: user.id,
          code,
        },
        select: REFERRAL_CODE_SELECT,
      })

      return referralCode
    } catch (error) {
      // Handle P2002 unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined

        // If userId constraint failed, another request created it - just fetch
        if (target?.includes("user_id")) {
          const existingByRace = await prisma.referralCode.findUnique({
            where: { userId: user.id },
            select: REFERRAL_CODE_SELECT,
          })

          if (existingByRace) {
            return existingByRace
          }
          // If still not found (weird edge case), continue to retry
        }

        // If code constraint failed, code collision - retry with new code
        if (target?.includes("code")) {
          console.log(`[Referral] Code collision on attempt ${attempt + 1}, retrying...`)
          continue
        }
      }

      // Unknown error, rethrow
      throw error
    }
  }

  throw new Error("Failed to generate unique referral code after maximum attempts")
}

/**
 * Get referral code stats for the current user
 */
export async function getReferralStats(): Promise<{
  code: string | null
  stats: {
    clicks: number
    signups: number
    conversions: number
    creditsEarned: number
  }
  referrals: Array<{
    id: string
    status: string
    createdAt: Date
    signedUpAt: Date | null
    convertedAt: Date | null
    rewardedAt: Date | null
  }>
} | null> {
  const user = await requireUser()

  const referralCode = await prisma.referralCode.findUnique({
    where: { userId: user.id },
    include: {
      referrals: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          createdAt: true,
          signedUpAt: true,
          convertedAt: true,
          rewardedAt: true,
        },
      },
    },
  })

  if (!referralCode) {
    return null
  }

  // Count rewarded referrals for credits earned
  const rewardedCount = referralCode.referrals.filter(
    (r) => r.status === "rewarded"
  ).length

  return {
    code: referralCode.code,
    stats: {
      clicks: referralCode.clickCount,
      signups: referralCode.signupCount,
      conversions: referralCode.convertCount,
      creditsEarned: rewardedCount, // 1 credit per rewarded referral
    },
    referrals: referralCode.referrals,
  }
}

/**
 * Track a click on a referral link
 * Called from the middleware when ?ref= parameter is present
 */
export async function trackReferralClick(code: string): Promise<boolean> {
  try {
    await prisma.referralCode.update({
      where: { code, isActive: true },
      data: { clickCount: { increment: 1 } },
    })
    return true
  } catch {
    // Code doesn't exist or is inactive
    return false
  }
}

/**
 * Validate a referral code exists and is active
 */
export async function validateReferralCode(code: string): Promise<{
  valid: boolean
  referrerUserId?: string
}> {
  const referralCode = await prisma.referralCode.findUnique({
    where: { code, isActive: true },
    select: { userId: true },
  })

  if (!referralCode) {
    return { valid: false }
  }

  return {
    valid: true,
    referrerUserId: referralCode.userId,
  }
}

/**
 * Create a referral code for a user (server-side, no session required)
 *
 * This is called during user creation webhook to pre-generate the referral code.
 * Uses the same P2002 handling pattern as getOrCreateReferralCode.
 *
 * @param userId - The user's database ID
 * @returns The created referral code, or null if creation failed
 */
export async function createReferralCodeForUser(userId: string): Promise<string | null> {
  // First, check if user already has a referral code
  const existingCode = await prisma.referralCode.findUnique({
    where: { userId },
    select: { code: true },
  })

  if (existingCode) {
    return existingCode.code
  }

  // Attempt to create a new code
  const maxAttempts = 5

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode()

    try {
      const referralCode = await prisma.referralCode.create({
        data: {
          userId,
          code,
        },
        select: { code: true },
      })

      console.log(`[Referral] Created referral code for user ${userId}: ${referralCode.code}`)
      return referralCode.code
    } catch (error) {
      // Handle P2002 unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined

        // If userId constraint failed, another process created it - just fetch
        if (target?.includes("user_id")) {
          const existingByRace = await prisma.referralCode.findUnique({
            where: { userId },
            select: { code: true },
          })

          if (existingByRace) {
            return existingByRace.code
          }
        }

        // If code constraint failed, code collision - retry with new code
        if (target?.includes("code")) {
          console.log(`[Referral] Code collision on attempt ${attempt + 1} for user ${userId}, retrying...`)
          continue
        }
      }

      // Log but don't throw - this is a background operation
      console.error(`[Referral] Failed to create referral code for user ${userId}:`, error)
      return null
    }
  }

  console.error(`[Referral] Failed to generate unique referral code for user ${userId} after ${maxAttempts} attempts`)
  return null
}

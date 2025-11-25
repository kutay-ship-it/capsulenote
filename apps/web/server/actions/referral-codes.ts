"use server"

import { prisma } from "@/server/lib/db"
import { requireUser } from "@/server/lib/auth"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"

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

/**
 * Get or create a referral code for the current user
 */
export async function getOrCreateReferralCode(): Promise<{
  code: string
  clickCount: number
  signupCount: number
  convertCount: number
  isActive: boolean
  createdAt: Date
}> {
  const user = await requireUser()

  // Check if user already has a referral code
  let referralCode = await prisma.referralCode.findUnique({
    where: { userId: user.id },
    select: {
      code: true,
      clickCount: true,
      signupCount: true,
      convertCount: true,
      isActive: true,
      createdAt: true,
    },
  })

  if (referralCode) {
    return referralCode
  }

  // Generate a unique code
  let code: string
  let attempts = 0
  const maxAttempts = 10

  do {
    code = generateCode()
    const existing = await prisma.referralCode.findUnique({
      where: { code },
    })
    if (!existing) break
    attempts++
  } while (attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique referral code")
  }

  // Create the referral code
  referralCode = await prisma.referralCode.create({
    data: {
      userId: user.id,
      code,
    },
    select: {
      code: true,
      clickCount: true,
      signupCount: true,
      convertCount: true,
      isActive: true,
      createdAt: true,
    },
  })

  return referralCode
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

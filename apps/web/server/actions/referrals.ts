"use server"

import { prisma } from "@/server/lib/db"
import { requireUser } from "@/server/lib/auth"
import { revalidatePath } from "next/cache"
import {
  validateReferralEligibility,
  incrementInviteCount,
} from "@/server/lib/referral-fraud"
import { getOrCreateReferralCode } from "./referral-codes"
import { addEmailCredits } from "@/server/lib/entitlements"

/**
 * Create a new referral invite
 * Called when user shares their referral link with someone's email
 */
export async function createReferralInvite(refereeEmail: string): Promise<{
  success: boolean
  error?: string
}> {
  const user = await requireUser()

  // Get or create referral code
  const referralCode = await getOrCreateReferralCode()

  // Get full referral code record
  const codeRecord = await prisma.referralCode.findUnique({
    where: { code: referralCode.code },
  })

  if (!codeRecord) {
    return { success: false, error: "Referral code not found" }
  }

  // Validate eligibility (fraud checks)
  const eligibility = await validateReferralEligibility(
    user.id,
    user.email,
    refereeEmail,
    codeRecord.id
  )

  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.details || "Not eligible for referral",
    }
  }

  // Create the referral record
  await prisma.referral.create({
    data: {
      referralCodeId: codeRecord.id,
      referrerId: user.id,
      refereeEmail: refereeEmail.toLowerCase(),
      status: "pending",
    },
  })

  // Increment rate limit counter
  await incrementInviteCount(user.id)

  revalidatePath("/settings/referrals")
  return { success: true }
}

/**
 * Process a signup that came through a referral
 * Called during user creation when they signed up with a referral code
 */
export async function processReferralSignup(
  refereeUserId: string,
  refereeEmail: string,
  referralCode: string
): Promise<boolean> {
  try {
    // Find the referral code
    const codeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode, isActive: true },
    })

    if (!codeRecord) {
      console.warn(`[Referral] Invalid code at signup: ${referralCode}`)
      return false
    }

    // Check if referral record exists (from invite) or create new one
    let referral = await prisma.referral.findFirst({
      where: {
        referralCodeId: codeRecord.id,
        refereeEmail: refereeEmail.toLowerCase(),
      },
    })

    if (referral) {
      // Update existing referral with signup info
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          refereeUserId,
          status: "signed_up",
          signedUpAt: new Date(),
        },
      })
    } else {
      // Create new referral record (organic referral link click without invite)
      await prisma.referral.create({
        data: {
          referralCodeId: codeRecord.id,
          referrerId: codeRecord.userId,
          refereeUserId,
          refereeEmail: refereeEmail.toLowerCase(),
          status: "signed_up",
          signedUpAt: new Date(),
        },
      })
    }

    // Update code stats
    await prisma.referralCode.update({
      where: { id: codeRecord.id },
      data: { signupCount: { increment: 1 } },
    })

    // Store referral code in profile for later reward processing
    await prisma.profile.update({
      where: { userId: refereeUserId },
      data: { referredByCode: referralCode },
    })

    return true
  } catch (error) {
    console.error("[Referral] Failed to process signup:", error)
    return false
  }
}

/**
 * Process a conversion (user subscribed/paid)
 * Called when a referred user completes their first payment
 */
export async function processReferralConversion(
  refereeUserId: string
): Promise<{
  rewarded: boolean
  referrerId?: string
  refereeId?: string
}> {
  try {
    // Find the referral by referee user ID
    const referral = await prisma.referral.findFirst({
      where: {
        refereeUserId,
        status: "signed_up", // Only process signed_up status
      },
      include: {
        referralCode: true,
      },
    })

    if (!referral) {
      // No pending referral to convert
      return { rewarded: false }
    }

    // Update referral status to converted
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "converted",
        convertedAt: new Date(),
      },
    })

    // Update code stats
    await prisma.referralCode.update({
      where: { id: referral.referralCodeId },
      data: { convertCount: { increment: 1 } },
    })

    // Award credits to both parties
    const creditAmount = 1 // 1 email credit each

    // Credit the referrer
    await addEmailCredits(referral.referrerId, creditAmount)

    // Credit the referee
    await addEmailCredits(refereeUserId, creditAmount)

    // Mark as rewarded
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "rewarded",
        rewardedAt: new Date(),
      },
    })

    console.log(
      `[Referral] Rewarded: referrer=${referral.referrerId}, referee=${refereeUserId}, credits=${creditAmount}`
    )

    return {
      rewarded: true,
      referrerId: referral.referrerId,
      refereeId: refereeUserId,
    }
  } catch (error) {
    console.error("[Referral] Failed to process conversion:", error)
    return { rewarded: false }
  }
}

/**
 * Get referral link for current user
 *
 * @param code - Optional pre-fetched referral code to avoid duplicate getOrCreateReferralCode calls
 */
export async function getReferralLink(code?: string): Promise<string> {
  const referralCode = code ?? (await getOrCreateReferralCode()).code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"
  return `${baseUrl}?ref=${referralCode}`
}

/**
 * Build referral link from code (no DB call)
 */
export async function buildReferralLink(code: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"
  return `${baseUrl}?ref=${code}`
}

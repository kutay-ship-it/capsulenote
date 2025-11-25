import { prisma } from "@/server/lib/db"
import { redis } from "@/server/lib/redis"

/**
 * Referral Fraud Detection Utilities
 *
 * Prevents:
 * 1. Self-referrals (same email domain)
 * 2. Excessive invite spam (rate limiting)
 * 3. Duplicate referrals to same email
 */

const INVITE_RATE_LIMIT_KEY = "referral:invites:"
const INVITE_RATE_LIMIT_COUNT = 10 // Max invites per period
const INVITE_RATE_LIMIT_WINDOW = 60 * 60 * 24 // 24 hours in seconds

/**
 * Extract domain from email
 */
function getEmailDomain(email: string): string {
  return email.toLowerCase().split("@")[1] || ""
}

/**
 * Check if referrer and referee have the same email domain
 * (Potential self-referral or organization abuse)
 */
export function isSameDomainReferral(
  referrerEmail: string,
  refereeEmail: string
): boolean {
  const referrerDomain = getEmailDomain(referrerEmail)
  const refereeDomain = getEmailDomain(refereeEmail)

  // Skip check for common public email providers
  const publicDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
    "mail.com",
    "aol.com",
    "live.com",
    "msn.com",
    "yandex.com",
  ]

  if (publicDomains.includes(referrerDomain)) {
    return false
  }

  return referrerDomain === refereeDomain
}

/**
 * Check if user has exceeded invite rate limit
 */
export async function checkInviteRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  resetInSeconds: number
}> {
  const key = `${INVITE_RATE_LIMIT_KEY}${userId}`

  try {
    // Get current count
    const countStr = await redis.get(key)
    const count = countStr ? parseInt(countStr as string, 10) : 0

    if (count >= INVITE_RATE_LIMIT_COUNT) {
      // Get TTL to show reset time
      const ttl = await redis.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: ttl > 0 ? ttl : INVITE_RATE_LIMIT_WINDOW,
      }
    }

    return {
      allowed: true,
      remaining: INVITE_RATE_LIMIT_COUNT - count,
      resetInSeconds: 0,
    }
  } catch (error) {
    console.error("[Referral Fraud] Rate limit check failed:", error)
    // Fail open - allow the invite if Redis is down
    return {
      allowed: true,
      remaining: INVITE_RATE_LIMIT_COUNT,
      resetInSeconds: 0,
    }
  }
}

/**
 * Increment invite count for rate limiting
 */
export async function incrementInviteCount(userId: string): Promise<void> {
  const key = `${INVITE_RATE_LIMIT_KEY}${userId}`

  try {
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, INVITE_RATE_LIMIT_WINDOW)
    await pipeline.exec()
  } catch (error) {
    console.error("[Referral Fraud] Failed to increment invite count:", error)
    // Non-critical - continue even if tracking fails
  }
}

/**
 * Check if a referral to this email already exists
 */
export async function isDuplicateReferral(
  referralCodeId: string,
  refereeEmail: string
): Promise<boolean> {
  const existing = await prisma.referral.findFirst({
    where: {
      referralCodeId,
      refereeEmail: refereeEmail.toLowerCase(),
    },
  })

  return !!existing
}

/**
 * Validate referral eligibility
 * Returns validation result with specific error if invalid
 */
export async function validateReferralEligibility(
  referrerId: string,
  referrerEmail: string,
  refereeEmail: string,
  referralCodeId: string
): Promise<{
  eligible: boolean
  error?: "rate_limited" | "same_domain" | "duplicate" | "self_referral"
  details?: string
}> {
  // 1. Check self-referral (same email)
  if (referrerEmail.toLowerCase() === refereeEmail.toLowerCase()) {
    return {
      eligible: false,
      error: "self_referral",
      details: "Cannot refer yourself",
    }
  }

  // 2. Check same domain (potential organization abuse)
  if (isSameDomainReferral(referrerEmail, refereeEmail)) {
    return {
      eligible: false,
      error: "same_domain",
      details: "Cannot refer users from the same organization",
    }
  }

  // 3. Check rate limit
  const rateLimit = await checkInviteRateLimit(referrerId)
  if (!rateLimit.allowed) {
    return {
      eligible: false,
      error: "rate_limited",
      details: `Invite limit reached. Try again in ${Math.ceil(rateLimit.resetInSeconds / 3600)} hours`,
    }
  }

  // 4. Check duplicate referral
  if (await isDuplicateReferral(referralCodeId, refereeEmail)) {
    return {
      eligible: false,
      error: "duplicate",
      details: "This email has already been invited",
    }
  }

  return { eligible: true }
}

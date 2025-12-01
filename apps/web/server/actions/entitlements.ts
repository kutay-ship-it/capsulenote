"use server"

import { requireUser } from "@/server/lib/auth"
import { getEntitlements, canPurchasePhysicalTrial } from "@/server/lib/entitlements"
import { prisma } from "@/server/lib/db"
import {
  PHYSICAL_MAIL_MIN_LEAD_DAYS,
  type DeliveryEligibility,
} from "@/server/lib/entitlement-types"

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get delivery eligibility for the letter editor
 * Returns credit counts and scheduling capabilities for UI rendering
 */
export async function getDeliveryEligibility(): Promise<DeliveryEligibility> {
  const user = await requireUser()
  const entitlements = await getEntitlements(user.id)

  // Get trial status from database
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { physicalMailTrialUsed: true },
  })

  // Check if user can purchase trial credit
  const canPurchaseTrial = await canPurchasePhysicalTrial(user.id)

  const isDigitalCapsule = entitlements.plan === "DIGITAL_CAPSULE"

  return {
    canScheduleEmail:
      entitlements.features.canScheduleDeliveries &&
      !entitlements.limits.emailsReached,
    canSchedulePhysical:
      entitlements.features.canSchedulePhysicalMail &&
      !entitlements.limits.mailCreditsExhausted,
    emailCredits: entitlements.features.emailDeliveriesIncluded,
    physicalCredits: entitlements.usage.mailCreditsRemaining,
    hasActiveSubscription: entitlements.features.canScheduleDeliveries,
    plan: entitlements.plan,
    canPurchasePhysicalTrial: canPurchaseTrial,
    hasUsedPhysicalTrial: userRecord?.physicalMailTrialUsed ?? false,
    physicalMailMinLeadDays: PHYSICAL_MAIL_MIN_LEAD_DAYS,
    isDigitalCapsule,
  }
}

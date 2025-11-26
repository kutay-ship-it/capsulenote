"use server"

import { requireUser } from "@/server/lib/auth"
import { getEntitlements } from "@/server/lib/entitlements"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Delivery eligibility data for the letter editor
 * Used to determine which delivery channels are available
 */
export interface DeliveryEligibility {
  /** Whether user can schedule email deliveries (has subscription + credits) */
  canScheduleEmail: boolean
  /** Whether user can schedule physical mail (Paper & Pixels plan + credits) */
  canSchedulePhysical: boolean
  /** Current email credits remaining */
  emailCredits: number
  /** Current physical mail credits remaining */
  physicalCredits: number
  /** Whether user has any active subscription */
  hasActiveSubscription: boolean
  /** User's current plan type */
  plan: string
}

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
  }
}

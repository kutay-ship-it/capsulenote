// ============================================================================
// ENTITLEMENT TYPES
// ============================================================================
// Shared types for entitlement/eligibility data
// Separated from server actions to allow use in client components

/** Minimum lead time for physical mail delivery (30 days) */
export const PHYSICAL_MAIL_MIN_LEAD_DAYS = 30

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
  /** Whether user is eligible to purchase one-time physical mail trial ($4.99) */
  canPurchasePhysicalTrial: boolean
  /** Whether user has already used their trial credit */
  hasUsedPhysicalTrial: boolean
  /** Minimum lead days required for physical mail */
  physicalMailMinLeadDays: number
  /** Whether user is on Digital Capsule plan (needs trial/upgrade for physical mail) */
  isDigitalCapsule: boolean
}

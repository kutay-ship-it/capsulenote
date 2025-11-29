/**
 * Mail Delivery Calculator Engine
 *
 * Calculates optimal send dates for "arrive-by" mail delivery mode.
 *
 * Key concepts:
 * - transitDays: Estimated USPS transit time (varies by mail class)
 * - bufferDays: Safety margin to account for delays
 * - sendDate: When to actually mail the letter (targetDate - transit - buffer)
 *
 * Mail classes and typical transit times:
 * - usps_first_class: 2-5 business days (average ~4 days)
 * - usps_standard: 3-10 business days (average ~7 days)
 *
 * @see https://docs.lob.com/node#section/Letter-Delivery-Time-Estimates
 */

export type MailType = "usps_first_class" | "usps_standard"

export interface TransitEstimate {
  /** Estimated transit days for this mail class */
  transitDays: number
  /** Buffer days to add for safety */
  bufferDays: number
  /** Total days before target to send */
  totalLeadDays: number
}

export interface ArriveByCalculation {
  /** User's desired arrival date */
  targetArrivalDate: Date
  /** Calculated date to send the letter */
  sendDate: Date
  /** Estimated transit days */
  transitDays: number
  /** Buffer days added for safety */
  bufferDays: number
  /** Mail type used for calculation */
  mailType: MailType
  /** Whether the send date is in the past (too late to guarantee arrival) */
  isTooLate: boolean
  /** Earliest possible arrival if we send ASAP (when isTooLate is true) */
  earliestPossibleArrival?: Date
}

/**
 * Transit time estimates by mail class
 *
 * Based on Lob documentation and USPS averages:
 * - First Class: 2-5 business days, we use 5 (conservative)
 * - Standard: 3-10 business days, we use 8 (conservative)
 *
 * Buffer days account for:
 * - Lob print processing time (~1-2 business days)
 * - Weekend/holiday delays
 * - USPS variability
 */
const TRANSIT_ESTIMATES: Record<MailType, TransitEstimate> = {
  usps_first_class: {
    transitDays: 5, // Upper bound of 2-5 days
    bufferDays: 3, // Print time + safety margin
    totalLeadDays: 8,
  },
  usps_standard: {
    transitDays: 8, // Conservative estimate within 3-10 days
    bufferDays: 4, // More buffer for slower class
    totalLeadDays: 12,
  },
}

/**
 * Minimum lead time in milliseconds (must send at least 5 minutes in future)
 */
const MIN_LEAD_TIME_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Calculate the optimal send date for arrive-by delivery mode
 *
 * @param targetArrivalDate - User's desired arrival date
 * @param mailType - USPS mail class (affects transit time)
 * @returns Calculation result with send date and transit estimates
 *
 * @example
 * ```ts
 * const result = calculateArriveByDate(
 *   new Date('2025-12-25'), // Want it by Christmas
 *   'usps_first_class'
 * )
 * // result.sendDate might be 2025-12-17 (8 days before)
 * ```
 */
export function calculateArriveByDate(
  targetArrivalDate: Date,
  mailType: MailType = "usps_first_class"
): ArriveByCalculation {
  const estimate = TRANSIT_ESTIMATES[mailType]
  const now = new Date()

  // Calculate send date: target - transitDays - bufferDays
  const sendDate = new Date(targetArrivalDate)
  sendDate.setDate(sendDate.getDate() - estimate.totalLeadDays)

  // Check if we have enough time
  const isTooLate = sendDate.getTime() < now.getTime() + MIN_LEAD_TIME_MS

  // Calculate earliest possible arrival if sending ASAP
  let earliestPossibleArrival: Date | undefined
  if (isTooLate) {
    earliestPossibleArrival = new Date(now)
    earliestPossibleArrival.setDate(
      earliestPossibleArrival.getDate() + estimate.totalLeadDays
    )
  }

  return {
    targetArrivalDate,
    sendDate: isTooLate ? new Date(now.getTime() + MIN_LEAD_TIME_MS) : sendDate,
    transitDays: estimate.transitDays,
    bufferDays: estimate.bufferDays,
    mailType,
    isTooLate,
    earliestPossibleArrival,
  }
}

/**
 * Get transit estimates for a mail type
 *
 * Useful for displaying expected delivery timeframes in the UI
 *
 * @param mailType - USPS mail class
 * @returns Transit time and buffer estimates
 */
export function getTransitEstimate(mailType: MailType): TransitEstimate {
  return TRANSIT_ESTIMATES[mailType]
}

/**
 * Validate if a target arrival date is achievable
 *
 * @param targetArrivalDate - Desired arrival date
 * @param mailType - USPS mail class
 * @returns Validation result with suggested alternatives if not achievable
 */
export function validateArrivalDate(
  targetArrivalDate: Date,
  mailType: MailType = "usps_first_class"
): {
  isAchievable: boolean
  calculation: ArriveByCalculation
  suggestion?: string
} {
  const calculation = calculateArriveByDate(targetArrivalDate, mailType)

  if (!calculation.isTooLate) {
    return { isAchievable: true, calculation }
  }

  // Generate helpful suggestion
  const daysDifference = Math.ceil(
    (calculation.earliestPossibleArrival!.getTime() -
      targetArrivalDate.getTime()) /
      (1000 * 60 * 60 * 24)
  )

  let suggestion: string
  if (daysDifference <= 3) {
    suggestion = `Your letter will arrive approximately ${daysDifference} day${daysDifference > 1 ? "s" : ""} after your target date.`
  } else {
    suggestion = `The earliest possible arrival is ${calculation.earliestPossibleArrival!.toLocaleDateString()}. Consider using First Class mail for faster delivery.`
  }

  return {
    isAchievable: false,
    calculation,
    suggestion,
  }
}

/**
 * Calculate when to schedule the Inngest job for arrive-by mode
 *
 * For arrive-by mode, we need to send the letter on the calculated sendDate,
 * not on the user's target arrival date.
 *
 * @param deliveryMode - "send_on" or "arrive_by"
 * @param userSelectedDate - The date the user selected in the UI
 * @param mailType - USPS mail class (only used for arrive_by)
 * @returns The date when we should actually trigger the mail send
 */
export function calculateJobScheduleDate(
  deliveryMode: "send_on" | "arrive_by",
  userSelectedDate: Date,
  mailType: MailType = "usps_first_class"
): {
  scheduleDate: Date
  transitDays: number
  bufferDays: number
  originalTargetDate: Date
} {
  if (deliveryMode === "send_on") {
    // For send_on mode, schedule directly on the user's selected date
    return {
      scheduleDate: userSelectedDate,
      transitDays: 0,
      bufferDays: 0,
      originalTargetDate: userSelectedDate,
    }
  }

  // For arrive_by mode, calculate the send date
  const calculation = calculateArriveByDate(userSelectedDate, mailType)

  return {
    scheduleDate: calculation.sendDate,
    transitDays: calculation.transitDays,
    bufferDays: calculation.bufferDays,
    originalTargetDate: userSelectedDate,
  }
}

/**
 * Format arrival estimate for display in UI
 *
 * @param sendDate - When the letter will be sent
 * @param mailType - USPS mail class
 * @returns Human-readable delivery estimate string
 */
export function formatDeliveryEstimate(
  sendDate: Date,
  mailType: MailType = "usps_first_class"
): string {
  const estimate = TRANSIT_ESTIMATES[mailType]

  const earliestArrival = new Date(sendDate)
  earliestArrival.setDate(
    earliestArrival.getDate() + estimate.transitDays - 2
  ) // Optimistic

  const latestArrival = new Date(sendDate)
  latestArrival.setDate(
    latestArrival.getDate() + estimate.transitDays + estimate.bufferDays
  )

  return `Expected arrival: ${earliestArrival.toLocaleDateString()} - ${latestArrival.toLocaleDateString()}`
}

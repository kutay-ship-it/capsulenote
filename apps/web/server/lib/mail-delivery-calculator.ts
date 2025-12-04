/**
 * Mail Delivery Calculator Engine
 *
 * Calculates optimal send dates for "arrive-by" mail delivery mode.
 *
 * Key concepts:
 * - transitDays: Estimated USPS transit time (varies by mail class and destination)
 * - bufferDays: Safety margin to account for delays
 * - earlyArrivalDays: Extra buffer so letters arrive BEFORE target date (not on it)
 * - sendDate: When to actually mail the letter (targetDate - transit - buffer - earlyArrival)
 *
 * Mail classes and typical transit times (domestic US):
 * - usps_first_class: 2-5 business days (average ~4 days)
 * - usps_standard: 3-10 business days (average ~7 days)
 *
 * International mail adds 5-7+ business days depending on destination region.
 * Only First Class is available for international delivery.
 *
 * @see https://docs.lob.com/node#section/Letter-Delivery-Time-Estimates
 * @see https://help.lob.com/print-and-mail/building-a-mail-strategy/international-mail
 */

export type MailType = "usps_first_class" | "usps_standard"

/**
 * Destination regions for transit time calculation
 * Based on USPS international mail delivery patterns
 */
export type DestinationRegion = "domestic" | "north_america" | "europe" | "asia_pacific" | "other"

export interface TransitEstimate {
  /** Estimated transit days for this mail class */
  transitDays: number
  /** Buffer days to add for safety */
  bufferDays: number
  /** Early arrival buffer (letters arrive before target date) */
  earlyArrivalDays: number
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
  /** Early arrival buffer days */
  earlyArrivalDays: number
  /** Mail type used for calculation */
  mailType: MailType
  /** Destination region used for calculation */
  region: DestinationRegion
  /** Whether the send date is in the past (too late to guarantee arrival) */
  isTooLate: boolean
  /** Earliest possible arrival if we send ASAP (when isTooLate is true) */
  earliestPossibleArrival?: Date
  /** Whether this is an international delivery */
  isInternational: boolean
}

/**
 * Early arrival buffer - letters should arrive 2 days BEFORE target date
 * This provides a safety margin for the recipient and accounts for variability
 */
const EARLY_ARRIVAL_DAYS = 2

/**
 * Transit time estimates by mail class (domestic US)
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
const DOMESTIC_TRANSIT_ESTIMATES: Record<MailType, Omit<TransitEstimate, 'earlyArrivalDays' | 'totalLeadDays'>> = {
  usps_first_class: {
    transitDays: 5, // Upper bound of 2-5 days
    bufferDays: 3, // Print time + safety margin
  },
  usps_standard: {
    transitDays: 8, // Conservative estimate within 3-10 days
    bufferDays: 4, // More buffer for slower class
  },
}

/**
 * Additional transit days for international destinations
 * Based on Lob documentation: "Expect international mail to take an additional 5-7 business days"
 * We use conservative estimates for each region
 *
 * Note: Only First Class Mail is available for international delivery
 */
const INTERNATIONAL_ADDITIONAL_DAYS: Record<Exclude<DestinationRegion, 'domestic'>, number> = {
  north_america: 5,   // Canada, Mexico - closest neighbors
  europe: 7,          // Western Europe, UK - reliable postal systems
  asia_pacific: 10,   // Australia, Japan, etc. - farther distance
  other: 12,          // South America, Africa, etc. - variable infrastructure
}

/**
 * Country code to region mapping
 * ISO 3166-1 alpha-2 country codes
 */
const COUNTRY_REGIONS: Record<string, DestinationRegion> = {
  // Domestic
  US: "domestic",

  // North America
  CA: "north_america", // Canada
  MX: "north_america", // Mexico

  // Europe (selected major destinations)
  GB: "europe", UK: "europe", // United Kingdom
  DE: "europe", // Germany
  FR: "europe", // France
  IT: "europe", // Italy
  ES: "europe", // Spain
  NL: "europe", // Netherlands
  BE: "europe", // Belgium
  AT: "europe", // Austria
  CH: "europe", // Switzerland
  IE: "europe", // Ireland
  PT: "europe", // Portugal
  SE: "europe", // Sweden
  NO: "europe", // Norway
  DK: "europe", // Denmark
  FI: "europe", // Finland
  PL: "europe", // Poland

  // Asia Pacific (selected major destinations)
  AU: "asia_pacific", // Australia
  NZ: "asia_pacific", // New Zealand
  JP: "asia_pacific", // Japan
  KR: "asia_pacific", // South Korea
  SG: "asia_pacific", // Singapore
  HK: "asia_pacific", // Hong Kong
  TW: "asia_pacific", // Taiwan

  // Everything else defaults to "other" in getRegionFromCountry()
}

/**
 * Get destination region from country code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "CA", "GB")
 * @returns Destination region for transit calculation
 */
export function getRegionFromCountry(countryCode: string | undefined | null): DestinationRegion {
  if (!countryCode) return "domestic" // Default to domestic if unknown
  const normalized = countryCode.toUpperCase().trim()
  return COUNTRY_REGIONS[normalized] ?? "other"
}

/**
 * Check if a country code represents an international destination
 */
export function isInternationalDestination(countryCode: string | undefined | null): boolean {
  return getRegionFromCountry(countryCode) !== "domestic"
}

/**
 * Get transit estimate for a mail type and destination
 *
 * @param mailType - USPS mail class
 * @param countryCode - Destination country code (ISO 3166-1 alpha-2)
 * @returns Complete transit estimate including early arrival buffer
 */
export function getTransitEstimate(
  mailType: MailType,
  countryCode?: string | null
): TransitEstimate {
  const region = getRegionFromCountry(countryCode)
  const isInternational = region !== "domestic"

  // International only supports First Class
  const effectiveMailType = isInternational ? "usps_first_class" : mailType
  const base = DOMESTIC_TRANSIT_ESTIMATES[effectiveMailType]

  // Add international transit days if applicable
  const internationalDays = isInternational
    ? INTERNATIONAL_ADDITIONAL_DAYS[region as Exclude<DestinationRegion, 'domestic'>]
    : 0

  // Add extra buffer for international (less reliable tracking)
  const internationalBuffer = isInternational ? 2 : 0

  const transitDays = base.transitDays + internationalDays
  const bufferDays = base.bufferDays + internationalBuffer
  const totalLeadDays = transitDays + bufferDays + EARLY_ARRIVAL_DAYS

  return {
    transitDays,
    bufferDays,
    earlyArrivalDays: EARLY_ARRIVAL_DAYS,
    totalLeadDays,
  }
}

/**
 * Minimum lead time in milliseconds (must send at least 5 minutes in future)
 */
const MIN_LEAD_TIME_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Calculate the optimal send date for arrive-by delivery mode
 *
 * Letters are scheduled to arrive 2 days BEFORE the target date to ensure
 * they're there when the recipient expects them.
 *
 * @param targetArrivalDate - User's desired arrival date
 * @param mailType - USPS mail class (affects transit time)
 * @param countryCode - Destination country (ISO 3166-1 alpha-2, e.g., "US", "CA", "GB")
 * @returns Calculation result with send date and transit estimates
 *
 * @example
 * ```ts
 * // Domestic US delivery
 * const result = calculateArriveByDate(
 *   new Date('2025-12-25'), // Want it by Christmas
 *   'usps_first_class',
 *   'US'
 * )
 * // result.sendDate will be ~10 days before (8 transit/buffer + 2 early arrival)
 *
 * // International delivery to UK
 * const intlResult = calculateArriveByDate(
 *   new Date('2025-12-25'),
 *   'usps_first_class',
 *   'GB'
 * )
 * // result.sendDate will be ~19 days before (17 transit/buffer + 2 early arrival)
 * ```
 */
export function calculateArriveByDate(
  targetArrivalDate: Date,
  mailType: MailType = "usps_first_class",
  countryCode?: string | null
): ArriveByCalculation {
  const region = getRegionFromCountry(countryCode)
  const isInternational = region !== "domestic"
  const estimate = getTransitEstimate(mailType, countryCode)
  const now = new Date()

  // Calculate send date: target - transitDays - bufferDays - earlyArrivalDays
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
    earlyArrivalDays: estimate.earlyArrivalDays,
    mailType: isInternational ? "usps_first_class" : mailType, // International only supports First Class
    region,
    isTooLate,
    earliestPossibleArrival,
    isInternational,
  }
}

/**
 * Validate if a target arrival date is achievable
 *
 * @param targetArrivalDate - Desired arrival date
 * @param mailType - USPS mail class
 * @param countryCode - Destination country code
 * @returns Validation result with suggested alternatives if not achievable
 */
export function validateArrivalDate(
  targetArrivalDate: Date,
  mailType: MailType = "usps_first_class",
  countryCode?: string | null
): {
  isAchievable: boolean
  calculation: ArriveByCalculation
  suggestion?: string
} {
  const calculation = calculateArriveByDate(targetArrivalDate, mailType, countryCode)

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
  if (calculation.isInternational) {
    suggestion = `International mail requires more lead time. The earliest possible arrival is ${calculation.earliestPossibleArrival!.toLocaleDateString()}.`
  } else if (daysDifference <= 3) {
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
 * not on the user's target arrival date. Letters will arrive ~2 days before
 * the target date.
 *
 * @param deliveryMode - "send_on" or "arrive_by"
 * @param userSelectedDate - The date the user selected in the UI
 * @param mailType - USPS mail class (only used for arrive_by)
 * @param countryCode - Destination country code (for international transit calculation)
 * @returns The date when we should actually trigger the mail send
 */
export function calculateJobScheduleDate(
  deliveryMode: "send_on" | "arrive_by",
  userSelectedDate: Date,
  mailType: MailType = "usps_first_class",
  countryCode?: string | null
): {
  scheduleDate: Date
  transitDays: number
  bufferDays: number
  earlyArrivalDays: number
  originalTargetDate: Date
  isInternational: boolean
} {
  if (deliveryMode === "send_on") {
    // For send_on mode, schedule directly on the user's selected date
    return {
      scheduleDate: userSelectedDate,
      transitDays: 0,
      bufferDays: 0,
      earlyArrivalDays: 0,
      originalTargetDate: userSelectedDate,
      isInternational: isInternationalDestination(countryCode),
    }
  }

  // For arrive_by mode, calculate the send date
  const calculation = calculateArriveByDate(userSelectedDate, mailType, countryCode)

  return {
    scheduleDate: calculation.sendDate,
    transitDays: calculation.transitDays,
    bufferDays: calculation.bufferDays,
    earlyArrivalDays: calculation.earlyArrivalDays,
    originalTargetDate: userSelectedDate,
    isInternational: calculation.isInternational,
  }
}

/**
 * Format arrival estimate for display in UI
 *
 * Shows a range of expected arrival dates. For arrive-by mode, letters
 * are expected to arrive 2 days before the target date.
 *
 * @param sendDate - When the letter will be sent
 * @param mailType - USPS mail class
 * @param countryCode - Destination country code
 * @returns Human-readable delivery estimate string
 */
export function formatDeliveryEstimate(
  sendDate: Date,
  mailType: MailType = "usps_first_class",
  countryCode?: string | null
): string {
  const estimate = getTransitEstimate(mailType, countryCode)
  const isInternational = isInternationalDestination(countryCode)

  // Calculate arrival window
  const earliestArrival = new Date(sendDate)
  earliestArrival.setDate(
    earliestArrival.getDate() + estimate.transitDays - 2
  ) // Optimistic

  const latestArrival = new Date(sendDate)
  latestArrival.setDate(
    latestArrival.getDate() + estimate.transitDays + estimate.bufferDays
  )

  const prefix = isInternational ? "Expected international arrival" : "Expected arrival"
  return `${prefix}: ${earliestArrival.toLocaleDateString()} - ${latestArrival.toLocaleDateString()}`
}

/**
 * Get the minimum required lead days for a destination
 *
 * Useful for UI date pickers to disable dates that are too soon
 *
 * @param mailType - USPS mail class
 * @param countryCode - Destination country code
 * @returns Minimum days in advance needed to schedule delivery
 */
export function getMinimumLeadDays(
  mailType: MailType = "usps_first_class",
  countryCode?: string | null
): number {
  const estimate = getTransitEstimate(mailType, countryCode)
  return estimate.totalLeadDays
}

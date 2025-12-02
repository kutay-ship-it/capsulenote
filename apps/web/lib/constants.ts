/**
 * Application Constants
 *
 * Centralized location for magic numbers, timing values, and limits.
 * Organized by domain for easy discovery and maintenance.
 *
 * @module lib/constants
 */

/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION = {
  /** Modal open delay */
  MODAL_OPEN: 500,
  /** Letter unlock reveal animation duration */
  UNLOCK_REVEAL: 2000,
  /** Toast notification display duration */
  TOAST_DURATION: 3000,
  /** Skeleton loading shimmer duration */
  SKELETON_SHIMMER: 1500,
  /** Page transition duration */
  PAGE_TRANSITION: 300,
  /** Debounce delay for input fields */
  DEBOUNCE_INPUT: 300,
  /** Debounce delay for search */
  DEBOUNCE_SEARCH: 500,
} as const

/**
 * Content limits
 */
export const LIMITS = {
  /** Maximum letter title length */
  LETTER_TITLE_MAX: 200,
  /** Maximum letter body length (characters) */
  LETTER_BODY_MAX: 50000,
  /** Maximum tags per letter */
  LETTER_TAGS_MAX: 10,
  /** Maximum tag length */
  TAG_LENGTH_MAX: 50,
  /** Maximum recipient name length */
  RECIPIENT_NAME_MAX: 100,
  /** Maximum file upload size (bytes) */
  FILE_UPLOAD_MAX: 2 * 1024 * 1024, // 2MB
  /** Maximum letters per page */
  LETTERS_PER_PAGE: 50,
  /** Maximum delivery history items */
  DELIVERY_HISTORY_MAX: 100,
} as const

/**
 * Timing intervals (in milliseconds)
 */
export const INTERVALS = {
  /** Autosave interval for letter editor */
  AUTOSAVE: 30000, // 30 seconds
  /** Eligibility cache TTL */
  ELIGIBILITY_CACHE: 5 * 60 * 1000, // 5 minutes
  /** Session refresh interval */
  SESSION_REFRESH: 15 * 60 * 1000, // 15 minutes
  /** Draft expiry time */
  DRAFT_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  /** Anonymous draft expiry */
  ANONYMOUS_DRAFT_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const

/**
 * Delivery-related constants
 */
export const DELIVERY = {
  /** Lock window before delivery (hours) */
  LOCK_WINDOW_HOURS: 72,
  /** Minimum delay before delivery (minutes) */
  MIN_DELAY_MINUTES: 5,
  /** Maximum scheduling years in future */
  MAX_YEARS_FUTURE: 100,
  /** Minimum lead time for physical mail (days) */
  MIN_PHYSICAL_MAIL_LEAD_DAYS: 30,
  /** Email delivery buffer (minutes) */
  EMAIL_BUFFER_MINUTES: 2,
  /** Backstop reconciler interval (minutes) */
  RECONCILER_INTERVAL_MINUTES: 5,
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
} as const

/**
 * Rate limiting thresholds
 */
export const RATE_LIMITS = {
  /** API requests per minute */
  API_PER_MINUTE: 100,
  /** Letter creation per hour */
  LETTERS_PER_HOUR: 10,
  /** Delivery scheduling per hour */
  DELIVERIES_PER_HOUR: 20,
  /** Contact form submissions per hour */
  CONTACT_PER_HOUR: 5,
  /** Webhook requests per minute */
  WEBHOOK_PER_MINUTE: 200,
  /** Share token views per hour */
  SHARE_TOKEN_PER_HOUR: 20,
} as const

/**
 * Credit system constants
 */
export const CREDITS = {
  /** Email credits per delivery */
  EMAIL_PER_DELIVERY: 1,
  /** Physical mail credits per delivery */
  PHYSICAL_PER_DELIVERY: 1,
  /** Trial physical mail credit */
  TRIAL_PHYSICAL: 1,
  /** Credit expiry warning days */
  EXPIRY_WARNING_DAYS: 7,
} as const

/**
 * UI breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint */
  MOBILE: 640,
  /** Tablet breakpoint */
  TABLET: 768,
  /** Desktop breakpoint */
  DESKTOP: 1024,
  /** Large desktop breakpoint */
  LARGE: 1280,
} as const

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  /** Letter view mode preference */
  VIEW_MODE: "capsulenote:view-mode",
  /** Letter autosave draft */
  LETTER_AUTOSAVE: "capsulenote:letter-autosave",
  /** Anonymous letter draft */
  ANONYMOUS_DRAFT: "capsulenote:anonymous-draft",
  /** Onboarding completion status */
  ONBOARDING_COMPLETE: "capsulenote:onboarding-complete",
  /** Theme preference */
  THEME: "capsulenote:theme",
  /** Locale preference */
  LOCALE: "capsulenote:locale",
} as const

/**
 * Error codes for client-facing errors
 */
export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: "auth_required",
  AUTH_EXPIRED: "auth_expired",
  UNAUTHORIZED: "unauthorized",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",

  // Validation
  VALIDATION_FAILED: "validation_failed",
  INVALID_INPUT: "invalid_input",

  // Resources
  NOT_FOUND: "not_found",
  ALREADY_EXISTS: "already_exists",

  // Credits
  INSUFFICIENT_CREDITS: "insufficient_credits",
  QUOTA_EXCEEDED: "quota_exceeded",

  // Delivery
  DELIVERY_LOCKED: "delivery_locked",
  DELIVERY_PAST_DUE: "delivery_past_due",

  // Server
  INTERNAL_ERROR: "internal_error",
  SERVICE_UNAVAILABLE: "service_unavailable",
} as const

/**
 * User-facing error messages (for consistent error UX)
 * Maps ERROR_CODES to human-readable messages
 */
export const ERROR_MESSAGES: Record<
  (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
  string
> = {
  // Authentication
  [ERROR_CODES.AUTH_REQUIRED]: "Please sign in to continue.",
  [ERROR_CODES.AUTH_EXPIRED]: "Your session has expired. Please sign in again.",
  [ERROR_CODES.UNAUTHORIZED]: "You don't have permission to perform this action.",

  // Rate limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]:
    "Too many requests. Please wait a moment and try again.",

  // Validation
  [ERROR_CODES.VALIDATION_FAILED]:
    "Some information is missing or incorrect. Please check and try again.",
  [ERROR_CODES.INVALID_INPUT]: "The provided information is invalid.",

  // Resources
  [ERROR_CODES.NOT_FOUND]: "The requested item could not be found.",
  [ERROR_CODES.ALREADY_EXISTS]: "This item already exists.",

  // Credits
  [ERROR_CODES.INSUFFICIENT_CREDITS]:
    "You don't have enough credits for this action.",
  [ERROR_CODES.QUOTA_EXCEEDED]: "You've reached your usage limit for this feature.",

  // Delivery
  [ERROR_CODES.DELIVERY_LOCKED]:
    "This delivery is locked and cannot be modified.",
  [ERROR_CODES.DELIVERY_PAST_DUE]:
    "The scheduled delivery time has already passed.",

  // Server
  [ERROR_CODES.INTERNAL_ERROR]:
    "Something went wrong on our end. Please try again later.",
  [ERROR_CODES.SERVICE_UNAVAILABLE]:
    "This service is temporarily unavailable. Please try again later.",
} as const

/**
 * Feature flags (for gradual rollout tracking)
 */
export const FEATURES = {
  /** Physical mail delivery */
  PHYSICAL_MAIL: "enable-physical-mail",
  /** Arrive-by delivery mode */
  ARRIVE_BY_MODE: "enable-arrive-by-mode",
  /** Letter templates */
  LETTER_TEMPLATES: "enable-letter-templates",
  /** Postmark email provider */
  POSTMARK_EMAIL: "use-postmark-email",
  /** ClickSend mail provider */
  CLICKSEND_MAIL: "use-clicksend-mail",
} as const

/**
 * Helper to get user-facing error message from error code
 * Falls back to generic message if code not found
 */
export function getErrorMessage(
  code: string,
  fallback = ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR]
): string {
  return (
    ERROR_MESSAGES[code as (typeof ERROR_CODES)[keyof typeof ERROR_CODES]] ??
    fallback
  )
}

import { ErrorCodes } from "@dearme/types"

/**
 * Error Recovery Utilities
 *
 * Helps determine if errors are retryable and provides user-friendly
 * error messages with recovery actions.
 */

/**
 * Error categories for UX
 */
export type ErrorCategory = "retryable" | "permanent" | "user_action_required"

/**
 * Error recovery information
 */
export interface ErrorRecoveryInfo {
  category: ErrorCategory
  userMessage: string
  technicalMessage: string
  canRetry: boolean
  supportContact: boolean
  suggestedAction?: string
}

/**
 * Retryable error codes - errors that can be retried automatically
 */
const RETRYABLE_ERRORS = new Set([
  ErrorCodes.EMAIL_SEND_FAILED,
  ErrorCodes.MAIL_SEND_FAILED,
  ErrorCodes.INTERNAL_ERROR,
  ErrorCodes.DATABASE_ERROR,
  "PROVIDER_TIMEOUT",
  "NETWORK_ERROR",
  "TEMPORARY_FAILURE",
])

/**
 * User action required errors - errors where user needs to do something
 */
const USER_ACTION_ERRORS = new Set([
  ErrorCodes.SUBSCRIPTION_REQUIRED,
  ErrorCodes.QUOTA_EXCEEDED,
  ErrorCodes.INSUFFICIENT_CREDITS,
  ErrorCodes.VALIDATION_FAILED,
  ErrorCodes.UNAUTHORIZED,
])

/**
 * Permanent errors - errors that cannot be fixed by retry
 */
const PERMANENT_ERRORS = new Set([
  ErrorCodes.NOT_FOUND,
  ErrorCodes.FORBIDDEN,
  "INVALID_ADDRESS",
  "RECIPIENT_BLOCKED",
  "DOMAIN_BLOCKED",
])

/**
 * Determine if an error is retryable
 */
export function isRetryableError(errorCode: string | undefined): boolean {
  if (!errorCode) return false
  return RETRYABLE_ERRORS.has(errorCode)
}

/**
 * Get error category from error code
 */
export function getErrorCategory(errorCode: string | undefined): ErrorCategory {
  if (!errorCode) return "retryable"

  if (RETRYABLE_ERRORS.has(errorCode)) return "retryable"
  if (USER_ACTION_ERRORS.has(errorCode)) return "user_action_required"
  if (PERMANENT_ERRORS.has(errorCode)) return "permanent"

  // Default to retryable for unknown errors (safer for UX)
  return "retryable"
}

/**
 * Get user-friendly error message and recovery info
 */
export function getErrorRecoveryInfo(
  errorCode: string | undefined,
  errorMessage: string | undefined
): ErrorRecoveryInfo {
  const category = getErrorCategory(errorCode)
  const technicalMessage = errorMessage || "Unknown error"

  // Default recovery info
  let userMessage = "Something went wrong with your delivery."
  let canRetry = category === "retryable"
  let supportContact = category === "permanent"
  let suggestedAction: string | undefined

  // Customize based on error code
  switch (errorCode) {
    case ErrorCodes.EMAIL_SEND_FAILED:
      userMessage = "Failed to send email delivery."
      suggestedAction = "Check that the recipient email address is valid and try again."
      break

    case ErrorCodes.MAIL_SEND_FAILED:
      userMessage = "Failed to send physical mail delivery."
      suggestedAction = "Check that the shipping address is valid and try again."
      break

    case ErrorCodes.SUBSCRIPTION_REQUIRED:
      userMessage = "Your subscription doesn't include this delivery method."
      canRetry = false
      suggestedAction = "Upgrade your plan to schedule this delivery."
      break

    case ErrorCodes.INSUFFICIENT_CREDITS:
      userMessage = "You don't have enough mail credits."
      canRetry = false
      suggestedAction = "Purchase more mail credits or upgrade your plan."
      break

    case ErrorCodes.QUOTA_EXCEEDED:
      userMessage = "You've reached your delivery limit for this period."
      canRetry = false
      suggestedAction = "Upgrade your plan or wait until next period."
      break

    case ErrorCodes.NOT_FOUND:
      userMessage = "The letter or delivery was not found."
      canRetry = false
      supportContact = true
      break

    case ErrorCodes.FORBIDDEN:
      userMessage = "You don't have permission to access this delivery."
      canRetry = false
      supportContact = true
      break

    case "INVALID_ADDRESS":
      userMessage = "The shipping address is invalid."
      canRetry = false
      suggestedAction = "Update the shipping address and try again."
      break

    case "RECIPIENT_BLOCKED":
      userMessage = "The recipient has blocked deliveries."
      canRetry = false
      supportContact = true
      break

    case "PROVIDER_TIMEOUT":
    case "NETWORK_ERROR":
      userMessage = "Network error while sending delivery."
      suggestedAction = "This is usually temporary. Try again in a few minutes."
      break

    case ErrorCodes.INTERNAL_ERROR:
    case ErrorCodes.DATABASE_ERROR:
      userMessage = "A system error occurred."
      suggestedAction = "This is usually temporary. Try again in a few minutes."
      break

    default:
      // Use technical message if available, otherwise generic message
      if (errorMessage && errorMessage.length < 200) {
        userMessage = errorMessage
      }
      suggestedAction = "Try again, or contact support if the problem persists."
  }

  return {
    category,
    userMessage,
    technicalMessage,
    canRetry,
    supportContact,
    suggestedAction,
  }
}

/**
 * Parse error from delivery lastError field
 * Expects format: "ERROR_CODE: Error message"
 */
export function parseDeliveryError(lastError: string | null): {
  code: string | undefined
  message: string | undefined
} {
  if (!lastError) {
    return { code: undefined, message: undefined }
  }

  const colonIndex = lastError.indexOf(':')
  if (colonIndex === -1) {
    // No error code, just message
    return { code: undefined, message: lastError.trim() }
  }

  const code = lastError.substring(0, colonIndex).trim()
  const message = lastError.substring(colonIndex + 1).trim()

  return { code, message }
}

/**
 * Support contact information
 */
export const SUPPORT_INFO = {
  email: "support@capsulenote.com",
  subject: "Delivery Failure Support",
  helpUrl: "/help/delivery-failures",
} as const

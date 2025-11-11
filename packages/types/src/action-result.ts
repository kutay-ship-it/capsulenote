/**
 * Standardized response type for Server Actions.
 *
 * This type enforces the "expected error pattern" where Server Actions
 * return errors instead of throwing them, making error handling more
 * predictable and type-safe.
 *
 * @template T - The type of data returned on success
 *
 * @example
 * // Server Action using ActionResult
 * export async function createLetter(input: unknown): Promise<ActionResult<Letter>> {
 *   try {
 *     const letter = await db.letter.create({ data })
 *     return { success: true, data: letter }
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: {
 *         code: 'CREATION_FAILED',
 *         message: 'Failed to create letter',
 *         details: error
 *       }
 *     }
 *   }
 * }
 *
 * @example
 * // Client Component consuming ActionResult
 * const result = await createLetter(data)
 * if (result.success) {
 *   // TypeScript knows result.data is Letter
 *   console.log(result.data.id)
 * } else {
 *   // TypeScript knows result.error exists
 *   toast.error(result.error.message)
 * }
 */
export type ActionResult<T = void> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: {
        /** Machine-readable error code for categorization */
        code: string
        /** Human-readable error message for users */
        message: string
        /** Optional additional error details (for logging, not user display) */
        details?: unknown
      }
    }

/**
 * Common error codes for DearMe application.
 * Use these for consistency across Server Actions.
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Operation errors
  CREATION_FAILED: 'CREATION_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',

  // Encryption
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',

  // External services
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  MAIL_SEND_FAILED: 'MAIL_SEND_FAILED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

/**
 * Type-safe error code
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

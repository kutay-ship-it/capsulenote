/**
 * Worker Error Classification System
 *
 * Defines error types and handling strategies for Inngest workers.
 * Distinguishes between retryable and non-retryable errors.
 */

/**
 * Base class for all worker errors
 */
export class WorkerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = true,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Retryable Errors - Transient failures that should be retried
 */

export class NetworkError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', true, metadata)
  }
}

export class RateLimitError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', true, metadata)
  }
}

export class ProviderTimeoutError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'PROVIDER_TIMEOUT', true, metadata)
  }
}

export class TemporaryProviderError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'TEMPORARY_PROVIDER_ERROR', true, metadata)
  }
}

export class DatabaseConnectionError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'DATABASE_CONNECTION_ERROR', true, metadata)
  }
}

/**
 * Non-Retryable Errors - Permanent failures that won't succeed on retry
 */

export class InvalidDeliveryError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'INVALID_DELIVERY', false, metadata)
  }
}

export class DecryptionError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'DECRYPTION_ERROR', false, metadata)
  }
}

export class InvalidEmailError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'INVALID_EMAIL', false, metadata)
  }
}

export class ProviderRejectionError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'PROVIDER_REJECTION', false, metadata)
  }
}

export class ConfigurationError extends WorkerError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', false, metadata)
  }
}

/**
 * Classifies errors from external providers
 */
export function classifyProviderError(error: any): WorkerError {
  const errorMessage = error?.message || String(error)
  const statusCode = error?.statusCode || error?.response?.status

  // Lob HTML size limit (non-retryable)
  if (
    error?.code === "LOB_HTML_TOO_LARGE" ||
    errorMessage.includes("LOB_HTML_TOO_LARGE") ||
    errorMessage.includes("HTML must be less than 10000")
  ) {
    return new ProviderRejectionError(errorMessage, {
      statusCode,
      originalError: error,
    })
  }

  // Network-related errors (retryable)
  if (
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('network')
  ) {
    return new NetworkError(errorMessage, { originalError: error })
  }

  // Rate limiting (retryable with backoff)
  if (statusCode === 429 || errorMessage.includes('rate limit')) {
    return new RateLimitError(errorMessage, {
      statusCode,
      originalError: error,
    })
  }

  // Timeout errors (retryable)
  if (
    statusCode === 408 ||
    statusCode === 504 ||
    errorMessage.includes('timeout')
  ) {
    return new ProviderTimeoutError(errorMessage, {
      statusCode,
      originalError: error,
    })
  }

  // Server errors (retryable - might be transient)
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return new TemporaryProviderError(errorMessage, {
      statusCode,
      originalError: error,
    })
  }

  // Client errors (non-retryable)
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    // Invalid email address
    if (statusCode === 400 && errorMessage.includes('email')) {
      return new InvalidEmailError(errorMessage, {
        statusCode,
        originalError: error,
      })
    }

    // Provider rejection (e.g., blocklist, spam)
    return new ProviderRejectionError(errorMessage, {
      statusCode,
      originalError: error,
    })
  }

  // Unknown error - assume retryable to be safe
  return new TemporaryProviderError(
    `Unknown provider error: ${errorMessage}`,
    {
      statusCode,
      originalError: error,
    }
  )
}

/**
 * Classifies database errors
 */
export function classifyDatabaseError(error: any): WorkerError {
  const errorMessage = error?.message || String(error)
  const code = error?.code

  // Connection errors (retryable)
  if (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    errorMessage.includes('connection') ||
    errorMessage.includes('connect')
  ) {
    return new DatabaseConnectionError(errorMessage, {
      code,
      originalError: error,
    })
  }

  // Constraint violations (non-retryable)
  if (
    code === 'P2002' || // Unique constraint
    code === 'P2003' || // Foreign key constraint
    code === 'P2025' // Record not found
  ) {
    return new InvalidDeliveryError(
      `Database constraint error: ${errorMessage}`,
      {
        code,
        originalError: error,
      }
    )
  }

  // Assume retryable for unknown database errors
  return new DatabaseConnectionError(
    `Database error: ${errorMessage}`,
    {
      code,
      originalError: error,
    }
  )
}

/**
 * Determines if an error should be retried
 */
export function shouldRetry(error: unknown, attemptCount: number): boolean {
  // Max attempts check
  if (attemptCount >= 5) {
    return false
  }

  // WorkerError has explicit retryable flag
  if (error instanceof WorkerError) {
    return error.retryable
  }

  // Unknown errors - retry up to max attempts
  return true
}

/**
 * Calculates exponential backoff delay
 */
export function calculateBackoff(
  attemptCount: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 60000
): number {
  const delay = Math.min(
    baseDelayMs * Math.pow(2, attemptCount),
    maxDelayMs
  )

  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)

  return Math.floor(delay + jitter)
}

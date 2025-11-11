/**
 * Structured logging utility for DearMe application.
 *
 * Provides consistent logging across Server Components, Server Actions, and API routes.
 * Uses console in development and structured JSON in production for easy parsing.
 *
 * Integration points for future observability:
 * - Sentry: Error tracking and alerting
 * - OpenTelemetry: Distributed tracing
 * - LogDrain: Centralized log aggregation
 */

import { auth } from "@clerk/nextjs/server"

/**
 * Log levels following standard severity hierarchy
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Structured log context for enriching log entries
 */
export interface LogContext {
  /** User ID if available from Clerk auth */
  userId?: string
  /** Request path or operation identifier */
  pathname?: string
  /** Correlation ID for tracing requests across services */
  requestId?: string
  /** Additional structured data */
  [key: string]: unknown
}

/**
 * Log entry structure for JSON output
 */
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    // JSON format for production parsing
    return JSON.stringify(entry)
  } else {
    // Human-readable format for development
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
    const error = entry.error ? `\n  Error: ${entry.error.message}${entry.error.stack ? `\n${entry.error.stack}` : ''}` : ''

    return `[${timestamp}] ${level} ${entry.message}${context}${error}`
  }
}

/**
 * Get current user context from Clerk auth (server-side only)
 */
async function getUserContext(): Promise<{ userId?: string }> {
  try {
    const { userId } = await auth()
    return userId ? { userId } : {}
  } catch {
    // Auth not available (e.g., in API routes without middleware)
    return {}
  }
}

/**
 * Core logging function
 */
async function log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
  const userContext = await getUserContext()

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: {
      ...userContext,
      ...context,
    },
  }

  const formattedLog = formatLogEntry(entry)

  // Output to appropriate console method
  switch (level) {
    case 'debug':
      console.debug(formattedLog)
      break
    case 'info':
      console.info(formattedLog)
      break
    case 'warn':
      console.warn(formattedLog)
      break
    case 'error':
      console.error(formattedLog)
      break
  }

  // TODO: Send to Sentry in production for error level
  // if (level === 'error' && process.env.NODE_ENV === 'production') {
  //   Sentry.captureMessage(message, {
  //     level: 'error',
  //     contexts: { context: entry.context },
  //   })
  // }
}

/**
 * Log error with full context and stack trace
 */
async function logError(
  message: string,
  error: Error | unknown,
  context?: LogContext
): Promise<void> {
  const userContext = await getUserContext()

  const errorDetails = error instanceof Error
    ? {
        message: error.message,
        stack: error.stack,
        code: (error as { code?: string }).code,
      }
    : {
        message: String(error),
      }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    context: {
      ...userContext,
      ...context,
    },
    error: errorDetails,
  }

  const formattedLog = formatLogEntry(entry)
  console.error(formattedLog)

  // TODO: Send to Sentry with full error object
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, {
  //     contexts: { context: entry.context },
  //   })
  // }
}

/**
 * Structured logger with convenience methods
 */
export const logger = {
  /**
   * Debug-level logging for development troubleshooting
   * Not emitted in production
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      return log('debug', message, context)
    }
  },

  /**
   * Info-level logging for general application flow
   */
  info: (message: string, context?: LogContext) => log('info', message, context),

  /**
   * Warning-level logging for recoverable issues
   */
  warn: (message: string, context?: LogContext) => log('warn', message, context),

  /**
   * Error-level logging with automatic error tracking
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (error) {
      return logError(message, error, context)
    } else {
      return log('error', message, context)
    }
  },
}

/**
 * Create logger with preset context for a specific operation
 *
 * @example
 * const opLogger = createOperationLogger('create-letter', { letterId: 'abc123' })
 * await opLogger.info('Starting letter creation')
 * await opLogger.error('Failed to encrypt content', error)
 */
export function createOperationLogger(operation: string, baseContext?: LogContext) {
  return {
    debug: (message: string, additionalContext?: LogContext) =>
      logger.debug(message, { operation, ...baseContext, ...additionalContext }),
    info: (message: string, additionalContext?: LogContext) =>
      logger.info(message, { operation, ...baseContext, ...additionalContext }),
    warn: (message: string, additionalContext?: LogContext) =>
      logger.warn(message, { operation, ...baseContext, ...additionalContext }),
    error: (message: string, error?: Error | unknown, additionalContext?: LogContext) =>
      logger.error(message, error, { operation, ...baseContext, ...additionalContext }),
  }
}

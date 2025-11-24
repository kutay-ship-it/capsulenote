/**
 * Structured Logger for Inngest Workers
 *
 * Provides JSON-formatted logs compatible with:
 * - AWS CloudWatch Logs Insights
 * - Datadog
 * - LogDNA
 * - Vercel Logs
 * - Most log aggregators
 *
 * Usage:
 * ```typescript
 * import { createLogger, logger } from "../lib/logger"
 *
 * // Use default logger
 * logger.info("Processing delivery", { deliveryId: "123" })
 *
 * // Create logger with persistent context
 * const log = createLogger({ deliveryId: "123", step: "decrypt" })
 * log.info("Decrypting letter") // deliveryId and step included automatically
 * ```
 */

export interface LogMeta extends Record<string, unknown> {
  deliveryId?: string
  letterId?: string
  userId?: string
  step?: string
  attempt?: number
  error?: string
  errorType?: string
}

export interface Logger {
  info: (message: string, meta?: LogMeta) => void
  warn: (message: string, meta?: LogMeta) => void
  error: (message: string, meta?: LogMeta) => void
  debug: (message: string, meta?: LogMeta) => void
}

/**
 * Create a logger with optional persistent context
 *
 * @param context - Key-value pairs to include in every log entry
 * @returns Logger instance with info, warn, error, and debug methods
 */
export function createLogger(context?: LogMeta): Logger {
  const log = (level: string, message: string, meta?: LogMeta) => {
    const entry = JSON.stringify({
      level,
      message,
      ...context,
      ...meta,
      timestamp: new Date().toISOString(),
      service: "inngest-worker",
    })

    switch (level) {
      case "error":
        console.error(entry)
        break
      case "warn":
        console.warn(entry)
        break
      case "debug":
        // Only log debug in development or when LOG_LEVEL=debug
        if (process.env.NODE_ENV === "development" || process.env.LOG_LEVEL === "debug") {
          console.debug(entry)
        }
        break
      default:
        console.log(entry)
    }
  }

  return {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta),
  }
}

/**
 * Default logger instance (no persistent context)
 */
export const logger = createLogger()

/**
 * Log buffer serialization detection event
 *
 * This is a specialized logging function for detecting when Buffer objects
 * have been serialized across Inngest step boundaries. This is a critical
 * warning that indicates data may be corrupted.
 *
 * @param fieldName - Name of the field that contained serialized Buffer
 * @param stepName - Name of the Inngest step where detection occurred
 * @param meta - Additional context
 */
export function logBufferSerializationDetected(
  fieldName: string,
  stepName: string,
  meta?: LogMeta
): void {
  logger.warn("BUFFER_SERIALIZATION_DETECTED", {
    fieldName,
    step: stepName,
    severity: "high",
    recommendation: "Fetch encrypted data fresh inside the step that needs it",
    ...meta,
  })
}

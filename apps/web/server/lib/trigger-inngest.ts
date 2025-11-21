/**
 * Helper to trigger Inngest events from Server Actions
 *
 * Uses inngest.send() to trigger events with retry logic and exponential backoff.
 * If all retries fail, logs error but returns success to allow backstop reconciler to catch it.
 */

export interface TriggerInngestOptions {
  /** Number of retry attempts (default: 3) */
  retries?: number
  /** Base delay in ms for exponential backoff (default: 1000ms) */
  baseDelayMs?: number
  /** Whether to log each attempt (default: true) */
  verbose?: boolean
}

export async function triggerInngestEvent(
  eventName: string,
  data: Record<string, unknown>,
  options: TriggerInngestOptions = {}
) {
  const {
    retries = 3,
    baseDelayMs = 1000,
    verbose = true,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Dynamic import to get fresh instance
      const { inngest } = await import("@dearme/inngest")

      // Send event using Inngest SDK
      // In dev mode without Dev Server, this will queue locally
      // In production, this sends to Inngest Cloud
      const ids = await inngest.send({
        name: eventName,
        data,
      })

      if (verbose || attempt > 1) {
        console.log(`Inngest event sent: ${eventName}`, {
          ids,
          data,
          attempt,
          retriesUsed: attempt - 1,
        })
      }

      return { success: true, ids }
    } catch (error) {
      lastError = error as Error
      const isLastAttempt = attempt === retries

      console.error(
        `Failed to trigger Inngest event (attempt ${attempt}/${retries}):`,
        {
          eventName,
          error: error instanceof Error ? error.message : String(error),
          willRetry: !isLastAttempt,
        }
      )

      if (!isLastAttempt) {
        // Calculate exponential backoff with jitter
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt - 1), // Exponential: 1s, 2s, 4s
          30000 // Max 30s
        )
        const jitter = Math.random() * 0.2 * delay // ±20% jitter
        const totalDelay = Math.floor(delay + jitter)

        console.log(`Retrying in ${totalDelay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, totalDelay))
      }
    }
  }

  // All retries failed
  console.error(
    `Failed to trigger Inngest event after ${retries} attempts:`,
    {
      eventName,
      data,
      lastError: lastError?.message || "Unknown error",
      note: "This will be caught by backstop reconciler",
    }
  )

  // Return success anyway - backstop reconciler will catch it
  // This prevents blocking the main operation (e.g., delivery creation)
  return {
    success: true, // "Success" means operation completed, not that event was sent
    retriesFailed: true,
    willBeReconciled: true,
  }
}

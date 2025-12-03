import { logger } from "./logger"

/**
 * Helper to trigger Inngest events from Server Actions
 *
 * Uses inngest.send() to trigger events
 */

export async function triggerInngestEvent(eventName: string, data: Record<string, unknown>): Promise<string> {
  try {
    // Dynamic import to get fresh instance
    const { inngest } = await import("@dearme/inngest")

    // Send event using Inngest SDK
    // In dev mode without Dev Server, this will queue locally
    // In production, this sends to Inngest Cloud
    const result = await inngest.send({
      name: eventName,
      data,
    })

    // Inngest SDK returns { ids: string[] } for send()
    // Type guard to handle SDK response properly
    type InngestSendResult = { ids: string[] } | string[]
    const typedResult = result as InngestSendResult

    const ids: string[] = Array.isArray(typedResult)
      ? typedResult
      : Array.isArray(typedResult.ids)
        ? typedResult.ids
        : []

    const eventId = ids[0] ?? null

    if (!eventId) {
      await logger.error("[Inngest] No event ID returned", undefined, { eventName, result, data })
      throw new Error("Inngest did not return an event ID")
    }

    await logger.info("[Inngest] Event sent", { eventName, eventId })
    // Return event ID (not run ID - run ID is assigned when function executes)
    return eventId
  } catch (error) {
    await logger.error("[Inngest] Failed to trigger event", error, { eventName })
    throw error
  }
}

/**
 * Cancel an Inngest run by its ID
 *
 * @deprecated This function sends a cancellation event that is NOT currently handled.
 * Actual delivery cancellation is done by updating the delivery status to "canceled"
 * in the database, which the Inngest job checks after waking from sleep.
 * See: workers/inngest/functions/deliver-email.ts (post-sleep validation)
 *
 * This function is kept for backwards compatibility but is effectively a no-op.
 * The recommended approach is to update delivery.status = "canceled" directly.
 *
 * @param runId - The Inngest run ID (unused - event is not handled)
 * @returns true (always - actual cancellation happens via DB status)
 */
export async function cancelInngestRun(runId: string): Promise<boolean> {
  // Note: This event is not handled by any Inngest function.
  // Cancellation is achieved by setting delivery.status = "canceled"
  // which the Inngest job checks after sleep.
  await logger.info("[Inngest] cancelInngestRun called (deprecated)", { runId })
  return true
}

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
 * Used when canceling scheduled deliveries (e.g., letter deletion)
 *
 * @param runId - The Inngest run ID to cancel
 * @returns true if cancellation was successful
 */
export async function cancelInngestRun(runId: string): Promise<boolean> {
  try {
    const { inngest } = await import("@dearme/inngest")

    // Note: The Inngest SDK's cancel method works at the function level
    // For run-level cancellation, we need to use the REST API or send a cancellation event
    // For now, we'll send a cancellation event that the function can check
    await inngest.send({
      name: "delivery/cancel.requested",
      data: { runId },
    })

    await logger.info("[Inngest] Run cancellation requested", { runId })
    return true
  } catch (error) {
    await logger.error("[Inngest] Failed to cancel run", error, { runId })
    return false
  }
}

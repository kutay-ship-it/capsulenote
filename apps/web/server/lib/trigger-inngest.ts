/**
 * Helper to trigger Inngest events from Server Actions
 *
 * Uses inngest.send() to trigger events
 */

export async function triggerInngestEvent(eventName: string, data: Record<string, unknown>): Promise<string | null> {
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

    // Extract first run ID from the array
    const runId = Array.isArray(ids) && ids.length > 0 ? ids[0] : null
    console.log(`Inngest event sent: ${eventName}`, { runId, data })
    return runId
  } catch (error) {
    console.error("Failed to trigger Inngest event:", error)
    throw error
  }
}

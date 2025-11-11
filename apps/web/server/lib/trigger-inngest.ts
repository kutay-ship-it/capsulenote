/**
 * Helper to trigger Inngest events from Server Actions
 *
 * Uses inngest.send() to trigger events
 */

export async function triggerInngestEvent(eventName: string, data: Record<string, unknown>) {
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

    console.log(`Inngest event sent: ${eventName}`, { ids, data })
    return { success: true, ids }
  } catch (error) {
    console.error("Failed to trigger Inngest event:", error)
    throw error
  }
}

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

    // Inngest v3 returns { ids: string[] }, but older mocks can return a raw array
    const ids = Array.isArray(result)
      ? result
      : Array.isArray((result as any)?.ids)
      ? (result as any).ids
      : []

    const eventId = ids.find((id: unknown) => typeof id === "string") ?? null

    if (!eventId) {
      console.error(`Inngest send() returned no event ID for: ${eventName}`, { result, data })
      throw new Error("Inngest did not return an event ID")
    }

    console.log(`Inngest event sent: ${eventName}`, { eventId, data })
    // Return event ID (not run ID - run ID is assigned when function executes)
    return eventId
  } catch (error) {
    console.error("Failed to trigger Inngest event:", error)
    throw error
  }
}

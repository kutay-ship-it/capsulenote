"use client"

import { useEffect } from "react"

const CHANNEL_NAME = "capsule-credits"

/**
 * Hook to listen for credit update broadcasts from other tabs.
 * Used to sync credit state after Stripe checkout completes in a different tab.
 *
 * @example
 * useCreditsUpdateListener(() => {
 *   refreshCredits()
 *   toast.success("Credits updated!")
 * })
 */
export function useCreditsUpdateListener(onCreditsUpdated: () => void): void {
  useEffect(() => {
    // BroadcastChannel not supported in all browsers (Safari < 15.4)
    if (typeof BroadcastChannel === "undefined") {
      return
    }

    const channel = new BroadcastChannel(CHANNEL_NAME)

    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === "credits_updated") {
        onCreditsUpdated()
      }
    }

    return () => {
      channel.close()
    }
  }, [onCreditsUpdated])
}

/**
 * Broadcast a credit update to all other tabs.
 * Called from the credits success page after Stripe checkout completes.
 */
export function broadcastCreditsUpdated(): void {
  // BroadcastChannel not supported in all browsers
  if (typeof BroadcastChannel === "undefined") {
    return
  }

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ type: "credits_updated" })
    channel.close()
  } catch (error) {
    console.warn("Failed to broadcast credits update:", error)
  }
}

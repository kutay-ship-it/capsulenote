"use client"

import { useEffect } from "react"
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs"
import { detectBrowserTimezone } from "@/lib/timezone"

/**
 * SSO Callback Page
 *
 * Handles OAuth/SSO redirect callbacks using Clerk's AuthenticateWithRedirectCallback.
 * Also detects and stores the user's browser timezone in Clerk metadata for new users.
 */
export default function SSOCallbackPage() {
  return (
    <>
      <TimezoneDetectionOnAuth />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/journey"
        signUpFallbackRedirectUrl="/journey"
      />
    </>
  )
}

/**
 * Silent component that detects and stores timezone after OAuth authentication
 */
function TimezoneDetectionOnAuth() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function storeTimezone() {
      if (!isLoaded || !user) return

      // Only set timezone if user doesn't already have one in metadata
      const existingTimezone = user.unsafeMetadata?.detectedTimezone
      if (existingTimezone) return

      const detectedTimezone = detectBrowserTimezone()
      if (!detectedTimezone) return

      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            detectedTimezone,
          },
        })
      } catch (error) {
        // Non-critical - timezone can be set later
        console.warn("[Timezone] Failed to store timezone on SSO callback:", error)
      }
    }

    storeTimezone()
  }, [user, isLoaded])

  return null
}

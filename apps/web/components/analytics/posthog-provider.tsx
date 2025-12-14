"use client"

/**
 * PostHog Analytics Provider
 *
 * Client Component that initializes PostHog for product analytics.
 * Handles pageview tracking on route changes.
 *
 * Environment Variables:
 * - NEXT_PUBLIC_POSTHOG_KEY: PostHog project API key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog instance URL
 *
 * Features:
 * - Page view tracking (manual for Next.js App Router)
 * - Feature flags (optional)
 * - Session recording (optional)
 * - User identification (via Clerk)
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { PostHogProvider } from "@/components/analytics/posthog-provider"
 * // Wrap children in body
 * <PostHogProvider>{children}</PostHogProvider>
 * ```
 */

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"

// Initialize PostHog
if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (key && host && process.env.NODE_ENV === "production") {
    posthog.init(key, {
      api_host: host,
      // Privacy-focused defaults
      capture_pageview: false, // Manual tracking for Next.js
      capture_pageleave: true,
      autocapture: false, // Explicit event tracking only
      persistence: "localStorage",
      // Feature flags
      bootstrap: {
        featureFlags: {},
      },
      // Session recording (disabled by default)
      disable_session_recording: true,
      // Respect Do Not Track
      respect_dnt: true,
      // Cookie settings
      secure_cookie: true,
    })
  }
}

/**
 * PostHog Provider Component
 * Wraps the application and provides PostHog context
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

/**
 * Page View Tracker
 * Tracks page views on route changes in Next.js App Router
 */
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (pathname && posthogClient) {
      // Build full URL for tracking
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }

      posthogClient.capture("$pageview", {
        $current_url: url,
        $pathname: pathname,
      })
    }
  }, [pathname, searchParams, posthogClient])

  return null
}

/**
 * Identify user for PostHog tracking
 * Call this after Clerk authentication
 *
 * Usage:
 * ```tsx
 * import { identifyUser } from "@/components/analytics/posthog-provider"
 * identifyUser(user.id, { email: user.email })
 * ```
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetUser() {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.reset()
  }
}

/**
 * Track custom events
 *
 * Usage:
 * ```tsx
 * import { trackPostHogEvent } from "@/components/analytics/posthog-provider"
 * trackPostHogEvent("letter_created", { template: "new-year" })
 * ```
 */
export function trackPostHogEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

/**
 * Predefined events for Capsule Note
 */
export const PostHogEvents = {
  // User events
  signUp: (method: string) => trackPostHogEvent("user_signed_up", { method }),
  signIn: (method: string) => trackPostHogEvent("user_signed_in", { method }),

  // Letter events
  letterCreated: (templateId?: string) =>
    trackPostHogEvent("letter_created", { template_id: templateId || "blank" }),
  letterScheduled: (deliveryType: "email" | "mail", daysUntilDelivery: number) =>
    trackPostHogEvent("letter_scheduled", {
      delivery_type: deliveryType,
      days_until_delivery: daysUntilDelivery,
    }),
  letterOpened: () => trackPostHogEvent("letter_opened"),

  // Subscription events
  subscriptionStarted: (plan: string, price: number) =>
    trackPostHogEvent("subscription_started", { plan, price }),
  subscriptionCanceled: (plan: string) =>
    trackPostHogEvent("subscription_canceled", { plan }),

  // Engagement events
  templateViewed: (category: string, slug: string) =>
    trackPostHogEvent("template_viewed", { category, slug }),
  guideViewed: (slug: string) => trackPostHogEvent("guide_viewed", { slug }),
  promptUsed: (theme: string) => trackPostHogEvent("prompt_used", { theme }),
} as const

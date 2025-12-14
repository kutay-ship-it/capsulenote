/**
 * Google Analytics 4 Integration
 *
 * Server Component that injects GA4 tracking scripts.
 * Uses Next.js Script component for optimal loading (afterInteractive).
 *
 * Environment Variables:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: GA4 measurement ID (G-XXXXXXXXXX)
 *
 * Features:
 * - Page view tracking (automatic)
 * - Enhanced measurement (scrolls, outbound clicks, site search)
 * - Conversion events (custom)
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { GoogleAnalytics } from "@/components/analytics/google-analytics"
 * // In <head>
 * <GoogleAnalytics />
 * ```
 */

import Script from "next/script"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  // Don't render in development or if no measurement ID
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== "production") {
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      {/* GA4 Configuration */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  )
}

/**
 * Track custom events in GA4
 *
 * Usage:
 * ```tsx
 * import { trackEvent } from "@/components/analytics/google-analytics"
 * trackEvent("sign_up", { method: "email" })
 * ```
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams)
  }
}

/**
 * Track conversion events
 *
 * Predefined events for Capsule Note:
 * - sign_up: User registration
 * - letter_created: New letter created
 * - letter_scheduled: Letter scheduled for delivery
 * - subscription_started: Paid subscription began
 */
export const ConversionEvents = {
  signUp: (method: string) => trackEvent("sign_up", { method }),
  letterCreated: () => trackEvent("letter_created"),
  letterScheduled: (deliveryType: "email" | "mail") =>
    trackEvent("letter_scheduled", { delivery_type: deliveryType }),
  subscriptionStarted: (plan: string) =>
    trackEvent("subscription_started", { plan }),
} as const

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

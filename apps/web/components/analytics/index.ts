/**
 * Analytics Components
 *
 * Centralized exports for analytics integrations.
 *
 * Setup:
 * 1. Add GoogleAnalytics in <head> of layout.tsx
 * 2. Wrap children with PostHogProvider in <body>
 *
 * Environment Variables:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: Google Analytics 4 ID
 * - NEXT_PUBLIC_POSTHOG_KEY: PostHog API key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog instance URL
 */

// Google Analytics
export { GoogleAnalytics, trackEvent, ConversionEvents } from "./google-analytics"

// PostHog
export {
  PostHogProvider,
  identifyUser,
  resetUser,
  trackPostHogEvent,
  PostHogEvents,
} from "./posthog-provider"

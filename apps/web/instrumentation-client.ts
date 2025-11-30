// This file configures client-side instrumentation for analytics and error tracking.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// https://posthog.com/docs/libraries/next-js

import * as Sentry from "@sentry/nextjs"
import posthog from "posthog-js"

// Initialize PostHog for analytics
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Use the 2025-05-24 defaults for best practices
    defaults: "2025-05-24",
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture pageleave events for session recording
    capture_pageleave: true,
    // Disable in development unless explicitly enabled
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        // Optionally disable in development
        // posthog.opt_out_capturing()
      }
    },
  })
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable Replay to capture session recordings
  replaysOnErrorSampleRate: 1.0,

  // Sample rate for session replay. Set to 0 in development.
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Integrate with React Router for better error boundaries
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: "system",
      isNameRequired: false,
      isEmailRequired: false,
    }),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors that are typically not actionable
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // User cancellation
    "AbortError",
    // Benign resize observer errors
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],

  // Don't send errors in development
  enabled: process.env.NODE_ENV === "production",
})

// Export the router transition start hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

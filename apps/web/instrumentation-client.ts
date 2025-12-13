// This file configures client-side instrumentation for analytics and error tracking.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

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

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

/**
 * Next-intl Middleware Configuration
 *
 * CRITICAL: localeDetection is set to FALSE to prevent automatic redirects
 * based on Accept-Language headers. This ensures Google and other crawlers
 * always receive the URL they request without redirects.
 *
 * Locale Strategy:
 * - Default locale (en): Served at / without prefix
 * - Turkish locale: Served at /tr with prefix
 * - NO automatic redirects based on browser language
 * - Client-side LocaleDetector component handles user locale suggestions
 *
 * This configuration ensures:
 * ✅ No server-side redirects (prevents "redirect" issues in Google Search Console)
 * ✅ Crawlers can index all pages without redirect chains
 * ✅ hreflang tags work correctly (defined in page metadata)
 * ✅ Users can still switch languages via UI
 */
const intlMiddleware = createMiddleware({
  ...routing,
  // CRITICAL: Disable automatic locale detection to prevent redirects
  localeDetection: false,
})

const isProtectedRoute = createRouteMatcher([
  "/journey(.*)",
  "/:locale/journey(.*)",
  "/letters(.*)",
  "/:locale/letters(.*)",
  "/unlock(.*)",
  "/:locale/unlock(.*)",
  "/settings(.*)",
  "/:locale/settings(.*)",
  "/admin(.*)",
  "/:locale/admin(.*)",
])

// Next.js 16: proxy.ts replaces middleware.ts
// Runs on Node.js runtime (not Edge)
export const proxy = clerkMiddleware(async (auth, req) => {
  // Skip i18n for API routes (webhooks, Inngest, etc. don't need localization)
  if (req.nextUrl.pathname.startsWith("/api/")) {
    // Check if route is protected and enforce auth
    if (isProtectedRoute(req)) {
      await auth.protect()
    }
    return // Early return for API routes
  }

  // Check if route is protected and enforce auth
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Apply i18n middleware for non-API routes
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
}

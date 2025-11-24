import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/:locale/dashboard(.*)",
  "/letters(.*)",
  "/:locale/letters(.*)",
  "/deliveries(.*)",
  "/:locale/deliveries(.*)",
  "/settings(.*)",
  "/:locale/settings(.*)",
  "/admin(.*)",
  "/:locale/admin(.*)",
  "/sandbox(.*)",
  "/:locale/sandbox(.*)",
])

export default clerkMiddleware(async (auth, req) => {
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

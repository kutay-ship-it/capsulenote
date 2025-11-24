import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

const handleI18nRouting = createMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/letters(.*)",
  "/:locale/deliveries(.*)",
  "/:locale/settings(.*)",
  "/:locale/admin(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return handleI18nRouting(request)
})

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
}

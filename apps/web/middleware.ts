import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/", // Landing
  "/write-letter(.*)", // Try-before-signup editor
  "/pricing(.*)",
  "/demo-letter(.*)",
  "/subscribe(.*)", // Paywall/anonymous checkout
  "/checkout(.*)", // Stripe success/cancel redirects
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/api/webhooks(.*)",
  "/api/inngest(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

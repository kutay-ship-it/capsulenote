/**
 * Checkout Success Page
 *
 * Handles post-checkout flow with webhook delay handling.
 * Polls for subscription creation for up to 10 seconds.
 *
 * Server Component - performs initial polling server-side for performance.
 */

import { redirect } from "next/navigation"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { CheckoutSuccess } from "./_components/checkout-success"
import { CheckoutProcessing } from "./_components/checkout-processing"

interface CheckoutSuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

/**
 * Wait utility for server-side polling
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Force dynamic rendering - page requires auth and searchParams
export const dynamic = 'force-dynamic'

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const user = await requireUser()

  // Require session_id parameter
  if (!searchParams.session_id) {
    redirect("/dashboard")
  }

  // Poll for subscription (webhook may still be processing)
  // Try up to 10 times with 1-second intervals (10 seconds total)
  let subscription = null
  const maxAttempts = 10
  const pollInterval = 1000 // 1 second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["active", "trialing"] },
      },
      orderBy: { createdAt: "desc" },
    })

    if (subscription) {
      // Subscription found!
      break
    }

    // Don't wait after last attempt
    if (attempt < maxAttempts - 1) {
      await wait(pollInterval)
    }
  }

  // If subscription not found after polling, show loading state with client-side fallback
  if (!subscription) {
    return <CheckoutProcessing sessionId={searchParams.session_id} />
  }

  // Success! Show subscription details
  return <CheckoutSuccess subscription={subscription} />
}

/**
 * Metadata for SEO and social sharing
 */
export const metadata = {
  title: "Checkout Success | DearMe",
  description: "Your subscription is being activated",
  robots: {
    index: false,
    follow: false,
  },
}

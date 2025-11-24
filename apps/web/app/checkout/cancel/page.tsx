/**
 * Checkout Cancel Page
 *
 * Shown when user cancels checkout or navigates back from Stripe.
 * Provides reassurance and clear paths forward.
 *
 * Server Component - no client-side logic needed.
 */

import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutCancelPage() {
  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Checkout Canceled</CardTitle>
          <CardDescription className="text-base">
            No worries! You can return to pricing and try again whenever you're ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account remains on the free plan. You can upgrade at any time to unlock:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Unlimited letters and email deliveries</li>
              <li>• Physical mail delivery</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button asChild size="lg" className="flex-1">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Have questions?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Metadata for SEO
 */
export const metadata = {
  title: "Checkout Canceled | Capsule Note",
  description: "Checkout was canceled",
  alternates: {
    canonical: "/checkout/cancel",
  },
  robots: {
    index: false,
    follow: false,
  },
}

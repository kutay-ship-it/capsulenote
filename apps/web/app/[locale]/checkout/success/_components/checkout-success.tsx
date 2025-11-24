/**
 * Checkout Success Component
 *
 * Displays success message with subscription details and trial information.
 * Server Component - receives subscription data from parent.
 */

import { Link } from "@/i18n/routing"
import { CheckCircle2, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Subscription } from "@dearme/prisma"

interface CheckoutSuccessProps {
  subscription: Subscription
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(date)
}

/**
 * Calculate days remaining in trial
 */
function getDaysRemaining(endDate: Date): number {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function CheckoutSuccess({ subscription }: CheckoutSuccessProps) {
  const isTrialing = subscription.status === "trialing"
  const trialEndsAt = subscription.currentPeriodEnd
  const daysRemaining = getDaysRemaining(trialEndsAt)

  return (
    <div className="container max-w-3xl mx-auto py-16">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Capsule Note Pro!</h1>
        <p className="text-lg text-muted-foreground">
          Your subscription has been successfully activated
        </p>
      </div>

      {/* Subscription Details */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Subscription Details</CardTitle>
            <Badge variant={isTrialing ? "default" : "secondary"} className="uppercase">
              {isTrialing ? "Trial Active" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Capsule Note Pro</h3>
              <p className="text-sm text-muted-foreground">
                Unlimited letters, email deliveries, and physical mail credits
              </p>
            </div>
          </div>

          {/* Trial Info */}
          {isTrialing && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">14-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {daysRemaining > 0
                    ? `Your trial ends on ${formatDate(trialEndsAt)} (${daysRemaining} days remaining)`
                    : "Your trial is ending soon"}
                </p>
                <p className="text-sm text-muted-foreground">
                  You won't be charged until your trial ends. Cancel anytime before then.
                </p>
              </div>
            </div>
          )}

          {/* Features Summary */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">What's included:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Create unlimited letters to your future self</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Schedule unlimited email deliveries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>2 physical mail credits per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="flex-1 sm:flex-initial">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-initial">
          <Link href="/letters/new">Write Your First Letter</Link>
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          A confirmation email has been sent to your inbox.
        </p>
        <p>
          Manage your subscription anytime in{" "}
          <Link href="/settings/billing" className="text-primary hover:underline">
            billing settings
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

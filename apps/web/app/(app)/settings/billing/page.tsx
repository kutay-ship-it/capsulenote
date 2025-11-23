import { getCurrentUser } from "@/server/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/server/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SubscriptionStatus } from "./_components/subscription-status"
import { UsageIndicator } from "./_components/usage-indicator"
import { ManageSubscriptionButton } from "./_components/manage-subscription-button"
import { InvoiceHistory } from "./_components/invoice-history"
import { AddOnPurchase } from "./_components/addon-purchase"

// Force dynamic rendering - billing must always show fresh subscription data
export const revalidate = 0

export default async function BillingSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get current subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: { in: ['active', 'trialing'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Back Link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 font-mono text-sm text-gray-secondary hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Settings
      </Link>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          Billing & Subscription
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          Manage your subscription, usage, and payment methods
        </p>
      </div>

      {/* Subscription Status */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-purple-light"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <SubscriptionStatus subscription={subscription} />

          <Separator className="my-6 bg-charcoal" />

          <div className="flex justify-end">
            <ManageSubscriptionButton hasSubscription={!!subscription} />
          </div>

          {subscription && (
            <p className="mt-4 font-mono text-xs text-gray-secondary">
              Renewal date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage Indicator */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-blue-light"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <UsageIndicator userId={user.id} />
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-white"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <InvoiceHistory userId={user.id} />
        </CardContent>
      </Card>

      {/* Stripe Customer Portal Info */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-3">
            <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
              Stripe Customer Portal
            </h3>
            <p className="font-mono text-sm text-gray-secondary">
              The "Manage Subscription" button opens Stripe's secure customer portal where you can:
            </p>
            <ul className="space-y-1 font-mono text-sm text-gray-secondary list-disc list-inside">
              <li>Update your payment method</li>
              <li>View and download all invoices</li>
              <li>Update billing information</li>
              <li>Cancel your subscription (keeps access until period end)</li>
              <li>Reactivate a canceled subscription</li>
            </ul>
            <p className="font-mono text-xs text-gray-secondary pt-2">
              All payment processing is handled securely by Stripe. We never store your payment details.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-mono text-sm uppercase tracking-wide text-charcoal">Purchase add-ons</h4>
            <div className="flex flex-wrap gap-3">
              <AddOnPurchase type="email" label="+5 Email Credits ($4)" />
              <AddOnPurchase type="physical" label="+1 Physical Letter ($5)" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

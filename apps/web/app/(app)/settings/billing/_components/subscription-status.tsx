import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, AlertCircle } from "lucide-react"
import type { Subscription } from "@dearme/prisma"

interface SubscriptionStatusProps {
  subscription: Subscription | null
}

function getStatusBadge(status: Subscription['status'] | 'none') {
  switch (status) {
    case 'active':
      return (
        <Badge
          className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Active
        </Badge>
      )
    case 'trialing':
      return (
        <Badge
          className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Trial
        </Badge>
      )
    case 'canceled':
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase text-gray-secondary"
          style={{ borderRadius: "2px" }}
        >
          Canceled
        </Badge>
      )
    case 'past_due':
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          Past Due
        </Badge>
      )
    case 'incomplete':
    case 'incomplete_expired':
      return (
        <Badge
          className="border-2 border-charcoal bg-mustard font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Incomplete
        </Badge>
      )
    case 'unpaid':
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          Unpaid
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Free
        </Badge>
      )
  }
}

function getPlanBadge(plan: string) {
  switch (plan) {
    case 'pro':
      return (
        <Badge
          className="border-2 border-charcoal bg-lavender font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          Pro
        </Badge>
      )
    case 'enterprise':
      return (
        <Badge
          className="border-2 border-charcoal bg-sky-blue font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          Enterprise
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-2 border-charcoal bg-bg-yellow-pale font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          Free
        </Badge>
      )
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
            style={{ borderRadius: "2px" }}
          >
            <CreditCard className="h-6 w-6 text-charcoal" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
                Free Plan
              </h3>
              {getPlanBadge('none')}
            </div>
            <p className="font-mono text-xs text-gray-secondary">
              No active subscription
            </p>
          </div>
        </div>
        <p className="font-mono text-sm text-gray-secondary">
          Upgrade to Pro for unlimited letters, scheduled deliveries, and physical mail.
        </p>
      </div>
    )
  }

  const isTrialing = subscription.status === 'trialing'
  const isCanceled = subscription.cancelAtPeriodEnd
  const isPastDue = subscription.status === 'past_due'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <CreditCard className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
              {subscription.plan} Plan
            </h3>
            {getPlanBadge(subscription.plan)}
            {getStatusBadge(subscription.status)}
          </div>
          <p className="font-mono text-xs text-gray-secondary">
            {isTrialing && "Trial period active"}
            {!isTrialing && subscription.status === 'active' && "Subscription active"}
            {isPastDue && "Payment required"}
          </p>
        </div>
      </div>

      {/* Trial Info */}
      {isTrialing && (
        <div
          className="border-2 border-charcoal bg-duck-yellow p-3"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-charcoal mt-0.5 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="font-mono text-sm font-medium text-charcoal">
                Trial ends {formatDate(subscription.currentPeriodEnd)}
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                Add a payment method before your trial ends to continue your subscription.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Warning */}
      {isCanceled && (
        <div
          className="border-2 border-charcoal bg-coral/10 p-3"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="font-mono text-sm font-medium text-coral">
                Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                You'll retain Pro access until this date. Reactivate anytime before then.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Due Warning */}
      {isPastDue && (
        <div
          className="border-2 border-charcoal bg-coral/10 p-3"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="font-mono text-sm font-medium text-coral">
                Payment failed
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Info */}
      {subscription.status === 'active' && !isCanceled && (
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-gray-secondary">Next billing date</span>
          <span className="text-charcoal">{formatDate(subscription.currentPeriodEnd)}</span>
        </div>
      )}
    </div>
  )
}

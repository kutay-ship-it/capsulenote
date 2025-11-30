import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, AlertCircle } from "lucide-react"
import type { Subscription } from "@dearme/prisma"
import { getTranslations } from "next-intl/server"

interface SubscriptionStatusProps {
  subscription: Subscription | null
  locale: string
}

function getStatusBadge(status: Subscription["status"] | "none" | string, t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (status) {
    case "active":
      return (
        <Badge
          className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.active")}
        </Badge>
      )
    case "trialing":
      return (
        <Badge
          className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.trialing")}
        </Badge>
      )
    case "canceled":
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase text-gray-secondary"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.canceled")}
        </Badge>
      )
    case "past_due":
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.past_due")}
        </Badge>
      )
    case "incomplete":
    case "incomplete_expired":
      return (
        <Badge
          className="border-2 border-charcoal bg-mustard font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.incomplete")}
        </Badge>
      )
    case "unpaid":
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.unpaid")}
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.none")}
        </Badge>
      )
  }
}

function getPlanBadge(plan: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (plan) {
    case "DIGITAL_CAPSULE":
      return (
        <Badge
          className="border-2 border-charcoal bg-lavender font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.plan.DIGITAL_CAPSULE")}
        </Badge>
      )
    case "PAPER_PIXELS":
      return (
        <Badge
          className="border-2 border-charcoal bg-sky-blue font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.plan.PAPER_PIXELS")}
        </Badge>
      )
    // Legacy plan names (kept for backwards compatibility)
    case "pro":
      return (
        <Badge
          className="border-2 border-charcoal bg-lavender font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.plan.pro")}
        </Badge>
      )
    case "enterprise":
      return (
        <Badge
          className="border-2 border-charcoal bg-sky-blue font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.plan.enterprise")}
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-2 border-charcoal bg-bg-yellow-pale font-mono text-sm uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.plan.none")}
        </Badge>
      )
  }
}

export async function SubscriptionStatus({ subscription, locale }: SubscriptionStatusProps) {
  const t = await getTranslations("billing")
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
    }).format(date)

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
                {t("subscription.freeTitle")}
              </h3>
              {getPlanBadge("none", t)}
            </div>
            <p className="font-mono text-xs text-gray-secondary">
              {t("subscription.freeDescription")}
            </p>
          </div>
        </div>
        <p className="font-mono text-sm text-gray-secondary">
          {t("subscription.freeCta")}
        </p>
      </div>
    )
  }

  const isTrialing = subscription.status === "trialing"
  const isCanceled = subscription.cancelAtPeriodEnd
  const isPastDue = subscription.status === "past_due"

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
              {t(`subscription.plan.${subscription.plan}` as const)}
            </h3>
            {getPlanBadge(subscription.plan, t)}
            {getStatusBadge(subscription.status, t)}
          </div>
          <p className="font-mono text-xs text-gray-secondary">
            {isTrialing && t("subscription.status.trialing")}
            {!isTrialing && subscription.status === "active" && t("subscription.status.active")}
            {isPastDue && t("subscription.status.past_due")}
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
                {t("subscription.trialEnds", { date: formatDate(subscription.currentPeriodEnd) })}
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                {t("subscription.trialHint")}
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
                {t("subscription.cancelTitle", { date: formatDate(subscription.currentPeriodEnd) })}
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                {t("subscription.cancelHint")}
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
                {t("subscription.paymentFailedTitle")}
              </p>
              <p className="font-mono text-xs text-gray-secondary mt-1">
                {t("subscription.paymentFailedHint")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Info */}
      {subscription.status === "active" && !isCanceled && (
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-gray-secondary">{t("subscription.nextBilling")}</span>
          <span className="text-charcoal">{formatDate(subscription.currentPeriodEnd)}</span>
        </div>
      )}
    </div>
  )
}

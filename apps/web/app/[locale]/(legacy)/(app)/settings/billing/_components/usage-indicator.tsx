import { BarChart3, Calendar, Mail, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getEntitlements } from "@/server/lib/entitlements"
import { getTranslations } from "next-intl/server"

interface UsageIndicatorProps {
  userId: string
  locale: string
}

function getStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

function getEndOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999))
}

export async function UsageIndicator({ userId, locale }: UsageIndicatorProps) {
  const t = await getTranslations("billing.usage")
  const entitlements = await getEntitlements(userId)
  const { usage, features, limits, plan } = entitlements

  const periodStart = getStartOfMonth(new Date())
  const periodEnd = getEndOfMonth(new Date())

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(date)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <BarChart3 className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
            {t("heading")}
          </h3>
          <p className="font-mono text-xs text-gray-secondary">
            {t("range", { start: formatDate(periodStart), end: formatDate(periodEnd) })}
          </p>
        </div>
      </div>

      {/* Letters Created */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-secondary" strokeWidth={2} />
              <span className="font-mono text-sm text-gray-secondary">{t("lettersTitle")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`border-2 border-charcoal font-mono text-xs uppercase ${
                limits.lettersReached ? "bg-coral text-white" : "bg-bg-blue-light"
              }`}
                style={{ borderRadius: "2px" }}
              >
                {t("lettersBadge", { count: usage.lettersThisMonth })}
              </Badge>
            </div>
          </div>
          <p className="font-mono text-xs text-gray-secondary">
            {t("lettersHint")}
          </p>
        </div>

      {/* Email Deliveries */}
      {plan !== 'none' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-secondary" strokeWidth={2} />
              <span className="font-mono text-sm text-gray-secondary">{t("emailsTitle")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className="border-2 border-charcoal bg-bg-green-light font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                {t("emailsRemaining", { count: features.emailDeliveriesIncluded })}
              </Badge>
            </div>
          </div>
          <p className="font-mono text-xs text-gray-secondary">
            {t("emailsHint")}
          </p>
        </div>
      )}

      {/* Mail Credits */}
      {plan !== 'none' && features.mailCreditsPerMonth > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-secondary" strokeWidth={2} />
              <span className="font-mono text-sm text-gray-secondary">{t("mailTitle")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`border-2 border-charcoal font-mono text-xs uppercase ${
                  limits.mailCreditsExhausted ? "bg-coral text-white" : "bg-bg-purple-light"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {t("mailRemaining", { remaining: usage.mailCreditsRemaining, total: features.mailCreditsPerMonth })}
              </Badge>
            </div>
          </div>
          {limits.mailCreditsExhausted && (
            <p className="font-mono text-xs text-coral">
              {t("mailExhausted")}
            </p>
          )}
        </div>
      )}

      {/* Free Tier Message */}
      {plan === 'none' && (
        <div
          className="border-2 border-charcoal bg-duck-yellow p-3"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-charcoal mt-0.5 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="font-mono text-sm text-charcoal">
                {t("freeMessage")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

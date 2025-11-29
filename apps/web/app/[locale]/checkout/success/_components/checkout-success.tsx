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
import { getTranslations, getLocale } from "next-intl/server"
import type { Subscription } from "@dearme/prisma"

interface CheckoutSuccessProps {
  subscription: Subscription
}

/**
 * Format date for display based on locale
 */
function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
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

export async function CheckoutSuccess({ subscription }: CheckoutSuccessProps) {
  const t = await getTranslations("checkout")
  const locale = await getLocale()

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
        <h1 className="text-3xl font-bold mb-2">{t("success.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("success.subtitle")}
        </p>
      </div>

      {/* Subscription Details */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{t("success.subscriptionDetails")}</CardTitle>
            <Badge variant={isTrialing ? "default" : "secondary"} className="uppercase">
              {isTrialing ? t("success.badge.trial") : t("success.badge.active")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t("success.planName")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("success.planDescription")}
              </p>
            </div>
          </div>

          {/* Trial Info */}
          {isTrialing && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t("success.trial.title")}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {daysRemaining > 0
                    ? t("success.trial.endsOn", { date: formatDate(trialEndsAt, locale), days: daysRemaining })
                    : t("success.trial.endingSoon")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("success.trial.noBilling")}
                </p>
              </div>
            </div>
          )}

          {/* Features Summary */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">{t("success.features.title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.unlimited")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.emailDelivery")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.mailCredits")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.support")}</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="flex-1 sm:flex-initial">
          <Link href="/journey">{t("success.buttons.dashboard")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-initial">
          <Link href="/letters/new">{t("success.buttons.writeLetter")}</Link>
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          {t("success.confirmEmail")}
        </p>
        <p>
          {t.rich("success.manageSubscription", {
            link: (chunks) => (
              <Link href="/settings/billing" className="text-primary hover:underline">
                {t("success.billingSettings")}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  )
}

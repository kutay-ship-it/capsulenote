import { ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { getCurrentUser } from "@/server/lib/auth"
import { redirect, Link } from "@/i18n/routing"
import { prisma } from "@/server/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SubscriptionStatus } from "./_components/subscription-status"
import { UsageIndicator } from "./_components/usage-indicator"
import { ManageSubscriptionButton } from "./_components/manage-subscription-button"
import { InvoiceHistory } from "./_components/invoice-history"
import { AddOnPurchase } from "./_components/addon-purchase"

// Force dynamic rendering - billing must always show fresh subscription data
export const revalidate = 0

export default async function BillingSettingsPage() {
  const t = await getTranslations("billing")
  const locale = await getLocale()
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
        {t("back")}
      </Link>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          {t("heading")}
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Subscription Status */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-purple-light"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <SubscriptionStatus subscription={subscription} locale={locale} />

          <Separator className="my-6 bg-charcoal" />

          <div className="flex justify-end">
            <ManageSubscriptionButton hasSubscription={!!subscription} />
          </div>

          {subscription && (
            <p className="mt-4 font-mono text-xs text-gray-secondary">
              {t("subscription.renewalDate", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                  subscription.currentPeriodEnd
                ),
              })}
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
          <UsageIndicator userId={user.id} locale={locale} />
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-white"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6">
          <InvoiceHistory userId={user.id} locale={locale} />
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
              {t("portal.title")}
            </h3>
            <p className="font-mono text-sm text-gray-secondary">
              {t("portal.description")}
            </p>
            <ul className="space-y-1 font-mono text-sm text-gray-secondary list-disc list-inside">
              {(t.raw("portal.items") as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="font-mono text-xs text-gray-secondary pt-2">
              {t("portal.note")}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-mono text-sm uppercase tracking-wide text-charcoal">Purchase add-ons</h4>
            <div className="flex flex-wrap gap-3">
              <AddOnPurchase type="email" label={t("addons.email")} />
              <AddOnPurchase type="physical" label={t("addons.physical")} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

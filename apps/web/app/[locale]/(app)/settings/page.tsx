import { Suspense } from "react"
import { getCurrentUser } from "@/server/lib/auth"
import { redirect, Link } from "@/i18n/routing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Globe, Lock, CreditCard, AlertTriangle } from "lucide-react"
import { getEntitlements } from "@/server/lib/entitlements"
import { getTranslations } from "next-intl/server"
import { Skeleton } from "@/components/skeletons"

// Force dynamic rendering - settings must always show fresh user data
export const revalidate = 0

// Skeleton for account section
function AccountSkeleton() {
  return (
    <Card
      className="border-2 border-gray-200 bg-gray-50"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Async component for account information (depends on user + entitlements)
async function AccountSection() {
  const t = await getTranslations("settings")
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const entitlements = await getEntitlements(user.id)

  return (
    <Card
      className="border-2 border-charcoal shadow-sm bg-bg-blue-light"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
            style={{ borderRadius: "2px" }}
          >
            <User className="h-5 w-5 text-charcoal" strokeWidth={2} />
          </div>
          <div>
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
              {t("account.title")}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              {t("account.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
        <div className="space-y-2">
          <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
            {t("account.email")}
          </Label>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">{user.email}</p>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
            {t("account.displayName")}
          </Label>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            {user.profile?.displayName || t("account.notSet")}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
            {t("account.timezone")}
          </Label>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            {user.profile?.timezone || t("account.notSet")}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
            {t("account.status")}
          </Label>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm text-gray-secondary sm:text-base">
              {t(`account.statusLabel.${entitlements.status}` as const)}
            </p>
            {entitlements.status === "active" && (
              <Badge
                className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                ✓
              </Badge>
            )}
            {entitlements.status === "trialing" && (
              <Badge
                className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                {t("account.badges.trial")}
              </Badge>
            )}
            {(entitlements.status === "past_due" || entitlements.status === "unpaid") && (
              <Badge
                className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
                style={{ borderRadius: "2px" }}
              >
                !
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
            {t("account.plan")}
          </Label>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm text-gray-secondary sm:text-base">
              {t(`account.planLabel.${entitlements.plan}` as const)}
            </p>
            {entitlements.plan === "PAPER_PIXELS" && (
              <Badge
                className="border-2 border-charcoal bg-lavender font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                {t("account.badges.premium")}
              </Badge>
            )}
          </div>
        </div>
        <div className="pt-2">
          <Badge
            className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            {t("account.badges.editProfile")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function SettingsPage() {
  const t = await getTranslations("settings")

  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Page Header - Instant */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          {t("heading")}
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Account Information - Streams independently (depends on user + entitlements) */}
      <Suspense fallback={<AccountSkeleton />}>
        <AccountSection />
      </Suspense>

      {/* Static Settings Cards - Instant (no data dependencies) */}

      {/* Notification Preferences */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Bell className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                {t("notifications.title")}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                {t("notifications.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            {t("notifications.body")}
          </p>
          <Badge
            className="border-2 border-charcoal bg-mustard font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            {t("notifications.badge")}
          </Badge>
        </CardContent>
      </Card>

      {/* Timezone & Localization */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-green-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Globe className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                {t("timezone.title")}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                {t("timezone.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            {t("timezone.body")}
          </p>
          <Badge
            className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            {t("timezone.badge")}
          </Badge>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Link href="/settings/billing">
        <Card
          className="border-2 border-charcoal shadow-sm bg-bg-purple-light hover:shadow-md transition-shadow cursor-pointer"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                style={{ borderRadius: "2px" }}
              >
                <CreditCard className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
              <div>
                <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                  {t("billing.title")}
                </CardTitle>
                <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                  {t("billing.description")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <p className="font-mono text-sm text-gray-secondary">
              {t("billing.body")}
            </p>
            <Badge
              className="border-2 border-charcoal bg-lavender font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
            >
              {t("billing.badge")}
            </Badge>
          </CardContent>
        </Card>
      </Link>

      {/* Privacy & Data */}
      <Card
        className="border-2 border-charcoal shadow-sm"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                {t("privacy.title")}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                {t("privacy.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            {t("privacy.body")}
          </p>
          <Badge
            className="border-2 border-charcoal bg-sky-blue font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            {t("privacy.badge")}
          </Badge>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-2 border-charcoal shadow-md bg-bg-pink-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-coral"
              style={{ borderRadius: "2px" }}
            >
              <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide text-coral sm:text-2xl">
                {t("danger.title")}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                {t("danger.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            {t("danger.body")}
          </p>
          <Badge
            className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
            style={{ borderRadius: "2px" }}
          >
            {t("danger.badge")}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

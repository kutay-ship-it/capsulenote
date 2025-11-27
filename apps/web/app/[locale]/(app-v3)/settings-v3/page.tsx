import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import {
  User,
  Bell,
  CreditCard,
  BarChart3,
  Receipt,
  Plus,
  Download,
  AlertTriangle,
  Shield,
  Gift,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react"

import { getCurrentUser } from "@/server/lib/auth"
import { getEntitlements } from "@/server/lib/entitlements"
import { prisma } from "@/server/lib/db"
import { getOrCreateReferralCode, getReferralStats } from "@/server/actions/referral-codes"
import { getReferralLink } from "@/server/actions/referrals"
import { cn } from "@/lib/utils"

import { SettingsHeaderV3 } from "@/components/v3/settings/settings-header-v3"
import { SettingsCardV3 } from "@/components/v3/settings/settings-card-v3"
import { SettingsTabsV3, SettingsTabsV3Skeleton, type SettingsTab } from "@/components/v3/settings/settings-tabs-v3"
import { ProfileFieldsV3 } from "@/components/v3/settings/profile-fields-v3"

// Reuse existing client components
import { ExportDataButton } from "@/app/[locale]/(app)/settings/privacy/_components/export-data-button"
import { DeleteDataButton } from "@/app/[locale]/(app)/settings/privacy/_components/delete-data-button"
import { ManageSubscriptionButton } from "@/app/[locale]/(app)/settings/billing/_components/manage-subscription-button"
import { AddOnPurchase } from "@/app/[locale]/(app)/settings/billing/_components/addon-purchase"
import { ReferralShareV3 } from "@/components/v3/settings/referral-share-v3"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Types
interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>
}

// ============================================================================
// ACCOUNT TAB CONTENT
// ============================================================================

interface AccountContentProps {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  entitlements: Awaited<ReturnType<typeof getEntitlements>>
  translations: {
    account: Record<string, string>
  }
}

function AccountContent({ user, entitlements, translations }: AccountContentProps) {
  const statusBadgeConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    active: {
      bg: "bg-teal-primary",
      text: "text-white",
      icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />,
    },
    trialing: {
      bg: "bg-duck-yellow",
      text: "text-charcoal",
      icon: <Clock className="h-3.5 w-3.5" strokeWidth={2} />,
    },
    past_due: {
      bg: "bg-coral",
      text: "text-white",
      icon: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />,
    },
    unpaid: {
      bg: "bg-coral",
      text: "text-white",
      icon: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />,
    },
  }

  const statusConfig = statusBadgeConfig[entitlements.status] ?? statusBadgeConfig.active ?? {
    bg: "bg-teal-primary",
    text: "text-white",
    icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />,
  }

  return (
    <>
      {/* Account Info */}
      <SettingsCardV3
        icon={<User className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Account"
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        {/* Email */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
            Email
          </label>
          <p className="font-mono text-sm text-charcoal">{user.email}</p>
        </div>

        {/* Profile Fields V3 with Enhanced Timezone Picker */}
        <ProfileFieldsV3
          displayName={user.profile?.displayName ?? null}
          timezone={user.profile?.timezone ?? null}
          translations={{
            displayNameLabel: translations.account.displayName || "Display Name",
            timezoneLabel: translations.account.timezone || "Timezone",
            notSet: translations.account.notSet || "Not set",
            displayNamePlaceholder: "Enter your name",
            displayNameSuccess: "Display name updated",
            displayNameError: "Failed to update display name",
            timezoneSuccess: "Timezone updated",
            timezoneError: "Failed to update timezone",
          }}
        />

        {/* Status & Plan */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
              Status
            </label>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
                statusConfig.bg,
                statusConfig.text
              )}
              style={{ borderRadius: "2px" }}
            >
              {statusConfig.icon}
              <span>{entitlements.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
              Plan
            </label>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider bg-duck-blue text-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <span>
                {entitlements.plan === "DIGITAL_CAPSULE"
                  ? "Digital Capsule"
                  : entitlements.plan === "PAPER_PIXELS"
                    ? "Paper & Pixels"
                    : "Free"}
              </span>
            </div>
          </div>
        </div>
      </SettingsCardV3>

      {/* Notifications - Coming Soon */}
      <SettingsCardV3
        icon={<Bell className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Notifications"
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <p className="font-mono text-xs text-charcoal/60">
          Get notified when your letters are delivered.
        </p>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider bg-charcoal/10 text-charcoal/50"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Coming Soon</span>
        </div>
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// BILLING TAB CONTENT
// ============================================================================

interface BillingContentProps {
  subscription: Awaited<ReturnType<typeof prisma.subscription.findFirst>>
  entitlements: Awaited<ReturnType<typeof getEntitlements>>
  payments: Array<{
    id: string
    amountCents: number
    currency: string
    status: string
    createdAt: Date
    metadata: unknown
  }>
  locale: string
}

function BillingContent({ subscription, entitlements, payments, locale }: BillingContentProps) {
  return (
    <>
      {/* Subscription Status */}
      <SettingsCardV3
        icon={<CreditCard className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Subscription"
        badgeBg="bg-duck-blue"
        badgeText="text-charcoal"
        actions={<ManageSubscriptionButton hasSubscription={!!subscription} />}
      >
        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">Plan</span>
              <span className="font-mono text-sm font-bold text-charcoal">
                {subscription.plan === "DIGITAL_CAPSULE"
                  ? "Digital Capsule"
                  : subscription.plan === "PAPER_PIXELS"
                    ? "Paper & Pixels"
                    : "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">Status</span>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
                  subscription.status === "active" ? "bg-teal-primary text-white" : "bg-duck-yellow text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                {subscription.status === "active" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                <span>{subscription.status}</span>
              </div>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-charcoal/60">Renews</span>
                <span className="font-mono text-sm text-charcoal">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-sm text-charcoal/60">
              You&apos;re on the free plan. Upgrade to unlock more features.
            </p>
          </div>
        )}
      </SettingsCardV3>

      {/* Usage */}
      <SettingsCardV3
        icon={<BarChart3 className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Usage"
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <div className="space-y-4">
          {/* Email Deliveries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">Email Credits</span>
              <span className="font-mono text-xs font-bold text-charcoal">
                {entitlements.features.emailDeliveriesIncluded} remaining
              </span>
            </div>
            <div className="h-2 w-full border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
              <div
                className={cn(
                  "h-full",
                  entitlements.limits.emailsReached ? "bg-coral" : "bg-duck-blue"
                )}
                style={{
                  width: entitlements.limits.emailsReached ? "100%" : "0%",
                }}
              />
            </div>
            {entitlements.limits.emailsReached && (
              <p className="font-mono text-[10px] text-coral">All credits used</p>
            )}
          </div>

          {/* Mail Credits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">Physical Letter Credits</span>
              <span className="font-mono text-xs font-bold text-charcoal">
                {entitlements.usage.mailCreditsRemaining} remaining
              </span>
            </div>
            <div className="h-2 w-full border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
              <div
                className={cn(
                  "h-full",
                  entitlements.limits.mailCreditsExhausted ? "bg-coral" : "bg-teal-primary"
                )}
                style={{
                  width: entitlements.limits.mailCreditsExhausted ? "100%" : "0%",
                }}
              />
            </div>
            {entitlements.limits.mailCreditsExhausted && (
              <p className="font-mono text-[10px] text-coral">All credits used</p>
            )}
          </div>
        </div>
      </SettingsCardV3>

      {/* Invoices */}
      <SettingsCardV3
        icon={<Receipt className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Invoices"
        badgeBg="bg-charcoal"
        badgeText="text-white"
      >
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-2 border-charcoal/20 bg-off-white p-3 transition-colors hover:bg-duck-cream"
                style={{ borderRadius: "2px" }}
              >
                <div>
                  <p className="font-mono text-xs font-bold text-charcoal">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(payment.createdAt)}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/50 uppercase">
                    {payment.status}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-charcoal">
                  {new Intl.NumberFormat(locale, { style: "currency", currency: payment.currency }).format(payment.amountCents / 100)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-charcoal/60">No invoices yet.</p>
        )}
      </SettingsCardV3>

      {/* Add-ons */}
      <SettingsCardV3
        icon={<Plus className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Add-ons"
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        <p className="font-mono text-xs text-charcoal/60">
          Need more deliveries? Purchase additional credits.
        </p>
        <div className="flex flex-wrap gap-3">
          <AddOnPurchase type="email" label="+ Email Credits" />
          <AddOnPurchase type="physical" label="+ Mail Credits" />
        </div>
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// PRIVACY TAB CONTENT
// ============================================================================

function PrivacyContent() {
  return (
    <>
      {/* Export Data */}
      <SettingsCardV3
        icon={<Download className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Export Data"
        badgeBg="bg-charcoal"
        badgeText="text-white"
      >
        <p className="font-mono text-xs text-charcoal/60">
          Download all your data including letters, deliveries, and account information.
        </p>
        <div
          className="border-2 border-dashed border-charcoal/20 bg-off-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">
            Includes
          </p>
          <ul className="space-y-1 font-mono text-xs text-charcoal/60">
            <li>Profile & account settings</li>
            <li>All letters and drafts</li>
            <li>Delivery history</li>
            <li>Subscription & payments</li>
            <li>Usage statistics</li>
          </ul>
        </div>
        <ExportDataButton />
      </SettingsCardV3>

      {/* Legal Links */}
      <SettingsCardV3
        icon={<Shield className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Legal"
        badgeBg="bg-duck-blue"
        badgeText="text-charcoal"
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="/privacy"
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-charcoal/30">|</span>
          <a
            href="/terms"
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            Terms of Service
          </a>
          <span className="text-charcoal/30">|</span>
          <a
            href="/gdpr"
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            GDPR Rights
          </a>
        </div>
      </SettingsCardV3>

      {/* Danger Zone */}
      <SettingsCardV3
        icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Danger Zone"
        badgeBg="bg-coral"
        badgeText="text-white"
        className="border-coral/50"
      >
        <p className="font-mono text-xs text-charcoal/60">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div
          className="border-2 border-dashed border-coral/30 bg-coral/5 p-4"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-coral mb-2">
            Before you delete
          </p>
          <ul className="space-y-1 font-mono text-xs text-coral/80">
            <li>Export your data first</li>
            <li>Cancel any active subscriptions</li>
            <li>You will be signed out immediately</li>
          </ul>
        </div>
        <DeleteDataButton />
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// REFERRALS TAB CONTENT
// ============================================================================

interface ReferralsContentProps {
  referralCode: Awaited<ReturnType<typeof getOrCreateReferralCode>>
  referralLink: string
  stats: {
    clicks: number
    signups: number
    conversions: number
    creditsEarned: number
  }
  referrals: Array<{
    id: string
    status: string
    createdAt: Date
    signedUpAt: Date | null
    convertedAt: Date | null
    rewardedAt: Date | null
  }>
}

function ReferralsContent({ referralCode, referralLink, stats, referrals }: ReferralsContentProps) {
  return (
    <>
      {/* Referral Code */}
      <SettingsCardV3
        icon={<Gift className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Your Code"
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        <p className="font-mono text-xs text-charcoal/60">
          Share your referral code and earn credits when friends sign up.
        </p>
        <ReferralShareV3 code={referralCode.code} link={referralLink} />
      </SettingsCardV3>

      {/* Stats */}
      <SettingsCardV3
        icon={<BarChart3 className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Your Stats"
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Clicks", value: stats.clicks },
            { label: "Signups", value: stats.signups },
            { label: "Conversions", value: stats.conversions },
            { label: "Credits", value: `$${stats.creditsEarned}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-2 border-charcoal bg-white p-4 text-center"
              style={{ borderRadius: "2px" }}
            >
              <p className="font-mono text-2xl font-bold text-charcoal">{stat.value}</p>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </SettingsCardV3>

      {/* Referral History */}
      <SettingsCardV3
        icon={<Users className="h-3.5 w-3.5" strokeWidth={2} />}
        title="History"
        badgeBg="bg-charcoal"
        badgeText="text-white"
      >
        {referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between border-2 border-charcoal/20 bg-off-white p-3"
                style={{ borderRadius: "2px" }}
              >
                <div>
                  <p className="font-mono text-xs font-bold text-charcoal">
                    Referral #{referral.id.slice(0, 8)}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/50">
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(referral.createdAt)}
                  </p>
                </div>
                <div
                  className={cn(
                    "px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
                    referral.status === "converted"
                      ? "bg-teal-primary text-white"
                      : referral.status === "signed_up"
                        ? "bg-duck-blue text-charcoal"
                        : "bg-duck-yellow text-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {referral.status.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-charcoal/60">
            No referrals yet. Share your code to get started!
          </p>
        )}
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function SettingsV3Page({ searchParams }: SettingsPageProps) {
  const params = await searchParams
  const initialTab = (params.tab || "account") as SettingsTab
  const t = await getTranslations("settings")
  const locale = await getLocale()

  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }

  // Parallel fetch ALL tab data for instant tab switching
  const [entitlements, subscription, payments, referralCode, referralStats, referralLink] =
    await Promise.all([
      getEntitlements(user.id),
      prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["active", "trialing"] },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amountCents: true,
          currency: true,
          status: true,
          createdAt: true,
          metadata: true,
        },
      }),
      getOrCreateReferralCode(),
      getReferralStats(),
      getReferralLink(),
    ])

  // Build translations object
  const translations = {
    account: {
      displayName: t("account.displayName"),
      timezone: t("account.timezone"),
      notSet: t("account.notSet"),
    },
  }

  return (
    <div className="container py-12">
      {/* Page Header */}
      <SettingsHeaderV3
        title={t("heading")}
        description={t("subtitle")}
      />

      {/* Settings Tabs */}
      <div className="mt-8">
        <Suspense fallback={<SettingsTabsV3Skeleton />}>
          <SettingsTabsV3
            initialTab={initialTab}
            accountContent={
              <AccountContent
                user={user}
                entitlements={entitlements}
                translations={translations}
              />
            }
            billingContent={
              <BillingContent
                subscription={subscription}
                entitlements={entitlements}
                payments={payments}
                locale={locale}
              />
            }
            privacyContent={<PrivacyContent />}
            referralsContent={
              <ReferralsContent
                referralCode={referralCode}
                referralLink={referralLink}
                stats={
                  referralStats?.stats ?? {
                    clicks: referralCode.clickCount,
                    signups: referralCode.signupCount,
                    conversions: referralCode.convertCount,
                    creditsEarned: 0,
                  }
                }
                referrals={referralStats?.referrals ?? []}
              />
            }
          />
        </Suspense>
      </div>
    </div>
  )
}

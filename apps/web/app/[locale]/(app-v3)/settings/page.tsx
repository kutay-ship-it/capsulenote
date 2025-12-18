import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
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
import { getEntitlements, canPurchasePhysicalTrial } from "@/server/lib/entitlements"
import { prisma } from "@/server/lib/db"
import { getOrCreateReferralCode, getReferralStats } from "@/server/actions/referral-codes"
import { buildReferralLink } from "@/server/actions/referrals"
import { cn } from "@/lib/utils"
import { Link, type Locale } from "@/i18n/routing"

import { SettingsHeaderV3 } from "@/components/v3/settings/settings-header-v3"
import { SettingsCardV3 } from "@/components/v3/settings/settings-card-v3"
import { SettingsTabsV3, SettingsTabsV3Skeleton, type SettingsTab } from "@/components/v3/settings/settings-tabs-v3"
import { ProfileFieldsV3 } from "@/components/v3/settings/profile-fields-v3"
import { AddressesSettingsV3 } from "@/components/v3/settings/addresses-settings-v3"

// Settings client components
import { ExportDataButton } from "./_components/export-data-button"
import { DeleteDataButton } from "./_components/delete-data-button"
import { ManageSubscriptionButton } from "./_components/manage-subscription-button"
import { AddOnPurchase } from "./_components/addon-purchase"
import { BillingTrialSection } from "./_components/billing-trial-section"
import { ReferralShareV3 } from "@/components/v3/settings/referral-share-v3"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Types
interface SettingsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tab?: string }>
}

// ============================================================================
// ACCOUNT TAB CONTENT
// ============================================================================

interface AccountContentProps {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  entitlements: Awaited<ReturnType<typeof getEntitlements>>
  translations: {
    account: {
      title: string
      email: string
      displayName: string
      timezone: string
      notSet: string
      status: string
      plan: string
      displayNamePlaceholder: string
      displayNameSuccess: string
      displayNameError: string
      timezoneSuccess: string
      timezoneError: string
      planLabel: {
        DIGITAL_CAPSULE: string
        PAPER_PIXELS: string
        none: string
      }
    }
    notifications: {
      title: string
      body: string
      badge: string
    }
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
        title={translations.account.title}
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        {/* Email */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
            {translations.account.email}
          </label>
          <p className="font-mono text-sm text-charcoal">{user.email}</p>
        </div>

        {/* Profile Fields V3 with Enhanced Timezone Picker */}
        <ProfileFieldsV3
          displayName={user.profile?.displayName ?? null}
          timezone={user.profile?.timezone ?? null}
          translations={{
            displayNameLabel: translations.account.displayName,
            timezoneLabel: translations.account.timezone,
            notSet: translations.account.notSet,
            displayNamePlaceholder: translations.account.displayNamePlaceholder,
            displayNameSuccess: translations.account.displayNameSuccess,
            displayNameError: translations.account.displayNameError,
            timezoneSuccess: translations.account.timezoneSuccess,
            timezoneError: translations.account.timezoneError,
          }}
        />

        {/* Status & Plan */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
              {translations.account.status}
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
              {translations.account.plan}
            </label>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider bg-duck-blue text-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <span>
                {entitlements.plan === "DIGITAL_CAPSULE"
                  ? translations.account.planLabel.DIGITAL_CAPSULE
                  : entitlements.plan === "PAPER_PIXELS"
                    ? translations.account.planLabel.PAPER_PIXELS
                    : translations.account.planLabel.none}
              </span>
            </div>
          </div>
        </div>
      </SettingsCardV3>

      {/* Notifications - Coming Soon */}
      <SettingsCardV3
        icon={<Bell className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.notifications.title}
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <p className="font-mono text-xs text-charcoal/60">
          {translations.notifications.body}
        </p>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider bg-charcoal/10 text-charcoal/50"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          <span>{translations.notifications.badge}</span>
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
  /** Trial-related data for Digital Capsule users */
  trialData: {
    isDigitalCapsule: boolean
    canPurchaseTrial: boolean
    hasUsedTrial: boolean
    physicalCredits: number
  }
  translations: {
    subscription: {
      title: string
      plan: string
      status: string
      renews: string
      unknown: string
      freePlanMessage: string
      statusLabel: Record<string, string>
    }
    usage: {
      title: string
      emailCredits: string
      physicalLetterCredits: string
      remaining: string
      allCreditsUsed: string
    }
    invoices: {
      title: string
      noInvoices: string
    }
    paymentStatus: Record<string, string>
    addons: {
      title: string
      description: string
      emailCredits: string
      mailCredits: string
    }
    planLabel: {
      DIGITAL_CAPSULE: string
      PAPER_PIXELS: string
      none: string
    }
  }
}

function BillingContent({ subscription, entitlements, payments, locale, trialData, translations }: BillingContentProps) {
  return (
    <>
      {/* Physical Mail Trial Section - Shows for Digital Capsule users */}
      <BillingTrialSection
        isDigitalCapsule={trialData.isDigitalCapsule}
        canPurchaseTrial={trialData.canPurchaseTrial}
        hasUsedTrial={trialData.hasUsedTrial}
        physicalCredits={trialData.physicalCredits}
      />

      {/* Subscription Status */}
      <SettingsCardV3
        icon={<CreditCard className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.subscription.title}
        badgeBg="bg-duck-blue"
        badgeText="text-charcoal"
        actions={<ManageSubscriptionButton hasSubscription={!!subscription} />}
      >
        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">{translations.subscription.plan}</span>
              <span className="font-mono text-sm font-bold text-charcoal">
                {subscription.plan === "DIGITAL_CAPSULE"
                  ? translations.planLabel.DIGITAL_CAPSULE
                  : subscription.plan === "PAPER_PIXELS"
                    ? translations.planLabel.PAPER_PIXELS
                    : translations.subscription.unknown}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">{translations.subscription.status}</span>
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
                <span>{translations.subscription.statusLabel[subscription.status] || subscription.status}</span>
              </div>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-charcoal/60">{translations.subscription.renews}</span>
                <span className="font-mono text-sm text-charcoal">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-sm text-charcoal/60">
              {translations.subscription.freePlanMessage}
            </p>
          </div>
        )}
      </SettingsCardV3>

      {/* Usage */}
      <SettingsCardV3
        icon={<BarChart3 className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.usage.title}
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <div className="space-y-4">
          {/* Email Deliveries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">{translations.usage.emailCredits}</span>
              <span className="font-mono text-xs font-bold text-charcoal">
                {entitlements.features.emailDeliveriesIncluded} {translations.usage.remaining}
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
              <p className="font-mono text-[10px] text-coral">{translations.usage.allCreditsUsed}</p>
            )}
          </div>

          {/* Mail Credits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-charcoal/60">{translations.usage.physicalLetterCredits}</span>
              <span className="font-mono text-xs font-bold text-charcoal">
                {entitlements.usage.mailCreditsRemaining} {translations.usage.remaining}
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
              <p className="font-mono text-[10px] text-coral">{translations.usage.allCreditsUsed}</p>
            )}
          </div>
        </div>
      </SettingsCardV3>

      {/* Invoices */}
      <SettingsCardV3
        icon={<Receipt className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.invoices.title}
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
                    {new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", { dateStyle: "medium" }).format(payment.createdAt)}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/50 uppercase">
                    {translations.paymentStatus[payment.status] || payment.status}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-charcoal">
                  {new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", { style: "currency", currency: payment.currency }).format(payment.amountCents / 100)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-charcoal/60">{translations.invoices.noInvoices}</p>
        )}
      </SettingsCardV3>

      {/* Add-ons */}
      <SettingsCardV3
        icon={<Plus className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.addons.title}
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        <p className="font-mono text-xs text-charcoal/60">
          {translations.addons.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <AddOnPurchase type="email" label={translations.addons.emailCredits} />
          <AddOnPurchase type="physical" label={translations.addons.mailCredits} />
        </div>
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// PRIVACY TAB CONTENT
// ============================================================================

interface PrivacyContentProps {
  translations: {
    export: {
      title: string
      description: string
      includesTitle: string
      includes: {
        profile: string
        letters: string
        deliveries: string
        subscription: string
        usage: string
      }
    }
    legal: {
      title: string
      privacyPolicy: string
      terms: string
      gdpr: string
    }
    dangerZone: {
      title: string
      description: string
      beforeDelete: string
      warnings: {
        export: string
        cancel: string
        signOut: string
      }
    }
  }
}

function PrivacyContent({ translations }: PrivacyContentProps) {
  return (
    <>
      {/* Export Data */}
      <SettingsCardV3
        icon={<Download className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.export.title}
        badgeBg="bg-charcoal"
        badgeText="text-white"
      >
        <p className="font-mono text-xs text-charcoal/60">
          {translations.export.description}
        </p>
        <div
          className="border-2 border-dashed border-charcoal/20 bg-off-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">
            {translations.export.includesTitle}
          </p>
          <ul className="space-y-1 font-mono text-xs text-charcoal/60">
            <li>{translations.export.includes.profile}</li>
            <li>{translations.export.includes.letters}</li>
            <li>{translations.export.includes.deliveries}</li>
            <li>{translations.export.includes.subscription}</li>
            <li>{translations.export.includes.usage}</li>
          </ul>
        </div>
        <ExportDataButton />
      </SettingsCardV3>

      {/* Legal Links */}
      <SettingsCardV3
        icon={<Shield className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.legal.title}
        badgeBg="bg-duck-blue"
        badgeText="text-charcoal"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/privacy"
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            {translations.legal.privacyPolicy}
          </Link>
          <span className="text-charcoal/30">|</span>
          <Link
            href="/terms"
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            {translations.legal.terms}
          </Link>
          <span className="text-charcoal/30">|</span>
          <Link
            href={{ pathname: "/privacy", hash: "gdpr" }}
            className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:text-duck-blue transition-colors"
          >
            {translations.legal.gdpr}
          </Link>
        </div>
      </SettingsCardV3>

      {/* Danger Zone */}
      <SettingsCardV3
        icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.dangerZone.title}
        badgeBg="bg-coral"
        badgeText="text-white"
        className="border-coral/50"
      >
        <p className="font-mono text-xs text-charcoal/60">
          {translations.dangerZone.description}
        </p>
        <div
          className="border-2 border-dashed border-coral/30 bg-coral/5 p-4"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-coral mb-2">
            {translations.dangerZone.beforeDelete}
          </p>
          <ul className="space-y-1 font-mono text-xs text-coral/80">
            <li>{translations.dangerZone.warnings.export}</li>
            <li>{translations.dangerZone.warnings.cancel}</li>
            <li>{translations.dangerZone.warnings.signOut}</li>
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
  locale: string
  translations: {
    yourCode: {
      title: string
      description: string
    }
    yourStats: {
      title: string
      clicks: string
      signups: string
      conversions: string
      credits: string
    }
    history: {
      title: string
      referralPrefix: string
      empty: string
    }
  }
}

function ReferralsContent({ referralCode, referralLink, stats, referrals, locale, translations }: ReferralsContentProps) {
  return (
    <>
      {/* Referral Code */}
      <SettingsCardV3
        icon={<Gift className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.yourCode.title}
        badgeBg="bg-duck-yellow"
        badgeText="text-charcoal"
      >
        <p className="font-mono text-xs text-charcoal/60">
          {translations.yourCode.description}
        </p>
        <ReferralShareV3 code={referralCode.code} link={referralLink} />
      </SettingsCardV3>

      {/* Stats */}
      <SettingsCardV3
        icon={<BarChart3 className="h-3.5 w-3.5" strokeWidth={2} />}
        title={translations.yourStats.title}
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: translations.yourStats.clicks, value: stats.clicks },
            { label: translations.yourStats.signups, value: stats.signups },
            { label: translations.yourStats.conversions, value: stats.conversions },
            { label: translations.yourStats.credits, value: `$${stats.creditsEarned}` },
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
        title={translations.history.title}
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
                    {translations.history.referralPrefix}{referral.id.slice(0, 8)}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/50">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(referral.createdAt)}
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
            {translations.history.empty}
          </p>
        )}
      </SettingsCardV3>
    </>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function SettingsV3Page({ params, searchParams }: SettingsPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const initialTab = (resolvedSearchParams.tab || "account") as SettingsTab
  const t = await getTranslations({ locale, namespace: "settings" })
  const prefix = locale === "en" ? "" : `/${locale}`

  const user = await getCurrentUser()
  if (!user) {
    redirect(`${prefix}/sign-in`)
  }

  // Parallel fetch ALL tab data for instant tab switching
  // Note: We call getOrCreateReferralCode once and build referralLink from the result
  // to avoid race conditions from parallel calls to the same function
  const [entitlements, subscription, payments, addresses, referralCode, referralStats, canPurchaseTrial, userTrialStatus] =
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
      prisma.shippingAddress.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      getOrCreateReferralCode(),
      getReferralStats(),
      // Trial-related data
      canPurchasePhysicalTrial(user.id),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { physicalMailTrialUsed: true },
      }),
    ])

  // Build referral link from the code (no DB call needed)
  const referralLink = await buildReferralLink(referralCode.code)

  // Build trial data for billing section
  const trialData = {
    isDigitalCapsule: entitlements.plan === "DIGITAL_CAPSULE",
    canPurchaseTrial,
    hasUsedTrial: userTrialStatus?.physicalMailTrialUsed ?? false,
    physicalCredits: entitlements.usage.mailCreditsRemaining,
  }

  // Build translations objects for each content section
  const accountTranslations = {
    account: {
      title: t("account.title"),
      email: t("account.email"),
      displayName: t("account.displayName"),
      timezone: t("account.timezone"),
      notSet: t("account.notSet"),
      status: t("account.status"),
      plan: t("account.plan"),
      displayNamePlaceholder: t("account.displayNamePlaceholder"),
      displayNameSuccess: t("account.displayNameSuccess"),
      displayNameError: t("account.displayNameError"),
      timezoneSuccess: t("account.timezoneSuccess"),
      timezoneError: t("account.timezoneError"),
      planLabel: {
        DIGITAL_CAPSULE: t("account.planLabel.DIGITAL_CAPSULE"),
        PAPER_PIXELS: t("account.planLabel.PAPER_PIXELS"),
        none: t("account.planLabel.none"),
      },
    },
    notifications: {
      title: t("notifications.title"),
      body: t("notifications.body"),
      badge: t("notifications.badge"),
    },
  }

  const billingTranslations = {
    subscription: {
      title: t("billing.subscription.title"),
      plan: t("billing.subscription.plan"),
      status: t("billing.subscription.status"),
      renews: t("billing.subscription.renews"),
      unknown: t("billing.subscription.unknown"),
      freePlanMessage: t("billing.subscription.freePlanMessage"),
      statusLabel: {
        active: t("billing.subscription.statusLabel.active"),
        trialing: t("billing.subscription.statusLabel.trialing"),
        past_due: t("billing.subscription.statusLabel.past_due"),
        canceled: t("billing.subscription.statusLabel.canceled"),
        unpaid: t("billing.subscription.statusLabel.unpaid"),
        incomplete: t("billing.subscription.statusLabel.incomplete"),
      },
    },
    usage: {
      title: t("billing.usage.title"),
      emailCredits: t("billing.usage.emailCredits"),
      physicalLetterCredits: t("billing.usage.physicalLetterCredits"),
      remaining: t("billing.usage.remaining"),
      allCreditsUsed: t("billing.usage.allCreditsUsed"),
    },
    invoices: {
      title: t("billing.invoices.title"),
      noInvoices: t("billing.invoices.noInvoices"),
    },
    paymentStatus: {
      succeeded: t("billing.paymentStatus.succeeded"),
      pending: t("billing.paymentStatus.pending"),
      failed: t("billing.paymentStatus.failed"),
      processing: t("billing.paymentStatus.processing"),
      requires_action: t("billing.paymentStatus.requires_action"),
      canceled: t("billing.paymentStatus.canceled"),
    },
    addons: {
      title: t("billing.addons.title"),
      description: t("billing.addons.description"),
      emailCredits: t("billing.addons.emailCredits"),
      mailCredits: t("billing.addons.mailCredits"),
    },
    planLabel: {
      DIGITAL_CAPSULE: t("account.planLabel.DIGITAL_CAPSULE"),
      PAPER_PIXELS: t("account.planLabel.PAPER_PIXELS"),
      none: t("account.planLabel.none"),
    },
  }

  const privacyTranslations = {
    export: {
      title: t("privacy.export.title"),
      description: t("privacy.export.description"),
      includesTitle: t("privacy.export.includesTitle"),
      includes: {
        profile: t("privacy.export.includes.profile"),
        letters: t("privacy.export.includes.letters"),
        deliveries: t("privacy.export.includes.deliveries"),
        subscription: t("privacy.export.includes.subscription"),
        usage: t("privacy.export.includes.usage"),
      },
    },
    legal: {
      title: t("privacy.legal.title"),
      privacyPolicy: t("privacy.legal.privacyPolicy"),
      terms: t("privacy.legal.terms"),
      gdpr: t("privacy.legal.gdpr"),
    },
    dangerZone: {
      title: t("privacy.dangerZone.title"),
      description: t("privacy.dangerZone.description"),
      beforeDelete: t("privacy.dangerZone.beforeDelete"),
      warnings: {
        export: t("privacy.dangerZone.warnings.export"),
        cancel: t("privacy.dangerZone.warnings.cancel"),
        signOut: t("privacy.dangerZone.warnings.signOut"),
      },
    },
  }

  const referralsTranslations = {
    yourCode: {
      title: t("referral.yourCode.title"),
      description: t("referral.yourCode.description"),
    },
    yourStats: {
      title: t("referral.yourStats.title"),
      clicks: t("referral.yourStats.clicks"),
      signups: t("referral.yourStats.signups"),
      conversions: t("referral.yourStats.conversions"),
      credits: t("referral.yourStats.credits"),
    },
    history: {
      title: t("referral.history.title"),
      referralPrefix: t("referral.history.referralPrefix"),
      empty: t("referral.history.empty"),
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
                translations={accountTranslations}
              />
            }
            billingContent={
              <BillingContent
                subscription={subscription}
                entitlements={entitlements}
                payments={payments}
                locale={locale}
                trialData={trialData}
                translations={billingTranslations}
              />
            }
            addressesContent={
              <AddressesSettingsV3
                initialAddresses={addresses.map((addr) => ({
                  id: addr.id,
                  name: addr.name,
                  line1: addr.line1,
                  line2: addr.line2,
                  city: addr.city,
                  state: addr.state,
                  postalCode: addr.postalCode,
                  country: addr.country,
                  metadata: addr.metadata as Record<string, unknown>,
                  createdAt: addr.createdAt,
                  updatedAt: addr.updatedAt,
                }))}
              />
            }
            privacyContent={<PrivacyContent translations={privacyTranslations} />}
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
                locale={locale}
                translations={referralsTranslations}
              />
            }
          />
        </Suspense>
      </div>
    </div>
  )
}

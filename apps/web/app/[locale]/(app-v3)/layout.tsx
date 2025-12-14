import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { getTranslations } from "next-intl/server"

// Force dynamic rendering - this layout uses getCurrentUser() which requires headers()
export const dynamic = "force-dynamic"

// Prevent indexing of authenticated app pages
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

import { EmailLockGuard } from "@/components/auth/email-lock-guard"
import { SettingsDropdown } from "@/components/v3/settings-dropdown"
import { CreditsBarV3 } from "@/components/v3/nav/credit-indicator-v3"
import { WriteButtonV3 } from "@/components/v3/nav/write-button-v3"
import { OnboardingProvider } from "@/components/v3/onboarding"
import { Link } from "@/i18n/routing"
import { getCurrentUser } from "@/server/lib/auth"
import { getEntitlements, getPhysicalTrialStatus } from "@/server/lib/entitlements"

export default async function AppV3Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  const tLetters = await getTranslations({ locale, namespace: "letters" })

  // Get user info for the settings dropdown
  const user = await getCurrentUser()
  const userName = user?.profile?.displayName || null
  const userEmail = user?.email || null
  const userPlanType = user?.planType || null

  // Get entitlements for credit indicators
  const entitlements = user ? await getEntitlements(user.id) : null
  const emailCredits = entitlements?.features.emailDeliveriesIncluded ?? 0
  const mailCredits = entitlements?.usage.mailCreditsRemaining ?? 0

  // Get trial eligibility for the mail credit indicator (single optimized query)
  const isDigitalCapsule = entitlements?.plan === "DIGITAL_CAPSULE"
  const trialStatus = user ? await getPhysicalTrialStatus(user.id) : null
  const canPurchaseTrial = trialStatus?.canPurchase ?? false
  const hasUsedTrial = trialStatus?.hasUsedTrial ?? false

  // Check if user needs onboarding
  const shouldShowOnboarding = user ? !user.profile?.onboardingCompleted : false

  return (
    <EmailLockGuard>
      <OnboardingProvider shouldShowOnboarding={shouldShowOnboarding}>
        <div className="flex min-h-screen flex-col bg-off-white">
        {/* Header - Simplified per spec: [Logo] Your Letters [+ Write] [Settings] */}
        <header
          className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-white"
          style={{ height: "72px" }}
        >
          <div className="container flex h-full items-center justify-between">
            {/* Left: Logo + Brand */}
            <Link
              href="/journey"
              className="flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
              <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                {t("nav.brand")}
              </span>
            </Link>

            {/* Center: Navigation - hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/journey"
                className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70 transition-opacity"
              >
                {t("nav.journey")}
              </Link>
              <Link
                href="/letters"
                className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70 transition-opacity"
              >
                {t("nav.letters")}
              </Link>
            </nav>

            {/* Right: Credits + Write CTA + Settings Dropdown */}
            <div className="flex items-center gap-3">
              {/* Credit Indicators */}
              {user && (
                <CreditsBarV3
                  emailCredits={emailCredits}
                  mailCredits={mailCredits}
                  isDigitalCapsule={isDigitalCapsule}
                  canPurchaseTrial={canPurchaseTrial}
                  hasUsedTrial={hasUsedTrial}
                />
              )}

              {/* Write Button - hidden on new letter page */}
              <WriteButtonV3 label={tLetters("drafts.writeNew")} />

              {/* Settings Dropdown */}
              <SettingsDropdown userName={userName} userEmail={userEmail} planType={userPlanType} />
            </div>
          </div>
        </header>

        {/* Main Content - No container wrapper to allow full-width sections */}
        <main className="flex-1">{children}</main>
        </div>
      </OnboardingProvider>
    </EmailLockGuard>
  )
}

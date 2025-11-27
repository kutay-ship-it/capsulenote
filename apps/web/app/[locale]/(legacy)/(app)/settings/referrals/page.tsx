import { Suspense } from "react"
import { getTranslations, getLocale } from "next-intl/server"
import { ArrowLeft, Gift } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { requireUser } from "@/server/lib/auth"
import { getReferralStats, getOrCreateReferralCode } from "@/server/actions/referral-codes"
import { getReferralLink } from "@/server/actions/referrals"
import { ReferralSection } from "@/components/referral-section"
import { Skeleton } from "@/components/skeletons"

// Force dynamic rendering
export const revalidate = 0

// Skeleton for referral content
function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <div
        className="border-2 border-gray-200 bg-gray-50 p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />
    </div>
  )
}

// Async component for referral content
async function ReferralContent() {
  const locale = await getLocale()
  const user = await requireUser()

  // Get or create referral code and stats
  const referralCode = await getOrCreateReferralCode()
  const stats = await getReferralStats()
  const referralLink = await getReferralLink()

  return (
    <ReferralSection
      referralCode={referralCode.code}
      referralLink={referralLink}
      stats={
        stats?.stats ?? {
          clicks: referralCode.clickCount,
          signups: referralCode.signupCount,
          conversions: referralCode.convertCount,
          creditsEarned: 0,
        }
      }
      referrals={stats?.referrals ?? []}
      locale={locale}
    />
  )
}

export default async function ReferralsPage() {
  const t = await getTranslations("referral")

  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Back Link */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Gift className="h-6 w-6 text-charcoal" />
        </div>
        <div className="space-y-1">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Referral Content - Streams independently */}
      <Suspense fallback={<ReferralSkeleton />}>
        <ReferralContent />
      </Suspense>
    </div>
  )
}

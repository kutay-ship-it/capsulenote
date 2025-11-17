import { getCurrentUser } from "@/server/lib/auth"
import { getEntitlements } from "@/server/lib/entitlements"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export async function QuotaExceededBanner() {
  const user = await getCurrentUser()
  if (!user) return null

  const entitlements = await getEntitlements(user.id)

  // Only show for free tier users
  if (entitlements.plan !== 'none') return null

  const { usage, features, limits } = entitlements

  // Calculate usage percentages
  const letterUsagePercent = typeof features.maxLettersPerMonth === 'number'
    ? (usage.lettersThisMonth / features.maxLettersPerMonth) * 100
    : 0

  // Show banner if quota reached or approaching (>80%)
  const shouldShowBanner = limits.lettersReached || letterUsagePercent >= 80

  if (!shouldShowBanner) return null

  return (
    <div
      className="border-2 border-charcoal bg-duck-yellow p-4 sm:p-6 shadow-sm"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-white"
            style={{ borderRadius: "2px" }}
          >
            <AlertTriangle className="h-5 w-5 text-coral" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal sm:text-xl">
              {limits.lettersReached ? "Free Plan Limit Reached" : "Approaching Plan Limit"}
            </h3>
            <p className="font-mono text-sm text-gray-secondary">
              {limits.lettersReached
                ? `You've used all ${features.maxLettersPerMonth} letters for this month. Upgrade to Pro for unlimited letters.`
                : `You've used ${usage.lettersThisMonth} of ${features.maxLettersPerMonth} letters this month. Upgrade to Pro for unlimited access.`}
            </p>

            {/* Usage Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs text-gray-secondary">
                <span>Letters Used</span>
                <span>{usage.lettersThisMonth} / {features.maxLettersPerMonth}</span>
              </div>
              <div className="h-2 w-full border border-charcoal bg-white">
                <div
                  className={`h-full transition-all ${
                    limits.lettersReached ? 'bg-coral' : 'bg-mustard'
                  }`}
                  style={{ width: `${Math.min(letterUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Link href="/pricing" className="flex-shrink-0">
          <Button
            className="border-2 border-charcoal bg-lime font-mono text-sm uppercase tracking-wide hover:bg-lime/90"
            style={{ borderRadius: "2px" }}
          >
            Upgrade to Pro
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

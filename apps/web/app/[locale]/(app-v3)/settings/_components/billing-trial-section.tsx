"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Crown, ArrowRight, Lock, Mail, FileText, Gift } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface BillingTrialSectionProps {
  /** User is on Digital Capsule plan */
  isDigitalCapsule: boolean
  /** User can purchase trial credit (hasn't purchased yet) */
  canPurchaseTrial: boolean
  /** User has used their trial credit */
  hasUsedTrial: boolean
  /** Current physical credits */
  physicalCredits: number
}

export function BillingTrialSection({
  isDigitalCapsule,
  canPurchaseTrial,
  hasUsedTrial,
  physicalCredits,
}: BillingTrialSectionProps) {
  const t = useTranslations("settings.billing.trial")
  const router = useRouter()

  // Only show for Digital Capsule users
  if (!isDigitalCapsule) {
    return null
  }

  const handleUpgrade = () => {
    router.push("/pricing?upgrade=paper_pixels")
  }

  // For Digital Capsule users, show "See Upgrade Options" button (like navbar)
  // This applies whether they can purchase trial or not
  if (canPurchaseTrial || (!hasUsedTrial && physicalCredits === 0)) {
    return (
      <div
        className="border-2 border-charcoal/20 bg-off-white p-4 space-y-3"
        style={{ borderRadius: "2px" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Lock className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-1">
              {t("physicalMailLocked")}
            </h3>
            <p className="font-mono text-xs text-charcoal/60">
              {t("upgradeToUnlock")}
            </p>
          </div>
        </div>

        {/* Features hint */}
        <div className="flex flex-wrap gap-3 pl-13">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-charcoal/40" strokeWidth={2} />
            <span className="font-mono text-[10px] text-charcoal/50">{t("realLetter")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-charcoal/40" strokeWidth={2} />
            <span className="font-mono text-[10px] text-charcoal/50">{t("printedAndMailed")}</span>
          </div>
        </div>

        {/* CTA - See Upgrade Options */}
        <div className="pl-13">
          <Button
            onClick={handleUpgrade}
            className="gap-2 h-9 px-4 bg-white hover:bg-off-white text-charcoal font-mono text-[10px] font-bold uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
            style={{ borderRadius: "2px" }}
          >
            <Crown className="h-3.5 w-3.5" strokeWidth={2} />
            {t("seeUpgradeOptions")}
          </Button>
        </div>
      </div>
    )
  }

  // User has used trial and has no physical credits - show upgrade CTA
  if (hasUsedTrial && physicalCredits <= 0) {
    return (
      <div
        className="border-2 border-coral bg-coral/5 p-4 space-y-3"
        style={{ borderRadius: "2px" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-coral"
            style={{ borderRadius: "2px" }}
          >
            <Crown className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                {t("upgradeTitle")}
              </h3>
            </div>
            <p className="font-mono text-xs text-charcoal/60">
              {t("upgradeDescription")}
            </p>
          </div>
        </div>

        {/* Features comparison */}
        <div
          className="flex items-center justify-between bg-white border-2 border-charcoal/20 p-3"
          style={{ borderRadius: "2px" }}
        >
          <div className="text-center flex-1">
            <p className="font-mono text-[10px] text-charcoal/50 uppercase">{t("currentPlan")}</p>
            <p className="font-mono text-xs font-bold text-charcoal">{t("digitalCapsule")}</p>
            <p className="font-mono text-[10px] text-charcoal/50">{t("emailOnly")}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-charcoal/30 mx-4" strokeWidth={2} />
          <div className="text-center flex-1">
            <p className="font-mono text-[10px] text-teal-primary uppercase">{t("recommended")}</p>
            <p className="font-mono text-xs font-bold text-teal-primary">{t("paperPixels")}</p>
            <p className="font-mono text-[10px] text-charcoal/50">{t("emailAndPhysical")}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-charcoal/50">{t("proratedPrice")}</p>
            <p className="font-mono text-xs text-charcoal">{t("stripeCalculates")}</p>
          </div>
          <Button
            onClick={handleUpgrade}
            className="gap-2 h-9 px-4 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-[10px] font-bold uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
            style={{ borderRadius: "2px" }}
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            {t("upgradeNow")}
          </Button>
        </div>
      </div>
    )
  }

  // User has trial credit pending (purchased but not used)
  if (physicalCredits > 0 && !hasUsedTrial) {
    return (
      <div
        className="border-2 border-duck-yellow bg-duck-yellow/10 p-4 flex items-center gap-3"
        style={{ borderRadius: "2px" }}
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Gift className="h-4 w-4 text-charcoal" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-mono text-xs font-bold text-charcoal">
            {t("trialReady")}
          </p>
          <p className="font-mono text-[10px] text-charcoal/60">
            {t("trialReadyDescription", { credits: physicalCredits })}
          </p>
        </div>
      </div>
    )
  }

  return null
}

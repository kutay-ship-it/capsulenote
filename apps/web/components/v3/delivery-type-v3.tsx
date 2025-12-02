"use client"

import * as React from "react"
import { Mail, FileText, Check, Sparkles, AlertTriangle, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { DeliveryEligibility } from "@/server/lib/entitlement-types"

export type DeliveryChannel = "email" | "physical"

interface DeliveryTypeV3Props {
  value: DeliveryChannel[]
  onChange: (channels: DeliveryChannel[]) => void
  disabled?: boolean
  eligibility?: DeliveryEligibility
  isRefreshing?: boolean
  /** Callback when user clicks locked physical mail button (triggers upsell modal) */
  onPhysicalUpsellTriggered?: () => void
}

export function DeliveryTypeV3({
  value,
  onChange,
  disabled = false,
  eligibility,
  isRefreshing = false,
  onPhysicalUpsellTriggered,
}: DeliveryTypeV3Props) {
  const t = useTranslations("letters.deliveryType")
  const isEmailSelected = value.includes("email")
  const isPhysicalSelected = value.includes("physical")
  const isBothSelected = isEmailSelected && isPhysicalSelected

  // Credit status from eligibility
  const emailCredits = eligibility?.emailCredits ?? 0
  const physicalCredits = eligibility?.physicalCredits ?? 0
  const emailExhausted = emailCredits <= 0
  const physicalExhausted = physicalCredits <= 0

  // Check if physical mail is locked (Digital Capsule user without credits)
  const isPhysicalLocked =
    eligibility?.isDigitalCapsule &&
    physicalCredits <= 0 &&
    !eligibility?.canPurchasePhysicalTrial &&
    eligibility?.hasUsedPhysicalTrial

  // Check if user can purchase trial (Digital Capsule, no credits, hasn't purchased)
  const canShowTrialOffer =
    eligibility?.isDigitalCapsule &&
    physicalCredits <= 0 &&
    eligibility?.canPurchasePhysicalTrial

  const handleToggle = (channel: DeliveryChannel) => {
    if (disabled) return

    // Handle physical mail special cases
    if (channel === "physical") {
      // If locked or can show trial, trigger upsell instead of toggle
      if (isPhysicalLocked || canShowTrialOffer) {
        onPhysicalUpsellTriggered?.()
        return
      }
    }

    if (value.includes(channel)) {
      // Don't allow deselecting if it's the only one selected
      if (value.length === 1) return
      onChange(value.filter((c) => c !== channel))
    } else {
      onChange([...value, channel])
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {/* Email Option */}
        <button
          type="button"
          onClick={() => handleToggle("email")}
          disabled={disabled}
          aria-label={`${t("email")}. ${emailCredits} ${t("credits")}`}
          aria-pressed={isEmailSelected}
          className={cn(
            "relative flex flex-col items-center gap-2 border-2 border-charcoal px-3 py-4 font-mono transition-all duration-150",
            "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
            isEmailSelected
              ? "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
              : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
            disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Selected Checkmark */}
          {isEmailSelected && (
            <div
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Check className="h-3 w-3 text-charcoal" strokeWidth={3} />
            </div>
          )}

          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center border-2 border-charcoal transition-colors",
              isEmailSelected ? "bg-white" : "bg-duck-blue/20"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{t("email")}</span>

          {/* Credit indicator */}
          {eligibility && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 border",
                emailExhausted
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-charcoal/20 bg-white/50 text-charcoal/60"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isRefreshing ? (
                <div className="h-3 w-12 animate-pulse bg-charcoal/20 rounded-sm" />
              ) : (
                <>
                  {emailExhausted && (
                    <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2} />
                  )}
                  <span className="text-[9px] font-bold tabular-nums">
                    {emailCredits}
                  </span>
                  <span className="text-[8px] uppercase">{t("credits")}</span>
                </>
              )}
            </div>
          )}

          {!eligibility && (
            <span className="text-[9px] text-charcoal/50 uppercase tracking-wider -mt-1">
              {t("digitalDelivery")}
            </span>
          )}
        </button>

        {/* Physical Mail Option */}
        <button
          type="button"
          onClick={() => handleToggle("physical")}
          disabled={disabled}
          aria-label={`${t("physical")}. ${isPhysicalLocked ? t("upgradeRequired") : canShowTrialOffer ? t("tryFor499") : `${physicalCredits} ${t("credits")}`}`}
          aria-pressed={isPhysicalSelected}
          className={cn(
            "relative flex flex-col items-center gap-2 border-2 border-charcoal px-3 py-4 font-mono transition-all duration-150",
            "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
            isPhysicalSelected
              ? "bg-teal-primary text-white shadow-[3px_3px_0_theme(colors.charcoal)]"
              : isPhysicalLocked || canShowTrialOffer
                ? "bg-charcoal/5 text-charcoal/60 shadow-[2px_2px_0_theme(colors.charcoal/30)] border-charcoal/40 hover:bg-charcoal/10"
                : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-teal-primary/20",
            disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Selected Checkmark */}
          {isPhysicalSelected && (
            <div
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Check className="h-3 w-3 text-charcoal" strokeWidth={3} />
            </div>
          )}

          {/* Locked Badge for upgrade required */}
          {isPhysicalLocked && (
            <div
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-charcoal bg-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
          )}

          {/* Trial Badge for trial offer */}
          {canShowTrialOffer && (
            <div
              className="absolute -top-2 -right-2 flex items-center gap-1 px-1.5 py-0.5 border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-3 w-3 text-charcoal" strokeWidth={3} />
            </div>
          )}

          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center border-2 transition-colors",
              isPhysicalSelected
                ? "border-white bg-white/20"
                : isPhysicalLocked || canShowTrialOffer
                  ? "border-charcoal/30 bg-charcoal/10"
                  : "border-charcoal bg-teal-primary/20"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isPhysicalLocked ? (
              <Lock className="h-5 w-5" strokeWidth={2} />
            ) : (
              <FileText className="h-5 w-5" strokeWidth={2} />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {isPhysicalLocked ? t("locked") : t("physical")}
          </span>

          {/* Credit indicator or locked/trial status */}
          {eligibility && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 border",
                isPhysicalLocked
                  ? "border-charcoal/30 bg-charcoal/10 text-charcoal/60"
                  : canShowTrialOffer
                    ? "border-duck-yellow bg-duck-yellow/20 text-charcoal"
                    : physicalExhausted
                      ? isPhysicalSelected
                        ? "border-white/50 bg-white/10 text-white"
                        : "border-coral bg-coral/10 text-coral"
                      : isPhysicalSelected
                        ? "border-white/30 bg-white/10 text-white/80"
                        : "border-charcoal/20 bg-white/50 text-charcoal/60"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isRefreshing ? (
                <div
                  className={cn(
                    "h-3 w-12 animate-pulse rounded-sm",
                    isPhysicalSelected ? "bg-white/30" : "bg-charcoal/20"
                  )}
                />
              ) : isPhysicalLocked ? (
                <span className="text-[9px] font-bold uppercase">{t("upgradeRequired")}</span>
              ) : canShowTrialOffer ? (
                <span className="text-[9px] font-bold uppercase">{t("tryFor499")}</span>
              ) : (
                <>
                  {physicalExhausted && (
                    <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2} />
                  )}
                  <span className="text-[9px] font-bold tabular-nums">
                    {physicalCredits}
                  </span>
                  <span className="text-[8px] uppercase">{t("credits")}</span>
                </>
              )}
            </div>
          )}

          {!eligibility && (
            <span
              className={cn(
                "text-[9px] uppercase tracking-wider -mt-1",
                isPhysicalSelected ? "text-white/70" : "text-charcoal/50"
              )}
            >
              {t("realLetter")}
            </span>
          )}
        </button>
      </div>

      {/* Explanation Banner */}
      {isBothSelected && (
        <div
          className="flex items-start gap-3 p-3 border-2 border-duck-yellow bg-duck-yellow/20"
          style={{ borderRadius: "2px" }}
        >
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-charcoal" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
              {t("doubleDelivery.title")}
            </p>
            <p className="font-mono text-[10px] text-charcoal/70 leading-relaxed">
              {t("doubleDelivery.description")}
            </p>
          </div>
        </div>
      )}

      {/* Single selection info */}
      {!isBothSelected && isEmailSelected && (
        <p className="font-mono text-[9px] text-charcoal/40 uppercase tracking-wider text-center">
          {t("hints.addPhysical")}
        </p>
      )}
      {!isBothSelected && isPhysicalSelected && (
        <p className="font-mono text-[9px] text-charcoal/40 uppercase tracking-wider text-center">
          {t("hints.addEmail")}
        </p>
      )}
    </div>
  )
}

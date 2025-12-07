"use client"

import { useTranslations } from "next-intl"
import { Stamp, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CreditWarningBanner } from "@/components/v3/credit-warning-banner"
import type { DeliveryEligibility } from "@/server/lib/entitlement-types"
import { PHYSICAL_MAIL_MIN_LEAD_DAYS } from "@/server/lib/entitlement-types"

type DeliveryChannel = "email" | "physical"

interface LetterFormActionsProps {
  /** Whether form submission is in progress */
  isPending: boolean
  /** Whether the submit button should be enabled */
  canScheduleSelectedChannels: boolean
  /** Whether user has insufficient credits for selected channels */
  hasInsufficientCredits: boolean
  /** Whether physical mail date is less than 30 days away */
  physicalMailDateTooSoon: boolean
  /** Current eligibility state */
  eligibility: DeliveryEligibility
  /** Selected delivery channels */
  deliveryChannels: DeliveryChannel[]
  /** Handler to save current draft before checkout */
  onSaveBeforeCheckout: () => void
  /** Handler to clear the form */
  onClear: () => void
}

/**
 * Actions section of the letter editor
 * Contains submit button, credit warning, and clear button
 */
export function LetterFormActions({
  isPending,
  canScheduleSelectedChannels,
  hasInsufficientCredits,
  physicalMailDateTooSoon,
  eligibility,
  deliveryChannels,
  onSaveBeforeCheckout,
  onClear,
}: LetterFormActionsProps) {
  const t = useTranslations("letters.editor")

  return (
    <div
      className="border-2 border-charcoal bg-duck-cream p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      <div className="space-y-3">
        {/* Credit Warning Banner - shown when insufficient credits */}
        {hasInsufficientCredits && (
          <CreditWarningBanner
            eligibility={eligibility}
            selectedChannels={deliveryChannels}
            onBeforeCheckout={onSaveBeforeCheckout}
          />
        )}

        {/* Submit Button - Full width, disabled when no credits */}
        <Button
          type="submit"
          disabled={isPending || !canScheduleSelectedChannels}
          className={cn(
            "w-full gap-2 h-12",
            !canScheduleSelectedChannels && "opacity-50 cursor-not-allowed"
          )}
        >
          <Stamp className="h-4 w-4" strokeWidth={2} />
          {isPending ? t("sealing") : t("sealAndSchedule")}
        </Button>

        {/* Warning for physical mail date too soon */}
        {physicalMailDateTooSoon && (
          <div
            className="flex items-start gap-2 p-3 border-2 border-coral bg-coral/10"
            style={{ borderRadius: "2px" }}
          >
            <AlertTriangle className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-mono text-[10px] text-charcoal leading-relaxed">
              {t("physicalMailDateTooSoon", { days: PHYSICAL_MAIL_MIN_LEAD_DAYS })}
            </p>
          </div>
        )}

        {/* Helpful message when button is disabled */}
        {!canScheduleSelectedChannels && !hasInsufficientCredits && !physicalMailDateTooSoon && (
          <p className="font-mono text-[10px] text-center text-charcoal/50 uppercase tracking-wider">
            {!eligibility.hasActiveSubscription
              ? t("subscribeToSchedule")
              : t("selectChannelToContinue")}
          </p>
        )}

        {/* Secondary actions row */}
        <div className="flex gap-2">
          {/* Clear Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 h-10 text-charcoal/60 hover:text-coral hover:bg-coral/5"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                {t("clearButton")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="border-2 border-charcoal bg-white font-mono"
              style={{
                borderRadius: "2px",
                boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
                  {t("clearDialog.title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="font-mono text-sm text-charcoal/60">
                  {t("clearDialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel
                  className="border-2 border-charcoal bg-white hover:bg-off-white font-mono uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {t("clearDialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClear}
                  className="border-2 border-charcoal bg-coral hover:bg-coral/90 text-white font-mono uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {t("clearDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

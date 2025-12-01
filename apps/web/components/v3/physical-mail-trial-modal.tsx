"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Mail,
  Sparkles,
  Check,
  ArrowRight,
  X,
  Clock,
  Gift,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createTrialPhysicalCheckoutSession } from "@/server/actions/trial-physical"

interface PhysicalMailTrialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhysicalMailTrialModal({
  open,
  onOpenChange,
}: PhysicalMailTrialModalProps) {
  const t = useTranslations("letters.physicalMailTrial")
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const result = await createTrialPhysicalCheckoutSession()
      if (result.success && result.data?.url) {
        router.push(result.data.url)
      } else if (!result.success) {
        toast.error(t("errors.checkoutFailed"), {
          description: result.error?.message || t("errors.tryAgainLater"),
        })
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      toast.error(t("errors.checkoutFailed"), {
        description: t("errors.tryAgainLater"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    t("features.realLetter"),
    t("features.printedMailed"),
    t("features.thirtyDaysNotice"),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-visible border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>

        {/* Header */}
        <div className="relative border-b-2 border-charcoal bg-teal-primary p-6 pt-8 text-center">
          {/* Floating Badge */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-duck-yellow border-2 border-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal z-10"
            style={{ borderRadius: "2px" }}
          >
            <Gift className="h-3 w-3" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          {/* Icon */}
          <div
            className="mx-auto mb-4 mt-2 flex h-20 w-20 items-center justify-center border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <FileText className="h-10 w-10 text-teal-primary" strokeWidth={1.5} />
          </div>

          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-white">
            {t("title")}
          </h2>
          <p className="mt-1 font-mono text-[10px] text-white/80 uppercase tracking-wider">
            {t("subtitle")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <p className="font-mono text-sm text-charcoal/80 leading-relaxed text-center">
            {t("description")}
          </p>

          {/* Features List */}
          <div
            className="border-2 border-charcoal bg-off-white p-4 space-y-3"
            style={{ borderRadius: "2px" }}
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-teal-primary"
                  style={{ borderRadius: "2px" }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="font-mono text-xs text-charcoal leading-relaxed">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Price Box */}
          <div
            className="border-2 border-duck-yellow bg-duck-yellow/20 p-4 text-center"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60 mb-1">
              {t("priceLabel")}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-mono text-3xl font-bold text-charcoal">$4.99</span>
              <span className="font-mono text-xs text-charcoal/60">{t("oneTime")}</span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-charcoal/50">
              {t("trialNote")}
            </p>
          </div>

          {/* Info Banner */}
          <div
            className="flex items-start gap-3 p-3 border-2 border-dashed border-charcoal/30 bg-duck-cream"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles className="h-4 w-4 text-duck-yellow flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
              {t("upgradeHint")}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-charcoal bg-off-white p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 gap-2 h-11 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider"
              style={{ borderRadius: "2px" }}
            >
              <X className="h-4 w-4" strokeWidth={2} />
              {t("notNow")}
            </Button>
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={isLoading}
              className="flex-[2] gap-2 h-11 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
              style={{ borderRadius: "2px" }}
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-pulse" strokeWidth={2} />
                  {t("processing")}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  {t("tryPhysicalMail")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

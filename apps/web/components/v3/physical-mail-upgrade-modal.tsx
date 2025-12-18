"use client"

import * as React from "react"
import {
  Sparkles,
  Check,
  ArrowRight,
  X,
  Crown,
  Zap,
  Loader2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createUpgradeSession } from "@/server/actions/billing"
import { toast } from "sonner"

interface PhysicalMailUpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhysicalMailUpgradeModal({
  open,
  onOpenChange,
}: PhysicalMailUpgradeModalProps) {
  const t = useTranslations("letters.physicalMailUpgrade")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const result = await createUpgradeSession()
      if (result.success) {
        window.location.href = result.data.url
      } else {
        toast.error("Failed to start upgrade", {
          description: result.error.message || "Please try again",
        })
        setIsLoading(false)
      }
    } catch {
      toast.error("Failed to start upgrade", {
        description: "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const digitalFeatures = [
    { text: t("plans.digital.feature1"), included: true },
    { text: t("plans.digital.feature2"), included: true },
    { text: t("plans.digital.feature3"), included: false },
    { text: t("plans.digital.feature4"), included: false },
  ]

  const paperFeatures = [
    { text: t("plans.paper.feature1"), included: true },
    { text: t("plans.paper.feature2"), included: true },
    { text: t("plans.paper.feature3"), included: true },
    { text: t("plans.paper.feature4"), included: true },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg overflow-visible border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>

        {/* Header */}
        <div className="relative border-b-2 border-charcoal bg-coral p-6 pt-8 text-center">
          {/* Floating Badge */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white z-10"
            style={{ borderRadius: "2px" }}
          >
            <Crown className="h-3 w-3" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          {/* Icon */}
          <div
            className="mx-auto mb-4 mt-2 flex h-16 w-16 items-center justify-center border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Zap className="h-8 w-8 text-coral" strokeWidth={1.5} />
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

          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Digital Capsule (Current) */}
            <div
              className="border-2 border-charcoal/30 bg-off-white p-4"
              style={{ borderRadius: "2px" }}
            >
              <div className="text-center mb-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">
                  {t("plans.digital.title")}
                </p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="font-mono text-lg font-bold text-charcoal/60">$2.22</span>
                  <span className="font-mono text-[10px] text-charcoal/40">/yr</span>
                </div>
              </div>
              <div className="space-y-2">
                {digitalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div
                      className={cn(
                        "flex h-4 w-4 flex-shrink-0 items-center justify-center border",
                        feature.included
                          ? "border-charcoal/20 bg-charcoal/10"
                          : "border-charcoal/10 bg-transparent"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      {feature.included ? (
                        <Check className="h-2.5 w-2.5 text-charcoal/50" strokeWidth={3} />
                      ) : (
                        <X className="h-2.5 w-2.5 text-charcoal/30" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] leading-relaxed",
                        feature.included ? "text-charcoal/60" : "text-charcoal/30"
                      )}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paper & Pixels (Upgrade) */}
            <div
              className="border-2 border-teal-primary bg-teal-primary/5 p-4 relative"
              style={{ borderRadius: "2px" }}
            >
              {/* Recommended Badge */}
              <div
                className="absolute -top-2 right-2 px-2 py-0.5 bg-teal-primary font-mono text-[8px] font-bold uppercase tracking-wider text-white"
                style={{ borderRadius: "2px" }}
              >
                {t("plans.paper.recommended")}
              </div>

              <div className="text-center mb-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-primary mb-1">
                  {t("plans.paper.title")}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-lg font-bold text-teal-primary">$29</span>
                  <span className="font-mono text-[10px] text-charcoal/40">/yr</span>
                </div>
              </div>
              <div className="space-y-2">
                {paperFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center border border-teal-primary bg-teal-primary"
                      style={{ borderRadius: "2px" }}
                    >
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-mono text-[10px] text-charcoal leading-relaxed">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proration Note */}
          <div
            className="border-2 border-duck-yellow bg-duck-yellow/20 p-4 text-center"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-duck-yellow" strokeWidth={2} />
              <p className="font-mono text-xs font-bold text-charcoal">
                {t("prorationTitle")}
              </p>
            </div>
            <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
              {t("prorationDescription")}
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
              {t("maybeLater")}
            </Button>
            <Button
              type="button"
              onClick={handleUpgrade}
              disabled={isLoading}
              className="flex-[2] gap-2 h-11 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "2px" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  {t("loading")}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  {t("upgradeNow")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

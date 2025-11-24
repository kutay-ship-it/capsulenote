"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { ErrorCodes } from "@dearme/types"

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  error?: {
    code: string
    message: string
    details?: {
      requiredPlan?: string
      currentPlan?: string
      upgradeUrl?: string
      currentUsage?: number
      limit?: number | string
    }
  }
}

export function UpgradeModal({ open, onClose, error }: UpgradeModalProps) {
  const t = useTranslations("billing.upgradeModal")

  const isQuotaError = error?.code === 'QUOTA_EXCEEDED'
  const isSubscriptionError = error?.code === 'SUBSCRIPTION_REQUIRED'
  const isCreditsError = error?.code === 'INSUFFICIENT_CREDITS'

  const upgradeUrl = error?.details?.upgradeUrl || '/pricing'

  const getTitle = () => {
    if (isQuotaError) return t("quotaTitle")
    if (isSubscriptionError) return t("subscriptionTitle")
    if (isCreditsError) return t("creditsTitle")
    return t("defaultTitle")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-2 border-charcoal" style={{ borderRadius: "2px" }}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Zap className="h-6 w-6 text-charcoal" strokeWidth={2} />
            </div>
            <DialogTitle className="font-mono text-xl font-normal uppercase tracking-wide">
              {getTitle()}
            </DialogTitle>
          </div>
          <DialogDescription className="font-mono text-sm text-gray-secondary">
            {error?.message || t("defaultDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Current Usage (for quota errors) */}
        {isQuotaError && error?.details?.currentUsage !== undefined && error?.details?.limit && (
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-gray-secondary">{t("currentUsage")}</span>
              <Badge
                className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
                style={{ borderRadius: "2px" }}
              >
                {error.details.currentUsage} / {error.details.limit}
              </Badge>
            </div>
          </div>
        )}

        {/* Pro Features */}
        <div className="space-y-3 py-4">
          <p className="font-mono text-sm font-medium uppercase tracking-wide text-charcoal">
            {t("proIncludes")}
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-lime mt-0.5 flex-shrink-0" strokeWidth={3} />
              <span className="font-mono text-sm text-gray-secondary">{t("features.unlimited")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-lime mt-0.5 flex-shrink-0" strokeWidth={3} />
              <span className="font-mono text-sm text-gray-secondary">{t("features.email")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-lime mt-0.5 flex-shrink-0" strokeWidth={3} />
              <span className="font-mono text-sm text-gray-secondary">{t("features.mail")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-lime mt-0.5 flex-shrink-0" strokeWidth={3} />
              <span className="font-mono text-sm text-gray-secondary">{t("features.support")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-lime mt-0.5 flex-shrink-0" strokeWidth={3} />
              <span className="font-mono text-sm text-gray-secondary">{t("features.trial")}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-2 border-charcoal font-mono text-sm uppercase tracking-wide"
            style={{ borderRadius: "2px" }}
          >
            {t("cancel")}
          </Button>
          <Link href={upgradeUrl}>
            <Button
              className="border-2 border-charcoal bg-lime font-mono text-sm uppercase tracking-wide hover:bg-lime/90"
              style={{ borderRadius: "2px" }}
            >
              {t("upgrade")}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

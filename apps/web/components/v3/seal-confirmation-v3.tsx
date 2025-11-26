"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Mail,
  FileText,
  Calendar,
  User,
  Users,
  Stamp,
  Lock,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DeliveryChannel } from "@/components/v3/delivery-type-v3"
import type { DeliveryEligibility } from "@/server/actions/entitlements"

interface SealConfirmationV3Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting: boolean
  letterTitle: string
  recipientType: "myself" | "someone-else"
  recipientName?: string
  recipientEmail: string
  deliveryChannels: DeliveryChannel[]
  deliveryDate: Date
  eligibility: DeliveryEligibility
}

export function SealConfirmationV3({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  letterTitle,
  recipientType,
  recipientName,
  recipientEmail,
  deliveryChannels,
  deliveryDate,
  eligibility,
}: SealConfirmationV3Props) {
  const hasEmail = deliveryChannels.includes("email")
  const hasPhysical = deliveryChannels.includes("physical")
  const isBothChannels = hasEmail && hasPhysical

  const recipientDisplay = recipientType === "myself" ? "Future You" : recipientName || recipientEmail
  const formattedDate = format(deliveryDate, "EEEE, MMMM d, yyyy")
  const daysFromNow = Math.ceil((deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  // Calculate credit cost (clamped to prevent negative display)
  const emailCreditCost = hasEmail ? 1 : 0
  const physicalCreditCost = hasPhysical ? 1 : 0
  const emailCreditsAfter = Math.max(0, eligibility.emailCredits - emailCreditCost)
  const physicalCreditsAfter = Math.max(0, eligibility.physicalCredits - physicalCreditCost)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-visible border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogTitle className="sr-only">Seal your letter confirmation</DialogTitle>
        {/* Header with Wax Seal */}
        <div className="relative border-b-2 border-charcoal bg-duck-yellow p-6 pt-8 text-center">
          {/* Floating Badge */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white z-10"
            style={{ borderRadius: "2px" }}
          >
            <Lock className="h-3 w-3" strokeWidth={2} />
            <span>Final Review</span>
          </div>

          {/* Wax Seal Icon */}
          <div
            className="mx-auto mb-4 mt-2 flex h-20 w-20 items-center justify-center border-4 border-charcoal bg-coral shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "50%" }}
          >
            <Stamp className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Seal Your Letter
          </h2>
          <p className="mt-1 font-mono text-[10px] text-charcoal/70 uppercase tracking-wider">
            Review details before sealing
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Letter Title */}
          <div
            className="border-2 border-charcoal bg-off-white p-4"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">
              Your Letter
            </p>
            <p className="font-mono text-sm font-bold text-charcoal line-clamp-1">
              "{letterTitle}"
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-2">
            {/* Recipient */}
            <div
              className="flex items-center gap-3 border-2 border-charcoal p-3"
              style={{ borderRadius: "2px" }}
            >
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                  recipientType === "myself" ? "bg-duck-yellow" : "bg-teal-primary"
                )}
                style={{ borderRadius: "2px" }}
              >
                {recipientType === "myself" ? (
                  <User className="h-4 w-4 text-charcoal" strokeWidth={2} />
                ) : (
                  <Users className="h-4 w-4 text-white" strokeWidth={2} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Recipient
                </p>
                <p className="font-mono text-xs font-bold text-charcoal truncate">
                  {recipientDisplay}
                </p>
                <p className="font-mono text-[10px] text-charcoal/50 truncate">
                  {recipientEmail}
                </p>
              </div>
            </div>

            {/* Delivery Method */}
            <div
              className="flex items-center gap-3 border-2 border-charcoal p-3"
              style={{ borderRadius: "2px" }}
            >
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                  isBothChannels ? "bg-duck-yellow" : hasEmail ? "bg-duck-blue" : "bg-teal-primary"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isBothChannels ? (
                  <Sparkles className="h-4 w-4 text-charcoal" strokeWidth={2} />
                ) : hasEmail ? (
                  <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
                ) : (
                  <FileText className="h-4 w-4 text-white" strokeWidth={2} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Delivery Method
                </p>
                <p className="font-mono text-xs font-bold text-charcoal">
                  {isBothChannels
                    ? "Email + Physical Letter"
                    : hasEmail
                      ? "Email Only"
                      : "Physical Letter Only"}
                </p>
              </div>
            </div>

            {/* Delivery Date */}
            <div
              className="flex items-center gap-3 border-2 border-duck-blue bg-duck-blue/10 p-3"
              style={{ borderRadius: "2px" }}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-blue"
                style={{ borderRadius: "2px" }}
              >
                <Calendar className="h-4 w-4 text-charcoal" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Arrives In
                </p>
                <p className="font-mono text-xs font-bold text-charcoal">
                  {formattedDate}
                </p>
                <p className="font-mono text-[10px] text-duck-blue font-bold">
                  {daysFromNow === 1 ? "Tomorrow" : `${daysFromNow} days from now`}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Cost Display */}
          <div
            className="border-2 border-duck-yellow bg-duck-yellow/10 p-3 space-y-2"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
              Credit Usage
            </p>
            <div className="space-y-1.5">
              {hasEmail && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal">Email delivery</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    1 credit ({eligibility.emailCredits} → {emailCreditsAfter})
                  </span>
                </div>
              )}
              {hasPhysical && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal">Physical mail</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    1 credit ({eligibility.physicalCredits} → {physicalCreditsAfter})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div
            className="flex items-start gap-3 p-3 border-2 border-dashed border-charcoal/30 bg-duck-cream"
            style={{ borderRadius: "2px" }}
          >
            <Lock className="h-4 w-4 text-charcoal/50 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
              Once sealed, your letter will be <span className="font-bold text-charcoal">locked and encrypted</span> until the delivery date. You won't be able to read or edit it.
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
              disabled={isSubmitting}
              className="flex-1 gap-2 h-11 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider"
              style={{ borderRadius: "2px" }}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Go Back
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-[2] gap-2 h-11 bg-coral hover:bg-coral/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
              style={{ borderRadius: "2px" }}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-pulse" strokeWidth={2} />
                  Sealing...
                </>
              ) : (
                <>
                  <Stamp className="h-4 w-4" strokeWidth={2} />
                  Seal & Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"
import { useTransition } from "react"
import { AlertTriangle, Plus, Loader2, Mail, FileText } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import type { DeliveryEligibility } from "@/server/lib/entitlement-types"
import type { DeliveryChannel } from "@/components/v3/delivery-type-v3"

// ============================================================================
// TYPES
// ============================================================================

interface CreditWarningBannerProps {
  eligibility: DeliveryEligibility
  selectedChannels: DeliveryChannel[]
  className?: string
  /** Called before opening checkout to save draft */
  onBeforeCheckout?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Warning banner shown when user has selected delivery channels
 * but lacks sufficient credits to schedule them
 */
export function CreditWarningBanner({
  eligibility,
  selectedChannels,
  className,
  onBeforeCheckout,
}: CreditWarningBannerProps) {
  const [isPendingEmail, startTransitionEmail] = useTransition()
  const [isPendingPhysical, startTransitionPhysical] = useTransition()

  const needsEmail = selectedChannels.includes("email")
  const needsPhysical = selectedChannels.includes("physical")

  const emailShort = needsEmail && eligibility.emailCredits <= 0
  const physicalShort = needsPhysical && eligibility.physicalCredits <= 0

  // Don't render if no shortage
  if (!emailShort && !physicalShort) return null

  // Check if user has no subscription at all
  const noSubscription = !eligibility.hasActiveSubscription

  const handleAddCredits = (type: "email" | "physical") => {
    const transition = type === "email" ? startTransitionEmail : startTransitionPhysical

    transition(async () => {
      // Save draft before opening checkout (safety net)
      onBeforeCheckout?.()

      // Return to dedicated success page that broadcasts to other tabs
      const successUrl = typeof window !== "undefined"
        ? `${window.location.origin}/credits/success`
        : undefined

      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        successUrl,
        cancelUrl: typeof window !== "undefined" ? window.location.href : undefined,
      })

      if (result.success) {
        // Open in new tab so user doesn't lose their draft
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab", {
          description: "Complete your purchase to add credits. This page will refresh when you return.",
        })
      } else {
        if (result.error.code === "NO_CUSTOMER") {
          toast.error("Subscription required", {
            description: "Please subscribe to a plan first before purchasing additional credits.",
            action: {
              label: "View Plans",
              onClick: () => window.open("/pricing", "_blank"),
            },
          })
        } else {
          toast.error("Failed to start checkout", {
            description: result.error.message || "Please try again",
          })
        }
      }
    })
  }

  return (
    <div
      className={cn(
        "border-2 border-coral bg-coral/10 p-4 space-y-3",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 border-coral bg-coral"
          style={{ borderRadius: "2px" }}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-white" strokeWidth={2} />
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
          {noSubscription ? "Subscription Required" : "Insufficient Credits"}
        </span>
      </div>

      {/* Message */}
      <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
        {noSubscription ? (
          <>
            You need an active subscription to schedule letter deliveries.
            Subscribe to get credits and start sending letters to your future self.
          </>
        ) : (
          <>
            {emailShort && physicalShort
              ? "No email or physical mail credits remaining. "
              : emailShort
                ? "No email credits remaining. "
                : "No physical mail credits remaining. "}
            Add credits to schedule delivery, or your letter will be saved as a draft.
          </>
        )}
      </p>

      {/* Credit Status */}
      {!noSubscription && (
        <div className="flex gap-3">
          {needsEmail && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-2",
                emailShort
                  ? "border-coral bg-coral/5"
                  : "border-charcoal/20 bg-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Mail className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
              <span className="font-mono text-xs font-bold text-charcoal">
                {eligibility.emailCredits}
              </span>
              <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                email
              </span>
            </div>
          )}
          {needsPhysical && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-2",
                physicalShort
                  ? "border-coral bg-coral/5"
                  : "border-charcoal/20 bg-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              <FileText className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
              <span className="font-mono text-xs font-bold text-charcoal">
                {eligibility.physicalCredits}
              </span>
              <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                mail
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {noSubscription ? (
          <button
            onClick={() => window.open("/pricing", "_blank")}
            className={cn(
              "flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2",
              "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
              "transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            View Plans
          </button>
        ) : (
          <>
            {emailShort && (
              <button
                onClick={() => handleAddCredits("email")}
                disabled={isPendingEmail}
                className={cn(
                  "flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-3 py-2",
                  "font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isPendingEmail ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                    Opening...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add Email Credits
                  </>
                )}
              </button>
            )}
            {physicalShort && (
              <button
                onClick={() => handleAddCredits("physical")}
                disabled={isPendingPhysical}
                className={cn(
                  "flex items-center gap-2 border-2 border-charcoal bg-teal-primary px-3 py-2",
                  "font-mono text-[10px] font-bold uppercase tracking-wider text-white",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isPendingPhysical ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                    Opening...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add Mail Credits
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

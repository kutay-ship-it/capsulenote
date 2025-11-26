"use client"

import { useState, useTransition } from "react"
import { Mail, FileText, Plus, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import { toast } from "sonner"

// ============================================================================
// TYPES
// ============================================================================

type CreditType = "email" | "mail"

interface CreditIndicatorV3Props {
  type: CreditType
  count: number
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CREDIT_CONFIG: Record<
  CreditType,
  {
    icon: typeof Mail
    label: string
    singularLabel: string
    addLabel: string
    description: string
    emptyMessage: string
    lowMessage: string
  }
> = {
  email: {
    icon: Mail,
    label: "Email Credits",
    singularLabel: "Email Credit",
    addLabel: "Add Email Credits",
    description: "Send letters via email",
    emptyMessage: "No email credits remaining",
    lowMessage: "Running low on email credits",
  },
  mail: {
    icon: FileText,
    label: "Mail Credits",
    singularLabel: "Mail Credit",
    addLabel: "Add Mail Credits",
    description: "Send physical letters",
    emptyMessage: "No mail credits remaining",
    lowMessage: "Running low on mail credits",
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCreditStatus(count: number) {
  if (count === 0) return "empty"
  if (count <= 2) return "low"
  return "good"
}

function getStatusColors(status: "empty" | "low" | "good") {
  switch (status) {
    case "empty":
      return {
        bg: "bg-coral",
        text: "text-white",
        border: "border-coral",
        iconColor: "text-white",
      }
    case "low":
      return {
        bg: "bg-duck-yellow",
        text: "text-charcoal",
        border: "border-charcoal",
        iconColor: "text-charcoal",
      }
    case "good":
      return {
        bg: "bg-teal-primary",
        text: "text-white",
        border: "border-teal-primary",
        iconColor: "text-white",
      }
  }
}

// ============================================================================
// CREDIT INDICATOR COMPONENT
// Minimal trigger (Style A) + Full detailed popover (Style D)
// ============================================================================

export function CreditIndicatorV3({
  type,
  count,
  className,
}: CreditIndicatorV3Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const config = CREDIT_CONFIG[type]
  const status = getCreditStatus(count)
  const colors = getStatusColors(status)
  const Icon = config.icon
  const isEmpty = status === "empty"
  const isLow = status === "low"

  const handleAddCredits = () => {
    startTransition(async () => {
      const addonType = type === "email" ? "email" : "physical"
      const result = await createAddOnCheckoutSession({ type: addonType })
      if (result.success) {
        window.location.href = result.data.url
      } else {
        toast.error("Failed to start checkout", {
          description: result.error.message || "Please try again",
        })
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Minimal Trigger (Style A) */}
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-2 py-1 font-mono text-xs font-bold transition-opacity hover:opacity-80",
            isEmpty ? "text-coral" : isLow ? "text-duck-yellow" : "text-charcoal",
            className
          )}
          aria-label={`${count} ${count === 1 ? config.singularLabel : config.label}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span className="tabular-nums">{count}</span>
        </button>
      </PopoverTrigger>

      {/* Full Detailed Popover (Style D) */}
      <PopoverContent
        className="w-64 border-2 border-charcoal bg-white p-0 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-2 border-b-2 border-charcoal px-4 py-3",
            colors.bg
          )}
        >
          <Icon className={cn("h-4 w-4", colors.iconColor)} strokeWidth={2} />
          <span className={cn("font-mono text-xs font-bold uppercase tracking-wider", colors.text)}>
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Credit Count Display */}
          <div className="text-center">
            <div className="font-mono text-4xl font-bold text-charcoal">{count}</div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
              {count === 1 ? config.singularLabel : config.label} remaining
            </p>
          </div>

          {/* Status Message */}
          {(isEmpty || isLow) && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 font-mono text-[10px]",
                isEmpty
                  ? "bg-coral/10 text-coral"
                  : "bg-duck-yellow/20 text-charcoal"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              <span>{isEmpty ? config.emptyMessage : config.lowMessage}</span>
            </div>
          )}

          {/* Description */}
          <p className="font-mono text-xs text-charcoal/60">{config.description}</p>

          {/* Add Credits Button */}
          <button
            onClick={handleAddCredits}
            disabled={isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2.5",
              "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
              "transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{config.addLabel}</span>
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

interface EmailCreditIndicatorV3Props {
  count: number
  className?: string
}

export function EmailCreditIndicatorV3({ count, className }: EmailCreditIndicatorV3Props) {
  return <CreditIndicatorV3 type="email" count={count} className={className} />
}

interface MailCreditIndicatorV3Props {
  count: number
  className?: string
}

export function MailCreditIndicatorV3({ count, className }: MailCreditIndicatorV3Props) {
  return <CreditIndicatorV3 type="mail" count={count} className={className} />
}

// ============================================================================
// COMBINED CREDITS BAR (for showing both in navbar)
// ============================================================================

interface CreditsBarV3Props {
  emailCredits: number
  mailCredits: number
  className?: string
}

/**
 * Combined credits bar showing both email and mail credits
 * Designed for navbar placement
 */
export function CreditsBarV3({ emailCredits, mailCredits, className }: CreditsBarV3Props) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <EmailCreditIndicatorV3 count={emailCredits} />
      <MailCreditIndicatorV3 count={mailCredits} />
    </div>
  )
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

export function CreditIndicatorV3Skeleton() {
  return (
    <div className="flex items-center gap-1 px-2 py-1 animate-pulse">
      <div className="h-3.5 w-3.5 rounded-sm bg-charcoal/20" />
      <div className="h-3 w-4 rounded-sm bg-charcoal/20" />
    </div>
  )
}

export function CreditsBarV3Skeleton() {
  return (
    <div className="flex items-center gap-1">
      <CreditIndicatorV3Skeleton />
      <CreditIndicatorV3Skeleton />
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Mail,
  FileText,
  Plus,
  Minus,
  Loader2,
  AlertTriangle,
  Zap,
  Check,
  Lock,
  Sparkles,
  Crown,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreditsUpdateListener } from "@/hooks/use-credits-broadcast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import { createTrialPhysicalCheckoutSession } from "@/server/actions/trial-physical"
import { createUpgradeSession } from "@/server/actions/billing"
import { toast } from "sonner"
import {
  type CreditAddonType,
  CREDIT_ADDON_BASE_PRICES,
  calculateCreditAddonPrice,
  getCreditAddonDiscount,
} from "@/lib/pricing-constants"

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
  }
> = {
  email: {
    icon: Mail,
    label: "Email Credits",
    singularLabel: "Email Credit",
  },
  mail: {
    icon: FileText,
    label: "Mail Credits",
    singularLabel: "Mail Credit",
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

/**
 * Map UI credit type to addon type for pricing
 */
function toAddonType(type: CreditType): CreditAddonType {
  return type === "mail" ? "physical" : "email"
}

/**
 * Calculate price using centralized Stripe-synced pricing tiers
 * @see lib/pricing-constants.ts - MUST match Stripe Dashboard volume pricing
 */
function calculatePrice(quantity: number, type: CreditType): number {
  const addonType = toAddonType(type)
  return calculateCreditAddonPrice(addonType, quantity).total
}

/**
 * Get discount percentage using centralized pricing tiers
 */
function getDiscountPercent(quantity: number, type: CreditType): number {
  const addonType = toAddonType(type)
  return getCreditAddonDiscount(addonType, quantity)
}

/**
 * Get base price for a credit type
 */
function getBasePrice(type: CreditType): number {
  const addonType = toAddonType(type)
  return CREDIT_ADDON_BASE_PRICES[addonType]
}

// ============================================================================
// SMART ADAPTIVE PANEL (Variation 6)
// Combines urgency awareness with full quantity control
// ============================================================================

interface SmartAdaptivePanelProps {
  type: CreditType
  currentCredits: number
  onClose: () => void
}

function SmartAdaptivePanel({ type, currentCredits, onClose }: SmartAdaptivePanelProps) {
  const [quantity, setQuantity] = useState(25)
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = type === "email" ? Mail : FileText
  const status = getCreditStatus(currentCredits)
  const price = calculatePrice(quantity, type)
  const discount = getDiscountPercent(quantity, type)
  const basePrice = getBasePrice(type)
  const perUnit = (price / quantity).toFixed(2)
  const savings = Number((quantity * basePrice - price).toFixed(2))

  // Quick select options based on urgency
  const quickOptions = status === "empty"
    ? [10, 25, 50]
    : status === "low"
    ? [5, 10, 25]
    : [10, 25, 50]

  const statusConfig = {
    empty: {
      borderColor: "border-coral",
      headerBg: "bg-coral",
      headerText: "text-white",
      badgeIcon: AlertTriangle,
      badgeText: "No Credits",
      message: "You need credits to schedule deliveries",
    },
    low: {
      borderColor: "border-duck-yellow",
      headerBg: "bg-duck-yellow",
      headerText: "text-charcoal",
      badgeIcon: Zap,
      badgeText: "Running Low",
      message: `Only ${currentCredits} credit${currentCredits === 1 ? "" : "s"} left`,
    },
    good: {
      borderColor: "border-teal-primary",
      headerBg: "bg-teal-primary",
      headerText: "text-white",
      badgeIcon: Check,
      badgeText: `${currentCredits} Available`,
      message: "Add more credits anytime",
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.badgeIcon

  const handlePurchase = () => {
    startTransition(async () => {
      const addonType = type === "email" ? "email" : "physical"
      const successUrl = typeof window !== "undefined"
        ? `${window.location.origin}/credits/success`
        : undefined

      const result = await createAddOnCheckoutSession({
        type: addonType,
        quantity,
        successUrl,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab", {
          description: "Complete your purchase to add credits.",
        })
        onClose()
      } else {
        toast.error("Failed to start checkout", {
          description: result.error.message || "Please try again",
        })
      }
    })
  }

  return (
    <div className="w-full">
      {/* Status Header Bar */}
      <div className={cn("flex items-center justify-between px-4 py-2 border-b-2 border-charcoal", config.headerBg)}>
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("h-4 w-4", config.headerText)} strokeWidth={2.5} />
          <span className={cn("font-mono text-xs font-bold uppercase tracking-wider", config.headerText)}>
            {config.badgeText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", config.headerText)} strokeWidth={2} />
          <span className={cn("font-mono text-[10px] uppercase", config.headerText)}>
            {type === "email" ? "Email" : "Mail"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Message */}
        <p className="font-mono text-xs text-charcoal/70">{config.message}</p>

        {/* Quick Select Options */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
            Quick Add
          </span>
          <div className="grid grid-cols-3 gap-2">
            {quickOptions.map((q) => {
              const qPrice = calculatePrice(q, type)
              const qDiscount = getDiscountPercent(q, type)
              const isSelected = quantity === q
              return (
                <button
                  key={q}
                  onClick={() => {
                    setQuantity(q)
                    setIsExpanded(true)
                  }}
                  className={cn(
                    "relative flex flex-col items-center p-2.5 border-2 transition-all",
                    "hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
                    isSelected
                      ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                      : "border-charcoal/40 bg-white hover:border-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-lg font-bold text-charcoal">+{q}</span>
                  <span className="font-mono text-[10px] font-bold text-charcoal">${qPrice.toFixed(2)}</span>
                  {qDiscount > 0 && (
                    <span className="mt-0.5 px-1 py-0.5 bg-teal-primary/10 font-mono text-[8px] font-bold text-teal-primary">
                      {qDiscount}% OFF
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-charcoal flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Expandable Custom Quantity Section */}
        <div className="border-t-2 border-dashed border-charcoal/10 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full group"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50 group-hover:text-charcoal">
              Custom Quantity
            </span>
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center border border-charcoal/30 transition-transform",
                isExpanded && "rotate-180"
              )}
              style={{ borderRadius: "2px" }}
            >
              <svg className="h-3 w-3 text-charcoal/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Stepper Control */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-9 w-9 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 active:shadow-none transition-all shadow-[1px_1px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5 text-charcoal" strokeWidth={2.5} />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="h-10 w-16 border-2 border-charcoal bg-duck-yellow font-mono text-lg font-bold text-center text-charcoal focus:outline-none focus:ring-2 focus:ring-duck-blue"
                  style={{ borderRadius: "2px" }}
                  min={1}
                  max={100}
                />

                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="flex h-9 w-9 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 active:shadow-none transition-all shadow-[1px_1px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                  disabled={quantity >= 100}
                >
                  <Plus className="h-3.5 w-3.5 text-charcoal" strokeWidth={2.5} />
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="bg-off-white p-2.5 space-y-1.5" style={{ borderRadius: "2px" }}>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-charcoal/60">{quantity}× @ ${perUnit}</span>
                  <span className="font-mono text-[10px] text-charcoal">${(quantity * basePrice).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] font-bold text-teal-primary">Discount ({discount}%)</span>
                    <span className="font-mono text-[10px] font-bold text-teal-primary">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-charcoal/10 pt-1.5 flex justify-between">
                  <span className="font-mono text-xs font-bold text-charcoal">Total</span>
                  <span className="font-mono text-base font-bold text-charcoal">${price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3",
            "font-mono text-xs font-bold uppercase tracking-wider",
            "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
            status === "empty" ? "bg-coral text-white" : "bg-duck-yellow text-charcoal"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Add {quantity} — ${price.toFixed(2)}
              {discount > 0 && <span className="text-teal-primary ml-1">({discount}%)</span>}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// DIGITAL CAPSULE MAIL PANEL
// Shows trial offer or upgrade prompt for Digital Capsule users
// ============================================================================

interface DigitalCapsuleMailPanelProps {
  currentCredits: number
  canPurchaseTrial: boolean
  hasUsedTrial: boolean
  onClose: () => void
}

function DigitalCapsuleMailPanel({
  currentCredits,
  canPurchaseTrial,
  hasUsedTrial,
  onClose,
}: DigitalCapsuleMailPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const t = useTranslations("settings.billing.mailCredits")

  const handleTrialPurchase = () => {
    startTransition(async () => {
      const result = await createTrialPhysicalCheckoutSession()
      if (result.success && result.data?.url) {
        // Open in new tab (consistent with other payment flows)
        window.open(result.data.url, "_blank")
        toast.info(t("checkoutOpened"), {
          description: t("checkoutOpenedDescription"),
        })
        onClose()
      } else if (!result.success) {
        toast.error("Failed to start checkout", {
          description: result.error?.message || "Please try again",
        })
      }
    })
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const result = await createUpgradeSession()
      if (result.success) {
        // Open in new tab (consistent with other payment flows)
        window.open(result.data.url, "_blank")
        toast.info(t("checkoutOpened"), {
          description: t("checkoutOpenedDescription"),
        })
        onClose()
      } else {
        toast.error("Failed to start upgrade", {
          description: result.error.message || "Please try again",
        })
      }
    } catch {
      toast.error("Failed to start upgrade", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  // If user has credits (from trial), show available state
  if (currentCredits > 0) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b-2 border-charcoal bg-teal-primary">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              {t("available", { count: currentCredits })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            <span className="font-mono text-[10px] uppercase text-white">
              {t("headerMail")}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="font-mono text-xs text-charcoal/70">
            {t("trialReady")}
          </p>

          <div className="border-2 border-dashed border-charcoal/20 bg-duck-cream p-3" style={{ borderRadius: "2px" }}>
            <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
              <Sparkles className="h-3 w-3 inline mr-1 text-duck-yellow" strokeWidth={2} />
              {t.rich("upgradeHint", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-2.5 bg-white hover:bg-off-white font-mono text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: "2px" }}
          >
            {isUpgrading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Crown className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {isUpgrading ? "Loading..." : t("viewUpgradeOptions")}
          </button>
        </div>
      </div>
    )
  }

  // If can purchase trial, show trial offer
  if (canPurchaseTrial) {
    const trialFeatures = [
      t("trialFeature1"),
      t("trialFeature2"),
      t("trialFeature3"),
    ]

    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b-2 border-charcoal bg-duck-yellow">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-charcoal" strokeWidth={2.5} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
              {t("tryPhysicalMail")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-charcoal" strokeWidth={2} />
            <span className="font-mono text-[10px] uppercase text-charcoal">
              {t("headerMail")}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="font-mono text-xs text-charcoal/70">
            {t("trialDescription")}
          </p>

          {/* Features */}
          <div className="border-2 border-charcoal/20 bg-off-white p-3 space-y-2" style={{ borderRadius: "2px" }}>
            {trialFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-teal-primary" strokeWidth={3} />
                <span className="font-mono text-[10px] text-charcoal">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center py-2">
            <span className="font-mono text-2xl font-bold text-charcoal">{t("trialPrice")}</span>
            <span className="font-mono text-xs text-charcoal/50 ml-1">{t("trialPriceLabel")}</span>
          </div>

          <button
            onClick={handleTrialPurchase}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: "2px" }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("processing")}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                {t("tryForPrice")}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // User has used trial and has no credits - show upgrade
  const upgradeFeatures = [
    t("feature24Email"),
    t("feature3Mail"),
    t("featurePremium"),
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-charcoal bg-charcoal">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-white" strokeWidth={2.5} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            {t("upgradeRequired")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          <span className="font-mono text-[10px] uppercase text-white">
            {t("headerMail")}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="font-mono text-xs text-charcoal/70">
          {hasUsedTrial
            ? t("trialUsedMessage")
            : t("noTrialMessage")
          }
        </p>

        {/* Plan comparison hint */}
        <div className="border-2 border-charcoal/20 bg-off-white p-3" style={{ borderRadius: "2px" }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-teal-primary" strokeWidth={2} />
            <span className="font-mono text-xs font-bold text-charcoal">{t("paperPixelsTitle")}</span>
          </div>
          <ul className="space-y-1.5">
            {upgradeFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-2.5 w-2.5 text-teal-primary" strokeWidth={3} />
                <span className="font-mono text-[10px] text-charcoal/70">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-charcoal/10">
            <span className="font-mono text-lg font-bold text-charcoal">{t("yearlyPrice")}</span>
            <span className="font-mono text-[10px] text-charcoal/50">{t("perYear")}</span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isUpgrading}
          className="flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "2px" }}
        >
          {isUpgrading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {isUpgrading ? "Loading..." : t("upgradeNow")}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// CREDIT INDICATOR COMPONENT
// Minimal trigger + Smart Adaptive Panel popover
// ============================================================================

export function CreditIndicatorV3({
  type,
  count,
  className,
}: CreditIndicatorV3Props) {
  const [open, setOpen] = useState(false)

  const config = CREDIT_CONFIG[type]
  const status = getCreditStatus(count)
  const Icon = config.icon
  const isEmpty = status === "empty"
  const isLow = status === "low"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Minimal Trigger */}
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

      {/* Smart Adaptive Panel Popover */}
      <PopoverContent
        className="w-80 border-2 border-charcoal bg-white p-0 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
        align="end"
        sideOffset={8}
      >
        <SmartAdaptivePanel
          type={type}
          currentCredits={count}
          onClose={() => setOpen(false)}
        />
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
  /** If true, user is on Digital Capsule plan */
  isDigitalCapsule?: boolean
  /** If true, user can purchase trial credit */
  canPurchaseTrial?: boolean
  /** If true, user has used their trial credit */
  hasUsedTrial?: boolean
}

export function MailCreditIndicatorV3({
  count,
  className,
  isDigitalCapsule = false,
  canPurchaseTrial = false,
  hasUsedTrial = false,
}: MailCreditIndicatorV3Props) {
  const [open, setOpen] = useState(false)

  const config = CREDIT_CONFIG.mail
  const Icon = config.icon

  // For Digital Capsule users, always show as "locked" unless they have credits
  const isLockedForDigitalCapsule = isDigitalCapsule && count === 0
  const showTrialBadge = isDigitalCapsule && canPurchaseTrial && count === 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Minimal Trigger */}
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-2 py-1 font-mono text-xs font-bold transition-opacity hover:opacity-80",
            isLockedForDigitalCapsule
              ? "text-charcoal/40"
              : count === 0
                ? "text-coral"
                : count <= 2
                  ? "text-duck-yellow"
                  : "text-charcoal",
            className
          )}
          aria-label={`${count} ${count === 1 ? config.singularLabel : config.label}`}
        >
          {isLockedForDigitalCapsule ? (
            <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          <span className="tabular-nums">{count}</span>
          {showTrialBadge && (
            <span className="ml-0.5 px-1 py-0.5 bg-duck-yellow text-charcoal font-mono text-[8px] font-bold uppercase" style={{ borderRadius: "2px" }}>
              Try
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Popover Content - Different panel for Digital Capsule users */}
      <PopoverContent
        className="w-80 border-2 border-charcoal bg-white p-0 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
        align="end"
        sideOffset={8}
      >
        {isDigitalCapsule ? (
          <DigitalCapsuleMailPanel
            currentCredits={count}
            canPurchaseTrial={canPurchaseTrial}
            hasUsedTrial={hasUsedTrial}
            onClose={() => setOpen(false)}
          />
        ) : (
          <SmartAdaptivePanel
            type="mail"
            currentCredits={count}
            onClose={() => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// COMBINED CREDITS BAR (for showing both in navbar)
// ============================================================================

interface CreditsBarV3Props {
  emailCredits: number
  mailCredits: number
  className?: string
  /** If true, user is on Digital Capsule plan */
  isDigitalCapsule?: boolean
  /** If true, user can purchase trial credit */
  canPurchaseTrial?: boolean
  /** If true, user has used their trial credit */
  hasUsedTrial?: boolean
}

/**
 * Combined credits bar showing both email and mail credits
 * Designed for navbar placement
 * Listens for credit updates from other tabs (after Stripe checkout)
 */
export function CreditsBarV3({
  emailCredits,
  mailCredits,
  className,
  isDigitalCapsule = false,
  canPurchaseTrial = false,
  hasUsedTrial = false,
}: CreditsBarV3Props) {
  const router = useRouter()

  // Listen for credit updates from other tabs and refresh the page data
  useCreditsUpdateListener(() => {
    router.refresh()
  })

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <EmailCreditIndicatorV3 count={emailCredits} />
      <MailCreditIndicatorV3
        count={mailCredits}
        isDigitalCapsule={isDigitalCapsule}
        canPurchaseTrial={canPurchaseTrial}
        hasUsedTrial={hasUsedTrial}
      />
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

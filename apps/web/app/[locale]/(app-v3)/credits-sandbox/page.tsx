"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import {
  Mail,
  FileText,
  Plus,
  Minus,
  Loader2,
  Sparkles,
  AlertTriangle,
  Check,
  Zap,
  Crown,
  Gift,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import {
  type CreditAddonType,
  CREDIT_ADDON_BASE_PRICES,
  calculateCreditAddonPrice,
  getCreditAddonDiscount,
} from "@/lib/pricing-constants"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type CreditType = "email" | "physical"

interface CreditPack {
  quantity: number
  basePrice: number
  discountPercent: number
  label?: string
  badge?: "popular" | "best-value" | "starter"
}

// Tiered pricing structure (for display purposes - actual prices come from pricing-constants)
const EMAIL_PACKS: CreditPack[] = [
  { quantity: 5, basePrice: 4.45, discountPercent: 10, badge: "starter" },
  { quantity: 10, basePrice: 8.40, discountPercent: 15 },
  { quantity: 25, basePrice: 19.75, discountPercent: 20, badge: "popular" },
  { quantity: 50, basePrice: 37.00, discountPercent: 25, badge: "best-value" },
]

const PHYSICAL_PACKS: CreditPack[] = [
  { quantity: 3, basePrice: 14.97, discountPercent: 0, badge: "starter" },
  { quantity: 5, basePrice: 22.45, discountPercent: 10 },
  { quantity: 10, basePrice: 42.40, discountPercent: 15, badge: "popular" },
  { quantity: 25, basePrice: 99.75, discountPercent: 20, badge: "best-value" },
]

/**
 * Get base price for a credit type
 * @see lib/pricing-constants.ts - MUST match Stripe Dashboard volume pricing
 */
function getBasePrice(type: CreditType): number {
  return CREDIT_ADDON_BASE_PRICES[type]
}

/**
 * Calculate price using centralized Stripe-synced pricing tiers
 * @see lib/pricing-constants.ts - MUST match Stripe Dashboard volume pricing
 */
function calculatePrice(quantity: number, type: CreditType): number {
  return calculateCreditAddonPrice(type, quantity).total
}

/**
 * Get discount percentage using centralized pricing tiers
 */
function getDiscountPercent(quantity: number, type: CreditType): number {
  return getCreditAddonDiscount(type, quantity)
}

// ============================================================================
// VARIATION 1: QUANTITY STEPPER
// Simple +/- stepper with real-time price calculation
// ============================================================================

interface QuantityStepperProps {
  type: CreditType
  currentCredits: number
}

function QuantityStepper({ type, currentCredits }: QuantityStepperProps) {
  const [quantity, setQuantity] = useState(5)
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const basePrice = getBasePrice(type)
  const price = calculatePrice(quantity, type)
  const perUnit = (price / quantity).toFixed(2)
  const discount = getDiscountPercent(quantity, type)
  const savings = Number((quantity * basePrice - price).toFixed(2))

  const handlePurchase = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className="w-full max-w-sm border-2 border-charcoal bg-white"
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b-2 border-charcoal bg-duck-blue px-4 py-3">
        <Icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          {type === "email" ? "Email Credits" : "Mail Credits"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-charcoal/60 uppercase">Current Balance</span>
          <span className="font-mono text-sm font-bold text-charcoal">{currentCredits}</span>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 transition-colors"
            style={{ borderRadius: "2px" }}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4 text-charcoal" strokeWidth={2} />
          </button>

          <div
            className="flex h-12 w-20 items-center justify-center border-2 border-charcoal bg-duck-yellow font-mono text-xl font-bold text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            {quantity}
          </div>

          <button
            onClick={() => setQuantity(Math.min(100, quantity + 1))}
            className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 transition-colors"
            style={{ borderRadius: "2px" }}
            disabled={quantity >= 100}
          >
            <Plus className="h-4 w-4 text-charcoal" strokeWidth={2} />
          </button>
        </div>

        {/* Quick Select */}
        <div className="flex gap-2 justify-center">
          {[5, 10, 25, 50].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={cn(
                "px-3 py-1 font-mono text-xs font-bold border-2 transition-all",
                quantity === q
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-charcoal/30 text-charcoal/60 hover:border-charcoal hover:text-charcoal"
              )}
              style={{ borderRadius: "2px" }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Pricing Info */}
        <div className="border-t-2 border-dashed border-charcoal/10 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-charcoal/60">Per credit</span>
            <span className="font-mono text-xs text-charcoal">${perUnit}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <span className="font-mono text-xs text-teal-primary font-bold">Discount</span>
              <span className="font-mono text-xs text-teal-primary font-bold">-{discount}% (Save ${savings.toFixed(2)})</span>
            </div>
          )}

          <div className="flex justify-between border-t border-charcoal/10 pt-2">
            <span className="font-mono text-sm font-bold text-charcoal">Total</span>
            <span className="font-mono text-lg font-bold text-charcoal">${price.toFixed(2)}</span>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3",
            "font-mono text-sm font-bold uppercase tracking-wider text-charcoal",
            "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add {quantity} Credits - ${price.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 2: QUICK PACK CARDS
// Pre-defined bundles with visual discount badges
// ============================================================================

interface QuickPackCardProps {
  pack: CreditPack
  type: CreditType
  isSelected: boolean
  onSelect: () => void
}

function QuickPackCard({ pack, type, isSelected, onSelect }: QuickPackCardProps) {
  const perUnit = (pack.basePrice * (1 - pack.discountPercent / 100) / pack.quantity).toFixed(2)
  const finalPrice = (pack.basePrice * (1 - pack.discountPercent / 100)).toFixed(2)

  const BadgeIcon = pack.badge === "best-value" ? Crown : pack.badge === "popular" ? Zap : Gift

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center p-4 border-2 transition-all",
        "hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
        isSelected
          ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
          : "border-charcoal/40 bg-white hover:border-charcoal"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Badge */}
      {pack.badge && (
        <div
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5",
            "font-mono text-[9px] font-bold uppercase tracking-wider",
            pack.badge === "best-value" && "bg-teal-primary text-white",
            pack.badge === "popular" && "bg-duck-blue text-charcoal",
            pack.badge === "starter" && "bg-off-white text-charcoal border border-charcoal/20"
          )}
          style={{ borderRadius: "2px" }}
        >
          <BadgeIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
          {pack.badge === "best-value" && "Best Value"}
          {pack.badge === "popular" && "Popular"}
          {pack.badge === "starter" && "Starter"}
        </div>
      )}

      {/* Quantity */}
      <div className="font-mono text-3xl font-bold text-charcoal">{pack.quantity}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
        {type === "email" ? "emails" : "letters"}
      </div>

      {/* Price */}
      <div className="mt-3 font-mono text-lg font-bold text-charcoal">${finalPrice}</div>

      {/* Per Unit */}
      <div className="font-mono text-[10px] text-charcoal/50">${perUnit}/ea</div>

      {/* Discount Badge */}
      {pack.discountPercent > 0 && (
        <div
          className="mt-2 px-2 py-0.5 bg-teal-primary/10 font-mono text-[10px] font-bold text-teal-primary"
          style={{ borderRadius: "2px" }}
        >
          {pack.discountPercent}% OFF
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-charcoal">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

function QuickPackSelector({ type, currentCredits }: { type: CreditType; currentCredits: number }) {
  const packs = type === "email" ? EMAIL_PACKS : PHYSICAL_PACKS
  const defaultPack = packs[2] ?? packs[0]!
  const [selectedPack, setSelectedPack] = useState<CreditPack>(defaultPack) // Default to "popular"
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const finalPrice = (selectedPack.basePrice * (1 - selectedPack.discountPercent / 100)).toFixed(2)

  const handlePurchase = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity: selectedPack.quantity,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className="w-full max-w-lg border-2 border-charcoal bg-white"
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-charcoal bg-duck-blue px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
            Add {type === "email" ? "Email" : "Mail"} Credits
          </span>
        </div>
        <span className="font-mono text-xs text-charcoal/70">
          Balance: <span className="font-bold">{currentCredits}</span>
        </span>
      </div>

      {/* Pack Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {packs.map((pack) => (
            <QuickPackCard
              key={pack.quantity}
              pack={pack}
              type={type}
              isSelected={selectedPack.quantity === pack.quantity}
              onSelect={() => setSelectedPack(pack)}
            />
          ))}
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isPending}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3",
            "font-mono text-sm font-bold uppercase tracking-wider text-charcoal",
            "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add {selectedPack.quantity} Credits - ${finalPrice}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 3: URGENCY-AWARE WIDGET
// Adapts UI based on credit status (empty/low/good)
// ============================================================================

interface UrgencyAwarePanelProps {
  type: CreditType
  currentCredits: number
}

function UrgencyAwarePanel({ type, currentCredits }: UrgencyAwarePanelProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(25)
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const status = currentCredits === 0 ? "empty" : currentCredits <= 2 ? "low" : "good"

  const price = calculatePrice(selectedQuantity, type)
  const discount = getDiscountPercent(selectedQuantity, type)

  const handlePurchase = (qty: number) => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity: qty,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  // Status-based styling
  const statusStyles = {
    empty: {
      headerBg: "bg-coral",
      headerText: "text-white",
      borderColor: "border-coral",
      IconComponent: AlertTriangle,
      title: `No ${type === "email" ? "Email" : "Mail"} Credits`,
      message: "You need credits to schedule letter delivery.",
    },
    low: {
      headerBg: "bg-duck-yellow",
      headerText: "text-charcoal",
      borderColor: "border-duck-yellow",
      IconComponent: Sparkles,
      title: `Running Low`,
      message: `Only ${currentCredits} credit${currentCredits === 1 ? "" : "s"} remaining. Stock up!`,
    },
    good: {
      headerBg: "bg-teal-primary",
      headerText: "text-white",
      borderColor: "border-teal-primary",
      IconComponent: Check,
      title: `${currentCredits} Credits Available`,
      message: "You're all set. Add more anytime.",
    },
  }

  const styles = statusStyles[status]
  const StatusIcon = styles.IconComponent

  return (
    <div
      className={cn("w-full max-w-md border-2", styles.borderColor, "bg-white")}
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className={cn("flex items-center gap-2 px-4 py-3", styles.headerBg)}>
        <StatusIcon className={cn("h-4 w-4", styles.headerText)} strokeWidth={2} />
        <span className={cn("font-mono text-xs font-bold uppercase tracking-wider", styles.headerText)}>
          {styles.title}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="font-mono text-xs text-charcoal/70">{styles.message}</p>

        {/* EMPTY: Show urgent quick-refill options */}
        {status === "empty" && (
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">Quick Refill</p>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 25].map((qty) => {
                const p = calculatePrice(qty, type)
                const d = getDiscountPercent(qty, type)
                return (
                  <button
                    key={qty}
                    onClick={() => handlePurchase(qty)}
                    disabled={isPending}
                    className={cn(
                      "flex flex-col items-center p-3 border-2 border-charcoal transition-all",
                      "hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
                      qty === 25 ? "bg-duck-yellow" : "bg-white",
                      "disabled:opacity-50"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <span className="font-mono text-lg font-bold text-charcoal">+{qty}</span>
                    <span className="font-mono text-xs font-bold text-charcoal">${p.toFixed(2)}</span>
                    {d > 0 && (
                      <span className="font-mono text-[9px] text-teal-primary font-bold">{d}% OFF</span>
                    )}
                    {qty === 25 && (
                      <span className="mt-1 px-1.5 py-0.5 bg-charcoal font-mono text-[8px] text-white uppercase">
                        Best
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* LOW: Show warning with CTA */}
        {status === "low" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {[10, 25, 50].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setSelectedQuantity(qty)}
                  className={cn(
                    "flex-1 py-2 border-2 font-mono text-xs font-bold transition-all",
                    selectedQuantity === qty
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-charcoal/30 text-charcoal hover:border-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  +{qty}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePurchase(selectedQuantity)}
              disabled={isPending}
              className={cn(
                "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3",
                "font-mono text-sm font-bold uppercase tracking-wider text-charcoal",
                "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add {selectedQuantity} - ${price.toFixed(2)}
              {discount > 0 && <span className="text-teal-primary">({discount}% OFF)</span>}
            </button>
          </div>
        )}

        {/* GOOD: Minimal add more CTA */}
        {status === "good" && (
          <button
            onClick={() => handlePurchase(25)}
            disabled={isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-off-white px-4 py-2",
              "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
              "transition-all hover:bg-duck-yellow hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add More Credits
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 4: COMBINED TABBED PANEL
// Both email + physical in one interface
// ============================================================================

function CombinedCreditPanel() {
  const [activeTab, setActiveTab] = useState<CreditType>("email")
  const [quantity, setQuantity] = useState(25)
  const [isPending, startTransition] = useTransition()

  // Demo balances
  const emailBalance = 3
  const physicalBalance = 1

  const basePrice = getBasePrice(activeTab)
  const price = calculatePrice(quantity, activeTab)
  const discount = getDiscountPercent(quantity, activeTab)
  const perUnit = (price / quantity).toFixed(2)
  const savings = Number((quantity * basePrice - price).toFixed(2))

  const handlePurchase = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: activeTab === "email" ? "email" : "physical",
        quantity,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className="w-full max-w-md border-2 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      {/* Tabs */}
      <div className="flex border-b-2 border-charcoal">
        <button
          onClick={() => setActiveTab("email")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === "email"
              ? "bg-duck-blue text-charcoal"
              : "bg-off-white text-charcoal/50 hover:text-charcoal"
          )}
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          Email
          <span className="px-1.5 py-0.5 bg-charcoal/10 text-[10px]">{emailBalance}</span>
        </button>
        <div className="w-0.5 bg-charcoal" />
        <button
          onClick={() => setActiveTab("physical")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === "physical"
              ? "bg-teal-primary text-white"
              : "bg-off-white text-charcoal/50 hover:text-charcoal"
          )}
        >
          <FileText className="h-4 w-4" strokeWidth={2} />
          Mail
          <span className="px-1.5 py-0.5 bg-charcoal/10 text-[10px]">{physicalBalance}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between px-3 py-2 bg-off-white" style={{ borderRadius: "2px" }}>
          <span className="font-mono text-xs text-charcoal/60 uppercase">Your Balance</span>
          <span className="font-mono text-lg font-bold text-charcoal">
            {activeTab === "email" ? emailBalance : physicalBalance}
          </span>
        </div>

        {/* Quantity Selection */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">Select Quantity</span>
          <div className="grid grid-cols-5 gap-2">
            {(activeTab === "email" ? [5, 10, 25, 50] : [3, 5, 10, 25]).map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={cn(
                  "py-2 border-2 font-mono text-sm font-bold transition-all",
                  quantity === q
                    ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "border-charcoal/30 text-charcoal/60 hover:border-charcoal hover:text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                {q}
              </button>
            ))}
            {/* Custom Input */}
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="py-2 border-2 border-charcoal/30 font-mono text-sm font-bold text-center text-charcoal focus:border-charcoal focus:outline-none"
              style={{ borderRadius: "2px" }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="border-2 border-charcoal/20 p-3 space-y-2" style={{ borderRadius: "2px" }}>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-charcoal/60">{quantity} credits @ ${perUnit}/ea</span>
            <span className="font-mono text-xs text-charcoal">${price.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-teal-primary">
              <span className="font-mono text-xs font-bold">Volume Discount ({discount}%)</span>
              <span className="font-mono text-xs font-bold">-${savings.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-charcoal/10 pt-2 flex justify-between">
            <span className="font-mono text-sm font-bold text-charcoal">Total</span>
            <span className="font-mono text-xl font-bold text-charcoal">${price.toFixed(2)}</span>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3",
            "font-mono text-sm font-bold uppercase tracking-wider",
            "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            activeTab === "email"
              ? "bg-duck-yellow text-charcoal"
              : "bg-teal-primary text-white",
            "disabled:opacity-50"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Purchase - ${price.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 5: INLINE CREDIT ADDER (for embedding in other contexts)
// Compact horizontal design
// ============================================================================

function InlineCreditAdder({ type }: { type: CreditType }) {
  const [quantity, setQuantity] = useState(10)
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const price = calculatePrice(quantity, type)

  const handlePurchase = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className="flex items-center gap-3 p-3 border-2 border-charcoal bg-white"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
        <span className="font-mono text-xs font-bold uppercase text-charcoal">
          {type === "email" ? "Email" : "Mail"}
        </span>
      </div>

      <div className="flex items-center border-2 border-charcoal/30" style={{ borderRadius: "2px" }}>
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 5))}
          className="px-2 py-1 hover:bg-charcoal/5"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="px-3 py-1 font-mono text-sm font-bold text-charcoal border-x border-charcoal/30">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(100, quantity + 5))}
          className="px-2 py-1 hover:bg-charcoal/5"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 border-2 border-charcoal bg-duck-yellow",
          "font-mono text-xs font-bold uppercase text-charcoal",
          "hover:shadow-[2px_2px_0_theme(colors.charcoal)] transition-all",
          "disabled:opacity-50"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        ${price.toFixed(2)}
      </button>
    </div>
  )
}

// ============================================================================
// VARIATION 6: SMART ADAPTIVE PANEL
// Combines urgency awareness with full quantity control - UI morphs based on state
// ============================================================================

interface SmartAdaptivePanelProps {
  type: CreditType
  currentCredits: number
}

function SmartAdaptivePanel({ type, currentCredits }: SmartAdaptivePanelProps) {
  const [quantity, setQuantity] = useState(25)
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = type === "email" ? Mail : FileText
  const status = currentCredits === 0 ? "empty" : currentCredits <= 2 ? "low" : "good"
  const basePrice = getBasePrice(type)
  const price = calculatePrice(quantity, type)
  const discount = getDiscountPercent(quantity, type)
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
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className={cn(
        "w-full max-w-md border-2 bg-white transition-all duration-300",
        config.borderColor,
        "shadow-[2px_2px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Status Header Bar */}
      <div className={cn("flex items-center justify-between px-4 py-2", config.headerBg)}>
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
                    "relative flex flex-col items-center p-3 border-2 transition-all",
                    "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                    isSelected
                      ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                      : "border-charcoal/40 bg-white hover:border-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-xl font-bold text-charcoal">+{q}</span>
                  <span className="font-mono text-xs font-bold text-charcoal">${qPrice.toFixed(2)}</span>
                  {qDiscount > 0 && (
                    <span className="mt-1 px-1.5 py-0.5 bg-teal-primary/10 font-mono text-[9px] font-bold text-teal-primary">
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
        <div className="border-t-2 border-dashed border-charcoal/10 pt-4">
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
            <div className="mt-4 space-y-4">
              {/* Stepper Control */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 active:shadow-none transition-all shadow-[1px_1px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-charcoal" strokeWidth={2.5} />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="h-12 w-20 border-2 border-charcoal bg-duck-yellow font-mono text-xl font-bold text-center text-charcoal focus:outline-none focus:ring-2 focus:ring-duck-blue"
                  style={{ borderRadius: "2px" }}
                  min={1}
                  max={100}
                />

                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="flex h-11 w-11 items-center justify-center border-2 border-charcoal bg-off-white hover:bg-charcoal/5 active:shadow-none transition-all shadow-[1px_1px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                  disabled={quantity >= 100}
                >
                  <Plus className="h-4 w-4 text-charcoal" strokeWidth={2.5} />
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="bg-off-white p-3 space-y-2" style={{ borderRadius: "2px" }}>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-charcoal/60">{quantity}× credits @ ${perUnit}</span>
                  <span className="font-mono text-xs text-charcoal">${(quantity * basePrice).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold text-teal-primary">Volume discount ({discount}%)</span>
                    <span className="font-mono text-xs font-bold text-teal-primary">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-charcoal/10 pt-2 flex justify-between">
                  <span className="font-mono text-sm font-bold text-charcoal">Total</span>
                  <span className="font-mono text-xl font-bold text-charcoal">${price.toFixed(2)}</span>
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
            "flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3.5",
            "font-mono text-sm font-bold uppercase tracking-wider",
            "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
            status === "empty" ? "bg-coral text-white" : "bg-duck-yellow text-charcoal"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add {quantity} Credits — ${price.toFixed(2)}
              {discount > 0 && <span className="text-teal-primary ml-1">({discount}% OFF)</span>}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 7: CREDIT GAUGE METER
// Visual fuel-gauge representation with instant status comprehension
// ============================================================================

interface CreditGaugeMeterProps {
  type: CreditType
  currentCredits: number
  maxCredits?: number
}

function CreditGaugeMeter({ type, currentCredits, maxCredits = 50 }: CreditGaugeMeterProps) {
  const [selectedRefill, setSelectedRefill] = useState<number | null>(null)
  const [customQuantity, setCustomQuantity] = useState(25)
  const [showCustom, setShowCustom] = useState(false)
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const fillPercent = Math.min((currentCredits / maxCredits) * 100, 100)
  const segments = 10
  const filledSegments = Math.ceil((currentCredits / maxCredits) * segments)

  // Determine gauge color based on level
  const getSegmentColor = (index: number) => {
    const segmentPercent = ((index + 1) / segments) * 100
    if (segmentPercent <= 20) return "bg-coral"
    if (segmentPercent <= 40) return "bg-duck-yellow"
    return "bg-teal-primary"
  }

  const getZoneLabel = () => {
    if (fillPercent <= 10) return { text: "EMPTY", color: "text-coral" }
    if (fillPercent <= 30) return { text: "LOW", color: "text-coral" }
    if (fillPercent <= 60) return { text: "OK", color: "text-duck-yellow" }
    return { text: "FULL", color: "text-teal-primary" }
  }

  const zone = getZoneLabel()

  // Refill options with tank metaphor
  const refillOptions = [
    { quantity: 10, label: "Quarter Tank", icon: "¼" },
    { quantity: 25, label: "Half Tank", icon: "½" },
    { quantity: 50, label: "Full Tank", icon: "F" },
  ]

  const handlePurchase = (qty: number) => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity: qty,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  const selectedPrice = selectedRefill ? calculatePrice(selectedRefill, type) : null
  const selectedDiscount = selectedRefill ? getDiscountPercent(selectedRefill, type) : 0

  return (
    <div
      className="w-full max-w-lg border-2 border-charcoal bg-white shadow-[2px_2px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-charcoal bg-off-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
            {type === "email" ? "Email" : "Mail"} Credits
          </span>
        </div>
        <span className={cn("font-mono text-xs font-bold uppercase", zone.color)}>
          {zone.text}
        </span>
      </div>

      {/* Gauge Section */}
      <div className="p-4 space-y-4">
        {/* Visual Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-mono text-[10px] uppercase text-charcoal/50">E</span>
            <span className="font-mono text-2xl font-bold text-charcoal">{currentCredits}</span>
            <span className="font-mono text-[10px] uppercase text-charcoal/50">F</span>
          </div>

          {/* Segmented Gauge Bar */}
          <div className="flex gap-1">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-8 flex-1 border-2 transition-all duration-300",
                  i < filledSegments
                    ? cn(getSegmentColor(i), "border-charcoal")
                    : "bg-charcoal/5 border-charcoal/20"
                )}
                style={{ borderRadius: "2px" }}
              />
            ))}
          </div>

          {/* Gauge Labels */}
          <div className="flex justify-between text-[9px] font-mono uppercase text-charcoal/40">
            <span>0</span>
            <span>{Math.round(maxCredits * 0.25)}</span>
            <span>{Math.round(maxCredits * 0.5)}</span>
            <span>{Math.round(maxCredits * 0.75)}</span>
            <span>{maxCredits}</span>
          </div>
        </div>

        {/* Quick Refill Options */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
            Refill Options
          </span>
          <div className="grid grid-cols-3 gap-2">
            {refillOptions.map((option) => {
              const price = calculatePrice(option.quantity, type)
              const discount = getDiscountPercent(option.quantity, type)
              const isSelected = selectedRefill === option.quantity

              return (
                <button
                  key={option.quantity}
                  onClick={() => setSelectedRefill(isSelected ? null : option.quantity)}
                  className={cn(
                    "relative flex flex-col items-center p-3 border-2 transition-all",
                    "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                    isSelected
                      ? "border-charcoal bg-teal-primary text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
                      : "border-charcoal/40 bg-white hover:border-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <span className={cn(
                    "font-mono text-2xl font-bold",
                    isSelected ? "text-white" : "text-charcoal"
                  )}>
                    {option.icon}
                  </span>
                  <span className={cn(
                    "font-mono text-[10px] uppercase",
                    isSelected ? "text-white/80" : "text-charcoal/60"
                  )}>
                    +{option.quantity}
                  </span>
                  <span className={cn(
                    "font-mono text-xs font-bold mt-1",
                    isSelected ? "text-white" : "text-charcoal"
                  )}>
                    ${price.toFixed(2)}
                  </span>
                  {discount > 0 && (
                    <span className={cn(
                      "mt-1 px-1.5 py-0.5 font-mono text-[9px] font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-teal-primary/10 text-teal-primary"
                    )} style={{ borderRadius: "2px" }}>
                      {discount}% OFF
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Amount Toggle */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 w-full justify-center py-2 border-t-2 border-dashed border-charcoal/10"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50 hover:text-charcoal transition-colors">
            {showCustom ? "Hide" : "Show"} Custom Amount
          </span>
        </button>

        {showCustom && (
          <div className="flex items-center gap-3 p-3 bg-off-white" style={{ borderRadius: "2px" }}>
            <button
              onClick={() => setCustomQuantity(Math.max(1, customQuantity - 5))}
              className="flex h-9 w-9 items-center justify-center border-2 border-charcoal bg-white hover:bg-charcoal/5"
              style={{ borderRadius: "2px" }}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="h-9 w-16 border-2 border-charcoal font-mono text-sm font-bold text-center focus:outline-none"
              style={{ borderRadius: "2px" }}
            />
            <button
              onClick={() => setCustomQuantity(Math.min(100, customQuantity + 5))}
              className="flex h-9 w-9 items-center justify-center border-2 border-charcoal bg-white hover:bg-charcoal/5"
              style={{ borderRadius: "2px" }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setSelectedRefill(customQuantity)
                setShowCustom(false)
              }}
              className="flex-1 h-9 border-2 border-charcoal bg-duck-yellow font-mono text-xs font-bold uppercase hover:shadow-[2px_2px_0_theme(colors.charcoal)] transition-all"
              style={{ borderRadius: "2px" }}
            >
              Select
            </button>
          </div>
        )}

        {/* Purchase Button */}
        {selectedRefill && (
          <button
            onClick={() => handlePurchase(selectedRefill)}
            disabled={isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3.5",
              "font-mono text-sm font-bold uppercase tracking-wider text-charcoal",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              "disabled:opacity-50"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Refill +{selectedRefill} — ${selectedPrice?.toFixed(2)}
                {selectedDiscount > 0 && (
                  <span className="text-teal-primary">({selectedDiscount}% OFF)</span>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 8: SMART RECOMMENDATION CARD
// AI-like recommendations to reduce decision fatigue - one-click optimal choice
// ============================================================================

interface SmartRecommendationCardProps {
  type: CreditType
  currentCredits: number
  averageMonthlyUsage?: number
}

function SmartRecommendationCard({
  type,
  currentCredits,
  averageMonthlyUsage = 8
}: SmartRecommendationCardProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customQuantity, setCustomQuantity] = useState(25)
  const [isPending, startTransition] = useTransition()

  const Icon = type === "email" ? Mail : FileText
  const status = currentCredits === 0 ? "empty" : currentCredits <= 2 ? "low" : "good"

  // Smart recommendation logic
  const getRecommendation = () => {
    if (status === "empty") {
      return {
        quantity: 25,
        reason: "Get back on track",
        subtext: `Covers ~${Math.round(25 / averageMonthlyUsage)} weeks based on your usage`,
        urgency: "immediate",
      }
    }
    if (status === "low") {
      return {
        quantity: 25,
        reason: "Top up before you run out",
        subtext: `You have ${currentCredits} left, this adds ${Math.round(25 / averageMonthlyUsage)} more weeks`,
        urgency: "soon",
      }
    }
    return {
      quantity: 50,
      reason: "Best value bulk purchase",
      subtext: "Maximum 25% discount — save $12.38 on your next 50 credits",
      urgency: "none",
    }
  }

  const recommendation = getRecommendation()
  const recBasePrice = getBasePrice(type)
  const recPrice = calculatePrice(recommendation.quantity, type)
  const recDiscount = getDiscountPercent(recommendation.quantity, type)
  const recSavings = Number((recommendation.quantity * recBasePrice - recPrice).toFixed(2))

  // Alternative options
  const alternatives = [
    { quantity: 5, label: "Starter" },
    { quantity: 10, label: "Basic" },
    { quantity: 25, label: "Popular" },
    { quantity: 50, label: "Best Value" },
  ].filter(alt => alt.quantity !== recommendation.quantity)

  const handlePurchase = (qty: number) => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({
        type: type === "email" ? "email" : "physical",
        quantity: qty,
        successUrl: `${window.location.origin}/credits/success`,
      })

      if (result.success) {
        window.open(result.data.url, "_blank")
        toast.info("Checkout opened in new tab")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div
      className="w-full max-w-md border-2 border-charcoal bg-white shadow-[2px_2px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3",
        status === "empty" ? "bg-coral" : status === "low" ? "bg-duck-yellow" : "bg-teal-primary"
      )}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", status === "low" ? "text-charcoal" : "text-white")} strokeWidth={2} />
          <span className={cn(
            "font-mono text-xs font-bold uppercase tracking-wider",
            status === "low" ? "text-charcoal" : "text-white"
          )}>
            {type === "email" ? "Email" : "Mail"} Credits
          </span>
        </div>
        <span className={cn(
          "font-mono text-xs",
          status === "low" ? "text-charcoal/70" : "text-white/80"
        )}>
          Balance: <span className="font-bold">{currentCredits}</span>
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Recommended Option - Featured */}
        <div
          className="relative border-2 border-charcoal bg-duck-yellow/10 p-4 shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          {/* Floating Badge */}
          <div
            className="absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 bg-duck-yellow border-2 border-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Crown className="h-3 w-3" strokeWidth={2.5} />
            Recommended
          </div>

          <div className="mt-2 space-y-3">
            {/* Main Offer */}
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-3xl font-bold text-charcoal">+{recommendation.quantity}</span>
                <span className="font-mono text-lg text-charcoal/70 ml-1">credits</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-charcoal">${recPrice.toFixed(2)}</div>
                {recDiscount > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    <span className="font-mono text-xs line-through text-charcoal/40">
                      ${(recommendation.quantity * recBasePrice).toFixed(2)}
                    </span>
                    <span
                      className="px-1.5 py-0.5 bg-teal-primary font-mono text-[10px] font-bold text-white"
                      style={{ borderRadius: "2px" }}
                    >
                      {recDiscount}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason & Subtext */}
            <div className="border-t border-charcoal/10 pt-3">
              <p className="font-mono text-sm font-bold text-charcoal">{recommendation.reason}</p>
              <p className="font-mono text-xs text-charcoal/60 mt-1">{recommendation.subtext}</p>
            </div>

            {/* CTA */}
            <button
              onClick={() => handlePurchase(recommendation.quantity)}
              disabled={isPending}
              className={cn(
                "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3",
                "font-mono text-sm font-bold uppercase tracking-wider text-charcoal",
                "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                "disabled:opacity-50"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Add Recommended — ${recPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
            Other Options
          </span>
          <div className="grid grid-cols-3 gap-2">
            {alternatives.map((alt) => {
              const altPrice = calculatePrice(alt.quantity, type)
              const altDiscount = getDiscountPercent(alt.quantity, type)

              return (
                <button
                  key={alt.quantity}
                  onClick={() => handlePurchase(alt.quantity)}
                  disabled={isPending}
                  className={cn(
                    "flex flex-col items-center p-2.5 border-2 border-charcoal/30 bg-white",
                    "transition-all hover:border-charcoal hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]",
                    "disabled:opacity-50"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-xs text-charcoal/50 uppercase">{alt.label}</span>
                  <span className="font-mono text-lg font-bold text-charcoal">+{alt.quantity}</span>
                  <span className="font-mono text-xs text-charcoal">${altPrice.toFixed(2)}</span>
                  {altDiscount > 0 && (
                    <span className="font-mono text-[9px] text-teal-primary font-bold">{altDiscount}% OFF</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Amount Accordion */}
        <div className="border-t-2 border-dashed border-charcoal/10 pt-3">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center justify-between w-full group"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50 group-hover:text-charcoal">
              Need a different amount?
            </span>
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center border border-charcoal/30 transition-transform",
                showCustom && "rotate-180"
              )}
              style={{ borderRadius: "2px" }}
            >
              <svg className="h-3 w-3 text-charcoal/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showCustom && (
            <div className="mt-3 p-3 bg-off-white space-y-3" style={{ borderRadius: "2px" }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCustomQuantity(Math.max(1, customQuantity - 5))}
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="flex-1 h-10 border-2 border-charcoal font-mono text-lg font-bold text-center focus:outline-none"
                  style={{ borderRadius: "2px" }}
                />
                <button
                  onClick={() => setCustomQuantity(Math.min(100, customQuantity + 5))}
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => handlePurchase(customQuantity)}
                disabled={isPending}
                className={cn(
                  "flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-charcoal px-4 py-2.5",
                  "font-mono text-xs font-bold uppercase tracking-wider text-white",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.duck-yellow)]",
                  "disabled:opacity-50"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add {customQuantity} — ${calculatePrice(customQuantity, type).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SANDBOX PAGE
// ============================================================================

export default function SandboxPage() {
  return (
    <div className="container py-12 space-y-16">
      {/* Page Header */}
      <header className="space-y-4">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
          Credit Purchase Components
        </h1>
        <p className="font-mono text-sm text-charcoal/70 max-w-2xl">
          Design sandbox exploring different credit purchase UX patterns. All components follow
          the V3 neo-brutalist design system with tiered volume discounts.
        </p>

        {/* Discount Tiers Reference */}
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 border-2 border-charcoal/20 font-mono text-[10px] uppercase">
            1-4: Base Price
          </span>
          <span className="px-3 py-1 border-2 border-charcoal/20 font-mono text-[10px] uppercase text-teal-primary">
            5-9: 10% OFF
          </span>
          <span className="px-3 py-1 border-2 border-charcoal/20 font-mono text-[10px] uppercase text-teal-primary">
            10-24: 15% OFF
          </span>
          <span className="px-3 py-1 border-2 border-charcoal/20 font-mono text-[10px] uppercase text-teal-primary">
            25-49: 20% OFF
          </span>
          <span className="px-3 py-1 border-2 border-charcoal/20 font-mono text-[10px] uppercase text-teal-primary font-bold">
            50+: 25% OFF
          </span>
        </div>
      </header>

      {/* Variation 1: Quantity Stepper */}
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Variation 1: Quantity Stepper
        </h2>
        <p className="font-mono text-xs text-charcoal/60 max-w-lg">
          Simple +/- stepper with real-time price calculation. Best for users who want precise control.
        </p>
        <div className="flex flex-wrap gap-6">
          <QuantityStepper type="email" currentCredits={3} />
          <QuantityStepper type="physical" currentCredits={1} />
        </div>
      </section>

      {/* Variation 2: Quick Pack Cards */}
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Variation 2: Quick Pack Cards
        </h2>
        <p className="font-mono text-xs text-charcoal/60 max-w-lg">
          Pre-defined bundles with visual discount badges. Great for quick decisions with clear value props.
        </p>
        <div className="space-y-6">
          <QuickPackSelector type="email" currentCredits={3} />
          <QuickPackSelector type="physical" currentCredits={1} />
        </div>
      </section>

      {/* Variation 3: Urgency-Aware Widget */}
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Variation 3: Urgency-Aware Widget
        </h2>
        <p className="font-mono text-xs text-charcoal/60 max-w-lg">
          Adaptive UI that changes based on credit status (empty/low/good). Shows appropriate urgency.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="px-2 py-1 bg-coral font-mono text-[10px] text-white uppercase">Status: Empty</span>
            <UrgencyAwarePanel type="email" currentCredits={0} />
          </div>
          <div className="space-y-2">
            <span className="px-2 py-1 bg-duck-yellow font-mono text-[10px] text-charcoal uppercase">Status: Low</span>
            <UrgencyAwarePanel type="email" currentCredits={2} />
          </div>
          <div className="space-y-2">
            <span className="px-2 py-1 bg-teal-primary font-mono text-[10px] text-white uppercase">Status: Good</span>
            <UrgencyAwarePanel type="email" currentCredits={15} />
          </div>
        </div>
      </section>

      {/* Variation 4: Combined Tabbed Panel */}
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Variation 4: Combined Tabbed Panel
        </h2>
        <p className="font-mono text-xs text-charcoal/60 max-w-lg">
          Both email and mail credits in one interface. Includes custom quantity input and detailed summary.
        </p>
        <CombinedCreditPanel />
      </section>

      {/* Variation 5: Inline Credit Adder */}
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Variation 5: Inline Credit Adder
        </h2>
        <p className="font-mono text-xs text-charcoal/60 max-w-lg">
          Compact horizontal design for embedding in other contexts (banners, modals, etc).
        </p>
        <div className="space-y-3 max-w-md">
          <InlineCreditAdder type="email" />
          <InlineCreditAdder type="physical" />
        </div>
      </section>

      {/* Best Practice Recommendation */}
      <section className="border-2 border-teal-primary bg-teal-primary/5 p-6 space-y-4" style={{ borderRadius: "2px" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-primary" strokeWidth={2} />
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-teal-primary">
            Best Practice Recommendation
          </h2>
        </div>
        <div className="font-mono text-sm text-charcoal/80 space-y-3">
          <p>
            <strong>Primary Use Case:</strong> Use <strong>Variation 3 (Urgency-Aware)</strong> in the navbar popover
            and letter editor warnings. It adapts to user context and drives appropriate action.
          </p>
          <p>
            <strong>Secondary:</strong> Use <strong>Variation 4 (Combined Tabbed)</strong> for a dedicated credits
            page or settings section where users want full control.
          </p>
          <p>
            <strong>Tertiary:</strong> Use <strong>Variation 5 (Inline)</strong> in contextual warnings and banners.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* NEW PREMIUM VARIATIONS - BEST UX PRACTICES */}
      {/* ================================================================== */}

      <div className="border-t-4 border-charcoal pt-16">
        <header className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Crown className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
              Premium Variations
            </h2>
          </div>
          <p className="font-mono text-sm text-charcoal/70 max-w-2xl">
            Advanced credit purchase components combining the best of urgency-awareness, quantity control,
            and intelligent recommendations. Each variation is optimized for specific use cases.
          </p>
        </header>

        {/* Variation 6: Smart Adaptive Panel */}
        <section className="space-y-6 mb-16">
          <div className="space-y-2">
            <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Variation 6: Smart Adaptive Panel
            </h3>
            <p className="font-mono text-xs text-charcoal/60 max-w-lg">
              UI morphs based on credit status. Combines urgency awareness with full quantity control.
              Perfect for navbar popovers and sidebar widgets.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Urgency-Aware
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Stepper Control
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Quick Select
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Expandable
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="px-2 py-1 bg-coral font-mono text-[10px] text-white uppercase" style={{ borderRadius: "2px" }}>
                Status: Empty (0 credits)
              </span>
              <SmartAdaptivePanel type="email" currentCredits={0} />
            </div>
            <div className="space-y-2">
              <span className="px-2 py-1 bg-duck-yellow font-mono text-[10px] text-charcoal uppercase" style={{ borderRadius: "2px" }}>
                Status: Low (2 credits)
              </span>
              <SmartAdaptivePanel type="email" currentCredits={2} />
            </div>
            <div className="space-y-2">
              <span className="px-2 py-1 bg-teal-primary font-mono text-[10px] text-white uppercase" style={{ borderRadius: "2px" }}>
                Status: Good (15 credits)
              </span>
              <SmartAdaptivePanel type="email" currentCredits={15} />
            </div>
          </div>

          {/* Best Practices Box */}
          <div
            className="border-2 border-duck-blue bg-duck-blue/5 p-4 space-y-2"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-duck-blue" strokeWidth={2} />
              <span className="font-mono text-xs font-bold uppercase text-charcoal">
                Best For
              </span>
            </div>
            <ul className="font-mono text-xs text-charcoal/70 space-y-1 ml-6">
              <li>• Navbar credit popover (most common use case)</li>
              <li>• Sidebar widget in letter editor</li>
              <li>• Modal trigger from "low credits" warning</li>
            </ul>
          </div>
        </section>

        {/* Variation 7: Credit Gauge Meter */}
        <section className="space-y-6 mb-16">
          <div className="space-y-2">
            <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Variation 7: Credit Gauge Meter
            </h3>
            <p className="font-mono text-xs text-charcoal/60 max-w-lg">
              Fuel gauge metaphor provides instant visual comprehension of credit level.
              Gamification element encourages users to "fill up" their tank.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Visual Meter
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Gamification
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Tank Metaphor
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Quick Refill
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-charcoal/50 uppercase">Email Credits</span>
              <CreditGaugeMeter type="email" currentCredits={12} />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-charcoal/50 uppercase">Mail Credits</span>
              <CreditGaugeMeter type="physical" currentCredits={3} />
            </div>
          </div>

          {/* Gauge States Demo */}
          <div className="grid grid-cols-4 gap-4">
            {[0, 5, 25, 45].map((credits) => (
              <div key={credits} className="space-y-2">
                <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                  {credits} Credits
                </span>
                <CreditGaugeMeter type="email" currentCredits={credits} />
              </div>
            ))}
          </div>

          {/* Best Practices Box */}
          <div
            className="border-2 border-duck-blue bg-duck-blue/5 p-4 space-y-2"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-duck-blue" strokeWidth={2} />
              <span className="font-mono text-xs font-bold uppercase text-charcoal">
                Best For
              </span>
            </div>
            <ul className="font-mono text-xs text-charcoal/70 space-y-1 ml-6">
              <li>• Dashboard widget (at-a-glance status)</li>
              <li>• Account settings page</li>
              <li>• Visual-first users who prefer graphics over numbers</li>
            </ul>
          </div>
        </section>

        {/* Variation 8: Smart Recommendation Card */}
        <section className="space-y-6 mb-16">
          <div className="space-y-2">
            <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Variation 8: Smart Recommendation Card
            </h3>
            <p className="font-mono text-xs text-charcoal/60 max-w-lg">
              AI-like intelligent defaults reduce decision fatigue. One-click optimal choice
              with alternatives available for those who want control.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Smart Defaults
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                One-Click
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Social Proof
              </span>
              <span className="px-2 py-0.5 border border-charcoal/20 font-mono text-[9px] uppercase bg-off-white">
                Usage-Based
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="px-2 py-1 bg-coral font-mono text-[10px] text-white uppercase" style={{ borderRadius: "2px" }}>
                Empty: Urgency Mode
              </span>
              <SmartRecommendationCard type="email" currentCredits={0} />
            </div>
            <div className="space-y-2">
              <span className="px-2 py-1 bg-duck-yellow font-mono text-[10px] text-charcoal uppercase" style={{ borderRadius: "2px" }}>
                Low: Top-up Mode
              </span>
              <SmartRecommendationCard type="email" currentCredits={2} />
            </div>
            <div className="space-y-2">
              <span className="px-2 py-1 bg-teal-primary font-mono text-[10px] text-white uppercase" style={{ borderRadius: "2px" }}>
                Good: Value Mode
              </span>
              <SmartRecommendationCard type="email" currentCredits={15} />
            </div>
          </div>

          {/* Best Practices Box */}
          <div
            className="border-2 border-duck-blue bg-duck-blue/5 p-4 space-y-2"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-duck-blue" strokeWidth={2} />
              <span className="font-mono text-xs font-bold uppercase text-charcoal">
                Best For
              </span>
            </div>
            <ul className="font-mono text-xs text-charcoal/70 space-y-1 ml-6">
              <li>• Dedicated credits/billing page</li>
              <li>• Conversion optimization (reduces paradox of choice)</li>
              <li>• Users who want guidance, not just options</li>
            </ul>
          </div>
        </section>

        {/* Updated Best Practice Recommendation */}
        <section
          className="border-2 border-duck-yellow bg-duck-yellow/10 p-6 space-y-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-charcoal" strokeWidth={2} />
            <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
              Updated Best Practice Recommendation
            </h2>
          </div>
          <div className="font-mono text-sm text-charcoal/80 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border-2 border-charcoal/20 p-3 bg-white" style={{ borderRadius: "2px" }}>
                <div className="font-bold text-charcoal mb-1">🥇 Primary</div>
                <div className="text-xs">
                  <strong>Variation 6 (Smart Adaptive)</strong> for navbar popover.
                  Morphs based on urgency + full control when needed.
                </div>
              </div>
              <div className="border-2 border-charcoal/20 p-3 bg-white" style={{ borderRadius: "2px" }}>
                <div className="font-bold text-charcoal mb-1">🥈 Secondary</div>
                <div className="text-xs">
                  <strong>Variation 8 (Smart Recommendation)</strong> for dedicated credits page.
                  Reduces decision fatigue with intelligent defaults.
                </div>
              </div>
              <div className="border-2 border-charcoal/20 p-3 bg-white" style={{ borderRadius: "2px" }}>
                <div className="font-bold text-charcoal mb-1">🥉 Tertiary</div>
                <div className="text-xs">
                  <strong>Variation 7 (Gauge Meter)</strong> for dashboard widget.
                  Visual representation for at-a-glance status.
                </div>
              </div>
            </div>
            <div className="border-t border-charcoal/20 pt-4 space-y-2">
              <p className="font-bold text-charcoal">Key UX Principles Applied:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>✓ <strong>Urgency Communication:</strong> Visual and textual cues based on credit status</li>
                <li>✓ <strong>Progressive Disclosure:</strong> Quick actions first, custom control on demand</li>
                <li>✓ <strong>Anchoring Effect:</strong> Pre-selected "best value" options with crossed-out prices</li>
                <li>✓ <strong>Reduced Cognitive Load:</strong> Smart defaults minimize decision fatigue</li>
                <li>✓ <strong>Trust Signals:</strong> Transparent pricing, savings highlighted in positive color</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

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

// Tiered pricing structure
const EMAIL_PACKS: CreditPack[] = [
  { quantity: 5, basePrice: 4.95, discountPercent: 0, badge: "starter" },
  { quantity: 10, basePrice: 9.90, discountPercent: 10 },
  { quantity: 25, basePrice: 24.75, discountPercent: 20, badge: "popular" },
  { quantity: 50, basePrice: 49.50, discountPercent: 25, badge: "best-value" },
]

const PHYSICAL_PACKS: CreditPack[] = [
  { quantity: 3, basePrice: 14.97, discountPercent: 0, badge: "starter" },
  { quantity: 5, basePrice: 24.95, discountPercent: 10 },
  { quantity: 10, basePrice: 49.90, discountPercent: 20, badge: "popular" },
  { quantity: 25, basePrice: 124.75, discountPercent: 25, badge: "best-value" },
]

const BASE_PRICES = {
  email: 0.99,
  physical: 4.99,
}

// Calculate discounted price
function calculatePrice(quantity: number, type: CreditType): number {
  const basePrice = BASE_PRICES[type]
  let discount = 0

  if (quantity >= 50) discount = 0.25
  else if (quantity >= 25) discount = 0.20
  else if (quantity >= 10) discount = 0.15
  else if (quantity >= 5) discount = 0.10

  return Number((quantity * basePrice * (1 - discount)).toFixed(2))
}

function getDiscountPercent(quantity: number): number {
  if (quantity >= 50) return 25
  if (quantity >= 25) return 20
  if (quantity >= 10) return 15
  if (quantity >= 5) return 10
  return 0
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
  const price = calculatePrice(quantity, type)
  const perUnit = (price / quantity).toFixed(2)
  const discount = getDiscountPercent(quantity)
  const savings = Number((quantity * BASE_PRICES[type] - price).toFixed(2))

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
  const discount = getDiscountPercent(selectedQuantity)

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
                const d = getDiscountPercent(qty)
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

  const price = calculatePrice(quantity, activeTab)
  const discount = getDiscountPercent(quantity)
  const perUnit = (price / quantity).toFixed(2)
  const savings = Number((quantity * BASE_PRICES[activeTab] - price).toFixed(2))

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
    </div>
  )
}

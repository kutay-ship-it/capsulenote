"use client"

import * as React from "react"
import { format, differenceInDays, subHours } from "date-fns"
import {
  Calendar,
  Mail,
  FileText,
  Lock,
  Sparkles,
  MapPin,
  User,
  Users,
  Stamp,
  ArrowLeft,
  Clock,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { DeliveryChannel } from "./channel-selector-v3"
import type { PrintOptions, MailDeliveryMode } from "./mail-config-v3"
import type { ShippingAddress } from "@/server/actions/addresses"

interface ScheduleSummaryV3Props {
  letterTitle: string
  deliveryDate: Date
  deliveryTime: string
  timezone: string
  channels: DeliveryChannel[]
  // Email settings
  recipientType: "myself" | "someone-else"
  recipientEmail: string
  recipientName?: string
  // Mail settings
  mailDeliveryMode?: MailDeliveryMode
  shippingAddress?: ShippingAddress | null
  printOptions?: PrintOptions
  // Credit info
  emailCredits: number
  physicalCredits: number
  // Actions
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
  disabled?: boolean
}

const LOCK_WINDOW_HOURS = 72

export function ScheduleSummaryV3({
  letterTitle,
  deliveryDate,
  deliveryTime,
  timezone,
  channels,
  recipientType,
  recipientEmail,
  recipientName,
  mailDeliveryMode = "send_on",
  shippingAddress,
  printOptions,
  emailCredits,
  physicalCredits,
  onConfirm,
  onBack,
  isSubmitting = false,
  disabled = false,
}: ScheduleSummaryV3Props) {
  const hasEmail = channels.includes("email")
  const hasMail = channels.includes("mail")
  const isBoth = hasEmail && hasMail

  // Calculate costs
  const emailCost = hasEmail ? 1 : 0
  const mailCost = hasMail ? 1 : 0
  const totalCost = emailCost + mailCost

  // Calculate lock date
  const lockDate = subHours(deliveryDate, LOCK_WINDOW_HOURS)
  const daysFromNow = differenceInDays(deliveryDate, new Date())

  // Format time display
  const formatTimeDisplay = (time: string): string => {
    if (!time) return ""
    const parts = time.split(":").map(Number)
    const hours = parts[0] ?? 9
    const minutes = parts[1] ?? 0
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const recipientDisplay = recipientType === "myself" ? "Future You" : recipientName || recipientEmail

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white mb-4"
          style={{ borderRadius: "2px" }}
        >
          <Stamp className="h-3 w-3" strokeWidth={2} />
          <span>Final Review</span>
        </div>
        <h2 className="font-mono text-xl font-bold uppercase tracking-wider text-charcoal">
          Ready to Seal Your Letter?
        </h2>
        <p className="mt-1 font-mono text-xs text-charcoal/60 uppercase tracking-wider">
          Review your delivery settings
        </p>
      </div>

      {/* Summary Card */}
      <div
        className="border-2 border-charcoal bg-white p-5 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Letter Title */}
        <div className="border-b-2 border-dashed border-charcoal/20 pb-4 mb-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">
            Your Letter
          </p>
          <p className="font-mono text-sm font-bold text-charcoal line-clamp-2">
            &ldquo;{letterTitle}&rdquo;
          </p>
        </div>

        {/* Delivery Details Grid */}
        <div className="space-y-3">
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
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                Delivery Date
              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                {format(deliveryDate, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="font-mono text-[10px] text-duck-blue font-bold">
                at {formatTimeDisplay(deliveryTime)} • {daysFromNow === 1 ? "Tomorrow" : `${daysFromNow} days from now`}
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
                isBoth ? "bg-duck-yellow" : hasEmail ? "bg-duck-blue" : "bg-teal-primary"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isBoth ? (
                <Sparkles className="h-4 w-4 text-charcoal" strokeWidth={2} />
              ) : hasEmail ? (
                <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
              ) : (
                <FileText className="h-4 w-4 text-white" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                Delivery Method
              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                {isBoth ? "Email + Physical Mail" : hasEmail ? "Email Only" : "Physical Mail Only"}
              </p>
            </div>
          </div>

          {/* Recipient (for email) */}
          {hasEmail && (
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
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Email Recipient
                </p>
                <p className="font-mono text-xs font-bold text-charcoal truncate">
                  {recipientDisplay}
                </p>
                <p className="font-mono text-[10px] text-charcoal/50 truncate">
                  {recipientEmail}
                </p>
              </div>
            </div>
          )}

          {/* Shipping Address (for mail) */}
          {hasMail && shippingAddress && (
            <div
              className="flex items-start gap-3 border-2 border-teal-primary bg-teal-primary/5 p-3"
              style={{ borderRadius: "2px" }}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-teal-primary"
                style={{ borderRadius: "2px" }}
              >
                <MapPin className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Shipping To
                </p>
                <p className="font-mono text-xs font-bold text-charcoal">
                  {shippingAddress.name}
                </p>
                <p className="font-mono text-[10px] text-charcoal/70 leading-relaxed">
                  {shippingAddress.line1}
                  {shippingAddress.line2 && <>, {shippingAddress.line2}</>}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                {/* Print Options */}
                {printOptions?.doubleSided && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-teal-primary">
                      <BookOpen className="h-3 w-3" strokeWidth={2} />
                      Double-sided
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lock Date */}
          <div
            className="flex items-center gap-3 border-2 border-duck-yellow bg-duck-yellow/10 p-3"
            style={{ borderRadius: "2px" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-4 w-4 text-charcoal" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                Lock Date
              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                {format(lockDate, "MMMM d, yyyy")}
              </p>
              <p className="font-mono text-[10px] text-charcoal/60">
                No edits after this date
              </p>
            </div>
          </div>

          {/* Credit Cost */}
          <div
            className="border-2 border-charcoal bg-off-white p-3"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">
              Credit Usage
            </p>
            <div className="space-y-1.5">
              {hasEmail && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal">Email Delivery</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    {emailCredits} → {emailCredits - 1}
                  </span>
                </div>
              )}
              {hasMail && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal">Physical Mail</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    {physicalCredits} → {physicalCredits - mailCost}
                  </span>
                </div>
              )}
              {totalCost > 0 && (
                <div className="flex items-center justify-between pt-1.5 border-t border-charcoal/10">
                  <span className="font-mono text-xs font-bold text-charcoal">Total</span>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    {totalCost} credit{totalCost !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div
        className="flex items-start gap-3 p-3 border-2 border-dashed border-charcoal/30 bg-duck-cream"
        style={{ borderRadius: "2px" }}
      >
        <Lock className="h-4 w-4 text-charcoal/50 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
          <span className="font-bold text-charcoal">Once sealed</span>, this letter will be encrypted and locked until delivery. You won&apos;t be able to read or edit it again until it arrives.
        </p>
      </div>

      {/* Physical Mail Content Sealing Warning */}
      {hasMail && (
        <div
          className="flex items-start gap-3 p-3 border-2 border-coral/50 bg-coral/10"
          style={{ borderRadius: "2px" }}
        >
          <Stamp className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-charcoal font-bold leading-relaxed">
              IMPORTANT: Physical Mail Content Is Final
            </p>
            <p className="font-mono text-[10px] text-charcoal/70 leading-relaxed">
              Your letter content will be sealed immediately for printing. Unlike email, you <span className="font-bold">cannot edit the physical letter</span> after scheduling, even before the delivery date.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || disabled}
          className="flex-1 gap-2 h-12 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider"
          style={{ borderRadius: "2px" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting || disabled}
          className="flex-[2] gap-2 h-12 bg-coral hover:bg-coral/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] hover:shadow-[6px_6px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
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
  )
}

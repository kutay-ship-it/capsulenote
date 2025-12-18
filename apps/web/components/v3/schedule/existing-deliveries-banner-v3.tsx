"use client"

import * as React from "react"
import { format } from "date-fns"
import { Mail, FileText, Clock, ChevronDown, ChevronUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import type { DeliveryChannel, DeliveryStatus } from "@prisma/client"
import { Link } from "@/i18n/routing"

interface DeliveryInfo {
  id: string
  channel: DeliveryChannel
  status: DeliveryStatus
  deliverAt: Date
  emailDelivery?: {
    toEmail: string
    subject: string
  } | null
  mailDelivery?: {
    shippingAddressId: string
  } | null
}

interface ExistingDeliveriesBannerV3Props {
  deliveries: DeliveryInfo[]
  letterId: string
}

const STATUS_KEYS: Record<DeliveryStatus, string> = {
  scheduled: "status.scheduled",
  processing: "status.processing",
  sent: "status.sent",
  failed: "status.failed",
  canceled: "status.canceled",
}

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  scheduled: "bg-duck-blue text-charcoal",
  processing: "bg-duck-yellow text-charcoal",
  sent: "bg-teal-primary text-white",
  failed: "bg-coral text-white",
  canceled: "bg-charcoal/30 text-charcoal",
}

export function ExistingDeliveriesBannerV3({
  deliveries,
  letterId,
}: ExistingDeliveriesBannerV3Props) {
  const t = useTranslations("schedule.existingDeliveries")
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Filter to only show active deliveries (not canceled/failed)
  const activeDeliveries = deliveries.filter(
    (d) => d.status !== "canceled" && d.status !== "failed"
  )

  // Don't render if no active deliveries
  if (activeDeliveries.length === 0) {
    return null
  }

  const showCollapseToggle = activeDeliveries.length > 2
  const displayedDeliveries = showCollapseToggle && !isExpanded
    ? activeDeliveries.slice(0, 2)
    : activeDeliveries

  const getRecipient = (delivery: DeliveryInfo): string => {
    if (delivery.channel === "email" && delivery.emailDelivery) {
      return delivery.emailDelivery.toEmail
    }
    // For mail, we only have the shipping address ID - show generic label
    // Could be enhanced to include shipping address name in the query
    return delivery.channel === "email" ? t("emailRecipient") : t("mailRecipient")
  }

  return (
    <div
      className="border-2 border-duck-yellow bg-duck-yellow/20 p-4"
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-6 w-6 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="h-3.5 w-3.5 text-charcoal" strokeWidth={2} />
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
          {t("title", { count: activeDeliveries.length })}
        </p>
      </div>

      {/* Delivery List */}
      <div className="space-y-2">
        {displayedDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="flex items-center gap-3 border-2 border-charcoal/20 bg-white p-3"
            style={{ borderRadius: "2px" }}
          >
            {/* Channel Icon */}
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                delivery.channel === "email" ? "bg-duck-blue" : "bg-teal-primary"
              )}
              style={{ borderRadius: "2px" }}
            >
              {delivery.channel === "email" ? (
                <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
              ) : (
                <FileText className="h-4 w-4 text-white" strokeWidth={2} />
              )}
            </div>

            {/* Delivery Info */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold text-charcoal truncate">
                {delivery.channel === "email" ? t("email") : t("physicalMail")} {t("to")} {getRecipient(delivery)}
              </p>
              <p className="font-mono text-[10px] text-charcoal/60">
                {format(new Date(delivery.deliverAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={cn(
                "flex-shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                STATUS_COLORS[delivery.status]
              )}
              style={{ borderRadius: "2px" }}
            >
              {t(STATUS_KEYS[delivery.status])}
            </span>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      {showCollapseToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70 hover:text-charcoal transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" strokeWidth={2} />
              {t("showLess")}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" strokeWidth={2} />
              {t("showMore", { count: activeDeliveries.length - 2 })}
            </>
          )}
        </button>
      )}

      {/* Link to Letter Page */}
      <div className="mt-3 pt-3 border-t border-charcoal/10">
        <Link
          href={{ pathname: "/letters/[id]", params: { id: letterId } }}
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70 hover:text-charcoal transition-colors"
        >
          {t("manageOnLetterPage")}
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}

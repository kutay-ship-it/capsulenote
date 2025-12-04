"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Printer,
  Send,
  Truck,
  MapPin,
  MailCheck,
  Check,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"

/**
 * Tracking stages for physical mail delivery
 * Maps Lob webhook statuses to user-friendly stages
 */
const TRACKING_STAGES = [
  {
    id: "preparing",
    label: "Preparing",
    description: "Your letter is being printed",
    statuses: ["created", "rendered"],
    icon: Printer,
  },
  {
    id: "mailed",
    label: "Mailed",
    description: "Entered USPS mail stream",
    statuses: ["mailed"],
    icon: Send,
  },
  {
    id: "in_transit",
    label: "In Transit",
    description: "On its way to you",
    statuses: ["in_transit"],
    icon: Truck,
  },
  {
    id: "local",
    label: "In Your Area",
    description: "Arriving soon",
    statuses: ["in_local_area", "out_for_delivery"],
    icon: MapPin,
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Check your mailbox!",
    statuses: ["delivered"],
    icon: MailCheck,
  },
] as const

type StageId = (typeof TRACKING_STAGES)[number]["id"]
type StageStatus = "completed" | "current" | "pending" | "failed"

interface MailTrackingRoadProps {
  trackingStatus: string | null
  expectedDeliveryDate?: string | null
  className?: string
}

/**
 * Get the current active stage based on tracking status
 */
function getActiveStageIndex(trackingStatus: string | null): number {
  if (!trackingStatus) return 0

  // Check for failure states
  if (trackingStatus === "returned" || trackingStatus === "failed") {
    return -1 // Special case: failed
  }

  for (let i = 0; i < TRACKING_STAGES.length; i++) {
    if (TRACKING_STAGES[i]!.statuses.includes(trackingStatus as never)) {
      return i
    }
  }
  return 0
}

/**
 * Get the status for a stage (completed, current, pending, or failed)
 */
function getStageStatus(
  stageIndex: number,
  activeIndex: number,
  isFailed: boolean
): StageStatus {
  if (isFailed) {
    // On failure, show all stages as failed/pending
    return stageIndex === 0 ? "failed" : "pending"
  }
  if (stageIndex < activeIndex) return "completed"
  if (stageIndex === activeIndex) return "current"
  return "pending"
}

/**
 * Mail Tracking Road Component
 *
 * Displays the physical mail delivery journey in a neo-brutalist style.
 * Shows progress through: Preparing → Mailed → In Transit → Local → Delivered
 */
export function MailTrackingRoad({
  trackingStatus,
  expectedDeliveryDate,
  className,
}: MailTrackingRoadProps) {
  const activeIndex = getActiveStageIndex(trackingStatus)
  const isFailed =
    trackingStatus === "returned" || trackingStatus === "failed"

  return (
    <div
      className={cn(
        "border-2 border-charcoal bg-cream p-4 md:p-6",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Mail Tracking
        </h3>
        {expectedDeliveryDate && !isFailed && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
            Expected: {expectedDeliveryDate}
          </span>
        )}
        {isFailed && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-coral text-white"
            style={{ borderRadius: "2px" }}
          >
            <AlertTriangle className="h-3 w-3" strokeWidth={2} />
            {trackingStatus === "returned" ? "Returned" : "Failed"}
          </span>
        )}
      </div>

      {/* Tracking Road */}
      <div className="flex flex-wrap items-start justify-between gap-2 md:flex-nowrap md:gap-0">
        {TRACKING_STAGES.map((stage, index) => {
          const status = getStageStatus(index, activeIndex, isFailed)
          const Icon = stage.icon
          const isLast = index === TRACKING_STAGES.length - 1

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <div className="flex flex-col items-center w-[calc(50%-4px)] md:w-auto md:flex-1">
                {/* Icon Container */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 md:h-14 md:w-14 items-center justify-center border-2 border-charcoal transition-all",
                    status === "completed" &&
                      "bg-teal-primary shadow-[3px_3px_0_theme(colors.charcoal)]",
                    status === "current" &&
                      "bg-duck-yellow shadow-[3px_3px_0_theme(colors.charcoal)]",
                    status === "pending" && "bg-charcoal/10",
                    status === "failed" &&
                      "bg-coral shadow-[3px_3px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Completed Check */}
                  {status === "completed" && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-teal-primary border-2 border-charcoal" style={{ borderRadius: "2px" }}>
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Current Pulse */}
                  {status === "current" && (
                    <div className="absolute inset-0 bg-duck-yellow animate-pulse opacity-50" style={{ borderRadius: "2px" }} />
                  )}

                  <Icon
                    className={cn(
                      "relative z-10 h-5 w-5 md:h-6 md:w-6",
                      status === "completed" && "text-white",
                      status === "current" && "text-charcoal",
                      status === "pending" && "text-charcoal/40",
                      status === "failed" && "text-white"
                    )}
                    strokeWidth={2}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider text-center",
                    status === "completed" && "text-teal-primary",
                    status === "current" && "text-charcoal",
                    status === "pending" && "text-charcoal/40",
                    status === "failed" && "text-coral"
                  )}
                >
                  {stage.label}
                </span>

                {/* Description (only for current stage on desktop) */}
                {status === "current" && (
                  <span className="hidden md:block mt-0.5 font-mono text-[9px] text-charcoal/60 text-center max-w-[80px]">
                    {stage.description}
                  </span>
                )}
              </div>

              {/* Connector Line (between stages) */}
              {!isLast && (
                <div className="hidden md:flex items-center flex-shrink-0 w-8 h-14 justify-center">
                  <div
                    className={cn(
                      "w-full border-t-2 border-dashed",
                      index < activeIndex
                        ? "border-teal-primary"
                        : "border-charcoal/20"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Failed State Message */}
      {isFailed && (
        <div
          className="mt-4 flex items-center gap-3 p-3 border-2 border-coral bg-coral/10"
          style={{ borderRadius: "2px" }}
        >
          <RotateCcw className="h-5 w-5 text-coral flex-shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
              {trackingStatus === "returned"
                ? "Mail Returned to Sender"
                : "Delivery Failed"}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-charcoal/70">
              {trackingStatus === "returned"
                ? "The address may be incorrect or undeliverable. Please check your shipping address."
                : "An error occurred during delivery. Please contact support."}
            </p>
          </div>
        </div>
      )}

      {/* Delivered State Message */}
      {trackingStatus === "delivered" && (
        <div
          className="mt-4 flex items-center gap-3 p-3 border-2 border-teal-primary bg-teal-primary/10"
          style={{ borderRadius: "2px" }}
        >
          <MailCheck className="h-5 w-5 text-teal-primary flex-shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
              Your Letter Has Arrived!
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-charcoal/70">
              Check your mailbox for a message from your past self.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

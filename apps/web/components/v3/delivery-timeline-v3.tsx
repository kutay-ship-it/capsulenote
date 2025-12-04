"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CancelDeliveryDialogV3 } from "./cancel-delivery-dialog-v3"
import { MailTrackingRoad } from "./mail-tracking-road"
import { retryDelivery } from "@/server/actions/deliveries"

interface DeliveryInfo {
  id: string
  channel: "email" | "mail"
  status: "scheduled" | "processing" | "sent" | "failed" | "canceled"
  deliverAt: Date | string
  lastError?: string | null
  emailDelivery?: {
    toEmail: string
  } | null
  mailDelivery?: {
    shippingAddressId: string
    trackingStatus?: string | null
    previewUrl?: string | null
  } | null
}

interface DeliveryTimelineV3Props {
  deliveries: DeliveryInfo[]
  letterId: string
  letterTitle: string
}

export function DeliveryTimelineV3({
  deliveries,
  letterId,
  letterTitle,
}: DeliveryTimelineV3Props) {
  const [retryingId, setRetryingId] = React.useState<string | null>(null)

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId)

    try {
      const result = await retryDelivery(deliveryId)

      if (!result.success) {
        toast.error("Failed to retry delivery", {
          description: result.error?.message || "Please try again.",
        })
        return
      }

      toast.success("Delivery rescheduled", {
        description: "The delivery will be attempted again.",
      })
    } catch (error) {
      console.error("Failed to retry delivery:", error)
      toast.error("Failed to retry delivery", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setRetryingId(null)
    }
  }

  return (
    <div
      className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
        Delivery Timeline
      </h2>

      <div className="space-y-3">
        {deliveries.map((delivery) => {
          const deliveryDate = format(
            new Date(delivery.deliverAt),
            "MMMM d, yyyy 'at' h:mm a"
          )
          const isDelivered = delivery.status === "sent"
          const isFailed = delivery.status === "failed"
          const isScheduled = delivery.status === "scheduled"
          const isProcessing = delivery.status === "processing"
          const isCanceled = delivery.status === "canceled"
          const canCancel = isScheduled // Only scheduled can be canceled
          const canRetry = isFailed

          return (
            <div
              key={delivery.id}
              className={cn(
                "flex items-center gap-4 border-2 border-l-4 p-4",
                isDelivered && "border-teal-primary bg-white",
                isFailed && "border-coral bg-white",
                isScheduled && "border-duck-blue bg-white",
                isProcessing && "border-duck-yellow bg-white",
                isCanceled && "border-charcoal/30 bg-charcoal/5"
              )}
              style={{ borderRadius: "2px" }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                  isDelivered && "bg-teal-primary text-white",
                  isFailed && "bg-coral text-white",
                  isScheduled && "bg-duck-blue text-charcoal",
                  isProcessing && "bg-duck-yellow text-charcoal",
                  isCanceled && "bg-charcoal/20 text-charcoal/50"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isDelivered && (
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                )}
                {isFailed && <AlertCircle className="h-5 w-5" strokeWidth={2} />}
                {isScheduled && <Clock className="h-5 w-5" strokeWidth={2} />}
                {isProcessing && (
                  <Clock className="h-5 w-5 animate-pulse" strokeWidth={2} />
                )}
                {isCanceled && <X className="h-5 w-5" strokeWidth={2} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
                    {delivery.channel === "email" ? "Email" : "Mail"}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                      isDelivered && "bg-teal-primary text-white",
                      isFailed && "bg-coral text-white",
                      isScheduled && "bg-duck-blue text-charcoal",
                      isProcessing && "bg-duck-yellow text-charcoal",
                      isCanceled && "bg-charcoal/30 text-charcoal/70"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {delivery.status}
                  </span>
                </div>

                <p className="mt-1 font-mono text-xs text-charcoal/60">
                  {deliveryDate}
                </p>

                {delivery.channel === "email" &&
                  delivery.emailDelivery?.toEmail && (
                    <p className="font-mono text-xs text-charcoal/40">
                      To: {delivery.emailDelivery.toEmail}
                    </p>
                  )}

                {isFailed && delivery.lastError && (
                  <p className="mt-1 font-mono text-xs text-coral">
                    {delivery.lastError}
                  </p>
                )}

                {/* Mail Tracking Road - only for physical mail with tracking */}
                {delivery.channel === "mail" &&
                  delivery.mailDelivery?.trackingStatus && (
                    <MailTrackingRoad
                      trackingStatus={delivery.mailDelivery.trackingStatus}
                      className="mt-3"
                    />
                  )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Cancel button for scheduled */}
                {canCancel && (
                  <CancelDeliveryDialogV3
                    deliveryId={delivery.id}
                    channel={delivery.channel}
                    deliverAt={delivery.deliverAt}
                    letterTitle={letterTitle}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-mono text-xs uppercase tracking-wider text-coral hover:text-coral hover:bg-coral/10"
                    >
                      <X className="h-4 w-4 mr-1" strokeWidth={2} />
                      Cancel
                    </Button>
                  </CancelDeliveryDialogV3>
                )}

                {/* Reschedule button for scheduled */}
                {canCancel && (
                  <Link
                    href={{ pathname: "/letters/[id]/schedule", params: { id: letterId } }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                      style={{ borderRadius: "2px" }}
                    >
                      <Calendar className="h-4 w-4 mr-1" strokeWidth={2} />
                      Reschedule
                    </Button>
                  </Link>
                )}

                {/* Retry button for failed */}
                {canRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(delivery.id)}
                    disabled={retryingId === delivery.id}
                    className="font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    <RotateCcw
                      className={cn(
                        "h-4 w-4 mr-1",
                        retryingId === delivery.id && "animate-spin"
                      )}
                      strokeWidth={2}
                    />
                    {retryingId === delivery.id ? "Retrying..." : "Retry"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

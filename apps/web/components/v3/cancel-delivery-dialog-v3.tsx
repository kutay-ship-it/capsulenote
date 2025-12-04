"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { AlertTriangle, Clock, CreditCard, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cancelDelivery } from "@/server/actions/deliveries"

const LOCK_WINDOW_MS = 72 * 60 * 60 * 1000 // 72 hours

interface CancelDeliveryDialogV3Props {
  deliveryId: string
  channel: "email" | "mail"
  deliverAt: Date | string
  letterTitle: string
  children: React.ReactNode
  onCanceled?: () => void
}

export function CancelDeliveryDialogV3({
  deliveryId,
  channel,
  deliverAt,
  letterTitle,
  children,
  onCanceled,
}: CancelDeliveryDialogV3Props) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Calculate if within lock window
  const deliveryDate = new Date(deliverAt)
  const timeUntilDelivery = deliveryDate.getTime() - Date.now()
  const isLocked = timeUntilDelivery <= LOCK_WINDOW_MS
  const hoursUntilDelivery = Math.floor(timeUntilDelivery / (1000 * 60 * 60))
  const daysUntilDelivery = Math.floor(hoursUntilDelivery / 24)

  // Credit type
  const creditType = channel === "email" ? "email" : "physical mail"
  const willRefund = !isLocked

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const result = await cancelDelivery({ deliveryId })

      if (!result.success) {
        toast.error("Failed to cancel delivery", {
          description: result.error?.message || "Please try again.",
        })
        setIsLoading(false)
        return
      }

      // Success
      toast.success("Delivery canceled", {
        description: willRefund
          ? `Your ${creditType} credit has been refunded.`
          : "The delivery has been canceled.",
      })

      setOpen(false)
      onCanceled?.()
      router.refresh()
    } catch (error) {
      console.error("Failed to cancel delivery:", error)
      toast.error("Failed to cancel delivery", {
        description: "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="max-w-md border-2 border-charcoal bg-white p-0 gap-0"
        style={{
          borderRadius: "2px",
          boxShadow: "6px 6px 0px 0px rgb(56, 56, 56)",
        }}
      >
        {/* Header */}
        <AlertDialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                isLocked ? "bg-coral" : "bg-duck-yellow"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isLocked ? (
                <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2} />
              ) : (
                <X className="h-6 w-6 text-charcoal" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                Cancel Delivery?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 font-mono text-xs text-charcoal/60">
                &ldquo;{letterTitle}&rdquo;
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Content */}
        <div className="px-6 pb-4 space-y-4">
          {/* Delivery Info */}
          <div
            className="flex items-center gap-3 border-2 border-charcoal/20 bg-off-white p-3"
            style={{ borderRadius: "2px" }}
          >
            <Clock className="h-4 w-4 text-charcoal/50" strokeWidth={2} />
            <div className="font-mono text-xs">
              <span className="text-charcoal/60">Scheduled for </span>
              <span className="font-bold text-charcoal">
                {format(deliveryDate, "MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>

          {/* Lock Window Warning */}
          {isLocked ? (
            <div
              className="border-2 border-coral bg-coral/10 p-4"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="h-5 w-5 text-coral flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
                    Credit Will NOT Be Refunded
                  </p>
                  <p className="font-mono text-xs text-charcoal/70">
                    This delivery is within the 72-hour lock window (
                    {hoursUntilDelivery < 24
                      ? `${hoursUntilDelivery} hours`
                      : `${daysUntilDelivery} days`}{" "}
                    remaining). Your {creditType} credit will be{" "}
                    <span className="font-bold text-coral">lost</span> if you
                    cancel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-teal-primary/30 bg-teal-primary/10 p-4"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-start gap-3">
                <CreditCard
                  className="h-5 w-5 text-teal-primary flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
                    Credit Will Be Refunded
                  </p>
                  <p className="font-mono text-xs text-charcoal/70">
                    Your {creditType} credit will be returned to your account
                    when you cancel this delivery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional context */}
          <p className="font-mono text-[10px] text-charcoal/50 leading-relaxed">
            Canceling will stop this delivery from being sent. The letter itself
            will remain in your account as a draft.
          </p>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="border-t-2 border-charcoal/10 bg-duck-cream p-4">
          <AlertDialogCancel
            className="font-mono text-xs uppercase tracking-wider border-2 border-charcoal bg-white hover:bg-charcoal/5 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
            disabled={isLoading}
          >
            Keep Scheduled
          </AlertDialogCancel>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className={cn(
              "font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]",
              isLocked
                ? "bg-coral hover:bg-coral/90 text-white"
                : "bg-charcoal hover:bg-charcoal/90 text-white"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Canceling...
              </>
            ) : isLocked ? (
              "Cancel Anyway"
            ) : (
              "Cancel Delivery"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

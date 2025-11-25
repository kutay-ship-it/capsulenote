"use client"

import { useOptimistic, useTransition } from "react"
import { Mail, Package, Clock, CheckCircle2, XCircle, Calendar, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TimezoneTooltip } from "@/components/timezone-tooltip"
import { DownloadCalendarButton } from "@/components/download-calendar-button"
import { DeliveryErrorCard } from "@/components/delivery-error-card"
import { toast } from "sonner"
import { cancelDelivery } from "@/server/actions/deliveries"
import { cn } from "@/lib/utils"

export interface DeliveryItem {
  id: string
  letterId: string
  status: "scheduled" | "processing" | "sent" | "failed" | "canceled"
  channel: "email" | "mail"
  deliverAt: Date | string
  attemptCount: number
  lastError: string | null
  letter: {
    title: string
  }
  emailDelivery?: {
    toEmail: string
  } | null
}

interface DeliveriesListClientProps {
  deliveries: DeliveryItem[]
  locale: string
}

type OptimisticAction = { type: "cancel"; id: string }

export function DeliveriesListClient({ deliveries, locale }: DeliveriesListClientProps) {
  const t = useTranslations("deliveries")
  const [isPending, startTransition] = useTransition()

  const [optimisticDeliveries, updateOptimisticDeliveries] = useOptimistic(
    deliveries,
    (state, action: OptimisticAction) => {
      if (action.type === "cancel") {
        return state.map((delivery) =>
          delivery.id === action.id
            ? { ...delivery, status: "canceled" as const }
            : delivery
        )
      }
      return state
    }
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-duck-blue"
      case "processing":
        return "bg-mustard"
      case "sent":
        return "bg-lime"
      case "failed":
        return "bg-coral"
      case "canceled":
        return "bg-gray"
      default:
        return "bg-gray"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
      case "failed":
      case "canceled":
        return <XCircle className="h-4 w-4" strokeWidth={2} />
      case "scheduled":
      case "processing":
      default:
        return <Clock className="h-4 w-4" strokeWidth={2} />
    }
  }

  const getChannelIcon = (channel: string) => {
    return channel === "email" ? (
      <Mail className="h-4 w-4" strokeWidth={2} />
    ) : (
      <Package className="h-4 w-4" strokeWidth={2} />
    )
  }

  // Note: dateStyle/timeStyle cannot be combined with timeZoneName in Intl.DateTimeFormat
  // Use explicit options when timeZoneName is needed
  const formatDateTime = (date: Date | string) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(typeof date === "string" ? new Date(date) : date)

  const handleCancel = (deliveryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      // Optimistically cancel the delivery
      updateOptimisticDeliveries({ type: "cancel", id: deliveryId })

      try {
        const result = await cancelDelivery(deliveryId)

        if (!result.success) {
          // Revert will happen automatically on next render
          toast.error(t("toasts.cancelError.title"), {
            description: result.error?.message || t("toasts.cancelError.description"),
          })
          return
        }

        toast.success(t("toasts.canceled.title"), {
          description: t("toasts.canceled.description"),
        })
      } catch (error) {
        toast.error(t("toasts.cancelError.title"), {
          description: t("toasts.cancelError.description"),
        })
      }
    })
  }

  return (
    <div className={cn("space-y-4 sm:space-y-6", isPending && "opacity-70")}>
      {optimisticDeliveries.map((delivery) => (
        <div key={delivery.id} className="space-y-3">
          <Link href={`/letters/${delivery.letterId}`}>
            <Card
              className="group border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5"
              style={{ borderRadius: "2px" }}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left Side - Letter Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-charcoal ${getStatusColor(delivery.status)}`}
                        style={{ borderRadius: "2px" }}
                      >
                        {getStatusIcon(delivery.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-base font-normal uppercase tracking-wide text-charcoal line-clamp-1 sm:text-lg">
                          {delivery.letter.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-gray-secondary sm:text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" strokeWidth={2} />
                            {formatDateTime(delivery.deliverAt)}
                            <TimezoneTooltip deliveryDate={delivery.deliverAt} variant="clock" />
                          </span>
                          <span className="flex items-center gap-1">
                            {getChannelIcon(delivery.channel)}
                            {delivery.channel === "email" ? t("channel.email") : t("channel.mail")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status Badge and Actions */}
                  <div className="flex items-center gap-3">
                    {delivery.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral/20 text-coral"
                        onClick={(e) => handleCancel(delivery.id, e)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 mr-1" strokeWidth={2} />
                        {t("cancel")}
                      </Button>
                    )}
                    <DownloadCalendarButton
                      letterTitle={delivery.letter.title}
                      deliveryDate={new Date(delivery.deliverAt)}
                      deliveryMethod={delivery.channel}
                      recipientEmail={delivery.channel === "email" ? (delivery.emailDelivery?.toEmail ?? "") : ""}
                    />
                    <Badge
                      className={`border-2 border-charcoal font-mono text-xs uppercase ${getStatusColor(delivery.status)}`}
                      style={{ borderRadius: "2px" }}
                    >
                      {t(`status.${delivery.status}` as const)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Error Card for Failed Deliveries */}
          {delivery.status === "failed" && (
            <DeliveryErrorCard
              deliveryId={delivery.id}
              lastError={delivery.lastError}
              attemptCount={delivery.attemptCount}
              letterTitle={delivery.letter.title}
            />
          )}
        </div>
      ))}
    </div>
  )
}

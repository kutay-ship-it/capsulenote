import { getDeliveries } from "@/server/actions/deliveries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTimeWithTimezone } from "@/lib/utils"
import { TimezoneTooltip } from "@/components/timezone-tooltip"
import { DownloadCalendarButton } from "@/components/download-calendar-button"
import { DeliveryErrorCard } from "@/components/delivery-error-card"
import Link from "next/link"
import { Mail, Package, Clock, CheckCircle2, XCircle, Calendar } from "lucide-react"

// Force dynamic rendering - deliveries list must always show fresh data
export const revalidate = 0

export default async function DeliveriesPage() {
  const deliveries = await getDeliveries()

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

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          Deliveries
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          All your scheduled and past deliveries
        </p>
      </div>

      {deliveries.length === 0 ? (
        /* Empty State */
        <Card
          className="border-2 border-charcoal shadow-md"
          style={{ borderRadius: "2px" }}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-duck-blue"
              style={{ borderRadius: "2px" }}
            >
              <Mail className="h-10 w-10 text-charcoal" strokeWidth={2} />
            </div>
            <h3 className="mb-2 font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
              No Deliveries Scheduled
            </h3>
            <p className="max-w-md font-mono text-sm text-gray-secondary sm:text-base">
              When you schedule letters, they'll appear here with their delivery status.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Deliveries List */
        <div className="space-y-4 sm:space-y-6">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="space-y-3">
              <Link href={`/letters/${delivery.letterId}`}>
                <Card
                  className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5"
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
                                {formatDateTimeWithTimezone(delivery.deliverAt)}
                                <TimezoneTooltip deliveryDate={delivery.deliverAt} variant="clock" />
                              </span>
                              <span className="flex items-center gap-1">
                                {getChannelIcon(delivery.channel)}
                                {delivery.channel === "email" ? "Email" : "Physical Mail"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Status Badge and Actions */}
                      <div className="flex items-center gap-3">
                        <div onClick={(e) => e.preventDefault()}>
                          <DownloadCalendarButton
                            letterTitle={delivery.letter.title}
                            deliveryDate={new Date(delivery.deliverAt)}
                            deliveryMethod={delivery.channel}
                            recipientEmail={delivery.channel === "email" ? (delivery.emailDelivery?.toEmail ?? "") : ""}
                          />
                        </div>
                        <Badge
                          className={`border-2 border-charcoal font-mono text-xs uppercase ${getStatusColor(delivery.status)}`}
                          style={{ borderRadius: "2px" }}
                        >
                          {delivery.status}
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
      )}
    </div>
  )
}

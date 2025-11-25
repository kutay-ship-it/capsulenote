import { getTranslations, getLocale } from "next-intl/server"
import { ArrowRight, CheckCircle2, Clock, Send, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getNextDeliveryWithTimeline } from "@/server/lib/stats"
import { cn } from "@/lib/utils"

interface TimelineMinimapProps {
  userId: string
}

type TimelineStatus = "created" | "scheduled" | "processing" | "delivered" | "failed"

interface MinimapStep {
  status: TimelineStatus
  isCompleted: boolean
  isCurrent: boolean
  isError?: boolean
}

const statusIcons = {
  created: CheckCircle2,
  scheduled: Clock,
  processing: Send,
  delivered: CheckCircle2,
  failed: AlertCircle,
}

const statusColors = {
  created: { completed: "bg-duck-blue", pending: "bg-gray-200" },
  scheduled: { completed: "bg-duck-blue", pending: "bg-gray-200" },
  processing: { completed: "bg-mustard", pending: "bg-gray-200" },
  delivered: { completed: "bg-lime", pending: "bg-gray-200" },
  failed: { completed: "bg-coral", pending: "bg-gray-200" },
}

export async function TimelineMinimap({ userId }: TimelineMinimapProps) {
  const t = await getTranslations("timeline.minimap")
  const locale = await getLocale()
  const delivery = await getNextDeliveryWithTimeline(userId)

  if (!delivery) {
    return (
      <Card
        className="border-2 border-charcoal bg-bg-lavender-light"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="flex flex-col items-center py-6 text-center">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-off-white"
            style={{ borderRadius: "2px" }}
          >
            <Clock className="h-6 w-6 text-charcoal" />
          </div>
          <p className="font-mono text-sm text-gray-secondary">
            {t("noDeliveries")}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Build minimap steps
  const getMinimapSteps = (): MinimapStep[] => {
    const steps: MinimapStep[] = []
    const status = delivery.status

    // Created - always completed
    steps.push({
      status: "created",
      isCompleted: true,
      isCurrent: false,
    })

    // Scheduled
    const isScheduled = ["scheduled", "processing", "sent", "failed"].includes(status)
    steps.push({
      status: "scheduled",
      isCompleted: isScheduled,
      isCurrent: status === "scheduled",
    })

    // Processing
    if (["processing", "sent", "failed"].includes(status)) {
      steps.push({
        status: "processing",
        isCompleted: status !== "processing",
        isCurrent: status === "processing",
      })
    }

    // Final status
    if (status === "sent") {
      steps.push({
        status: "delivered",
        isCompleted: true,
        isCurrent: true,
      })
    } else if (status === "failed") {
      steps.push({
        status: "failed",
        isCompleted: true,
        isCurrent: true,
        isError: true,
      })
    }

    return steps
  }

  const steps = getMinimapSteps()

  // Calculate days until delivery
  const deliverAt = new Date(delivery.deliverAt)
  const now = new Date()
  const diffTime = deliverAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const getDaysLabel = () => {
    if (diffDays < 0) return t("overdue")
    if (diffDays === 0) return t("today")
    return t("daysUntil", { count: diffDays })
  }

  const formatDeliveryDate = () => {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(deliverAt)
  }

  return (
    <Card
      className="border-2 border-charcoal bg-bg-peach-light"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm uppercase tracking-wide text-charcoal">
          {t("heading")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Letter title */}
        <p className="truncate font-mono text-sm text-charcoal">
          &ldquo;{delivery.letterTitle}&rdquo;
        </p>

        {/* Mini timeline */}
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, index) => {
            const Icon = statusIcons[step.status]
            const isLast = index === steps.length - 1
            const colorConfig = statusColors[step.status]
            const bgColor = step.isCompleted || step.isCurrent
              ? colorConfig.completed
              : colorConfig.pending

            return (
              <div key={step.status} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal",
                    bgColor,
                    step.isError && "bg-coral"
                  )}
                  style={{ borderRadius: "2px" }}
                  title={step.status}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      step.isCompleted || step.isCurrent
                        ? "text-charcoal"
                        : "text-gray-400"
                    )}
                  />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-1",
                      step.isCompleted ? "bg-charcoal" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Delivery info */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-gray-secondary">
            {formatDeliveryDate()}
          </span>
          <span
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-xs uppercase",
              diffDays < 0
                ? "border-coral bg-coral/10 text-coral"
                : diffDays === 0
                  ? "border-duck-yellow bg-duck-yellow text-charcoal"
                  : "border-charcoal bg-off-white text-charcoal"
            )}
          >
            {getDaysLabel()}
          </span>
        </div>

        {/* View letter link */}
        {/* @ts-expect-error - Dynamic route pattern supported by next-intl */}
        <Link href={`/letters/${delivery.letterId}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-2 border-charcoal bg-off-white text-charcoal hover:bg-duck-yellow/20"
            style={{ borderRadius: "2px" }}
          >
            {t("viewLetter")}
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

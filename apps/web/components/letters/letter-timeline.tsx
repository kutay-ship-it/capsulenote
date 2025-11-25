"use client"

import { useTranslations } from "next-intl"
import { Circle, CheckCircle2, Clock, AlertCircle, Send, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

type TimelineStep = "created" | "scheduled" | "processing" | "delivered" | "failed"

interface TimelineStepData {
  step: TimelineStep
  date?: Date | string | null
  isCompleted: boolean
  isCurrent: boolean
  isError?: boolean
}

interface LetterTimelineProps {
  createdAt: Date | string
  scheduledFor?: Date | string | null
  deliveries: Array<{
    status: string
    deliverAt: Date | string
    createdAt: Date | string
  }>
  locale?: string
  className?: string
}

const stepConfig: Record<TimelineStep, { icon: typeof Circle; color: string; bgColor: string }> = {
  created: { icon: Pencil, color: "text-duck-blue", bgColor: "bg-duck-blue" },
  scheduled: { icon: Clock, color: "text-duck-blue", bgColor: "bg-duck-blue" },
  processing: { icon: Send, color: "text-mustard", bgColor: "bg-mustard" },
  delivered: { icon: CheckCircle2, color: "text-lime", bgColor: "bg-lime" },
  failed: { icon: AlertCircle, color: "text-coral", bgColor: "bg-coral" },
}

export function LetterTimeline({
  createdAt,
  scheduledFor,
  deliveries,
  locale = "en",
  className,
}: LetterTimelineProps) {
  const t = useTranslations("timeline")

  // Determine timeline steps based on delivery status
  const getTimelineSteps = (): TimelineStepData[] => {
    const steps: TimelineStepData[] = []

    // Step 1: Created (always completed)
    steps.push({
      step: "created",
      date: createdAt,
      isCompleted: true,
      isCurrent: false,
    })

    // Get the most recent delivery for timeline
    const latestDelivery = deliveries.length > 0
      ? deliveries.reduce((latest, d) =>
          new Date(d.deliverAt) > new Date(latest.deliverAt) ? d : latest
        )
      : null

    if (!latestDelivery) {
      // No deliveries - just show created
      steps[0]!.isCurrent = true
      return steps
    }

    // Step 2: Scheduled
    const isScheduled = ["scheduled", "processing", "sent", "failed"].includes(latestDelivery.status)
    const isProcessing = latestDelivery.status === "processing"
    const isSent = latestDelivery.status === "sent"
    const isFailed = latestDelivery.status === "failed"

    steps.push({
      step: "scheduled",
      date: scheduledFor || latestDelivery.deliverAt,
      isCompleted: isScheduled,
      isCurrent: latestDelivery.status === "scheduled",
    })

    // Step 3: Processing (only show if in progress or past)
    if (isProcessing || isSent || isFailed) {
      steps.push({
        step: "processing",
        date: isProcessing ? new Date() : null,
        isCompleted: isSent || isFailed,
        isCurrent: isProcessing,
      })
    }

    // Step 4: Delivered or Failed
    if (isSent) {
      steps.push({
        step: "delivered",
        date: latestDelivery.deliverAt,
        isCompleted: true,
        isCurrent: true,
      })
    } else if (isFailed) {
      steps.push({
        step: "failed",
        date: latestDelivery.deliverAt,
        isCompleted: true,
        isCurrent: true,
        isError: true,
      })
    }

    return steps
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return ""
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(dateObj)
  }

  const timelineSteps = getTimelineSteps()

  return (
    <div className={cn("border-2 border-charcoal p-4 sm:p-6", className)} style={{ borderRadius: "2px" }}>
      <h3 className="mb-6 font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
        {t("heading")}
      </h3>

      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200" />

        {/* Timeline steps */}
        <div className="space-y-6">
          {timelineSteps.map((stepData, index) => {
            const config = stepConfig[stepData.step]
            const Icon = config.icon
            const isLast = index === timelineSteps.length - 1

            return (
              <div key={stepData.step} className="relative flex items-start gap-4">
                {/* Step indicator */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal",
                    stepData.isCompleted || stepData.isCurrent
                      ? config.bgColor
                      : "bg-white",
                    stepData.isError && "bg-coral"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      stepData.isCompleted || stepData.isCurrent
                        ? "text-charcoal"
                        : "text-gray-400"
                    )}
                  />
                </div>

                {/* Step content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "font-mono text-sm uppercase tracking-wide",
                        stepData.isCompleted || stepData.isCurrent
                          ? "text-charcoal font-medium"
                          : "text-gray-400"
                      )}
                    >
                      {t(`steps.${stepData.step}`)}
                    </span>

                    {/* Status badge */}
                    {stepData.isCurrent && !stepData.isError && (
                      <span className="rounded-sm border border-charcoal bg-duck-yellow px-2 py-0.5 font-mono text-xs uppercase">
                        {t("status.current")}
                      </span>
                    )}
                    {stepData.isError && (
                      <span className="rounded-sm border border-charcoal bg-coral px-2 py-0.5 font-mono text-xs uppercase text-white">
                        {t("status.error")}
                      </span>
                    )}
                    {stepData.isCompleted && !stepData.isCurrent && !stepData.isError && (
                      <span className="rounded-sm border border-gray-300 bg-gray-100 px-2 py-0.5 font-mono text-xs uppercase text-gray-500">
                        {t("status.completed")}
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  {stepData.date && (
                    <p className="mt-1 font-mono text-xs text-gray-secondary">
                      {formatDate(stepData.date)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

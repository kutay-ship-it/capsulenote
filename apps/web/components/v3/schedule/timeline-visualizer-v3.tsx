"use client"

import * as React from "react"
import { format, subHours } from "date-fns"
import { Lock, Mail, FileText, Printer, Truck, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

type DeliveryChannel = "email" | "mail"
type MailDeliveryMode = "send_on" | "arrive_by"

interface TimelineStep {
  id: string
  label: string
  date: Date
  icon: React.ReactNode
  color: "charcoal" | "duck-blue" | "teal-primary" | "duck-yellow"
  description?: string
  isCurrent?: boolean
}

interface TimelineVisualizerV3Props {
  deliveryDate: Date
  channel: DeliveryChannel
  mailDeliveryMode?: MailDeliveryMode
  mailSendDate?: Date
  transitDays?: number
  lockWindowHours?: number // Default 72 hours
}

const LOCK_WINDOW_HOURS = 72 // 3 days before delivery

export function TimelineVisualizerV3({
  deliveryDate,
  channel,
  mailDeliveryMode = "send_on",
  mailSendDate,
  transitDays = 5,
  lockWindowHours = LOCK_WINDOW_HOURS,
}: TimelineVisualizerV3Props) {
  const t = useTranslations("schedule.timeline")
  const lockDate = subHours(deliveryDate, lockWindowHours)

  // Build timeline steps based on channel
  const steps: TimelineStep[] = React.useMemo(() => {
    const now = new Date()
    const baseSteps: TimelineStep[] = [
      {
        id: "now",
        label: t("steps.now"),
        date: now,
        icon: <Clock className="h-4 w-4" strokeWidth={2} />,
        color: "charcoal",
        description: t("descriptions.scheduleYourLetter"),
        isCurrent: true,
      },
    ]

    if (channel === "email") {
      baseSteps.push(
        {
          id: "lock",
          label: t("steps.lock"),
          date: lockDate,
          icon: <Lock className="h-4 w-4" strokeWidth={2} />,
          color: "duck-yellow",
          description: t("descriptions.noMoreEdits"),
        },
        {
          id: "delivery",
          label: t("steps.delivery"),
          date: deliveryDate,
          icon: <Mail className="h-4 w-4" strokeWidth={2} />,
          color: "teal-primary",
          description: t("descriptions.emailArrives"),
        }
      )
    } else {
      // Physical mail has more steps
      const actualSendDate = mailDeliveryMode === "arrive_by" && mailSendDate ? mailSendDate : deliveryDate
      const printDate = subHours(actualSendDate, 48) // 2 days before send for printing
      const mailLockDate = subHours(actualSendDate, lockWindowHours)

      if (mailDeliveryMode === "arrive_by") {
        baseSteps.push(
          {
            id: "lock",
            label: t("steps.lock"),
            date: mailLockDate,
            icon: <Lock className="h-4 w-4" strokeWidth={2} />,
            color: "duck-yellow",
            description: t("descriptions.noMoreEdits"),
          },
          {
            id: "print",
            label: t("steps.print"),
            date: printDate,
            icon: <Printer className="h-4 w-4" strokeWidth={2} />,
            color: "duck-blue",
            description: t("descriptions.letterGoesToPrint"),
          },
          {
            id: "mail",
            label: t("steps.mail"),
            date: actualSendDate,
            icon: <FileText className="h-4 w-4" strokeWidth={2} />,
            color: "duck-blue",
            description: t("descriptions.entersPostalSystem"),
          },
          {
            id: "transit",
            label: t("steps.transit"),
            date: actualSendDate,
            icon: <Truck className="h-4 w-4" strokeWidth={2} />,
            color: "charcoal",
            description: t("descriptions.businessDays", { days: transitDays }),
          },
          {
            id: "delivery",
            label: t("steps.delivery"),
            date: deliveryDate,
            icon: <MapPin className="h-4 w-4" strokeWidth={2} />,
            color: "teal-primary",
            description: t("descriptions.arrivesAtDoor"),
          }
        )
      } else {
        // Send-on mode
        baseSteps.push(
          {
            id: "lock",
            label: t("steps.lock"),
            date: lockDate,
            icon: <Lock className="h-4 w-4" strokeWidth={2} />,
            color: "duck-yellow",
            description: t("descriptions.noMoreEdits"),
          },
          {
            id: "mail",
            label: t("steps.mail"),
            date: deliveryDate,
            icon: <FileText className="h-4 w-4" strokeWidth={2} />,
            color: "duck-blue",
            description: t("descriptions.letterShips"),
          },
          {
            id: "transit",
            label: t("steps.transit"),
            date: deliveryDate,
            icon: <Truck className="h-4 w-4" strokeWidth={2} />,
            color: "charcoal",
            description: t("descriptions.approximateDays", { days: transitDays }),
          }
        )
      }
    }

    return baseSteps
  }, [channel, deliveryDate, lockDate, mailDeliveryMode, mailSendDate, transitDays, lockWindowHours, t])

  const colorClasses = {
    charcoal: "bg-charcoal text-white border-charcoal",
    "duck-blue": "bg-duck-blue text-charcoal border-charcoal",
    "teal-primary": "bg-teal-primary text-white border-charcoal",
    "duck-yellow": "bg-duck-yellow text-charcoal border-charcoal",
  }

  const lineColorClasses = {
    charcoal: "bg-charcoal",
    "duck-blue": "bg-duck-blue",
    "teal-primary": "bg-teal-primary",
    "duck-yellow": "bg-duck-yellow",
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 bg-charcoal"
          style={{ borderRadius: "2px" }}
        />
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {t("title")}
        </p>
      </div>

      {/* Horizontal Timeline (Desktop) */}
      <div className="hidden sm:block">
        <div
          className="relative border-2 border-charcoal bg-off-white p-6"
          style={{ borderRadius: "2px" }}
        >
          {/* Timeline Track */}
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-charcoal/20" />

            {/* Steps */}
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center"
              >
                {/* Connecting Line (colored segment) */}
                {index > 0 && steps[index - 1] && (
                  <div
                    className={cn(
                      "absolute right-1/2 top-1/2 h-1 -translate-y-1/2",
                      lineColorClasses[steps[index - 1]!.color]
                    )}
                    style={{
                      width: `calc(100% + 2rem)`,
                      transform: "translateX(50%) translateY(-50%)",
                    }}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center border-2",
                    colorClasses[step.color],
                    step.isCurrent && "ring-4 ring-duck-yellow/50"
                  )}
                  style={{ borderRadius: "50%" }}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
                    {step.label}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/60">
                    {format(step.date, "MMM d")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline (Mobile) */}
      <div className="block sm:hidden">
        <div
          className="relative border-2 border-charcoal bg-off-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="relative space-y-0">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-charcoal/20" />

            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 pb-6 last:pb-0"
              >
                {/* Colored Line Segment */}
                {index > 0 && steps[index - 1] && (
                  <div
                    className={cn(
                      "absolute left-5 w-0.5",
                      lineColorClasses[steps[index - 1]!.color]
                    )}
                    style={{
                      top: "-24px",
                      height: "24px",
                    }}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center border-2",
                    colorClasses[step.color],
                    step.isCurrent && "ring-4 ring-duck-yellow/50"
                  )}
                  style={{ borderRadius: "50%" }}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                      {step.label}
                    </p>
                    <p className="font-mono text-[10px] text-charcoal/60">
                      {format(step.date, "MMM d, yyyy")}
                    </p>
                  </div>
                  {step.description && (
                    <p className="mt-0.5 font-mono text-[10px] text-charcoal/50">
                      {step.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lock Warning */}
      <div
        className="flex items-start gap-3 border-2 border-dashed border-charcoal/30 bg-duck-cream p-3"
        style={{ borderRadius: "2px" }}
      >
        <Lock className="h-4 w-4 text-charcoal/50 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
          <span className="font-bold text-charcoal">{t("lockWarning.title")}</span> {t("lockWarning.description")}
        </p>
      </div>
    </div>
  )
}

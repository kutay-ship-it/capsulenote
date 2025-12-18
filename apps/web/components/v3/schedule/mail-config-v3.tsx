"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { Calendar, Truck, AlertTriangle, Info, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { AddressSelectorV3 } from "@/components/v3/address-selector-v3"
import type { ShippingAddress } from "@/server/actions/addresses"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getTransitEstimate,
  isInternationalDestination,
  type MailType,
} from "@/server/lib/mail-delivery-calculator"

export type MailDeliveryMode = "send_on" | "arrive_by"

export interface PrintOptions {
  color: boolean
  doubleSided: boolean
}

interface MailConfigV3Props {
  deliveryDate: Date
  deliveryMode: MailDeliveryMode
  onDeliveryModeChange: (mode: MailDeliveryMode) => void
  selectedAddressId: string | null
  onAddressChange: (addressId: string | null, address?: ShippingAddress) => void
  selectedAddress?: ShippingAddress | null
  printOptions: PrintOptions
  onPrintOptionsChange: (options: PrintOptions) => void
  transitDays?: number
  disabled?: boolean
}

// Calculate estimated send date for arrive-by mode using the calculator
function calculateSendDate(
  targetArrivalDate: Date,
  mailType: MailType,
  countryCode?: string
): { sendDate: Date; estimate: ReturnType<typeof getTransitEstimate> } {
  const estimate = getTransitEstimate(mailType, countryCode)
  const sendDate = subDays(targetArrivalDate, estimate.totalLeadDays)
  return { sendDate, estimate }
}

export function MailConfigV3({
  deliveryDate,
  deliveryMode,
  onDeliveryModeChange,
  selectedAddressId,
  onAddressChange,
  selectedAddress,
  printOptions: _printOptions,
  onPrintOptionsChange: _onPrintOptionsChange,
  transitDays: _transitDays, // Deprecated, now calculated from country
  disabled = false,
}: MailConfigV3Props) {
  const t = useTranslations("schedule.mailConfig")

  // Get country from selected address for transit calculation
  const countryCode = selectedAddress?.country ?? "US"
  const isInternational = isInternationalDestination(countryCode)

  // Calculate send date and get transit estimate based on destination
  const { sendDate: estimatedSendDate, estimate } = calculateSendDate(
    deliveryDate,
    "usps_first_class", // International only supports First Class anyway
    countryCode
  )
  const isArriveByTooSoon = estimatedSendDate < new Date()

  const handleDeliveryModeChange = (mode: MailDeliveryMode) => {
    if (disabled) return
    onDeliveryModeChange(mode)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
          {t("title")}
        </h3>
        <p className="mt-1 font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
          {t("subtitle")}
        </p>
      </div>

      {/* Delivery Mode Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
            {t("deliveryMode")}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-charcoal/40 hover:text-charcoal transition-colors"
                >
                  <Info className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-xs border-2 border-charcoal bg-white p-3 font-mono"
                style={{
                  borderRadius: "2px",
                  boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                }}
              >
                <p className="text-xs text-charcoal">
                  <span className="font-bold">{t("sendOn")}</span> {t("sendOnDescription")}
                </p>
                <p className="mt-2 text-xs text-charcoal">
                  <span className="font-bold">{t("arriveBy")}</span> {t("arriveByDescription")}
                </p>
                {isInternational && (
                  <p className="mt-2 text-xs text-coral">
                    {t("internationalNote")}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Send On Mode */}
          <button
            type="button"
            onClick={() => handleDeliveryModeChange("send_on")}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center gap-2 border-2 border-charcoal p-4 font-mono transition-all duration-150",
              "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              deliveryMode === "send_on"
                ? "bg-duck-blue text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center border-2 border-charcoal",
                deliveryMode === "send_on" ? "bg-charcoal" : "bg-white"
              )}
              style={{ borderRadius: "50%" }}
            >
              {deliveryMode === "send_on" && (
                <div className="h-2 w-2 bg-white" style={{ borderRadius: "50%" }} />
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{t("sendOnDate")}</span>
            <span className="text-[10px] text-charcoal/60 text-center">
              {t("sendOnDateDescription")}
            </span>
          </button>

          {/* Arrive By Mode */}
          <button
            type="button"
            onClick={() => handleDeliveryModeChange("arrive_by")}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center gap-2 border-2 border-charcoal p-4 font-mono transition-all duration-150",
              "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              deliveryMode === "arrive_by"
                ? "bg-teal-primary text-white shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-teal-primary/20",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center border-2",
                deliveryMode === "arrive_by"
                  ? "border-white bg-white"
                  : "border-charcoal bg-white"
              )}
              style={{ borderRadius: "50%" }}
            >
              {deliveryMode === "arrive_by" && (
                <div className="h-2 w-2 bg-teal-primary" style={{ borderRadius: "50%" }} />
              )}
            </div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider",
              deliveryMode === "arrive_by" && "text-white"
            )}>
              {t("arriveByDate")}
            </span>
            <span className={cn(
              "text-[10px] text-center",
              deliveryMode === "arrive_by" ? "text-white/70" : "text-charcoal/60"
            )}>
              {t("arriveByDateDescription")}
            </span>
          </button>
        </div>

        {/* Arrive By Calculation Info */}
        <AnimatePresence>
          {deliveryMode === "arrive_by" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "flex items-start gap-3 p-3 border-2",
                  isArriveByTooSoon
                    ? "border-coral bg-coral/10"
                    : "border-teal-primary/30 bg-teal-primary/10"
                )}
                style={{ borderRadius: "2px" }}
              >
                {isArriveByTooSoon ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <p className="font-mono text-[10px] font-bold text-coral uppercase tracking-wider">
                        {t("arrivalTooSoon")}
                      </p>
                      <p className="font-mono text-[10px] text-charcoal/70 mt-1">
                        {t("leadTimeRequired", { days: estimate.totalLeadDays })}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center border-2",
                        isInternational
                          ? "border-duck-yellow/50 bg-duck-yellow/20"
                          : "border-teal-primary/50 bg-teal-primary/20"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      {isInternational ? (
                        <Globe className="h-4 w-4 text-duck-yellow" strokeWidth={2} />
                      ) : (
                        <Calendar className="h-4 w-4 text-teal-primary" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold text-charcoal uppercase tracking-wider">
                        {isInternational ? t("internationalMailDate") : t("estimatedMailDate")}
                      </p>
                      <p className={cn(
                        "font-mono text-xs font-bold mt-0.5",
                        isInternational ? "text-duck-yellow" : "text-teal-primary"
                      )}>
                        {format(estimatedSendDate, "MMMM d, yyyy")}
                      </p>
                      <p className="font-mono text-[10px] text-charcoal/60 mt-0.5">
                        ~{estimate.transitDays} days transit + {estimate.earlyArrivalDays} days early arrival buffer
                      </p>
                      {isInternational && (
                        <p className="font-mono text-[10px] text-duck-yellow mt-1">
                          ⚠️ {t("internationalTracking")}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shipping Address */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {t("shippingAddress")} <span className="text-coral">*</span>
        </p>
        <AddressSelectorV3
          value={selectedAddressId}
          onChange={onAddressChange}
          disabled={disabled}
        />
      </div>

      {/* Transit Time Info */}
      <div
        className={cn(
          "flex items-center gap-2 border-2 border-dashed p-2",
          isInternational ? "border-duck-yellow/30 bg-duck-yellow/5" : "border-charcoal/20 bg-off-white"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isInternational ? (
          <Globe className="h-4 w-4 text-duck-yellow/70" strokeWidth={2} />
        ) : (
          <Truck className="h-4 w-4 text-charcoal/40" strokeWidth={2} />
        )}
        <p className="font-mono text-[10px] text-charcoal/50">
          {isInternational ? (
            <>{t("internationalTransit", { days: estimate.transitDays })}</>
          ) : (
            <>{t("domesticTransit", { days: estimate.transitDays })}</>
          )}
        </p>
      </div>
    </div>
  )
}

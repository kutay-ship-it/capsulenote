"use client"

import * as React from "react"
import { Mail, FileText, Check, Sparkles, Lock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

export type DeliveryChannel = "email" | "mail"

interface ChannelSelectorV3Props {
  value: DeliveryChannel[]
  onChange: (channels: DeliveryChannel[]) => void
  emailCredits: number
  physicalCredits: number
  isPhysicalLocked?: boolean
  canShowTrialOffer?: boolean
  onPhysicalUpsellTriggered?: () => void
  disabled?: boolean
}

interface ChannelCardProps {
  channel: DeliveryChannel
  isSelected: boolean
  onToggle: () => void
  credits: number
  isLocked?: boolean
  canShowTrial?: boolean
  disabled?: boolean
  title: string
  description: string
  creditLabel: string
  icon: React.ReactNode
}

function ChannelCard({
  channel,
  isSelected,
  onToggle,
  credits,
  isLocked = false,
  canShowTrial = false,
  disabled = false,
  title,
  description,
  creditLabel,
  icon,
}: ChannelCardProps) {
  const t = useTranslations("schedule.channelSelector")
  const isEmail = channel === "email"
  const isExhausted = credits <= 0 && !isLocked && !canShowTrial

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative flex flex-col border-2 border-charcoal p-5 font-mono transition-all duration-150",
        "hover:-translate-y-1 hover:shadow-[6px_6px_0_theme(colors.charcoal)]",
        isSelected
          ? isEmail
            ? "bg-duck-blue text-charcoal shadow-[6px_6px_0_theme(colors.charcoal)] -translate-y-1"
            : "bg-teal-primary text-white shadow-[6px_6px_0_theme(colors.charcoal)] -translate-y-1"
          : isLocked || canShowTrial
            ? "bg-charcoal/5 text-charcoal/60 shadow-[3px_3px_0_theme(colors.charcoal/30)] border-charcoal/40 hover:bg-charcoal/10"
            : "bg-white text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] hover:bg-duck-blue/10",
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[3px_3px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Selected Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          >
            <Check className="h-4 w-4 text-charcoal" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked Badge */}
      {isLocked && !isSelected && (
        <div
          className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center border-2 border-charcoal bg-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <Lock className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Trial Badge */}
      {canShowTrial && !isSelected && !isLocked && (
        <div
          className="absolute -top-3 -right-3 flex items-center gap-1 px-2 py-1 border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Sparkles className="h-3 w-3 text-charcoal" strokeWidth={3} />
          <span className="text-[9px] font-bold text-charcoal">TRY</span>
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center border-2 transition-colors",
          isSelected
            ? isEmail
              ? "border-charcoal bg-white"
              : "border-white bg-white/20"
            : isLocked || canShowTrial
              ? "border-charcoal/30 bg-charcoal/10"
              : "border-charcoal bg-duck-blue/20"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isLocked ? (
          <Lock className="h-7 w-7" strokeWidth={2} />
        ) : (
          icon
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "text-base font-bold uppercase tracking-wider mb-1",
        isSelected && !isEmail && "text-white"
      )}>
        {isLocked ? t("locked") : title}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-xs leading-relaxed mb-4",
        isSelected
          ? isEmail
            ? "text-charcoal/70"
            : "text-white/80"
          : "text-charcoal/60"
      )}>
        {description}
      </p>

      {/* Credit Cost / Status */}
      <div
        className={cn(
          "mt-auto flex items-center justify-center gap-1.5 px-3 py-2 border-2",
          isLocked
            ? "border-charcoal/30 bg-charcoal/10 text-charcoal/60"
            : canShowTrial
              ? "border-duck-yellow bg-duck-yellow/20 text-charcoal"
              : isExhausted
                ? isSelected
                  ? "border-white/50 bg-white/10 text-white"
                  : "border-coral bg-coral/10 text-coral"
                : isSelected
                  ? isEmail
                    ? "border-charcoal/30 bg-white/50 text-charcoal"
                    : "border-white/30 bg-white/10 text-white"
                  : "border-charcoal/20 bg-white/50 text-charcoal/70"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isLocked ? (
          <span className="text-[10px] font-bold uppercase">{t("upgradeRequired")}</span>
        ) : canShowTrial ? (
          <span className="text-[10px] font-bold uppercase">{t("tryFor")}</span>
        ) : (
          <>
            {isExhausted && (
              <AlertTriangle className="h-3 w-3" strokeWidth={2} />
            )}
            <span className="text-sm font-bold tabular-nums">{credits}</span>
            <span className="text-[10px] uppercase">{creditLabel}</span>
          </>
        )}
      </div>
    </button>
  )
}

export function ChannelSelectorV3({
  value,
  onChange,
  emailCredits,
  physicalCredits,
  isPhysicalLocked = false,
  canShowTrialOffer = false,
  onPhysicalUpsellTriggered,
  disabled = false,
}: ChannelSelectorV3Props) {
  const t = useTranslations("schedule.channelSelector")
  const isEmailSelected = value.includes("email")
  const isMailSelected = value.includes("mail")
  const isBothSelected = isEmailSelected && isMailSelected

  const handleEmailToggle = () => {
    if (disabled) return
    if (isEmailSelected) {
      // Don't allow deselecting if it's the only one selected
      if (value.length === 1) return
      onChange(value.filter((c) => c !== "email"))
    } else {
      onChange([...value, "email"])
    }
  }

  const handleMailToggle = () => {
    if (disabled) return
    // If locked or can show trial, trigger upsell
    if (isPhysicalLocked || canShowTrialOffer) {
      onPhysicalUpsellTriggered?.()
      return
    }
    if (isMailSelected) {
      // Don't allow deselecting if it's the only one selected
      if (value.length === 1) return
      onChange(value.filter((c) => c !== "mail"))
    } else {
      onChange([...value, "mail"])
    }
  }

  const handleSendBothToggle = () => {
    if (disabled) return
    if (isPhysicalLocked || canShowTrialOffer) {
      onPhysicalUpsellTriggered?.()
      return
    }
    if (isBothSelected) {
      // Default to email only
      onChange(["email"])
    } else {
      onChange(["email", "mail"])
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h3 className="font-mono text-lg font-bold uppercase tracking-wider text-charcoal">
          {t("title")}
        </h3>
        <p className="mt-1 font-mono text-xs text-charcoal/60 uppercase tracking-wider">
          {t("subtitle")}
        </p>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChannelCard
          channel="email"
          isSelected={isEmailSelected}
          onToggle={handleEmailToggle}
          credits={emailCredits}
          disabled={disabled}
          title={t("email.label")}
          description={t("email.description")}
          creditLabel={t("credits")}
          icon={<Mail className="h-7 w-7" strokeWidth={2} />}
        />
        <ChannelCard
          channel="mail"
          isSelected={isMailSelected}
          onToggle={handleMailToggle}
          credits={physicalCredits}
          isLocked={isPhysicalLocked}
          canShowTrial={canShowTrialOffer}
          disabled={disabled}
          title={t("physical.label")}
          description={t("physical.description")}
          creditLabel={t("credits")}
          icon={<FileText className="h-7 w-7" strokeWidth={2} />}
        />
      </div>

      {/* Send Both Option */}
      <button
        type="button"
        onClick={handleSendBothToggle}
        disabled={disabled || isPhysicalLocked}
        className={cn(
          "flex w-full items-center justify-center gap-3 border-2 border-charcoal p-4 font-mono transition-all duration-150",
          "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
          isBothSelected
            ? "bg-duck-yellow text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
            : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-yellow/20",
          (disabled || isPhysicalLocked) && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
        )}
        style={{ borderRadius: "2px" }}
      >
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center border-2 border-charcoal transition-colors",
            isBothSelected ? "bg-charcoal" : "bg-white"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isBothSelected && (
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          )}
        </div>
        <span className="text-sm font-bold uppercase tracking-wider">
          {t("sendBoth")}
        </span>
        <span className="text-xs text-charcoal/60">
          {t("creditsTotal", { count: emailCredits > 0 && physicalCredits > 0 ? emailCredits + physicalCredits : "?" })}
        </span>
      </button>

      {/* Double Delivery Explanation */}
      <AnimatePresence>
        {isBothSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-start gap-3 border-2 border-duck-yellow bg-duck-yellow/20 p-4"
              style={{ borderRadius: "2px" }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                style={{ borderRadius: "2px" }}
              >
                <Sparkles className="h-4 w-4 text-charcoal" strokeWidth={2} />
              </div>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  {t("doubleDelivery.title")}
                </p>
                <p className="mt-1 font-mono text-[11px] text-charcoal/70 leading-relaxed">
                  {t("doubleDelivery.description")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

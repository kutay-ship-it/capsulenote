"use client"

import * as React from "react"
import { User, Users, Mail, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type RecipientType = "myself" | "someone-else"

interface EmailConfigV3Props {
  recipientType: RecipientType
  onRecipientTypeChange: (type: RecipientType) => void
  recipientEmail: string
  onRecipientEmailChange: (email: string) => void
  recipientName?: string
  onRecipientNameChange?: (name: string) => void
  userEmail: string
  subject?: string
  onSubjectChange?: (subject: string) => void
  disabled?: boolean
}

export function EmailConfigV3({
  recipientType,
  onRecipientTypeChange,
  recipientEmail,
  onRecipientEmailChange,
  recipientName = "",
  onRecipientNameChange,
  userEmail,
  subject = "",
  onSubjectChange,
  disabled = false,
}: EmailConfigV3Props) {
  const handleRecipientTypeChange = (type: RecipientType) => {
    if (disabled) return
    onRecipientTypeChange(type)
    // Reset email to user's email when switching to "myself"
    if (type === "myself") {
      onRecipientEmailChange(userEmail)
    } else {
      onRecipientEmailChange("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
          Email Delivery Settings
        </h3>
        <p className="mt-1 font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
          Configure your email delivery
        </p>
      </div>

      {/* Recipient Type Selection */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          Recipient
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Send to Myself */}
          <button
            type="button"
            onClick={() => handleRecipientTypeChange("myself")}
            disabled={disabled}
            className={cn(
              "relative flex items-center gap-3 border-2 border-charcoal p-4 font-mono transition-all duration-150",
              "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              recipientType === "myself"
                ? "bg-duck-blue text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                recipientType === "myself" ? "bg-white" : "bg-duck-yellow/30"
              )}
              style={{ borderRadius: "2px" }}
            >
              <User className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-bold uppercase tracking-wider">
                Send to Myself
              </p>
              <p className="text-[10px] text-charcoal/60 truncate">
                {userEmail}
              </p>
            </div>
          </button>

          {/* Send to Someone Else */}
          <button
            type="button"
            onClick={() => handleRecipientTypeChange("someone-else")}
            disabled={disabled}
            className={cn(
              "relative flex items-center gap-3 border-2 border-charcoal p-4 font-mono transition-all duration-150",
              "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              recipientType === "someone-else"
                ? "bg-teal-primary text-white shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-teal-primary/20",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center border-2",
                recipientType === "someone-else"
                  ? "border-white bg-white/20"
                  : "border-charcoal bg-teal-primary/20"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Users
                className={cn(
                  "h-5 w-5",
                  recipientType === "someone-else" ? "text-white" : "text-charcoal"
                )}
                strokeWidth={2}
              />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "text-xs font-bold uppercase tracking-wider",
                recipientType === "someone-else" && "text-white"
              )}>
                Someone Else
              </p>
              <p className={cn(
                "text-[10px]",
                recipientType === "someone-else" ? "text-white/70" : "text-charcoal/60"
              )}>
                Enter their email
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Someone Else Form Fields */}
      <AnimatePresence>
        {recipientType === "someone-else" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              {/* Recipient Name (Optional) */}
              {onRecipientNameChange && (
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                    Recipient Name (optional)
                  </label>
                  <div
                    className={cn(
                      "flex items-center gap-3 border-2 border-charcoal bg-white p-3 transition-all duration-150",
                      "focus-within:shadow-[4px_4px_0_theme(colors.charcoal)] focus-within:-translate-y-0.5 focus-within:border-duck-blue",
                      "shadow-[2px_2px_0_theme(colors.charcoal)]",
                      disabled && "opacity-50"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-teal-primary/20"
                      style={{ borderRadius: "2px" }}
                    >
                      <User className="h-4 w-4 text-charcoal" strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => onRecipientNameChange(e.target.value)}
                      placeholder="Their name..."
                      disabled={disabled}
                      className="flex-1 bg-transparent font-mono text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Recipient Email (Required) */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Recipient Email <span className="text-coral">*</span>
                </label>
                <div
                  className={cn(
                    "flex items-center gap-3 border-2 border-charcoal bg-white p-3 transition-all duration-150",
                    "focus-within:shadow-[4px_4px_0_theme(colors.charcoal)] focus-within:-translate-y-0.5 focus-within:border-duck-blue",
                    "shadow-[2px_2px_0_theme(colors.charcoal)]",
                    disabled && "opacity-50"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-teal-primary/20"
                    style={{ borderRadius: "2px" }}
                  >
                    <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => onRecipientEmailChange(e.target.value)}
                    placeholder="their@email.com"
                    disabled={disabled}
                    required
                    className="flex-1 bg-transparent font-mono text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Line (Optional) */}
      {onSubjectChange && (
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
            Subject Line (optional)
          </label>
          <div
            className={cn(
              "flex items-center gap-3 border-2 border-charcoal bg-white p-3 transition-all duration-150",
              "focus-within:shadow-[4px_4px_0_theme(colors.charcoal)] focus-within:-translate-y-0.5 focus-within:border-duck-blue",
              "shadow-[2px_2px_0_theme(colors.charcoal)]",
              disabled && "opacity-50"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-cream"
              style={{ borderRadius: "2px" }}
            >
              <FileText className="h-4 w-4 text-charcoal" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="A Letter from Your Past Self"
              disabled={disabled}
              className="flex-1 bg-transparent font-mono text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
          <p className="font-mono text-[9px] text-charcoal/40">
            Default: &ldquo;A Letter from Your Past Self&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

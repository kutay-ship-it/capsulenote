"use client"

import * as React from "react"
import {
  Mail,
  Calendar,
  Clock,
  AtSign,
  User,
  Users,
  PenLine,
  Settings,
  Stamp,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useAuth } from "@clerk/nextjs"

import { cn, getUserTimezone } from "@/lib/utils"
import { getIntlLocale } from "@/lib/date-formatting"
import { saveAnonymousDraft, getAnonymousDraft, getLetterAutosave } from "@/lib/localStorage-letter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LetterEditor } from "@/components/letter-editor"
import { DatePicker } from "@/components/ui/date-picker"
import { useRouter } from "@/i18n/routing"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Form validation error types
interface DemoFormErrors {
  recipientEmail?: string
  deliveryDate?: string
  bodyHtml?: string
}

interface DatePreset {
  label: string
  key: string
}

// Hardcoded months values - translations only provide label/key, not numeric values
const MONTHS_BY_KEY: Record<string, number> = {
  "6mo": 6,
  "1yr": 12,
  "3yr": 36,
  "5yr": 60,
  "10yr": 120,
}

export function LetterDemo() {
  const t = useTranslations("marketing.letterDemo")
  const locale = useLocale()
  const { isSignedIn, isLoaded } = useAuth()
  const isAuthenticated = isLoaded && isSignedIn
  const intlLocale = getIntlLocale(locale)
  const datePresets = t.raw("datePresets") as DatePreset[]
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = React.useState(false)

  // Simple IntersectionObserver instead of framer-motion useInView
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-100px", threshold: 0 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  // Form state - simplified (recipient is always "myself" for demo)
  const [title, setTitle] = React.useState("")
  const [bodyRich, setBodyRich] = React.useState<Record<string, unknown> | null>(null)
  const [bodyHtml, setBodyHtml] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [showCustomDate, setShowCustomDate] = React.useState(false)

  // Seal animation state
  const [sealStage, setSealStage] = React.useState<"idle" | "sealing" | "sealed">("idle")
  const isSealing = sealStage !== "idle"

  // Validation errors state
  const [errors, setErrors] = React.useState<DemoFormErrors>({})

  // Helper to safely parse a date string and return undefined if invalid
  const parseDateSafe = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    // Check if the date is valid (Invalid Date returns NaN for getTime())
    if (isNaN(date.getTime())) return undefined
    return date
  }

  // Restore draft from localStorage on mount
  React.useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      // For signed-in users, check capsule-letter-autosave
      const autosave = getLetterAutosave()
      if (autosave) {
        setTitle(autosave.title || "")
        setBodyHtml(autosave.bodyHtml || "")
        setBodyRich(autosave.bodyRich as Record<string, unknown> | null)
        setRecipientEmail(autosave.recipientEmail || "")
        const parsedDate = parseDateSafe(autosave.deliveryDate)
        if (parsedDate) {
          setDeliveryDate(parsedDate)
        }
        if (autosave.selectedPreset) {
          setSelectedPreset(autosave.selectedPreset)
        }
      }
    } else {
      // For anonymous users, check anonymous draft
      const draft = getAnonymousDraft()
      if (draft) {
        setTitle(draft.title || "")
        setBodyHtml(draft.body || "")
        setRecipientEmail(draft.recipientEmail || "")
        const parsedDate = parseDateSafe(draft.deliveryDate)
        if (parsedDate) {
          setDeliveryDate(parsedDate)
        }
        if (draft.selectedPreset) {
          setSelectedPreset(draft.selectedPreset)
        }
      }
    }
  }, [isLoaded, isSignedIn])

  // Word/char count
  const plainText = bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  // Check if form has content
  const hasContent = title.trim() !== "" || plainText !== ""

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: DemoFormErrors = {}
    const trimmedEmail = recipientEmail.trim()

    // Email validation (required)
    if (!trimmedEmail) {
      newErrors.recipientEmail = t("errors.emailRequired")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.recipientEmail = t("errors.emailInvalid")
    }

    // Delivery date validation (required)
    if (!deliveryDate) {
      newErrors.deliveryDate = t("errors.dateRequired")
    }

    // Message content validation (required)
    if (!plainText) {
      newErrors.bodyHtml = t("errors.messageRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Helper to safely convert date to ISO string, returns null if invalid
  const toISOStringSafe = (date: Date | undefined): string | null => {
    if (!date) return null
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  }

  const handlePresetDate = (months: number, key: string) => {
    // Validate months is a valid number
    if (typeof months !== "number" || isNaN(months)) {
      console.warn("Invalid months value:", months)
      return
    }
    const today = new Date()
    const futureDate = new Date(today.setMonth(today.getMonth() + months))
    // Validate the resulting date is valid
    if (isNaN(futureDate.getTime())) {
      console.warn("Created invalid date from months:", months)
      return
    }
    setDeliveryDate(futureDate)
    setSelectedPreset(key)
    setShowCustomDate(false)
    // Clear date error on selection
    if (errors.deliveryDate) {
      setErrors((prev) => ({ ...prev, deliveryDate: undefined }))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setSelectedPreset(null)
    // Clear date error on selection
    if (errors.deliveryDate && date) {
      setErrors((prev) => ({ ...prev, deliveryDate: undefined }))
    }
  }

  // Save draft to localStorage and redirect to subscribe/checkout flow
  // Uses 2-stage animation: "Sealing..." (600ms) → "Sealed!" (400ms) → Navigate
  const handleTryProduct = async () => {
    // Prevent double-clicks
    if (isSealing) return

    // Validate form before proceeding
    if (!validateForm()) {
      // Scroll to first error (optional UX improvement)
      const firstErrorField = document.querySelector('[aria-invalid="true"]')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    const trimmedEmail = recipientEmail.trim()
    const timezone = getUserTimezone()

    // Stage 1: "Sealing..." animation
    setSealStage("sealing")

    type NavigationDestination =
      | { pathname: "/letters/new" }
      | { pathname: "/subscribe"; query: Record<string, string> }

    // Perform localStorage operations during animation
    const destination = await new Promise<NavigationDestination>((resolve) => {
      setTimeout(() => {
        // For signed-in users, go directly to new letter page
        if (isAuthenticated) {
          // Save as authenticated user draft format
          if (hasContent) {
            const draftData = {
              title,
              bodyRich,
              bodyHtml,
              recipientType: "self",
              recipientName: "",
              recipientEmail: trimmedEmail,
              deliveryChannels: ["email"],
              deliveryDate: toISOStringSafe(deliveryDate),
              selectedPreset,
              selectedAddressId: null,
              printOptions: { color: false, doubleSided: true },
              lastSaved: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            }
            try {
              localStorage.setItem("capsule-letter-autosave", JSON.stringify(draftData))
            } catch {
              // Silently fail if localStorage is not available
            }
          }
          resolve({ pathname: "/letters/new" })
          return
        }

        // For anonymous users: save draft and redirect to subscribe (paywall)
        if (hasContent || trimmedEmail) {
          const saved = saveAnonymousDraft(
            title,
            bodyHtml,
            trimmedEmail,
            toISOStringSafe(deliveryDate) ?? undefined,
            "email",
            timezone,
            "self",
            "",
            selectedPreset
          )

          if (!saved) {
            console.warn("Draft could not be saved to localStorage")
          }
        }

        // Build subscribe URL with email locked in
        const query: Record<string, string> = {
          deliveryType: "email",
          timezone,
        }
        if (trimmedEmail) query.email = trimmedEmail

        resolve({ pathname: "/subscribe", query })
      }, 600) // Stage 1 duration
    })

    // Stage 2: "Sealed!" confirmation
    setSealStage("sealed")

    // Navigate after brief success display
    setTimeout(() => {
      router.push(destination)
    }, 400) // Stage 2 duration
  }

  return (
    <section ref={containerRef} id="try-demo" className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12 transition-all duration-500",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <span
            className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] mb-4 sm:mb-6"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            {t("badge")}
          </span>
          <h2 className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-charcoal">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl font-mono text-sm sm:text-base md:text-lg leading-relaxed text-charcoal/70">
            {t("description")}
          </p>
        </div>

        {/* Demo Editor */}
        <div
          className={cn(
            "mx-auto max-w-5xl transition-all duration-500 delay-200",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          {/* Grid Layout: Editor Left, Settings Right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
            {/* Left Column - Letter Editor */}
            <div
              className="relative border-2 border-charcoal bg-white p-4 sm:p-6 md:p-8 shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)] min-h-[350px] sm:min-h-[450px] md:min-h-[500px] flex flex-col"
              style={{ borderRadius: "2px" }}
            >
              {/* Floating badge */}
              <div
                className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
                style={{ borderRadius: "2px" }}
              >
                <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{t("letterBadge")}</span>
              </div>

              {/* Mail stamp */}
              <div
                className="absolute -top-4 -right-4 w-14 h-14 border-2 border-charcoal bg-duck-blue flex items-center justify-center rotate-12 transition-transform duration-300 hover:rotate-0"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-7 w-7 text-charcoal" strokeWidth={2} />
              </div>

              <div className="flex flex-col flex-1 mt-4">
                {/* Title Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="demo-title"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
                  >
                    {t("labels.letterTitle")}
                  </label>
                  <Input
                    id="demo-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("placeholders.title")}
                    className="border-2 border-charcoal font-mono"
                    style={{ borderRadius: "2px" }}
                    maxLength={100}
                  />
                </div>

                {/* Dashed separator */}
                <div className="w-full border-t-2 border-dashed border-charcoal/10 my-6" />

                {/* Content Field */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <label
                      className={cn(
                        "font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1",
                        errors.bodyHtml ? "text-coral" : "text-charcoal"
                      )}
                    >
                      {t("labels.yourMessage")}
                      <span className="text-coral">*</span>
                    </label>
                    <div className="flex gap-3 font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                      <span>{t("wordCount", { count: wordCount })}</span>
                      <span>{t("charCount", { count: characterCount })}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex-1 flex flex-col min-h-0",
                      errors.bodyHtml && "ring-2 ring-coral ring-offset-2"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <LetterEditor
                      content={bodyRich || bodyHtml}
                      onChange={(json, html) => {
                        setBodyRich(json)
                        setBodyHtml(html)
                        // Clear error when user starts typing
                        if (errors.bodyHtml) {
                          setErrors((prev) => ({ ...prev, bodyHtml: undefined }))
                        }
                      }}
                      placeholder={t("placeholders.message")}
                      className="flex-1 flex flex-col min-h-0"
                      minHeight="200px"
                    />
                  </div>
                  {errors.bodyHtml && (
                    <p className="font-mono text-[10px] text-coral flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.bodyHtml}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Settings Sidebar */}
            <div className="space-y-6">
              {/* Delivery Settings Card */}
              <div
                className="relative border-2 border-charcoal bg-white p-4 sm:p-6 shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                {/* Floating badge */}
                <div
                  className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-blue font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
                  style={{ borderRadius: "2px" }}
                >
                  <Settings className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{t("settingsBadge")}</span>
                </div>

                <div className="space-y-5 mt-4">
                  {/* Recipient Type Selection */}
                  <div className="space-y-3">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      {t("labels.recipient")}
                    </label>

                    {/* Recipient Type Buttons */}
                    <TooltipProvider>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                          style={{ borderRadius: "2px" }}
                        >
                          <User className="h-3.5 w-3.5" strokeWidth={2} />
                          {t("buttons.myself")}
                        </button>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled
                              className="flex items-center justify-center gap-2 border-2 border-charcoal/40 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider bg-white/50 text-charcoal/40 cursor-not-allowed"
                              style={{ borderRadius: "2px" }}
                            >
                              <Users className="h-3.5 w-3.5" strokeWidth={2} />
                              {t("buttons.someoneElse")}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[200px] border-2 border-charcoal bg-duck-cream font-mono text-xs text-charcoal"
                            style={{ borderRadius: "2px" }}
                          >
                            <p>{t("tooltip.someoneElseDisabled")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {/* Recipient Email */}
                    <div className="space-y-2 pt-1">
                      <label
                        htmlFor="demo-email"
                        className={cn(
                          "font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                          errors.recipientEmail ? "text-coral" : "text-charcoal/70"
                        )}
                      >
                        <AtSign className="h-3 w-3" strokeWidth={2} />
                        {t("labels.yourEmail")}
                        <span className="text-coral">*</span>
                      </label>
                      <Input
                        id="demo-email"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => {
                          setRecipientEmail(e.target.value)
                          // Clear error when user starts typing
                          if (errors.recipientEmail) {
                            setErrors((prev) => ({ ...prev, recipientEmail: undefined }))
                          }
                        }}
                        placeholder={t("placeholders.email")}
                        className={cn(
                          "border-2 font-mono text-sm",
                          errors.recipientEmail
                            ? "border-coral focus-visible:ring-coral"
                            : "border-charcoal"
                        )}
                        style={{ borderRadius: "2px" }}
                        aria-invalid={!!errors.recipientEmail}
                        aria-describedby={errors.recipientEmail ? "demo-email-error" : undefined}
                      />
                      {errors.recipientEmail && (
                        <p
                          id="demo-email-error"
                          className="font-mono text-[10px] text-coral flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors.recipientEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dashed separator */}
                  <div className="w-full border-t-2 border-dashed border-charcoal/10" />

                  {/* Delivery Date */}
                  <div className="space-y-3">
                    <label
                      className={cn(
                        "font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                        errors.deliveryDate ? "text-coral" : "text-charcoal"
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                      {t("labels.whenToDeliver")}
                      <span className="text-coral">*</span>
                    </label>

                    {/* Date Preset Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {datePresets.map((preset) => {
                        const isSelected = selectedPreset === preset.key
                        return (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => handlePresetDate(MONTHS_BY_KEY[preset.key] ?? 6, preset.key)}
                            className={cn(
                              "border-2 border-charcoal px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                              "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                              isSelected
                                ? "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                                : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-yellow"
                            )}
                            style={{ borderRadius: "2px" }}
                          >
                            {preset.label}
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomDate(!showCustomDate)
                          if (!showCustomDate) setSelectedPreset(null)
                        }}
                        className={cn(
                          "col-span-2 border-2 border-charcoal px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                          "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                          showCustomDate
                            ? "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                            : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue"
                        )}
                        style={{ borderRadius: "2px" }}
                      >
                        {t("labels.customDate")}
                      </button>
                    </div>

                    {/* Custom Date Picker */}
                    {showCustomDate && (
                      <div className="pt-2">
                        <DatePicker
                          date={deliveryDate}
                          onSelect={handleDateSelect}
                          placeholder={t("placeholders.pickDate")}
                          minDate={new Date()}
                        />
                      </div>
                    )}

                    {/* Selected Date Display */}
                    {deliveryDate && !isNaN(deliveryDate.getTime()) && (
                      <div
                        className="flex items-center gap-3 p-3 border-2 border-duck-blue bg-duck-blue/10"
                        style={{ borderRadius: "2px" }}
                      >
                        <Clock className="h-4 w-4 text-duck-blue flex-shrink-0" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
                            {t("labels.scheduledFor")}
                          </p>
                          <p className="font-mono text-xs text-charcoal truncate">
                            {deliveryDate.toLocaleDateString(intlLocale, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date Error */}
                    {errors.deliveryDate && (
                      <p className="font-mono text-[10px] text-coral flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div
                className="border-2 border-charcoal bg-duck-cream p-4 sm:p-6 shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <div className="space-y-4">
                  {/* CTA Button with 2-stage seal animation */}
                  <Button
                    type="button"
                    onClick={handleTryProduct}
                    disabled={isSealing}
                    className={cn(
                      "w-full gap-2 h-12 group transition-all duration-200",
                      sealStage === "sealed" && "bg-teal-primary border-teal-primary"
                    )}
                  >
                    {sealStage === "idle" && (
                      <>
                        <Stamp className="h-4 w-4" strokeWidth={2} />
                        {isAuthenticated ? t("buttons.continueWriting") : t("buttons.sealSchedule")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                    {sealStage === "sealing" && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        {t("buttons.sealing")}
                      </>
                    )}
                    {sealStage === "sealed" && (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                        {t("buttons.sealed")}
                      </>
                    )}
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

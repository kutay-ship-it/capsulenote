"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  Mail,
  Calendar,
  Send,
  Clock,
  AtSign,
  Trash2,
  Eye,
  PenLine,
  Settings,
  User,
  Users,
  Sparkles,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LetterEditor } from "@/components/letter-editor"
import { DatePicker } from "@/components/ui/date-picker"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { getUserTimezone } from "@/lib/utils"
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
import { TemplateSelectorV3 } from "@/components/v3/template-selector-v3"
import { DeliveryTypeV3, type DeliveryChannel } from "@/components/v3/delivery-type-v3"
import type { LetterTemplate } from "@/server/actions/templates"

type RecipientType = "myself" | "someone-else"

interface LetterFormData {
  title: string
  bodyRich: Record<string, unknown> | null
  bodyHtml: string
  recipientType: RecipientType
  recipientName: string
  recipientEmail: string
  deliveryDate: Date | undefined
}

const DATE_PRESETS = [
  { label: "6 Months", months: 6, key: "6mo" },
  { label: "1 Year", months: 12, key: "1yr" },
  { label: "3 Years", months: 36, key: "3yr" },
  { label: "5 Years", months: 60, key: "5yr" },
  { label: "10 Years", months: 120, key: "10yr" },
]

export function LetterEditorV3() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const timezone = getUserTimezone()

  // Form state
  const [title, setTitle] = React.useState("")
  const [bodyRich, setBodyRich] = React.useState<Record<string, unknown> | null>(null)
  const [bodyHtml, setBodyHtml] = React.useState("")
  const [recipientType, setRecipientType] = React.useState<RecipientType>("myself")
  const [recipientName, setRecipientName] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [deliveryChannels, setDeliveryChannels] = React.useState<DeliveryChannel[]>(["email"])
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [showCustomDate, setShowCustomDate] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof LetterFormData, string>>>({})

  // Word/char count
  const plainText = bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  const handlePresetDate = (months: number, key: string) => {
    const today = new Date()
    const futureDate = new Date(today.setMonth(today.getMonth() + months))
    setDeliveryDate(futureDate)
    setSelectedPreset(key)
    setShowCustomDate(false)
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setSelectedPreset(null)
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleRecipientTypeChange = (type: RecipientType) => {
    setRecipientType(type)
    // Clear recipient fields when switching
    if (type === "myself") {
      setRecipientName("")
    }
    setRecipientEmail("")
    setErrors({ ...errors, recipientName: undefined, recipientEmail: undefined })
  }

  const handleClearForm = () => {
    setTitle("")
    setBodyRich(null)
    setBodyHtml("")
    setRecipientType("myself")
    setRecipientName("")
    setRecipientEmail("")
    setDeliveryChannels(["email"])
    setDeliveryDate(undefined)
    setSelectedPreset(null)
    setShowCustomDate(false)
    setErrors({})
  }

  const handleTemplateSelect = (template: LetterTemplate) => {
    // Apply template content to the editor
    setBodyHtml(template.promptText)
    setBodyRich(null) // Clear rich content, editor will parse HTML
    // Set title if empty
    if (!title.trim()) {
      setTitle(template.title)
    }
    // Clear any content errors
    if (errors.bodyHtml) {
      setErrors({ ...errors, bodyHtml: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LetterFormData, string>> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!plainText) {
      newErrors.bodyHtml = "Letter content is required"
    }

    // Validate recipient name for "someone else"
    if (recipientType === "someone-else" && !recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required"
    }

    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = "Invalid email format"
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = "Delivery date is required"
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deliveryDate < today) {
        newErrors.deliveryDate = "Delivery date must be in the future"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !deliveryDate || isPending) return

    startTransition(async () => {
      try {
        const result = await createLetter({
          title,
          bodyRich: bodyRich ?? { type: "doc", content: [] },
          bodyHtml: bodyHtml || "",
          tags: [],
          visibility: "private" as const,
        })

        if (result.success) {
          const letterId = result.data.letterId
          const deliverAt = fromZonedTime(
            `${deliveryDate.toISOString().split("T")[0]}T09:00`,
            timezone
          )

          try {
            await scheduleDelivery({
              letterId,
              channel: "email",
              deliverAt,
              timezone,
              toEmail: recipientEmail,
            })

            toast.success("Letter scheduled!", {
              description: `Your letter will be delivered on ${deliveryDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}`,
            })
          } catch {
            toast.error("Letter saved but delivery not scheduled", {
              description: "You can schedule delivery from the letter page.",
            })
          }

          router.push(`/letters-v3/${letterId}`)
        } else {
          if (result.error.code === "QUOTA_EXCEEDED") {
            toast.error("Quota exceeded", {
              description: result.error.message,
              action: {
                label: "Upgrade",
                onClick: () => router.push("/pricing"),
              },
            })
          } else {
            toast.error("Failed to create letter", {
              description: result.error.message,
            })
          }
        }
      } catch (error) {
        console.error("Letter creation error:", error)
        toast.error("Something went wrong", {
          description: "Please try again later.",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Grid Layout: Editor Left, Settings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
        {/* Left Column - Letter Editor */}
        <div
          className="relative border-2 border-charcoal bg-white p-6 md:p-8 shadow-[2px_2px_0_theme(colors.charcoal)] h-fit"
          style={{ borderRadius: "2px" }}
        >
          {/* Floating badge */}
          <div
            className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
            <span>New Letter</span>
          </div>

          {/* Mail stamp */}
          <div
            className="absolute -top-4 -right-4 w-14 h-14 border-2 border-charcoal bg-duck-blue flex items-center justify-center rotate-12 transition-transform duration-300 hover:rotate-0"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-7 w-7 text-charcoal" strokeWidth={2} />
          </div>

          <div className="space-y-6 mt-4">
            {/* Title Field */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
              >
                Letter Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: undefined })
                }}
                placeholder="A letter to my future self..."
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
                maxLength={100}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="font-mono text-xs text-coral">{errors.title}</p>
              )}
            </div>

            {/* Dashed separator */}
            <div className="w-full border-t-2 border-dashed border-charcoal/10" />

            {/* Content Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  Your Message
                </label>
                <div className="flex gap-3 font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                  <span>{wordCount} words</span>
                  <span>{characterCount} chars</span>
                </div>
              </div>
              <LetterEditor
                content={bodyRich || bodyHtml}
                onChange={(json, html) => {
                  setBodyRich(json)
                  setBodyHtml(html)
                  if (errors.bodyHtml) setErrors({ ...errors, bodyHtml: undefined })
                }}
                placeholder="Dear future me..."
                minHeight="400px"
              />
              {errors.bodyHtml && (
                <p className="font-mono text-xs text-coral">{errors.bodyHtml}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings Sidebar */}
        <div className="space-y-6">
          {/* Delivery Settings Card */}
          <div
            className="relative border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            {/* Floating badge */}
            <div
              className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-blue font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Settings</span>
            </div>

            <div className="space-y-5 mt-4">
              {/* Recipient Type Selection */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <User className="h-3.5 w-3.5" strokeWidth={2} />
                  Recipient
                </label>

                {/* Recipient Type Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange("myself")}
                    className={cn(
                      "flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                      recipientType === "myself"
                        ? "bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                        : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-yellow"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    Myself
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange("someone-else")}
                    className={cn(
                      "flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                      recipientType === "someone-else"
                        ? "bg-teal-primary text-white shadow-[3px_3px_0_theme(colors.charcoal)]"
                        : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-teal-primary/20"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <Users className="h-3.5 w-3.5" strokeWidth={2} />
                    Someone Else
                  </button>
                </div>

                {/* Recipient Name - Only for "Someone Else" */}
                {recipientType === "someone-else" && (
                  <div className="space-y-2 pt-2">
                    <label
                      htmlFor="recipientName"
                      className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
                    >
                      Their Name
                    </label>
                    <Input
                      id="recipientName"
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value)
                        if (errors.recipientName) setErrors({ ...errors, recipientName: undefined })
                      }}
                      placeholder="John Doe"
                      className="border-2 border-charcoal font-mono text-sm"
                      style={{ borderRadius: "2px" }}
                      aria-invalid={!!errors.recipientName}
                    />
                    {errors.recipientName && (
                      <p className="font-mono text-xs text-coral">{errors.recipientName}</p>
                    )}
                  </div>
                )}

                {/* Recipient Email */}
                <div className="space-y-2 pt-1">
                  <label
                    htmlFor="email"
                    className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70 flex items-center gap-1.5"
                  >
                    <AtSign className="h-3 w-3" strokeWidth={2} />
                    {recipientType === "myself" ? "Your Email" : "Their Email"}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value)
                      if (errors.recipientEmail) setErrors({ ...errors, recipientEmail: undefined })
                    }}
                    placeholder={recipientType === "myself" ? "your@email.com" : "their@email.com"}
                    className="border-2 border-charcoal font-mono text-sm"
                    style={{ borderRadius: "2px" }}
                    aria-invalid={!!errors.recipientEmail}
                  />
                  {errors.recipientEmail && (
                    <p className="font-mono text-xs text-coral">{errors.recipientEmail}</p>
                  )}
                </div>
              </div>

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Delivery Method */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                  Delivery Method
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  How should we deliver your letter?
                </p>
                <DeliveryTypeV3
                  value={deliveryChannels}
                  onChange={setDeliveryChannels}
                />
              </div>

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Delivery Date */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  When to Deliver
                </label>

                {/* Date Preset Buttons - 2 column grid */}
                <div className="grid grid-cols-2 gap-2">
                  {DATE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.key
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handlePresetDate(preset.months, preset.key)}
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
                    Custom Date
                  </button>
                </div>

                {/* Custom Date Picker */}
                {showCustomDate && (
                  <div className="pt-2">
                    <DatePicker
                      date={deliveryDate}
                      onSelect={handleDateSelect}
                      placeholder="Pick a date"
                      minDate={new Date()}
                    />
                  </div>
                )}

                {/* Selected Date Display */}
                {deliveryDate && (
                  <div
                    className="flex items-center gap-3 p-3 border-2 border-duck-blue bg-duck-blue/10"
                    style={{ borderRadius: "2px" }}
                  >
                    <Clock className="h-4 w-4 text-duck-blue flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
                        Scheduled for
                      </p>
                      <p className="font-mono text-xs text-charcoal truncate">
                        {deliveryDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {errors.deliveryDate && (
                  <p className="font-mono text-xs text-coral">{errors.deliveryDate}</p>
                )}
              </div>

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Templates Section */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Templates
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  Need inspiration? Start with a prompt
                </p>
                <TemplateSelectorV3 onSelect={handleTemplateSelect} />
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div
            className="border-2 border-charcoal bg-duck-cream p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <div className="space-y-3">
              {/* Submit Button - Full width */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full gap-2 h-12"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
                {isPending ? "Scheduling..." : "Schedule Letter"}
              </Button>

              {/* Secondary actions row */}
              <div className="flex gap-2">
                {/* Preview Button */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={!bodyHtml}
                  className="flex-1 gap-2 h-10 border-2 border-charcoal bg-white hover:bg-off-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Eye className="h-4 w-4" strokeWidth={2} />
                  Preview
                </Button>

                {/* Clear Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-2 h-10 text-charcoal/60 hover:text-coral hover:bg-coral/5"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="border-2 border-charcoal bg-white font-mono"
                    style={{
                      borderRadius: "2px",
                      boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
                    }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
                        Clear Letter?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-sm text-charcoal/60">
                        This will clear all your progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel
                        className="border-2 border-charcoal bg-white hover:bg-off-white font-mono uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearForm}
                        className="border-2 border-charcoal bg-coral hover:bg-coral/90 text-white font-mono uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

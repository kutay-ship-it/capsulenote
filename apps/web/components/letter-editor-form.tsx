"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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

interface LetterEditorFormProps {
  onSubmit?: (data: LetterFormData) => void
  initialData?: Partial<LetterFormData>
  accentColor?: "yellow" | "blue" | "teal" | "lavender" | "peach" | "lime"
}

export interface LetterFormData {
  title: string
  body: string
  recipientEmail: string
  deliveryDate: string
}

export function LetterEditorForm({
  onSubmit,
  initialData,
  accentColor = "yellow",
}: LetterEditorFormProps) {
  const [title, setTitle] = React.useState(initialData?.title || "")
  const [body, setBody] = React.useState(initialData?.body || "")
  const [recipientEmail, setRecipientEmail] = React.useState(
    initialData?.recipientEmail || ""
  )
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(
    initialData?.deliveryDate ? new Date(initialData.deliveryDate) : undefined
  )
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [showCustomDate, setShowCustomDate] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof LetterFormData, string>>>({})

  const characterCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  const datePresets = [
    { label: "6 Months", months: 6 },
    { label: "1 Year", months: 12 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 },
    { label: "10 Years", months: 120 },
  ]

  const handlePresetDate = (months: number, label: string) => {
    const today = new Date()
    const futureDate = new Date(today.setMonth(today.getMonth() + months))
    setDeliveryDate(futureDate)
    setSelectedPreset(label)
    setShowCustomDate(false)
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setSelectedPreset(null) // Clear preset selection when custom date is picked
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleCustomDateClick = () => {
    setShowCustomDate(!showCustomDate)
    if (!showCustomDate) {
      setSelectedPreset(null) // Clear preset selection when opening custom picker
    }
  }

  const handleClearForm = () => {
    setTitle("")
    setBody("")
    setRecipientEmail("")
    setDeliveryDate(undefined)
    setSelectedPreset(null)
    setShowCustomDate(false)
    setErrors({})
  }

  const accentColors = {
    yellow: "bg-duck-yellow",
    blue: "bg-duck-blue",
    teal: "bg-teal-primary",
    lavender: "bg-lavender",
    peach: "bg-peach",
    lime: "bg-lime",
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LetterFormData, string>> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!body.trim()) {
      newErrors.body = "Letter content is required"
    }

    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = "Invalid email address"
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

    if (validateForm() && deliveryDate) {
      onSubmit?.({
        title,
        body,
        recipientEmail,
        deliveryDate: deliveryDate.toISOString().split("T")[0],
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {/* Letter Paper Container */}
      <div
        className="relative bg-white border-2 border-charcoal p-12 -translate-x-1 -translate-y-1"
        style={{
          borderRadius: "2px",
          boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
          backgroundImage: `linear-gradient(transparent 0px, transparent 31px, rgba(56, 56, 56, 0.05) 32px)`,
          backgroundSize: "100% 32px",
        }}
      >
        {/* Accent Bar */}
        <div
          className={cn("absolute top-0 left-0 right-0 h-2", accentColors[accentColor])}
          style={{ borderRadius: "2px 2px 0 0" }}
        />

        {/* Duck Stamp */}
        <div
          className="absolute -top-3 -right-3 w-12 h-12 border-2 border-charcoal bg-duck-blue flex items-center justify-center rotate-12 transition-transform duration-300 hover:rotate-0"
          style={{ borderRadius: "2px" }}
        >
          <span className="text-xl">🦆</span>
        </div>

        <FieldGroup>
          {/* Letter Title */}
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="letter-title">Letter Title</FieldLabel>
            <Input
              id="letter-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: undefined })
              }}
              placeholder="My Letter to Future Me..."
              aria-invalid={!!errors.title}
              maxLength={100}
            />
            <FieldDescription>
              Give your letter a memorable title (max 100 characters)
            </FieldDescription>
            {errors.title && <FieldError>{errors.title}</FieldError>}
          </Field>

          {/* Letter Content */}
          <Field data-invalid={!!errors.body}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="letter-body">Letter Content</FieldLabel>
              <div className="flex gap-4 font-mono text-xs text-gray-secondary uppercase">
                <span>{wordCount} words</span>
                <span>{characterCount} characters</span>
              </div>
            </div>
            <Textarea
              id="letter-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                if (errors.body) setErrors({ ...errors, body: undefined })
              }}
              placeholder="Dear Future Me,&#10;&#10;I'm writing this letter to remind you of..."
              aria-invalid={!!errors.body}
              className="min-h-[400px]"
            />
            <FieldDescription>
              Write your letter to your future self. Be honest, be kind, be you.
            </FieldDescription>
            {errors.body && <FieldError>{errors.body}</FieldError>}
          </Field>

          {/* Delivery Settings */}
          <FieldSet>
            <FieldLegend variant="label">Delivery Settings</FieldLegend>
            <FieldGroup>
              {/* Recipient Email */}
              <Field data-invalid={!!errors.recipientEmail}>
                <FieldLabel htmlFor="recipient-email">Your Email Address</FieldLabel>
                <Input
                  id="recipient-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value)
                    if (errors.recipientEmail)
                      setErrors({ ...errors, recipientEmail: undefined })
                  }}
                  placeholder="future-me@example.com"
                  aria-invalid={!!errors.recipientEmail}
                />
                <FieldDescription>
                  Where should we send your letter when it's time?
                </FieldDescription>
                {errors.recipientEmail && (
                  <FieldError>{errors.recipientEmail}</FieldError>
                )}
              </Field>

              {/* Delivery Date */}
              <Field data-invalid={!!errors.deliveryDate}>
                <FieldLabel>Delivery Date</FieldLabel>
                <FieldDescription className="mb-4">
                  Choose when your future self should receive this letter
                </FieldDescription>

                {/* Date Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {datePresets.map((preset) => {
                    const isSelected = selectedPreset === preset.label
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetDate(preset.months, preset.label)}
                        className={cn(
                          "border-2 border-charcoal px-4 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0",
                          isSelected
                            ? "bg-duck-blue text-charcoal font-normal"
                            : "bg-white text-charcoal hover:bg-duck-yellow"
                        )}
                        style={{
                          borderRadius: "2px",
                          boxShadow: isSelected
                            ? "-6px 6px 0px 0px rgb(56, 56, 56)"
                            : "-4px 4px 0px 0px rgb(56, 56, 56)",
                        }}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={handleCustomDateClick}
                    className={cn(
                      "border-2 border-charcoal px-4 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0",
                      showCustomDate
                        ? "bg-duck-blue text-charcoal font-normal"
                        : "bg-white text-charcoal hover:bg-duck-blue"
                    )}
                    style={{
                      borderRadius: "2px",
                      boxShadow: showCustomDate
                        ? "-6px 6px 0px 0px rgb(56, 56, 56)"
                        : "-4px 4px 0px 0px rgb(56, 56, 56)",
                    }}
                  >
                    Custom Date
                  </button>
                </div>

                {/* Custom Date Picker (conditionally shown) */}
                {showCustomDate && (
                  <div className="mt-4">
                    <DatePicker
                      date={deliveryDate}
                      onSelect={handleDateSelect}
                      placeholder="Choose a custom date"
                      minDate={new Date()}
                    />
                  </div>
                )}

                {/* Selected Date Display */}
                {deliveryDate && (
                  <div className="mt-4 p-4 bg-bg-blue-pale border-2 border-duck-blue" style={{ borderRadius: "2px" }}>
                    <p className="font-mono text-sm text-charcoal">
                      <span className="uppercase text-duck-blue font-normal">Scheduled for:</span>{" "}
                      {deliveryDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {errors.deliveryDate && (
                  <FieldError className="mt-2">{errors.deliveryDate}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <Button type="submit" className="flex-1">
            Schedule Letter 🦆
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="border-2 border-charcoal bg-white font-mono"
              style={{
                borderRadius: "2px",
                boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="font-mono text-2xl uppercase tracking-wide text-charcoal">
                  Clear Form?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-mono text-sm text-gray-secondary">
                  This will delete all your progress on this letter. This action cannot be undone.
                  Are you sure you want to clear everything?
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
                  style={{
                    borderRadius: "2px",
                    boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                  }}
                >
                  Clear Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </form>
  )
}

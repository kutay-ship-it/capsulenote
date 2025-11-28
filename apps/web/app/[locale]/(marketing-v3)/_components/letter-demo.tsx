"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { motion, useInView } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LetterEditor } from "@/components/letter-editor"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type RecipientType = "myself"

const DATE_PRESETS = [
  { label: "6 Months", months: 6, key: "6mo" },
  { label: "1 Year", months: 12, key: "1yr" },
  { label: "3 Years", months: 36, key: "3yr" },
  { label: "5 Years", months: 60, key: "5yr" },
]

interface LetterDemoProps {
  isSignedIn: boolean
}

export function LetterDemo({ isSignedIn }: LetterDemoProps) {
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  // Form state - simplified (recipient is always "myself" for demo)
  const [title, setTitle] = React.useState("")
  const [bodyRich, setBodyRich] = React.useState<Record<string, unknown> | null>(null)
  const [bodyHtml, setBodyHtml] = React.useState("")
  const recipientType: RecipientType = "myself"
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [showCustomDate, setShowCustomDate] = React.useState(false)

  // Word/char count
  const plainText = bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  // Check if form has content
  const hasContent = title.trim() !== "" || plainText !== ""

  const handlePresetDate = (months: number, key: string) => {
    const today = new Date()
    const futureDate = new Date(today.setMonth(today.getMonth() + months))
    setDeliveryDate(futureDate)
    setSelectedPreset(key)
    setShowCustomDate(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setSelectedPreset(null)
  }

  // Save draft to localStorage and redirect to sign-up
  const handleTryProduct = () => {
    // Save the draft so users can continue after sign-up
    if (hasContent) {
      const draftData = {
        title,
        bodyRich,
        bodyHtml,
        recipientType: "self",
        recipientName: "",
        recipientEmail,
        deliveryChannels: ["email"],
        deliveryDate: deliveryDate?.toISOString() ?? null,
        selectedPreset,
        selectedAddressId: null,
        printOptions: { color: false, doubleSided: false },
        lastSaved: new Date().toISOString(),
      }
      try {
        localStorage.setItem("capsule_letter_autosave", JSON.stringify(draftData))
      } catch (e) {
        // Silently fail if localStorage is not available
      }
    }

    // Redirect to sign-up
    router.push(isSignedIn ? "/letters/new" : "/sign-up")
  }

  return (
    <section ref={containerRef} id="try-demo" className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] mb-6"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-4 w-4" strokeWidth={2} />
            Try It Now
          </span>
          <h2 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Write Your First Letter
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Experience the magic of writing to your future self.
            Your draft will be saved when you sign up.
          </p>
        </motion.div>

        {/* Demo Editor */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-5xl"
        >
          {/* Grid Layout: Editor Left, Settings Right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
            {/* Left Column - Letter Editor */}
            <div
              className="relative border-2 border-charcoal bg-white p-6 md:p-8 shadow-[4px_4px_0_theme(colors.charcoal)] min-h-[500px] flex flex-col"
              style={{ borderRadius: "2px" }}
            >
              {/* Floating badge */}
              <div
                className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
                style={{ borderRadius: "2px" }}
              >
                <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Demo Letter</span>
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
                    Letter Title
                  </label>
                  <Input
                    id="demo-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="A letter to my future self..."
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
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                      Your Message
                    </label>
                    <div className="flex gap-3 font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                      <span>{wordCount} words</span>
                      <span>{characterCount} chars</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <LetterEditor
                      content={bodyRich || bodyHtml}
                      onChange={(json, html) => {
                        setBodyRich(json)
                        setBodyHtml(html)
                      }}
                      placeholder="Dear future me, I'm writing this to remind you..."
                      className="flex-1 flex flex-col min-h-0"
                      minHeight="200px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Settings Sidebar */}
            <div className="space-y-6">
              {/* Delivery Settings Card */}
              <div
                className="relative border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
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
                    <TooltipProvider>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                          style={{ borderRadius: "2px" }}
                        >
                          <User className="h-3.5 w-3.5" strokeWidth={2} />
                          Myself
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
                              Someone Else
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[200px] border-2 border-charcoal bg-duck-cream font-mono text-xs text-charcoal"
                            style={{ borderRadius: "2px" }}
                          >
                            <p>Your first letter should be to yourself — future you deserves it first! ✨</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {/* Recipient Email */}
                    <div className="space-y-2 pt-1">
                      <label
                        htmlFor="demo-email"
                        className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70 flex items-center gap-1.5"
                      >
                        <AtSign className="h-3 w-3" strokeWidth={2} />
                        Your Email
                      </label>
                      <Input
                        id="demo-email"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="border-2 border-charcoal font-mono text-sm"
                        style={{ borderRadius: "2px" }}
                      />
                    </div>
                  </div>

                  {/* Dashed separator */}
                  <div className="w-full border-t-2 border-dashed border-charcoal/10" />

                  {/* Delivery Date */}
                  <div className="space-y-3">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                      When to Deliver
                    </label>

                    {/* Date Preset Buttons */}
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
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div
                className="border-2 border-charcoal bg-duck-cream p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <div className="space-y-4">
                  {/* CTA Button */}
                  <Button
                    type="button"
                    onClick={handleTryProduct}
                    className="w-full gap-2 h-12 group"
                  >
                    <Stamp className="h-4 w-4" strokeWidth={2} />
                    {isSignedIn ? "Continue Writing" : "Seal & Schedule"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  {/* Helper text */}
                  <p className="font-mono text-[10px] text-center text-charcoal/60 uppercase tracking-wider">
                    {isSignedIn
                      ? "Continue in the full editor"
                      : "Sign up free to schedule delivery"}
                  </p>

                  {/* Features list */}
                  <div className="pt-2 space-y-2">
                    {[
                      "End-to-end encryption",
                      "Email & physical mail delivery",
                      "Schedule years in advance",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-teal-primary" style={{ borderRadius: "2px" }} />
                        <span className="font-mono text-[10px] text-charcoal/70 uppercase tracking-wider">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

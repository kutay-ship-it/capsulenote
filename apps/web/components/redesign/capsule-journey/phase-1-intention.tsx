"use client"

import { useState, useMemo } from "react"
import { addMonths, addYears, format, differenceInDays } from "date-fns"
import { Calendar, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"

interface Phase1IntentionProps {
  selectedDate: Date | null
  onComplete: (date: Date) => void
}

interface DatePreset {
  key: string
  label: string
  sublabel: string
  getDate: () => Date
}

export function Phase1Intention({ selectedDate, onComplete }: Phase1IntentionProps) {
  const [date, setDate] = useState<Date | null>(selectedDate)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const presets: DatePreset[] = useMemo(() => {
    const now = new Date()
    return [
      {
        key: "6months",
        label: "6 Months",
        sublabel: format(addMonths(now, 6), "MMMM yyyy"),
        getDate: () => addMonths(now, 6),
      },
      {
        key: "1year",
        label: "1 Year",
        sublabel: format(addYears(now, 1), "MMMM yyyy"),
        getDate: () => addYears(now, 1),
      },
      {
        key: "2years",
        label: "2 Years",
        sublabel: format(addYears(now, 2), "MMMM yyyy"),
        getDate: () => addYears(now, 2),
      },
      {
        key: "5years",
        label: "5 Years",
        sublabel: format(addYears(now, 5), "MMMM yyyy"),
        getDate: () => addYears(now, 5),
      },
      {
        key: "10years",
        label: "10 Years",
        sublabel: format(addYears(now, 10), "MMMM yyyy"),
        getDate: () => addYears(now, 10),
      },
    ]
  }, [])

  const handlePresetSelect = (preset: DatePreset) => {
    setDate(preset.getDate())
    setSelectedPreset(preset.key)
    setShowCustom(false)
  }

  const handleCustomDate = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setSelectedPreset(null)
    }
  }

  const handleContinue = () => {
    if (date) {
      onComplete(date)
    }
  }

  const daysUntil = date ? differenceInDays(date, new Date()) : 0

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-12 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-primary bg-teal-primary/10">
            <Sparkles className="h-8 w-8 text-teal-primary" />
          </div>
          <h1 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
            Write to Your Future Self
          </h1>
          <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-gray-secondary sm:text-base">
            Choose when you&apos;d like to receive this letter.
            Your future self will thank you for this moment of reflection.
          </p>
        </motion.div>

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-charcoal">
            When should this letter arrive?
          </p>

          {/* Preset Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {presets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "group relative border-2 p-4 transition-all duration-200",
                  "hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]",
                  selectedPreset === preset.key
                    ? "border-teal-primary bg-teal-primary/10 shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]"
                    : "border-charcoal bg-white"
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="space-y-1">
                  <p className="font-mono text-sm font-semibold text-charcoal">
                    {preset.label}
                  </p>
                  <p className="font-mono text-[10px] text-gray-secondary">
                    {preset.sublabel}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Date */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={cn(
                "flex items-center gap-2 font-mono text-sm uppercase tracking-wide transition-colors",
                showCustom ? "text-teal-primary" : "text-gray-secondary hover:text-charcoal"
              )}
            >
              <Calendar className="h-4 w-4" />
              Choose a specific date
            </button>

            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-xs"
              >
                <DatePicker
                  date={date || undefined}
                  onSelect={handleCustomDate}
                  placeholder="Select a date"
                  minDate={new Date()}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Selected Date Display */}
        {date && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md border-2 border-teal-primary bg-bg-yellow-cream p-6"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-teal-primary">
              Your letter will arrive on
            </p>
            <p className="mt-2 font-mono text-xl font-semibold text-charcoal sm:text-2xl">
              {format(date, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="mt-1 font-mono text-sm text-gray-secondary">
              {daysUntil.toLocaleString()} days from now
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!date}
            size="lg"
            className="min-w-[200px] gap-2 text-base uppercase"
          >
            Begin Writing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

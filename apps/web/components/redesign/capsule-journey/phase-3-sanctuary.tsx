"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ArrowLeft, ArrowRight, Cloud, CloudOff } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SanctuaryEditor } from "./sanctuary-editor"

interface Phase3SanctuaryProps {
  initialTitle: string
  initialContent: string
  onComplete: (
    title: string,
    bodyRich: Record<string, unknown> | null,
    bodyHtml: string
  ) => void
  onBack: () => void
}

export function Phase3Sanctuary({
  initialTitle,
  initialContent,
  onComplete,
  onBack,
}: Phase3SanctuaryProps) {
  const [title, setTitle] = useState(initialTitle)
  const [bodyRich, setBodyRich] = useState<Record<string, unknown> | null>(null)
  const [bodyHtml, setBodyHtml] = useState(initialContent)
  const [isSaved, setIsSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Strip HTML tags for counting
  const plainText = useMemo(
    () => bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    [bodyHtml]
  )
  const wordCount = useMemo(
    () => (plainText ? plainText.split(/\s+/).length : 0),
    [plainText]
  )

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (!isSaved) {
        localStorage.setItem(
          "capsule-draft",
          JSON.stringify({
            title,
            bodyRich,
            bodyHtml,
            savedAt: new Date().toISOString(),
          })
        )
        setIsSaved(true)
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [title, bodyRich, bodyHtml, isSaved])

  const handleEditorChange = useCallback(
    (json: Record<string, unknown>, html: string) => {
      setBodyRich(json)
      setBodyHtml(html)
      setIsSaved(false)
    },
    []
  )

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value)
      setIsSaved(false)
    },
    []
  )

  const handleComplete = () => {
    if (!plainText.trim()) return
    onComplete(title, bodyRich, bodyHtml)
  }

  const isValid = plainText.trim().length > 0

  return (
    <div className="flex h-full flex-col bg-cream">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 border-b border-charcoal/5 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-sm text-gray-secondary transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Save status - centered */}
          <motion.div
            className="flex items-center gap-2 font-mono text-xs text-gray-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isSaved ? (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="saved"
              >
                <Cloud className="h-3.5 w-3.5 text-teal-primary" />
                <span className="text-teal-primary">Saved</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="saving"
              >
                <CloudOff className="h-3.5 w-3.5 animate-pulse" />
                <span>Saving...</span>
              </motion.div>
            )}
          </motion.div>

          {/* Word count */}
          <div className="font-mono text-xs text-gray-secondary tabular-nums">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>
        </div>
      </header>

      {/* Writing Area */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Letter Paper - Refined Design */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative border border-charcoal/80 bg-white"
            style={{
              borderRadius: "2px",
              boxShadow: "-4px 4px 0px 0px rgba(56, 56, 56, 0.12)",
            }}
          >
            {/* Subtle teal accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-1 bg-teal-primary"
              style={{ borderRadius: "2px 2px 0 0" }}
            />

            {/* Paper content area */}
            <div className="px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
              {/* Title Input - Elegant Typography */}
              <input
                value={title}
                onChange={handleTitleChange}
                placeholder="A letter to my future self..."
                className={cn(
                  "w-full bg-transparent",
                  "font-serif text-2xl sm:text-3xl font-medium text-charcoal",
                  "placeholder:text-charcoal/25",
                  "border-0 border-b border-charcoal/10 pb-4 mb-8",
                  "focus:outline-none focus:border-teal-primary/40",
                  "transition-colors duration-200"
                )}
              />

              {/* Sanctuary Editor - Clean, borderless */}
              <SanctuaryEditor
                content={initialContent || bodyHtml || bodyRich || undefined}
                onChange={handleEditorChange}
                placeholder="Dear Future Me..."
                className="min-h-[350px]"
              />

              {/* Subtle hint for formatting */}
              <p className="mt-8 text-center font-mono text-xs text-charcoal/30">
                Select text to format
              </p>
            </div>
          </motion.article>
        </div>
      </main>

      {/* Bottom Action Bar - Centered Design */}
      <footer className="sticky bottom-0 border-t border-charcoal/5 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-center gap-4">
            {/* Word count as inline text */}
            <span className="hidden font-mono text-xs text-gray-secondary sm:block">
              {wordCount > 0
                ? `${wordCount.toLocaleString()} ${wordCount === 1 ? "word" : "words"} written`
                : "Your words will travel through time"}
            </span>

            {/* Continue button */}
            <Button
              onClick={handleComplete}
              disabled={!isValid}
              size="lg"
              className={cn(
                "gap-2 px-8 uppercase transition-all duration-200",
                isValid && "shadow-sm hover:shadow"
              )}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

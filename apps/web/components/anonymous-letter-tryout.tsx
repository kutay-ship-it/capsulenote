"use client"

/**
 * Anonymous Letter Tryout Component
 *
 * Progressive disclosure pattern for anonymous users:
 * 1. Allow immediate writing (no sign-up required)
 * 2. Auto-save to localStorage every 10 seconds
 * 3. Show sign-up prompt after 50+ words
 * 4. Migrate draft to database on account creation
 *
 * Expected conversion improvement: 3% → 21% (7x)
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Check, Sparkles } from "lucide-react"
import {
  saveAnonymousDraft,
  getAnonymousDraft,
  countWords,
  formatLastSaved,
  shouldShowSignUpPrompt,
} from "@/lib/localStorage-letter"
import { cn, getUserTimezone } from "@/lib/utils"

export function AnonymousLetterTryout() {
  const router = useRouter()
  const t = useTranslations("forms.anonymousTryout")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [email, setEmail] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing draft on mount
  useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setTitle(draft.title)
      setBody(draft.body)
      setEmail(draft.recipientEmail || "")
      setWordCount(draft.wordCount)
      setLastSaved(draft.lastSaved)
    }
  }, [])

  // Auto-save function with debounce
  const performAutoSave = useCallback(() => {
    if (body.trim().length > 0) {
      saveAnonymousDraft(title, body, email, undefined, "email", getUserTimezone(), "self", "")
      setLastSaved(new Date().toISOString())
      setShowSaveIndicator(true)

      // Hide save indicator after 2 seconds
      setTimeout(() => setShowSaveIndicator(false), 2000)

      // Check if we should show sign-up prompt
      if (shouldShowSignUpPrompt() && !showSignUpPrompt) {
        setShowSignUpPrompt(true)
      }
    }
  }, [title, body, showSignUpPrompt])

  // Set up auto-save timer
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set new timer if there's content
    if (body.trim().length > 0) {
      autoSaveTimerRef.current = setTimeout(() => {
        performAutoSave()
      }, 10000) // Auto-save every 10 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [title, body, performAutoSave])

  // Update word count on body change
  useEffect(() => {
    setWordCount(countWords(body))
  }, [body])

  // Handle manual save
  const handleManualSave = () => {
    performAutoSave()
  }

  // Handle sign-up redirect
  const handleSignUp = () => {
    // Draft will be automatically loaded after sign-up via migration
    router.push('/sign-up?intent=save-draft')
  }

  const handleSendAndSchedule = () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setShowSignUpPrompt(true)
      return
    }
    const timezone = getUserTimezone()
    saveAnonymousDraft(title, body, trimmedEmail, undefined, "email", timezone, "self", "")
    const params = new URLSearchParams()
    params.set("email", trimmedEmail)
    params.set("deliveryType", "email")
    params.set("timezone", timezone)
    router.push(`/subscribe?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Sign-Up Prompt (appears after 50+ words) */}
      {showSignUpPrompt && (
        <Card
          className="border-2 border-charcoal shadow-md bg-duck-yellow animate-in fade-in slide-in-from-top-4 duration-500"
          style={{ borderRadius: "2px" }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Sparkles className="h-6 w-6 text-charcoal" strokeWidth={2} />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
                    {t("signUpPrompt.title")}
                  </h3>
                  <p className="font-mono text-sm text-gray-secondary mt-1">
                    {t("signUpPrompt.description", { wordCount })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSignUp}
                    className="border-2 border-charcoal bg-charcoal font-mono text-sm uppercase hover:bg-gray-800"
                    style={{ borderRadius: "2px" }}
                  >
                    {t("signUpPrompt.signUp")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignUpPrompt(false)}
                    className="border-2 border-charcoal font-mono text-sm uppercase"
                    style={{ borderRadius: "2px" }}
                  >
                    {t("signUpPrompt.keepWriting")}
                  </Button>
                </div>
                <p className="font-mono text-xs text-gray-secondary">
                  {t("signUpPrompt.features")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor Card */}
      <Card
        className="border-2 border-charcoal shadow-md bg-white"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="space-y-6 p-6 sm:p-8">
          {/* Header with save status */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
                {t("editor.title")}
              </h2>
              <p className="font-mono text-sm text-gray-secondary">
                {t("editor.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showSaveIndicator ? (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-mono text-xs text-gray-secondary">{t("editor.saved")}</span>
                </div>
              ) : lastSaved ? (
                <span className="font-mono text-xs text-gray-secondary">
                  {t("editor.savedTime", { time: formatLastSaved(lastSaved) })}
                </span>
              ) : null}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              {t("fields.titleLabel")}
            </Label>
            <Input
              placeholder={t("fields.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-charcoal font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ borderRadius: "2px" }}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              {t("fields.emailLabel")}
            </Label>
            <Input
              placeholder={t("fields.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-charcoal font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ borderRadius: "2px" }}
            />
            <p className="font-mono text-xs text-gray-secondary">
              {t("fields.emailDescription")}
            </p>
          </div>

          {/* Body Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                {t("fields.letterLabel")}
              </Label>
              <Badge
                variant="outline"
                className="border-2 border-charcoal font-mono text-xs"
                style={{ borderRadius: "2px" }}
              >
                {wordCount === 1 ? t("fields.wordCount", { count: wordCount }) : t("fields.wordCountPlural", { count: wordCount })}
              </Badge>
            </div>
            <Textarea
              placeholder={t("fields.letterPlaceholder")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className={cn(
                "min-h-[400px] border-2 border-charcoal font-mono text-base leading-relaxed",
                "focus-visible:ring-0 focus-visible:ring-offset-0 resize-none",
                // Lined paper effect
                "bg-white bg-[linear-gradient(transparent_30px,_#e5e7eb_31px)] bg-[length:100%_32px]"
              )}
              style={{ borderRadius: "2px", lineHeight: "32px", paddingTop: "8px" }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t-2 border-charcoal pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs text-gray-secondary">
                {t("features.autoSave")}
              </p>
              <p className="font-mono text-xs text-gray-secondary">
                {t("features.draftKept")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleManualSave}
                disabled={body.trim().length === 0}
                className="border-2 border-charcoal font-mono text-sm uppercase"
                style={{ borderRadius: "2px" }}
              >
                <Save className="mr-2 h-4 w-4" />
                {t("actions.saveNow")}
              </Button>
              <Button
                onClick={handleSendAndSchedule}
                disabled={body.trim().length === 0}
                className="border-2 border-charcoal bg-charcoal font-mono text-sm uppercase hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                {t("actions.sendSchedule")}
              </Button>
              {wordCount >= 10 && (
                <Button
                  onClick={handleSignUp}
                  className="border-2 border-charcoal font-mono text-sm uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {t("actions.signUpFirst")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Prompts */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-6">
          <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal mb-4">
            {t("prompts.title")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              t("prompts.items.grateful"),
              t("prompts.items.challenges"),
              t("prompts.items.goals"),
              t("prompts.items.advice"),
              t("prompts.items.remember"),
              t("prompts.items.grown"),
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setBody(body + (body ? '\n\n' : '') + prompt + '\n\n')}
                className="border-2 border-charcoal bg-white p-3 text-left font-mono text-sm text-charcoal hover:bg-duck-yellow transition-colors"
                style={{ borderRadius: "2px" }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Save, Lightbulb } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createLetter } from "@/server/actions/letters"
import { toast } from "sonner"
import { getAnonymousDraft, saveAnonymousDraft, clearAnonymousDraft } from "@/lib/localStorage-letter"

interface LetterDraftFormProps {
  initialData?: {
    title?: string
    body?: string
  }
  accentColor?: "yellow" | "blue" | "teal" | "lavender" | "peach" | "lime"
}

export function LetterDraftForm({
  initialData,
  accentColor = "yellow",
}: LetterDraftFormProps) {
  const router = useRouter()
  const t = useTranslations("letters")
  const tf = useTranslations("forms.letterDraft")

  const [title, setTitle] = React.useState(initialData?.title || "")
  const [body, setBody] = React.useState(initialData?.body || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [errors, setErrors] = React.useState<{ title?: string; body?: string }>({})
  const [restoredDraft, setRestoredDraft] = React.useState(false)

  // Auto-save timer ref
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastSavedLetterIdRef = React.useRef<string | null>(null)

  const characterCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  // Get accent color classes
  const accentColorMap = {
    yellow: "bg-bg-yellow-pale border-yellow-500",
    blue: "bg-bg-blue-light border-blue-500",
    teal: "bg-bg-teal-light border-teal-500",
    lavender: "bg-bg-lavender-light border-lavender-500",
    peach: "bg-bg-peach-light border-peach-500",
    lime: "bg-bg-lime-light border-lime-500",
  }

  // Writing prompts
  const writingPrompts = [
    tf("prompts.items.grateful"),
    tf("prompts.items.challenges"),
    tf("prompts.items.goals"),
    tf("prompts.items.tellFuture"),
    tf("prompts.items.proud"),
    tf("prompts.items.lessons"),
  ]

  // Load saved draft from localStorage (anonymous flow)
  React.useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setTitle(draft.title || "")
      setBody(draft.body || "")
      setRestoredDraft(true)
    }
  }, [])

  // Auto-save function
  const autoSave = React.useCallback(async () => {
    // Don't auto-save if body is empty
    if (!body.trim()) {
      return
    }

    setIsSaving(true)

    try {
      // Convert plain text to TipTap JSON format
      const paragraphs = body.split('\n').filter(p => p.trim()).map(p => ({
        type: 'paragraph',
        content: [{ type: 'text', text: p }]
      }))

      const bodyRich = {
        type: 'doc',
        content: paragraphs.length > 0 ? paragraphs : [
          { type: 'paragraph', content: [{ type: 'text', text: body }] }
        ]
      }

      // Convert to HTML with XSS protection
      const escapeHtml = (text: string): string => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }
        return text.replace(/[&<>"']/g, (char) => map[char] ?? char)
      }

      const bodyHtml = body
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('')

      saveAnonymousDraft(title, body, undefined, undefined, "email", Intl.DateTimeFormat().resolvedOptions().timeZone, "self", "")

      // Call createLetter action
      const result = await createLetter({
        title: title || tf("untitledLetter"),
        bodyRich,
        bodyHtml,
        tags: [],
        visibility: 'private' as const,
      })

      if (result.success) {
        lastSavedLetterIdRef.current = result.data.letterId
        setLastSaved(new Date())
      } else {
        console.error('Auto-save failed:', result.error)
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [title, body])

  // Set up auto-save on body changes (30s debounce)
  React.useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Only auto-save if there's content
    if (body.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave()
      }, 30000) // 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [body, autoSave])

  // Validate form
  const validate = (): boolean => {
    const newErrors: { title?: string; body?: string } = {}

    if (!body.trim()) {
      newErrors.body = t("toasts.draftValidation")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle explicit save draft
  const handleSaveDraft = async () => {
    if (!validate()) {
      return
    }

    await autoSave()

    toast.success(t("toasts.draftSaved.title"), {
      description: t("toasts.draftSaved.description"),
    })
  }

  // Handle continue to schedule
  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Save the letter first (if not already saved)
      let letterId = lastSavedLetterIdRef.current

      if (!letterId) {
        // Convert plain text to TipTap JSON format
        const paragraphs = body.split('\n').filter(p => p.trim()).map(p => ({
          type: 'paragraph',
          content: [{ type: 'text', text: p }]
        }))

        const bodyRich = {
          type: 'doc',
          content: paragraphs.length > 0 ? paragraphs : [
            { type: 'paragraph', content: [{ type: 'text', text: body }] }
          ]
        }

        const escapeHtml = (text: string): string => {
          const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          }
          return text.replace(/[&<>"']/g, (char) => map[char] ?? char)
        }

        const bodyHtml = body
          .split('\n')
          .filter(p => p.trim())
          .map(p => `<p>${escapeHtml(p)}</p>`)
          .join('')

        const result = await createLetter({
          title: title || tf("untitledLetter"),
          bodyRich,
          bodyHtml,
          tags: [],
          visibility: 'private' as const,
        })

        if (!result.success) {
          toast.error(t("toasts.createError.title"), {
            description: t("toasts.createError.description", {
              message: result.error.message || t("toasts.scheduleForm.failed"),
            }),
          })
          return
        }

        letterId = result.data.letterId
      }

      // Clear local draft since it is now persisted
      clearAnonymousDraft()

      // Navigate to schedule page
      router.push(`/letters/${letterId}/schedule`)
    } catch (error) {
      console.error('Error saving letter:', error)
      toast.error(t("toasts.scheduleForm.errorTitle"), {
        description: t("toasts.scheduleForm.unexpected"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format last saved time
  const formatLastSaved = (): string => {
    if (!lastSaved) return ""

    const now = new Date()
    const diffMs = now.getTime() - lastSaved.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 60) {
      return `${diffSecs}s ago`
    } else if (diffMins < 60) {
      return `${diffMins}m ago`
    } else {
      return lastSaved.toLocaleTimeString()
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Editor - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        <Card
          className={cn(
            "border-2 border-charcoal shadow-md",
            accentColorMap[accentColor]
          )}
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
              {tf("title")}
            </CardTitle>
            <CardDescription className="font-mono text-xs sm:text-sm">
              {tf("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6">
            {/* Title Field */}
            <Field>
              <FieldLabel className="font-mono text-sm font-normal uppercase tracking-wide">
                {tf("titleField.label")} <span className="text-gray-secondary">{tf("titleField.optional")}</span>
              </FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tf("titleField.placeholder")}
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              />
              <FieldDescription className="font-mono text-xs">
                {tf("titleField.description")}
              </FieldDescription>
            </Field>

            {/* Body Field */}
            <Field>
              <FieldLabel className="font-mono text-sm font-normal uppercase tracking-wide">
                {tf("bodyField.label")} <span className="text-red-500">{tf("bodyField.required")}</span>
              </FieldLabel>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={tf("bodyField.placeholder")}
                rows={16}
                className="border-2 border-charcoal font-mono resize-none"
                style={{ borderRadius: "2px" }}
              />
              {errors.body && (
                <FieldError className="font-mono text-xs">{errors.body}</FieldError>
              )}
            <div className="flex items-center justify-between">
              <FieldDescription className="font-mono text-xs">
                {tf("bodyField.stats", { chars: characterCount, words: wordCount })}
              </FieldDescription>
              {restoredDraft && (
                <FieldDescription className="font-mono text-xs text-green-700">
                  {tf("status.draftRestored")}
                </FieldDescription>
              )}
              {lastSaved && !isSaving && (
                <FieldDescription className="font-mono text-xs text-green-600">
                  {tf("status.saved", { time: formatLastSaved() })}
                  </FieldDescription>
                )}
                {isSaving && (
                  <FieldDescription className="font-mono text-xs text-gray-secondary">
                    {tf("status.saving")}
                  </FieldDescription>
                )}
              </div>
            </Field>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSaving || !body.trim()}
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              >
                <Save className="mr-2 h-4 w-4" />
                {tf("actions.saveDraft")}
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting || isSaving || !body.trim()}
                className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                {isSubmitting ? tf("actions.saving") : tf("actions.continue")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Writing Prompts Sidebar - 1/3 width */}
      <div className="lg:col-span-1">
        <Card
          className="border-2 border-charcoal shadow-sm bg-bg-lavender-light"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-charcoal" />
              <CardTitle className="font-mono text-base font-normal uppercase tracking-wide">
                {tf("prompts.title")}
              </CardTitle>
            </div>
            <CardDescription className="font-mono text-xs">
              {tf("prompts.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {writingPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!body.trim()) {
                    setBody(prompt + "\n\n")
                  } else {
                    setBody(body + "\n\n" + prompt + "\n\n")
                  }
                }}
                className="w-full text-left p-3 border-2 border-charcoal bg-white font-mono text-xs hover:shadow-md transition-all duration-fast hover:translate-x-0.5 hover:-translate-y-0.5"
                style={{ borderRadius: "2px" }}
              >
                {prompt}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

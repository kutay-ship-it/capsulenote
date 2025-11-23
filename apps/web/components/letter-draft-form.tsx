"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Save, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createLetter } from "@/server/actions/letters"
import { useToast } from "@/hooks/use-toast"
import { getAnonymousDraft, saveAnonymousDraft, clearAnonymousDraft } from "@/lib/localStorage-letter"

interface LetterDraftFormProps {
  initialData?: {
    title?: string
    body?: string
  }
  accentColor?: "yellow" | "blue" | "teal" | "lavender" | "peach" | "lime"
}

const writingPrompts = [
  "What are you grateful for right now?",
  "What challenges are you currently facing?",
  "What goals do you hope to achieve?",
  "What would you tell your future self?",
  "What makes you proud today?",
  "What lessons have you learned recently?",
]

export function LetterDraftForm({
  initialData,
  accentColor = "yellow",
}: LetterDraftFormProps) {
  const router = useRouter()
  const { toast } = useToast()

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
        return text.replace(/[&<>"']/g, (char) => map[char])
      }

      const bodyHtml = body
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('')

      saveAnonymousDraft(title, body)

      // Call createLetter action
      const result = await createLetter({
        title: title || "Untitled Letter",
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
      newErrors.body = "Please write something in your letter"
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

    toast({
      title: "Draft Saved",
      description: "Your letter has been saved as a draft.",
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
          return text.replace(/[&<>"']/g, (char) => map[char])
        }

        const bodyHtml = body
          .split('\n')
          .filter(p => p.trim())
          .map(p => `<p>${escapeHtml(p)}</p>`)
          .join('')

        const result = await createLetter({
          title: title || "Untitled Letter",
          bodyRich,
          bodyHtml,
          tags: [],
          visibility: 'private' as const,
        })

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error.message || "Failed to save letter.",
            variant: "destructive",
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
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
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
              Write Your Letter
            </CardTitle>
            <CardDescription className="font-mono text-xs sm:text-sm">
              Focus on your thoughts. You'll schedule delivery in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6">
            {/* Title Field */}
            <Field>
              <FieldLabel className="font-mono text-sm font-normal uppercase tracking-wide">
                Title <span className="text-gray-secondary">(Optional)</span>
              </FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A letter to my future self..."
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              />
              <FieldDescription className="font-mono text-xs">
                Give your letter a memorable title
              </FieldDescription>
            </Field>

            {/* Body Field */}
            <Field>
              <FieldLabel className="font-mono text-sm font-normal uppercase tracking-wide">
                Your Letter <span className="text-red-500">*</span>
              </FieldLabel>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Dear Future Me,&#10;&#10;Write your thoughts here..."
                rows={16}
                className="border-2 border-charcoal font-mono resize-none"
                style={{ borderRadius: "2px" }}
              />
              {errors.body && (
                <FieldError className="font-mono text-xs">{errors.body}</FieldError>
              )}
            <div className="flex items-center justify-between">
              <FieldDescription className="font-mono text-xs">
                {characterCount} characters · {wordCount} words
              </FieldDescription>
              {restoredDraft && (
                <FieldDescription className="font-mono text-xs text-green-700">
                  Draft restored from last visit
                </FieldDescription>
              )}
              {lastSaved && !isSaving && (
                <FieldDescription className="font-mono text-xs text-green-600">
                  ✓ Saved {formatLastSaved()}
                  </FieldDescription>
                )}
                {isSaving && (
                  <FieldDescription className="font-mono text-xs text-gray-secondary">
                    Saving...
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
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting || isSaving || !body.trim()}
                className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                {isSubmitting ? "Saving..." : "Continue to Schedule"}
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
                Writing Prompts
              </CardTitle>
            </div>
            <CardDescription className="font-mono text-xs">
              Stuck? Try one of these
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

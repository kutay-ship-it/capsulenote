"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"
import { getUserTimezone } from "@/lib/utils"
import { getAnonymousDraft, clearAnonymousDraft } from "@/lib/localStorage-letter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

/**
 * Dashboard Letter Editor Component
 *
 * Provides quick letter creation from the dashboard.
 * After creation, redirects to letter detail page for scheduling.
 */
export function DashboardLetterEditor() {
  const router = useRouter()
  const t = useTranslations("forms.dashboardEditor")
  const [isPending, startTransition] = useTransition()
  const [draftData, setDraftData] = useState<LetterFormData | null>(null)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [activeInitialData, setActiveInitialData] = useState<LetterFormData>(() => ({
    title: "",
    body: "",
    recipientEmail: "",
    deliveryDate: "",
    deliveryType: "email",
    recipientType: "self",
    timezone: getUserTimezone(),
  }))

  const defaultInitialData = useMemo(
    () => ({
      title: "",
      body: "",
      recipientEmail: "",
      deliveryDate: "",
      deliveryType: "email" as const,
      recipientType: "self" as const,
      timezone: getUserTimezone(),
    }),
    []
  )

  useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setDraftData({
        title: draft.title || "",
        body: draft.body || "",
        recipientEmail: draft.recipientEmail || "",
        deliveryDate: draft.deliveryDate || "",
        deliveryType: draft.deliveryType || "email",
        recipientType: draft.recipientType || "self",
        recipientName: draft.recipientName || "",
        timezone: draft.timezone || getUserTimezone(),
      })
      setShowResumePrompt(true)
    }
  }, [])

  const handleLetterSubmit = (data: LetterFormData) => {
    // Prevent double submission
    if (isPending) return

    startTransition(async () => {
      try {
        // Convert plain text body to TipTap JSON and HTML
        // TipTap expects a document structure with paragraphs
        const paragraphs = data.body.split('\n').filter(p => p.trim()).map(p => ({
          type: 'paragraph',
          content: [{ type: 'text', text: p }]
        }))

        const bodyRich = {
          type: 'doc',
          content: paragraphs.length > 0 ? paragraphs : [
            { type: 'paragraph', content: [{ type: 'text', text: data.body }] }
          ]
        }

        // Convert to HTML (simple implementation)
        const bodyHtml = data.body
          .split('\n')
          .filter(p => p.trim())
          .map(p => `<p>${escapeHtml(p)}</p>`)
          .join('')

        // Call server action to create letter
        const result = await createLetter({
          title: data.title,
          bodyRich,
          bodyHtml,
          tags: [],
          visibility: 'private' as const,
        })

        if (result.success) {
          const letterId = result.data.letterId
          const timezone = data.timezone || getUserTimezone()
          const deliverAt = fromZonedTime(`${data.deliveryDate}T09:00`, timezone)

          try {
            await scheduleDelivery({
              letterId,
              channel: data.deliveryType === "physical" ? "mail" : "email",
              deliverAt,
              timezone,
              toEmail: data.recipientEmail,
            })
          } catch (scheduleError) {
            toast.error(t("toasts.deliveryNotScheduled.title"), {
              description: scheduleError instanceof Error
                ? scheduleError.message
                : t("toasts.deliveryNotScheduled.description"),
            })
          }

          clearAnonymousDraft()

          // Show success toast
          toast.success(t("toasts.letterCreated.title"), {
            description: t("toasts.letterCreated.description", {
              title: data.title,
              scheduled: data.deliveryDate ? t("toasts.letterCreated.scheduled") : "",
            }),
          })

          // Redirect to letter detail page
          router.push(`/letters/${letterId}`)
        } else {
          // Handle error cases
          if (result.error.code === 'QUOTA_EXCEEDED') {
            toast.error(t("toasts.quotaExceeded.title"), {
              description: result.error.message,
              action: {
                label: t("toasts.upgrade"),
                onClick: () => router.push('/pricing'),
              },
            })
          } else if (result.error.code === 'VALIDATION_FAILED') {
            toast.error(t("toasts.validationError.title"), {
              description: result.error.message,
            })
          } else {
            toast.error(t("toasts.error.title"), {
              description: result.error.message || t("toasts.error.description"),
            })
          }
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Letter creation error:', error)
        toast.error(t("toasts.unexpectedError.title"), {
          description: t("toasts.unexpectedError.description"),
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      {showResumePrompt && draftData && (
        <Alert>
          <AlertTitle>{t("resumePrompt.title")}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {t("resumePrompt.description")}
            <Button
              size="sm"
              onClick={() => {
                setActiveInitialData(draftData)
                setShowResumePrompt(false)
              }}
              className="border-2 border-charcoal bg-charcoal text-cream hover:bg-gray-800"
            >
              {t("resumePrompt.resume")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearAnonymousDraft()
                setDraftData(null)
                setActiveInitialData(defaultInitialData)
                setShowResumePrompt(false)
              }}
              className="border-2 border-charcoal"
            >
              {t("resumePrompt.startFresh")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <LetterEditorForm
        accentColor="teal"
        onSubmit={(data) => {
          setShowResumePrompt(false)
          return handleLetterSubmit(data)
        }}
        initialData={activeInitialData}
        isSubmitting={isPending}
      />
    </div>
  )
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

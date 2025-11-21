"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { createLetter } from "@/server/actions/letters"
import { useToast } from "@/components/ui/use-toast"

/**
 * Dashboard Letter Editor Component
 *
 * Provides quick letter creation from the dashboard.
 * After creation, redirects to letter detail page for scheduling.
 */
export function DashboardLetterEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLetterSubmit = async (data: LetterFormData) => {
    // Prevent double submission
    if (isSubmitting) return

    setIsSubmitting(true)

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
        // Show success toast
        toast({
          title: "Letter Created",
          description: `"${data.title}" has been saved to your encrypted vault.`,
        })

        // Redirect to letter detail page
        router.push(`/letters/${result.data.letterId}`)
      } else {
        // Handle error cases
        if (result.error.code === 'QUOTA_EXCEEDED') {
          toast({
            title: "Quota Exceeded",
            description: result.error.message,
            variant: "destructive",
            action: {
              label: "Upgrade",
              onClick: () => router.push('/pricing'),
            },
          })
        } else if (result.error.code === 'VALIDATION_FAILED') {
          toast({
            title: "Validation Error",
            description: result.error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: result.error.message || "Failed to create letter. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Letter creation error:', error)
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LetterEditorForm
      accentColor="teal"
      onSubmit={handleLetterSubmit}
      initialData={{
        title: "",
        body: "",
        recipientEmail: "",
        deliveryDate: "",
      }}
      isSubmitting={isSubmitting}
    />
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

"use client"

import { useRouter } from "next/navigation"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { createLetter } from "@/server/actions/letters"
import { useToast } from "@/hooks/use-toast"

export function NewLetterForm() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: LetterFormData) => {
    try {
      // For now, we'll store the plain text body as both bodyRich and bodyHtml
      // In a future update, this can be enhanced to support rich text
      const result = await createLetter({
        title: data.title,
        bodyRich: { type: "doc", content: [{ type: "paragraph", text: data.body }] },
        bodyHtml: `<p>${data.body}</p>`,
        tags: [],
        visibility: "private",
      })

      toast({
        title: "Letter Created Successfully",
        description: `Your letter "${data.title}" has been saved and will be delivered on ${new Date(data.deliveryDate).toLocaleDateString()}`,
      })

      router.push(`/letters/${result.letterId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Letter",
        description: error instanceof Error ? error.message : "Failed to create letter",
      })
    }
  }

  return (
    <LetterEditorForm
      accentColor="blue"
      onSubmit={handleSubmit}
      initialData={{
        title: "",
        body: "",
        recipientEmail: "",
        deliveryDate: "",
      }}
    />
  )
}

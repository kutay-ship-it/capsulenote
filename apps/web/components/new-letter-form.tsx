"use client"

import { useRouter } from "next/navigation"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { useToast } from "@/hooks/use-toast"
import { zonedTimeToUtc } from "date-fns-tz"
import { getUserTimezone } from "@/lib/utils"

export function NewLetterForm() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: LetterFormData) => {
    // For now, we'll store the plain text body as both bodyRich and bodyHtml
    // In a future update, this can be enhanced to support rich text
    const result = await createLetter({
      title: data.title,
      bodyRich: { type: "doc", content: [{ type: "paragraph", text: data.body }] },
      bodyHtml: `<p>${data.body}</p>`,
      tags: [],
      visibility: "private",
    })

    if (result.success) {
      const letterId = result.data.letterId
      const timezone = data.timezone || getUserTimezone()
      const deliverAt = zonedTimeToUtc(`${data.deliveryDate}T09:00`, timezone)

      try {
        await scheduleDelivery({
          letterId,
          channel: data.deliveryType === "physical" ? "mail" : "email",
          deliverAt,
          timezone,
          toEmail: data.recipientEmail,
        })

        toast({
          title: "Letter Scheduled",
          description: `Your letter "${data.title}" is set for ${deliverAt.toLocaleString()}.`,
        })
      } catch (scheduleError) {
        toast({
          variant: "destructive",
          title: "Delivery Not Scheduled",
          description:
            scheduleError instanceof Error
              ? scheduleError.message
              : "We saved your letter, but scheduling failed. Please try again from the letter page.",
        })
      }

      router.push(`/letters/${letterId}`)
    } else {
      toast({
        variant: "destructive",
        title: "Error Creating Letter",
        description: result.error.message,
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
        deliveryType: "email",
        recipientType: "self",
        timezone: getUserTimezone(),
      }}
    />
  )
}

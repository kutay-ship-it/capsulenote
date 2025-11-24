"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { zonedTimeToUtc } from "date-fns-tz"

import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { useToast } from "@/hooks/use-toast"
import { getUserTimezone } from "@/lib/utils"
import { createLetter } from "@/server/actions/letters"

export function NewLetterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations("letters.toasts")

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
          title: t("letterScheduled.title"),
          description: t("letterScheduled.description", {
            title: data.title || "",
            date: new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(deliverAt),
          }),
        })
      } catch (scheduleError) {
        toast({
          variant: "destructive",
          title: t("scheduleFailed.title"),
          description:
            scheduleError instanceof Error
              ? scheduleError.message
              : t("scheduleFailed.description"),
        })
      }

      router.push(`/letters/${letterId}`)
    } else {
      toast({
        variant: "destructive",
        title: t("createError.title"),
        description: t("createError.description", { message: result.error.message }),
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

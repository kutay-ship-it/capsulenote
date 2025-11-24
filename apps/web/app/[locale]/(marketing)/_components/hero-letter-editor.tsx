"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { saveAnonymousDraft, getAnonymousDraft } from "@/lib/localStorage-letter"
import { getUserTimezone } from "@/lib/utils"
import { useRouter } from "@/i18n/routing"

export function HeroLetterEditor() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [initialData, setInitialData] = useState<LetterFormData>({
    title: "",
    body: "",
    recipientEmail: "",
    deliveryDate: "",
    deliveryType: "email",
    recipientType: "self",
    timezone: getUserTimezone(),
  })

  useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setInitialData({
        title: draft.title || "",
        body: draft.body || "",
        recipientEmail: draft.recipientEmail || "",
        deliveryDate: draft.deliveryDate || "",
        deliveryType: draft.deliveryType || "email",
        recipientType: draft.recipientType || "self",
        recipientName: draft.recipientName || "",
        timezone: draft.timezone || getUserTimezone(),
      })
    }
  }, [])

  const handleLetterSubmit = (data: LetterFormData) => {
    // If user is signed in, go directly to dashboard
    if (isSignedIn) {
      router.push("/dashboard")
      return
    }

    const timezone = data.timezone || getUserTimezone()
    const deliveryType = data.deliveryType

    // Anonymous user flow: Persist draft + email locally for resume/checkout
    saveAnonymousDraft(
      data.title,
      data.body,
      data.recipientEmail,
      data.deliveryDate,
      deliveryType,
      timezone,
      data.recipientType,
      data.recipientName
    )

    // Send to paywall with locked email and delivery metadata
    const params = new URLSearchParams()
    params.set("email", data.recipientEmail)
    if (data.deliveryDate) params.set("deliveryDate", data.deliveryDate)
    params.set("deliveryType", deliveryType)
    params.set("timezone", timezone)
    if (data.recipientName) params.set("recipientName", data.recipientName)
    params.set("recipientType", data.recipientType)
    router.push(`/subscribe?${params.toString()}`)
  }

  return (
    <LetterEditorForm
      accentColor="blue"
      onSubmit={handleLetterSubmit}
      initialData={initialData}
    />
  )
}

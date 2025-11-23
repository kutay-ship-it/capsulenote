"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { saveAnonymousDraft, getAnonymousDraft } from "@/lib/localStorage-letter"

export function HeroLetterEditor() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [initialData, setInitialData] = useState<LetterFormData>({
    title: "",
    body: "",
    recipientEmail: "",
    deliveryDate: "",
  })

  useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setInitialData({
        title: draft.title || "",
        body: draft.body || "",
        recipientEmail: draft.recipientEmail || "",
        deliveryDate: draft.deliveryDate || "",
      })
    }
  }, [])

  const handleLetterSubmit = (data: LetterFormData) => {
    // If user is signed in, go directly to dashboard
    if (isSignedIn) {
      router.push("/dashboard")
      return
    }

    // Anonymous user flow: Persist draft + email locally for resume/checkout
    saveAnonymousDraft(data.title, data.body, data.recipientEmail, data.deliveryDate)

    // Send to paywall with locked email
    const params = new URLSearchParams()
    params.set("email", data.recipientEmail)
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

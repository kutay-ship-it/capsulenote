"use client"

import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"

export function HeroLetterEditor() {
  const handleLetterSubmit = (data: LetterFormData) => {
    console.log("Letter preview:", data)
    alert(
      `✅ Your letter "${data.title}" is ready!\n\n` +
        `📬 Scheduled for: ${new Date(data.deliveryDate).toLocaleDateString()}\n` +
        `📧 Recipient: ${data.recipientEmail}\n\n` +
        `Sign up to schedule your delivery and keep your letters safe in our encrypted vault.`,
    )
  }

  return (
    <LetterEditorForm
      accentColor="blue"
      onSubmit={handleLetterSubmit}
      initialData={{
        title: "",
        body: "",
        recipientEmail: "",
        deliveryDate: "",
      }}
    />
  )
}

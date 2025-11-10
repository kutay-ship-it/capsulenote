"use client"

import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"

const handleLetterSubmit = async (data: LetterFormData) => {
  // TODO: Implement actual letter creation with server action
  console.log("Creating letter:", data)
  alert(
    `✅ Letter "${data.title}" created!\n\n` +
    `📬 Scheduled for: ${new Date(data.deliveryDate).toLocaleDateString()}\n` +
    `📧 Recipient: ${data.recipientEmail}\n\n` +
    `Your letter is securely stored in your encrypted vault.`
  )
}

export function DashboardLetterEditor() {
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
    />
  )
}

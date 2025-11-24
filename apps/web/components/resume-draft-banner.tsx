"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getAnonymousDraft, clearAnonymousDraft } from "@/lib/localStorage-letter"

interface ResumeDraftBannerProps {
  onResume?: (draft: { title?: string; body?: string; recipientEmail?: string; deliveryDate?: string }) => void
}

export function ResumeDraftBanner({ onResume }: ResumeDraftBannerProps) {
  const t = useTranslations("components.resumeDraftBanner")
  const [hasDraft, setHasDraft] = useState(false)
  const [draftData, setDraftData] = useState<{ title?: string; body?: string; recipientEmail?: string; deliveryDate?: string }>({})

  useEffect(() => {
    const draft = getAnonymousDraft()
    if (draft) {
      setHasDraft(true)
      setDraftData({
        title: draft.title,
        body: draft.body,
        recipientEmail: draft.recipientEmail,
        deliveryDate: draft.deliveryDate,
      })
    }
  }, [])

  if (!hasDraft) return null

  return (
    <Alert className="border-2 border-charcoal">
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        {t("description")}
        <Button
          size="sm"
          onClick={() => {
            onResume?.(draftData)
            setHasDraft(false)
          }}
          className="border-2 border-charcoal bg-charcoal text-cream hover:bg-gray-800"
        >
          {t("resume")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            clearAnonymousDraft()
            setHasDraft(false)
          }}
          className="border-2 border-charcoal"
        >
          {t("startFresh")}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

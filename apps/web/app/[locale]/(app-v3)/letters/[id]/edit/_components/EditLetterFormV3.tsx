"use client"

import * as React from "react"
import { Save, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { toast } from "sonner"

import { LetterEditor } from "@/components/letter-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "@/i18n/routing"
import { updateLetter } from "@/server/actions/letters"

interface EditLetterFormV3Props {
  letterId: string
  initialTitle: string
  initialBodyRich: Record<string, unknown> | null
  initialBodyHtml: string
}

export function EditLetterFormV3({
  letterId,
  initialTitle,
  initialBodyRich,
  initialBodyHtml,
}: EditLetterFormV3Props) {
  const t = useTranslations("letters")
  const router = useRouter()
  const [isSaving, startTransition] = useTransition()

  const [title, setTitle] = React.useState(initialTitle)
  const [bodyRich, setBodyRich] = React.useState<Record<string, unknown>>(initialBodyRich ?? {})
  const [bodyHtml, setBodyHtml] = React.useState(initialBodyHtml)

  const trimmedTitle = title.trim()
  const titleChanged = trimmedTitle !== initialTitle.trim()
  const bodyChanged = bodyHtml !== initialBodyHtml
  const hasChanges = titleChanged || bodyChanged

  const handleSave = () => {
    if (!trimmedTitle) {
      toast.error(t("edit.errors.titleRequired"))
      return
    }

    startTransition(async () => {
      const payload: Record<string, unknown> = { id: letterId }
      if (titleChanged) payload.title = trimmedTitle
      if (bodyChanged) {
        payload.bodyRich = bodyRich
        payload.bodyHtml = bodyHtml
      }

      const result = await updateLetter(payload)

      if (!result.success) {
        toast.error(t("edit.errors.saveFailed"), {
          description: result.error?.message,
        })
        return
      }

      toast.success(t("edit.saved.title"), {
        description: t("edit.saved.description"),
      })
      router.push({ pathname: "/letters/[id]", params: { id: letterId } })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
          {t("editor.titleLabel")}
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("editor.titlePlaceholder")}
          className="border-2 border-charcoal font-mono"
          style={{ borderRadius: "2px" }}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
          {t("editor.messageLabel")}
        </label>
        <div className="border-2 border-charcoal bg-white p-3" style={{ borderRadius: "2px" }}>
          <LetterEditor
            content={initialBodyRich ?? initialBodyHtml}
            placeholder={t("editor.messagePlaceholder")}
            showCharCount
            onChange={(json, html) => {
              setBodyRich(json)
              setBodyHtml(html)
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-2 border-charcoal font-mono text-xs uppercase"
          onClick={() => router.push({ pathname: "/letters/[id]", params: { id: letterId } })}
        >
          <X className="h-4 w-4" />
          {t("edit.cancel")}
        </Button>
        <Button
          type="button"
          className="gap-2 font-mono text-xs uppercase"
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          {isSaving ? t("edit.saving") : t("edit.save")}
        </Button>
      </div>
    </div>
  )
}

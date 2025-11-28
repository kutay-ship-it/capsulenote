"use client"

import { useTransition } from "react"
import { exportUserData } from "@/server/actions/gdpr"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function ExportDataButton() {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("privacy.export")

  const handleExport = () => {
    startTransition(async () => {
      try {
        const result = await exportUserData()

        if (!result.success) {
          toast.error(t("toast.error.title"), {
            description: result.error.message,
          })
          return
        }

        // Trigger download
        const link = document.createElement("a")
        link.href = result.data.downloadUrl
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success(t("toast.success.title"), {
          description: t("toast.success.description", { filename: result.data.filename }),
        })
      } catch (error) {
        console.error("[Export Data] Unexpected error:", error)
        toast.error(t("toast.error.title"), {
          description: t("toast.error.description"),
        })
      }
    })
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("loading")}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {t("button")}
        </>
      )}
    </Button>
  )
}

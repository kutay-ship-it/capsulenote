"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/routing"
import { deleteUserAccount } from "@/server/actions/gdpr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function DeleteDataButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const t = useTranslations("privacy.delete")

  const isConfirmed = confirmText === "DELETE"

  const handleDelete = () => {
    if (!isConfirmed) return

    startTransition(async () => {
      try {
        const result = await deleteUserAccount()

        if (!result.success) {
          toast.error(t("toast.error.title"), {
            description: result.error.message,
          })
          return
        }

        // Success - user will be signed out by Clerk
        toast.success(t("toast.success.title"), {
          description: t("toast.success.description"),
        })

        // Redirect to homepage after a brief delay
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 2000)
      } catch (error) {
        console.error("[Delete Data] Unexpected error:", error)
        toast.error(t("toast.error.title"), {
          description: t("toast.error.description"),
        })
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("button")}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("dialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <p className="font-semibold text-foreground">
              {t("dialog.warning")}
            </p>

            <div className="space-y-2">
              <p className="font-medium text-foreground">{t("dialog.willBeDeleted.title")}</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t("dialog.willBeDeleted.items.profile")}</li>
                <li>{t("dialog.willBeDeleted.items.letters")}</li>
                <li>{t("dialog.willBeDeleted.items.subscription")}</li>
                <li>{t("dialog.willBeDeleted.items.usage")}</li>
                <li>{t("dialog.willBeDeleted.items.auth")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">{t("dialog.willBeRetained.title")}</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t("dialog.willBeRetained.items.payments")}</li>
                <li>{t("dialog.willBeRetained.items.audit")}</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-semibold text-yellow-900 mb-2">{t("dialog.beforeProceeding.title")}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>{t("dialog.beforeProceeding.items.export")}</li>
                <li>{t("dialog.beforeProceeding.items.subscription")}</li>
                <li>{t("dialog.beforeProceeding.items.signOut")}</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <p className="font-semibold text-foreground">
                {t("dialog.confirmPrompt", { keyword: <span className="font-mono bg-muted px-2 py-1 rounded">DELETE</span> })}
              </p>
              <Input
                type="text"
                placeholder={t("dialog.confirmPlaceholder")}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                disabled={isPending}
                className="font-mono"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("cancel")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("loading")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("confirmButton")}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

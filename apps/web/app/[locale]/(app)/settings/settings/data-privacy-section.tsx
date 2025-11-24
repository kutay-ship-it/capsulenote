"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Trash2, Shield, AlertTriangle } from "lucide-react"
import { exportUserData, deleteUserData } from "@/server/actions/gdpr"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"

export function DataPrivacySection() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const t = useTranslations("settings.dataPrivacy")

  const handleExportData = async () => {
    try {
      setIsExporting(true)

      const result = await exportUserData()

      if (result.success) {
        // Create a download link
        const link = document.createElement("a")
        link.href = result.data.downloadUrl
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        alert(t("exportSuccess", { filename: result.data.filename }))
      } else {
        alert(t("exportFailed", { message: result.error.message }))
      }
    } catch (error) {
      alert(t("exportError"))
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true)

      const result = await deleteUserData()

      if (result.success) {
        alert(t("deleteSuccess"))

        // Redirect to homepage after a brief delay
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        alert(t("deleteFailed", { message: result.error.message }))
        setIsDeleting(false)
      }
    } catch (error) {
      alert(t("deleteError"))
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>{t("title")}</CardTitle>
        </div>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">{t("exportTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("exportDescription")}
            </p>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              className="mt-3"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? t("exporting") : t("exportButton")}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-destructive">{t("deleteTitle")}</h3>
            <div className="mt-2 rounded-lg bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{t("deleteWarning")}</p>
                  <p className="text-muted-foreground">
                    {t("deleteIntro")}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>{t("deleteList.letters")}</li>
                    <li>{t("deleteList.subscriptions")}</li>
                    <li>{t("deleteList.deliveries")}</li>
                    <li>{t("deleteList.profile")}</li>
                    <li>{t("deleteList.signOut")}</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    {t("deleteRetention")}
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="mt-4"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? t("deleting") : t("deleteButton")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      {t("confirmDescription")}
                    </p>
                    <p className="font-medium text-foreground">
                      {t("confirmWarning")}
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("confirmCancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("confirmDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start border-t pt-6">
        <p className="text-sm text-muted-foreground">
          {t("privacyFooter")}{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            {t("privacyPolicy")}
          </a>{" "}
          {t("and")}{" "}
          <a href="/terms" className="underline hover:text-foreground">
            {t("termsOfService")}
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}

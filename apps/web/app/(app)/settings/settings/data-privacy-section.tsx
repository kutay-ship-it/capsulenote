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
import { useRouter } from "next/navigation"

export function DataPrivacySection() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

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

        alert(`Data exported successfully to ${result.data.filename}`)
      } else {
        alert(`Export failed: ${result.error.message}`)
      }
    } catch (error) {
      alert("Export failed: An unexpected error occurred. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true)

      const result = await deleteUserData()

      if (result.success) {
        alert("Your account and all associated data have been permanently deleted.")

        // Redirect to homepage after a brief delay
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        alert(`Deletion failed: ${result.error.message}`)
        setIsDeleting(false)
      }
    } catch (error) {
      alert("Deletion failed: An unexpected error occurred. Please contact support.")
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Data & Privacy</CardTitle>
        </div>
        <CardDescription>
          Manage your personal data and privacy preferences in compliance with GDPR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Export Your Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Download a complete copy of your personal data, including all letters,
              deliveries, and account information in JSON format.
            </p>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              className="mt-3"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-destructive">Delete Your Account</h3>
            <div className="mt-2 rounded-lg bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">This action cannot be undone.</p>
                  <p className="text-muted-foreground">
                    Deleting your account will:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Permanently delete all your letters and content</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Remove all scheduled deliveries</li>
                    <li>Delete your profile and preferences</li>
                    <li>Sign you out of all devices</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Payment records will be anonymized and retained for 7 years for tax
                    compliance as required by law.
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
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      This will permanently delete your account and remove all your data
                      from our servers. This action cannot be undone.
                    </p>
                    <p className="font-medium text-foreground">
                      All your letters, scheduled deliveries, and account settings will
                      be permanently lost.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Your privacy is important to us. For more information, see our{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}

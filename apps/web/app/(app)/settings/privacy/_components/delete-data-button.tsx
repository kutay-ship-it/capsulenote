/**
 * Delete Data Button Component
 *
 * Client component for GDPR data deletion (Right to be Forgotten).
 * Implements multi-step confirmation to prevent accidental deletion.
 *
 * Confirmation steps:
 * 1. Click "Delete My Data" button
 * 2. Warning dialog with explanation
 * 3. Type "DELETE" to confirm understanding
 * 4. Final confirmation button
 * 5. Execute deletion and sign out
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteUserData } from "@/server/actions/gdpr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DeleteDataButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isConfirmed = confirmText === "DELETE"

  const handleDelete = async () => {
    if (!isConfirmed) return

    try {
      setIsDeleting(true)

      const result = await deleteUserData()

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: result.error.message,
        })
        setIsDeleting(false)
        return
      }

      // Success - user will be signed out by Clerk
      toast({
        title: "Account Deleted",
        description: "Your data has been permanently deleted. You will now be signed out.",
      })

      // Redirect to homepage after a brief delay
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("[Delete Data] Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "An unexpected error occurred. Please contact support for assistance.",
      })
      setIsDeleting(false)
    }
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
          Delete My Data
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Permanently Delete Your Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <p className="font-semibold text-foreground">
              This action is permanent and cannot be undone.
            </p>

            <div className="space-y-2">
              <p className="font-medium text-foreground">The following will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your profile and account settings</li>
                <li>All letters and their scheduled deliveries</li>
                <li>Subscription records</li>
                <li>Usage statistics and shipping addresses</li>
                <li>Your authentication account</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">What will be retained:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Payment records (anonymized, required by law for 7 years)</li>
                <li>Audit logs (required for security and compliance)</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-semibold text-yellow-900 mb-2">Before proceeding:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>Export your data first if you want to keep a copy</li>
                <li>Active subscriptions will be canceled immediately</li>
                <li>You will be signed out automatically</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <p className="font-semibold text-foreground">
                Type <span className="font-mono bg-muted px-2 py-1 rounded">DELETE</span> to confirm:
              </p>
              <Input
                type="text"
                placeholder="Type DELETE to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                disabled={isDeleting}
                className="font-mono"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Permanently Delete Everything
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

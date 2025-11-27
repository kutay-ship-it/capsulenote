"use client"

import * as React from "react"
import { CheckCircle2, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { broadcastCreditsUpdated } from "@/hooks/use-credits-broadcast"

export default function CreditsSuccessPage() {
  const [canClose, setCanClose] = React.useState(false)

  React.useEffect(() => {
    // Broadcast to all other tabs that credits have been updated
    broadcastCreditsUpdated()

    // Check if window.close() will work (only works if we opened this tab)
    // window.opener will be set if this tab was opened via window.open()
    setCanClose(typeof window !== "undefined" && window.opener !== null)
  }, [])

  const handleClose = () => {
    window.close()
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Success Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-teal-400/30" />
            <div className="relative rounded-full bg-teal-500/10 p-4">
              <CheckCircle2 className="h-16 w-16 text-teal-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
          Payment Successful!
        </h1>

        {/* Description */}
        <p className="mb-8 text-gray-600">
          Your credits have been added to your account. You can now continue
          writing your letter.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {canClose ? (
            <>
              <Button
                onClick={handleClose}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <X className="mr-2 h-4 w-4" />
                Close This Tab
              </Button>
              <p className="text-sm text-gray-500">
                Your original tab has been updated with your new credits.
              </p>
            </>
          ) : (
            <>
              <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                <Link href="/letters/new">Continue Writing</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/journey">Go to Dashboard</Link>
              </Button>
            </>
          )}
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-xs text-gray-400">
          If your credits don&apos;t appear, try refreshing the page.
        </p>
      </div>
    </div>
  )
}

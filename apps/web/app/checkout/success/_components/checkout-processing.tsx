/**
 * Checkout Processing Component
 *
 * Shown when subscription webhook hasn't processed yet.
 * Implements client-side polling fallback with loading animation.
 *
 * Client Component - uses hooks for polling logic.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { checkSubscriptionStatus } from "@/server/actions/billing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CheckoutProcessingProps {
  sessionId: string
}

export function CheckoutProcessing({ sessionId }: CheckoutProcessingProps) {
  const router = useRouter()
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 15 // Poll for up to 30 seconds (15 polls × 2s interval)

  useEffect(() => {
    // Client-side polling fallback
    const pollInterval = setInterval(async () => {
      try {
        const result = await checkSubscriptionStatus()

        if (result.success && result.data.hasSubscription) {
          // Subscription found! Refresh page to show success state
          router.refresh()
          clearInterval(pollInterval)
        } else {
          setPollCount((prev) => {
            const newCount = prev + 1
            if (newCount >= maxPolls) {
              // Stop polling after max attempts
              clearInterval(pollInterval)
            }
            return newCount
          })
        }
      } catch (error) {
        console.error("[Checkout] Polling error:", error)
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval)
  }, [router, maxPolls])

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl">Processing Your Subscription</CardTitle>
          <CardDescription className="text-base">
            {pollCount < maxPolls
              ? "Please wait while we activate your account..."
              : "Taking longer than expected. Your subscription will be ready shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center text-sm text-muted-foreground">
            <p>This usually takes just a few seconds.</p>
            {pollCount >= 10 && (
              <div className="space-y-2">
                <p className="font-medium">Still processing?</p>
                <p>
                  You can safely navigate away - we'll send you an email confirmation once your
                  subscription is active.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pollCount >= 10 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            You can check your subscription status in settings
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard"
              className="text-sm text-primary hover:underline"
            >
              Go to Dashboard
            </a>
            <a
              href="/settings/billing"
              className="text-sm text-primary hover:underline"
            >
              View Billing Settings
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

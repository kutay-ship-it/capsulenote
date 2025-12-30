"use client"

/**
 * Subscribe Error Boundary
 *
 * Catches Server Component errors in the subscribe route and shows
 * a user-friendly error UI with recovery options.
 *
 * Common causes:
 * - Missing Stripe price IDs in environment
 * - Database connection issues
 * - Translation loading failures
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SubscribeError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Subscribe Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Error Alert */}
        <Alert variant="destructive" className="border-4">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="font-mono text-lg">
            Unable to Load Pricing
          </AlertTitle>
          <AlertDescription className="font-mono text-sm">
            We encountered an issue loading the subscription page. This is usually temporary.
            {error.digest && (
              <span className="mt-2 block text-xs opacity-70">
                Error ID: {error.digest}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Recovery Actions */}
        <Card className="border-4 border-charcoal shadow-lg">
          <CardHeader>
            <CardTitle className="text-center font-mono text-2xl uppercase tracking-wide">
              What You Can Do
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Try Again */}
            <Button
              onClick={reset}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {/* Go Home */}
            <Button
              onClick={() => router.push("/")}
              size="lg"
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>

            {/* Contact Support */}
            <Button asChild size="lg" variant="ghost" className="w-full">
              <a href="mailto:support@capsulenote.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="rounded-lg border-2 border-charcoal bg-off-white p-4">
          <p className="font-mono text-sm text-charcoal">
            <strong>Need help?</strong>
            <br />
            If this problem persists, please email us at{" "}
            <a
              href="mailto:support@capsulenote.com"
              className="underline hover:opacity-70"
            >
              support@capsulenote.com
            </a>
            {error.digest && (
              <>
                <br />
                Include this error ID: <code className="rounded bg-gray-200 px-1">{error.digest}</code>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

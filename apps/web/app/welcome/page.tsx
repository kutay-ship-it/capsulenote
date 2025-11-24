"use client"

/**
 * Welcome Page - Draft Migration
 *
 * Shown after sign-up to migrate localStorage draft to database.
 * Part of the progressive disclosure anonymous user journey.
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { getAnonymousDraft, clearAnonymousDraft } from "@/lib/localStorage-letter"
import { migrateAnonymousDraft } from "@/server/actions/migrate-anonymous-draft"

export default function WelcomePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'migrating' | 'success' | 'no-draft' | 'error'>('checking')
  const [letterId, setLetterId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const checkAndMigrateDraft = async () => {
      // Check for draft in localStorage
      const draft = getAnonymousDraft()

      if (!draft || draft.body.trim().length === 0) {
        setStatus('no-draft')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Migrate draft
      setStatus('migrating')

      try {
        const result = await migrateAnonymousDraft({
          title: draft.title,
          body: draft.body,
        })

        if (result.success) {
          setLetterId(result.data.letterId)
          setStatus('success')

          // Clear localStorage draft
          clearAnonymousDraft()

          // Redirect to letter after 3 seconds
          setTimeout(() => {
            router.push(`/letters/${result.data.letterId}`)
          }, 3000)
        } else {
          setStatus('error')
          setErrorMessage(result.error.message)
        }
      } catch (error) {
        setStatus('error')
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    }

    checkAndMigrateDraft()
  }, [router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Card
        className="max-w-md w-full border-2 border-charcoal shadow-lg bg-white"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-8">
          {status === 'checking' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-charcoal mx-auto" />
              <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal">
                Checking for draft...
              </h2>
            </div>
          )}

          {status === 'migrating' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-charcoal mx-auto" />
              <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal">
                Saving your letter...
              </h2>
              <p className="font-mono text-sm text-gray-secondary">
                We're securely saving your draft to your account.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-6">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow mx-auto"
                style={{ borderRadius: "2px" }}
              >
                <Check className="h-8 w-8 text-charcoal" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
                  Welcome to Capsule Note! 🎉
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  Your letter has been saved successfully. Redirecting...
                </p>
              </div>
              <div className="border-t-2 border-charcoal pt-6">
                <p className="font-mono text-xs text-gray-secondary mb-4">
                  Next steps:
                </p>
                <ul className="space-y-2 font-mono text-xs text-gray-secondary text-left">
                  <li>✓ Review and edit your letter</li>
                  <li>✓ Schedule when to receive it</li>
                  <li>✓ Choose delivery method (email or mail)</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'no-draft' && (
            <div className="text-center space-y-6">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-bg-blue-light mx-auto"
                style={{ borderRadius: "2px" }}
              >
                <Check className="h-8 w-8 text-charcoal" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
                  Welcome to Capsule Note!
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  Let's get started with your first letter.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-coral mx-auto"
                style={{ borderRadius: "2px" }}
              >
                <AlertCircle className="h-8 w-8 text-white" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal">
                  Oops! Something Went Wrong
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  {errorMessage}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/letters/new')}
                  className="flex-1 border-2 border-charcoal bg-charcoal font-mono text-sm uppercase hover:bg-gray-800"
                  style={{ borderRadius: "2px" }}
                >
                  Start New Letter
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1 border-2 border-charcoal font-mono text-sm uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

/**
 * Welcome Page - Post-Signup Landing
 *
 * Shown after sign-up to welcome user and direct them to letter editor.
 * localStorage draft will be pre-filled in the editor for user to review/edit before saving.
 */

import { useEffect, useState } from "react"
import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { getAnonymousDraft } from "@/lib/localStorage-letter"
import { useTranslations } from "next-intl"

export default function WelcomePage() {
  const t = useTranslations("welcome")
  const [status, setStatus] = useState<'checking' | 'ready'>('checking')
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    // Check if user has localStorage draft to pre-fill
    const draft = getAnonymousDraft()
    setHasDraft(draft !== null && draft.body.trim().length > 0)
    setStatus('ready')
  }, [])

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
                Getting ready...
              </h2>
            </div>
          )}

          {status === 'ready' && (
            <div className="text-center space-y-6">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow mx-auto"
                style={{ borderRadius: "2px" }}
              >
                <Sparkles className="h-8 w-8 text-charcoal" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
                  Welcome to Capsule Note!
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  {hasDraft
                    ? "Your letter is ready to finish and send."
                    : "Let's write your first letter to the future."}
                </p>
              </div>

              <div className="border-t-2 border-charcoal pt-6 space-y-4">
                <Button
                  asChild
                  className="w-full border-2 border-charcoal bg-charcoal font-mono text-sm font-bold uppercase text-white hover:bg-gray-800"
                  style={{ borderRadius: "2px" }}
                >
                  <Link href="/letters/new">
                    {hasDraft ? "Continue My Letter" : "Write My First Letter"}
                  </Link>
                </Button>
                <p className="font-mono text-xs text-charcoal/60">
                  {hasDraft
                    ? "Review and edit before sending"
                    : "Create a message to your future self"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

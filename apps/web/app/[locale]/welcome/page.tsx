"use client"

/**
 * Welcome Page - Post-Signup Landing
 *
 * Shown after sign-up to welcome user and direct them to letter editor.
 * localStorage draft will be pre-filled in the editor for user to review/edit before saving.
 */

import { useMemo } from "react"
import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { getAnonymousDraft } from "@/lib/localStorage-letter"
import { useTranslations } from "next-intl"

export default function WelcomePage() {
  const t = useTranslations("welcome")

  // Check localStorage synchronously - no loading state needed
  const hasDraft = useMemo(() => {
    if (typeof window === "undefined") return false
    const draft = getAnonymousDraft()
    return draft !== null && draft.body.trim().length > 0
  }, [])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Card
        className="max-w-md w-full border-2 border-charcoal shadow-lg bg-white"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div
              className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow mx-auto"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-8 w-8 text-charcoal" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
                {t("page.title")}
              </h2>
              <p className="font-mono text-sm text-gray-secondary">
                {hasDraft
                  ? t("page.hasDraft.subtitle")
                  : t("page.noDraft.subtitle")}
              </p>
            </div>

            <div className="border-t-2 border-charcoal pt-6 space-y-4">
              <Button
                asChild
                className="w-full border-2 border-charcoal bg-charcoal font-mono text-sm font-bold uppercase text-white hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                <Link href="/letters/new">
                  {hasDraft
                    ? t("page.hasDraft.button")
                    : t("page.noDraft.button")}
                </Link>
              </Button>
              <p className="font-mono text-xs text-charcoal/60">
                {hasDraft ? t("page.hasDraft.hint") : t("page.noDraft.hint")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

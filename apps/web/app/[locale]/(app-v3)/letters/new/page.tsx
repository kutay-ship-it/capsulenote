import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { LetterEditorWrapper } from "@/components/v3/letter-editor-wrapper"
import { getDeliveryEligibility } from "@/server/actions/entitlements"

export default async function NewLetterV3Page() {
  // Fetch user's delivery eligibility (credits, subscription status)
  const eligibility = await getDeliveryEligibility()
  const t = await getTranslations("letters")

  return (
    <div className="container">
      {/* Header - matches letters page pattern */}
      <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link href="/letters">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-4 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("detail.back")}
            </Button>
          </Link>
          <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
            {t("new.heading")}
          </h1>
          <p className="font-mono text-sm text-charcoal/70">
            {t("new.subtitle")}
          </p>
        </div>
      </header>

      {/* Editor Section */}
      <section className="pb-12">
        <Suspense fallback={<div className="h-96 animate-pulse bg-charcoal/5 rounded" />}>
          <LetterEditorWrapper initialEligibility={eligibility} />
        </Suspense>
      </section>
    </div>
  )
}

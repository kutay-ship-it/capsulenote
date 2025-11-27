import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { DashboardLetterEditor } from "@/components/dashboard-letter-editor"

export default async function NewLetterPage() {
  const t = await getTranslations("letters")

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:py-12 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            {t("new.badge")}
          </Badge>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
            {t("new.title")}
          </h1>
          <p className="font-mono text-sm leading-relaxed text-gray-secondary sm:text-base">
            {t("new.description")}
          </p>
        </div>

        {/* Single-page Letter Editor with scheduling built-in */}
        <DashboardLetterEditor />
      </div>
    </div>
  )
}

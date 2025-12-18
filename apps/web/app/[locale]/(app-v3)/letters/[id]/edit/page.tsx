import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Link, type Locale } from "@/i18n/routing"
import { getLetter } from "@/server/actions/letters"

import { EditLetterFormV3 } from "./_components/EditLetterFormV3"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    locale: Locale
    id: string
  }>
}

export default async function EditLetterV3Page({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: "letters" })

  let letter
  try {
    letter = await getLetter(id)
  } catch {
    notFound()
  }

  const prefix = locale === "en" ? "" : `/${locale}`
  const hasSealedPhysicalMail = letter.deliveries.some(
    (d) => d.channel === "mail" && d.mailDelivery?.sealedAt != null
  )
  const canEdit =
    !hasSealedPhysicalMail &&
    letter.deliveries.every((d) => d.status === "failed" || d.status === "canceled")

  if (!canEdit) {
    redirect(`${prefix}/letters/${id}`)
  }

  return (
    <div className="container">
      <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link href={{ pathname: "/letters/[id]", params: { id } }}>
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
            {t("edit.heading")}
          </h1>
          <p className="font-mono text-sm text-charcoal/70">
            {t("edit.subtitle")}
          </p>
        </div>
      </header>

      <section className="pb-12">
        <EditLetterFormV3
          letterId={id}
          initialTitle={letter.title}
          initialBodyRich={letter.bodyRich as Record<string, unknown> | null}
          initialBodyHtml={letter.bodyHtml}
        />
      </section>
    </div>
  )
}

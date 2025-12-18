import type { Metadata } from "next"
import { BookOpen, FileText, Home, Lightbulb, Mail, PenLine } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "errors" })

  return {
    title: t("notFound.metaTitle"),
    description: t("notFound.metaDescription"),
    robots: { index: false, follow: true },
  }
}

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "errors" })

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div
        className="w-full max-w-2xl border-2 border-charcoal bg-white p-8 shadow-lg"
        style={{
          borderRadius: "2px",
          boxShadow: "rgb(56, 56, 56) -6px 6px 0px 0px",
        }}
      >
        {/* 404 Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-4xl font-bold text-charcoal">404</span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          {t("notFound.title")}
        </h1>

        {/* Description */}
        <p className="mb-8 text-center font-mono text-sm text-gray-secondary md:text-base">
          {t("notFound.description")}
        </p>

        {/* Primary CTA */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-charcoal transition-all hover:bg-duck-blue hover:shadow-none"
            style={{
              borderRadius: "2px",
              boxShadow: "rgb(56, 56, 56) -4px 4px 0px 0px",
            }}
          >
            <Home className="h-4 w-4" />
            {t("notFound.returnHome")}
          </Link>
        </div>

        {/* Helpful Links Section */}
        <div className="border-2 border-charcoal bg-off-white p-6" style={{ borderRadius: "2px" }}>
          <h2 className="mb-4 text-center font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
            {t("notFound.helpfulLinks")}
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <HelpfulLink href="/templates" icon={FileText} label={t("notFound.links.templates")} />
            <HelpfulLink href="/guides" icon={BookOpen} label={t("notFound.links.guides")} />
            <HelpfulLink href="/prompts" icon={Lightbulb} label={t("notFound.links.prompts")} />
            <HelpfulLink href="/blog" icon={PenLine} label={t("notFound.links.blog")} />
            <HelpfulLink href="/write-letter" icon={Mail} label={t("notFound.links.writeLetter")} />
            <HelpfulLink href="/contact" icon={Mail} label={t("notFound.links.contact")} />
          </div>
        </div>

        {/* Search Suggestion */}
        <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
          {t("notFound.specific")}{" "}
          <Link href="/guides" className="font-bold text-charcoal underline hover:text-duck-blue">
            {t("notFound.browseGuides")}
          </Link>{" "}
          {t("notFound.or")}{" "}
          <Link href="/templates" className="font-bold text-charcoal underline hover:text-duck-blue">
            {t("notFound.exploreTemplates")}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function HelpfulLink({
  href,
  icon: Icon,
  label,
}: {
  href: Parameters<typeof Link>[0]["href"]
  icon: typeof Home
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 border-2 border-charcoal bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-charcoal transition-all hover:bg-duck-yellow"
      style={{ borderRadius: "2px" }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Link>
  )
}


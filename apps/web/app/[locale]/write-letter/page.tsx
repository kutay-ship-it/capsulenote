/**
 * Anonymous Write Letter Page
 *
 * Progressive disclosure pattern for growth:
 * - Allows immediate writing (no sign-up)
 * - Auto-saves to localStorage
 * - Prompts sign-up after 50+ words
 * - Expected conversion: 3% → 21% (7x improvement)
 */

import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AnonymousLetterTryout } from "@/components/anonymous-letter-tryout"
import { getTemplate } from "@/lib/seo/template-content"
import { decodeTemplateId } from "@/lib/seo/template-ids"
import { templateCategories, type TemplateCategory } from "@/lib/seo/content-registry"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function decodeLegacyTemplateParam(value: string): { category: TemplateCategory; slug: string } | null {
  for (const category of templateCategories) {
    const prefix = `${category}-`
    if (value.startsWith(prefix)) {
      const slug = value.slice(prefix.length)
      return slug ? { category, slug } : null
    }
  }
  return null
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const t = await getTranslations({ locale, namespace: "forms.writeLetter" })

  // Check if there are tracking/template/prompt params that would cause index bloat
  const hasIndexableParams = !!(
    resolvedSearchParams.prompt ||
    resolvedSearchParams.template ||
    resolvedSearchParams.templateId ||
    resolvedSearchParams.utm_source ||
    resolvedSearchParams.utm_medium ||
    resolvedSearchParams.utm_campaign
  )

  // Always canonical to the clean base URL (no query params) to prevent index bloat
  const canonicalPath = locale === "en" ? "/write-letter" : `/${locale}/write-letter`

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    // noindex parameterized variants to prevent duplicate content
    ...(hasIndexableParams && { robots: "noindex, follow" }),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      url: `${appUrl}${canonicalPath}`,
    },
    alternates: {
      canonical: `${appUrl}${canonicalPath}`,
      languages: {
        en: `${appUrl}/write-letter`,
        tr: `${appUrl}/tr/write-letter`,
        "x-default": `${appUrl}/write-letter`,
      },
    },
  }
}

export default async function WriteLetterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const t = await getTranslations("forms.writeLetter")

  const prompt = firstSearchParam(resolvedSearchParams.prompt)
  const templateId = firstSearchParam(resolvedSearchParams.templateId)
  const legacyTemplate = firstSearchParam(resolvedSearchParams.template)

  let initialTitle: string | undefined
  let initialBody: string | undefined

  // Template selection (preferred) → use a localized sample opening
  const templateKey = templateId
    ? decodeTemplateId(templateId)
    : legacyTemplate
      ? decodeLegacyTemplateParam(legacyTemplate)
      : null

  if (templateKey) {
    const template = getTemplate(templateKey.category, templateKey.slug)
    if (template) {
      const localized = template[locale === "tr" ? "tr" : "en"]
      initialTitle = localized.title
      initialBody = localized.sampleOpening
    }
  } else if (prompt?.trim()) {
    // Prompt selection → seed the editor with the prompt
    initialBody = prompt.trim()
  }

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-5xl font-normal text-charcoal uppercase tracking-wide">
            {t("hero.title")}
          </h1>
          <p className="font-mono text-lg text-gray-secondary uppercase max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Anonymous Tryout Editor */}
        <AnonymousLetterTryout initialTitle={initialTitle} initialBody={initialBody} />

        {/* Trust Indicators */}
        <section className="mt-16">
          <div
            className="bg-bg-blue-light border-2 border-charcoal p-8 text-center"
            style={{ borderRadius: "2px" }}
          >
            <h3 className="font-mono text-2xl text-charcoal uppercase mb-6">
              {t("trustSection.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.encryption.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.encryption.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.encryption.description")}
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.delivery.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.delivery.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.delivery.description")}
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.free.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.free.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.free.description")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react"
import { notFound, permanentRedirect } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { RelatedContent } from "@/components/seo/related-content"
import { guideSlugs } from "@/lib/seo/content-registry"
import { getGuide } from "@/lib/seo/guide-content"
import { getRelatedContent, toRelatedItems } from "@/lib/seo/internal-links"
import { SEO_LOCALES, getGuidePath, getGuideSlug, getGuideSlugInfo, normalizeSeoLocale } from "@/lib/seo/localized-slugs"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = []
  for (const locale of SEO_LOCALES) {
    for (const slug of guideSlugs) {
      params.push({ locale, slug: getGuideSlug(locale, slug) })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  const seoLocale = normalizeSeoLocale(locale)
  const slugInfo = getGuideSlugInfo(seoLocale, slug)
  if (!slugInfo) {
    return { title: "Not Found" }
  }

  const guide = getGuide(slugInfo.id)
  if (!guide) {
    return { title: "Not Found" }
  }

  const data = guide[locale === "tr" ? "tr" : "en"]
  const canonicalPath = getGuidePath(seoLocale, slugInfo.id)

  return {
    title: `${data.title} | Capsule Note Guides`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "article",
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
      url: `${appUrl}${seoLocale === "en" ? "" : "/" + seoLocale}${canonicalPath}`,
    },
    alternates: {
      canonical: `${appUrl}${seoLocale === "en" ? "" : "/" + seoLocale}${canonicalPath}`,
      languages: {
        en: `${appUrl}${getGuidePath("en", slugInfo.id)}`,
        tr: `${appUrl}/tr${getGuidePath("tr", slugInfo.id)}`,
        "x-default": `${appUrl}${getGuidePath("en", slugInfo.id)}`,
      },
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const seoLocale = normalizeSeoLocale(locale)
  const slugInfo = getGuideSlugInfo(seoLocale, slug)
  if (!slugInfo) {
    notFound()
  }

  // Redirect non-canonical slugs to canonical version
  if (!slugInfo.isCanonical) {
    const canonicalPath = getGuidePath(seoLocale, slugInfo.id)
    const localePrefix = seoLocale === "en" ? "" : `/${seoLocale}`
    permanentRedirect(`${localePrefix}${canonicalPath}`)
  }

  const guide = getGuide(slugInfo.id)
  if (!guide) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const data = guide[locale === "tr" ? "tr" : "en"]
  const currentPath = getGuidePath(seoLocale, slugInfo.id)

  // Get related content using automated internal linking
  const relatedLinks = getRelatedContent("guide", slugInfo.id, undefined, locale === "tr" ? "tr" : "en")
  const relatedItems = toRelatedItems(relatedLinks, locale === "tr" ? "tr" : "en")

  return (
    <LegalPageLayout>
      {/* Schema.org */}
      <ArticleSchema
        locale={locale}
        title={data.title}
        description={data.description}
        datePublished={guide.datePublished}
        dateModified={guide.dateModified}
        authorName="Capsule Note Team"
        url={`${appUrl}${seoLocale === "en" ? "" : "/" + seoLocale}${currentPath}`}
      />
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: isEnglish ? "Guides" : "Rehberler", href: "/guides" },
          { name: data.title, href: currentPath },
        ]}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "All Guides" : "Tüm Rehberler"}
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-10">
        <h1 className={cn("font-mono text-3xl md:text-4xl text-charcoal mb-4", uppercaseClass)}>
          {data.title}
        </h1>
        <p className="font-mono text-base text-charcoal/70 mb-6">
          {data.description}
        </p>
        <div className="flex items-center gap-6 text-sm font-mono text-charcoal/50">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {guide.readTime} {isEnglish ? "min read" : "dk okuma"}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {isEnglish ? "Updated" : "Güncellendi"}: {new Date(guide.dateModified).toLocaleDateString(locale)}
          </span>
        </div>
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        {data.content.map((paragraph, index) => {
          // Handle markdown-style headings
          if (paragraph.startsWith("## ")) {
            return (
              <h2 key={index} className="font-mono text-xl font-bold text-charcoal mt-8 mb-4">
                {paragraph.replace("## ", "")}
              </h2>
            )
          }
          return (
            <p key={index} className="font-mono text-base text-charcoal/80 leading-relaxed mb-6">
              {paragraph}
            </p>
          )
        })}
      </article>

      {/* Related Content Section */}
      {relatedItems.length > 0 && (
        <RelatedContent
          items={relatedItems}
          title={isEnglish ? "Related Content" : "İlgili İçerikler"}
          locale={locale}
          variant="compact"
        />
      )}

      {/* CTA */}
      <div className="mt-12 pt-8 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "p-8 border-2 border-charcoal bg-teal-primary/10",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Ready to Write Your Letter?" : "Mektubunuzu Yazmaya Hazır mısınız?"}
          </h2>
          <p className="font-mono text-sm text-charcoal/70 mb-6">
            {isEnglish
              ? "Put what you've learned into practice. Start writing a letter to your future self today."
              : "Öğrendiklerinizi pratiğe dökün. Bugün gelecekteki kendinize bir mektup yazmaya başlayın."}
          </p>
          <Link
            href="/write-letter"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "border-2 border-charcoal bg-charcoal text-white",
              "font-mono text-sm tracking-wide",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              uppercaseClass
            )}
            style={{ borderRadius: "2px" }}
          >
            {isEnglish ? "Start Writing" : "Yazmaya Başla"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </LegalPageLayout>
  )
}

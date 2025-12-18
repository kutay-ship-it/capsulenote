import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import {
  BookOpen,
  ArrowRight,
  Clock,
  Brain,
  Shield,
  Heart,
  Lightbulb,
  Users,
  Book,
  Mail,
  Globe,
  Briefcase,
  Home,
  Sparkles,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { getAllGuides, getFeaturedGuides, type GuidePostContent } from "@/lib/seo/guide-content"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Icon mapping from string to Lucide component
const iconMap: Record<GuidePostContent["icon"], typeof Lightbulb> = {
  lightbulb: Lightbulb,
  brain: Brain,
  clock: Clock,
  shield: Shield,
  heart: Heart,
  users: Users,
  book: Book,
  mail: Mail,
  globe: Globe,
  briefcase: Briefcase,
  home: Home,
  sparkles: Sparkles,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === "en"

  const title = isEnglish
    ? "Guides | How to Write Letters to Your Future Self"
    : "Rehberler | Gelecekteki Kendine Mektup Nasıl Yazılır"

  const description = isEnglish
    ? "Expert guides on writing letters to your future self. Learn about time capsules, privacy, mental health benefits, legacy letters, and more."
    : "Gelecekteki kendine mektup yazma konusunda uzman rehberler. Zaman kapsülleri, gizlilik, ruh sağlığı faydaları ve miras mektupları hakkında bilgi edinin."

  return {
    title,
    description,
    keywords: isEnglish
      ? ["future self guide", "time capsule guide", "letter writing tips", "legacy letter guide", "mental health journaling"]
      : ["gelecek benlik rehberi", "zaman kapsülü rehberi", "mektup yazma ipuçları"],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides`,
      languages: {
        en: `${appUrl}/guides`,
        tr: `${appUrl}/tr/guides`,
      },
    },
  }
}

export default async function GuidesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const t = {
    badge: isEnglish ? "Guides" : "Rehberler",
    title: isEnglish ? "Learn & Explore" : "Öğren ve Keşfet",
    description: isEnglish
      ? "Expert guides to help you write meaningful letters, understand the science of future-self connection, and make the most of your time capsule journey."
      : "Anlamlı mektuplar yazmanıza, gelecek benlik bağlantısının bilimini anlamanıza ve zaman kapsülü yolculuğunuzdan en iyi şekilde yararlanmanıza yardımcı olacak uzman rehberler.",
    readTime: isEnglish ? "min read" : "dk okuma",
    readGuide: isEnglish ? "Read Guide" : "Rehberi Oku",
    featured: isEnglish ? "Featured Guides" : "Öne Çıkan Rehberler",
    allGuides: isEnglish ? "All Guides" : "Tüm Rehberler",
  }

  // Get guides from centralized content registry
  const allGuides = getAllGuides()
  const featuredGuides = getFeaturedGuides()
  const nonFeaturedGuides = allGuides.filter(({ data }) => !data.featured)

  // Schema.org data
  const schemaItems = allGuides.map(({ slug, data }, index) => ({
    name: data[locale === "tr" ? "tr" : "en"]?.title || slug,
    url: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides/${slug}`,
    position: index + 1,
  }))

  return (
    <LegalPageLayout>
      {/* Schema.org structured data */}
      <ItemListSchema
        locale={locale}
        name={t.title}
        description={t.description}
        items={schemaItems}
      />
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: t.badge, href: "/guides" },
        ]}
      />

      <LegalHero
        badge={t.badge}
        title={t.title}
        description={t.description}
        icon={BookOpen}
        accentColor="blue"
      />

      {/* Featured Guides Section */}
      {featuredGuides.length > 0 && (
        <section className="mt-10">
          <h2 className={cn("font-mono text-lg text-charcoal mb-6", uppercaseClass)}>
            {t.featured}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredGuides.map(({ slug, data }) => {
              const localizedData = data[locale === "tr" ? "tr" : "en"]
              const Icon = iconMap[data.icon]

	              return (
	                <Link
	                  key={slug}
	                  href={{ pathname: "/guides/[slug]", params: { slug } }}
	                  className={cn(
	                    "group p-6 border-2 border-charcoal",
	                    "transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
	                    data.color
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-white/50 rounded-sm">
                      <Icon className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn("font-mono text-lg font-bold text-charcoal", uppercaseClass)}>
                          {localizedData.title}
                        </h3>
                      </div>
                      <p className="font-mono text-sm text-charcoal/70 leading-relaxed mb-4">
                        {localizedData.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-charcoal/50 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {data.readTime} {t.readTime}
                        </span>
                        <span className="flex items-center gap-2 text-charcoal font-mono text-sm group-hover:gap-3 transition-all">
                          {t.readGuide}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* All Guides Section */}
      <section className="mt-12">
        <h2 className={cn("font-mono text-lg text-charcoal mb-6", uppercaseClass)}>
          {t.allGuides}
        </h2>
        <div className="space-y-4">
          {nonFeaturedGuides.map(({ slug, data }) => {
            const localizedData = data[locale === "tr" ? "tr" : "en"]
            const Icon = iconMap[data.icon]

	            return (
	              <Link
	                key={slug}
	                href={{ pathname: "/guides/[slug]", params: { slug } }}
	                className={cn(
	                  "group flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-2 border-charcoal",
	                  "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
	                  data.color
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-10 w-10 text-charcoal" strokeWidth={1.5} />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={cn("font-mono text-base font-bold text-charcoal")}>
                      {localizedData.title}
                    </h3>
                    <span className="font-mono text-xs text-charcoal/50">
                      {data.readTime} {t.readTime}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
                    {localizedData.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-charcoal font-mono text-sm sm:flex-shrink-0">
                  <span className="hidden sm:inline">{t.readGuide}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mt-12 pt-10 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "relative p-8 md:p-10 border-2 border-charcoal bg-duck-blue",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-2xl md:text-3xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Stay Updated" : "Güncel Kalın"}
          </h2>
          <p className="font-mono text-sm md:text-base text-charcoal/80 mb-6 max-w-xl">
            {isEnglish
              ? "New guides and writing tips delivered to your inbox. Join our community of thoughtful writers."
              : "Yeni rehberler ve yazma ipuçları gelen kutunuza teslim edilir. Düşünceli yazarlar topluluğumuza katılın."}
          </p>
          <Link
            href="/write-letter"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "border-2 border-charcoal bg-charcoal text-white",
              "font-mono text-sm tracking-wide",
              "shadow-[2px_2px_0_theme(colors.charcoal)]",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              uppercaseClass
            )}
            style={{ borderRadius: "2px" }}
          >
            {isEnglish ? "Start Writing" : "Yazmaya Başla"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </LegalPageLayout>
  )
}

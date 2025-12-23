import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Newspaper, ArrowRight, Calendar, Clock } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { getAllBlogPosts, getFeaturedBlogPosts } from "@/lib/seo/blog-content"
import { getBlogSlug, normalizeSeoLocale } from "@/lib/seo/localized-slugs"
import type { BlogSlug } from "@/lib/seo/content-registry"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Category to color mapping
const categoryColors: Record<string, string> = {
  // Original categories
  inspiration: "bg-duck-yellow/20 text-charcoal",
  ideas: "bg-teal-primary/20 text-charcoal",
  guides: "bg-duck-blue/20 text-charcoal",
  features: "bg-purple-100 text-charcoal",
  tips: "bg-pink-100 text-charcoal",
  // New cluster-based categories
  "future-self": "bg-duck-yellow/20 text-charcoal",
  psychology: "bg-teal-primary/20 text-charcoal",
  "letter-craft": "bg-duck-blue/20 text-charcoal",
  "life-events": "bg-purple-100 text-charcoal",
  privacy: "bg-pink-100 text-charcoal",
  "use-cases": "bg-orange-100 text-charcoal",
}

const categoryLabels: Record<string, { en: string; tr: string }> = {
  inspiration: { en: "Inspiration", tr: "İlham" },
  ideas: { en: "Ideas", tr: "Fikirler" },
  guides: { en: "Guides", tr: "Rehberler" },
  features: { en: "Features", tr: "Özellikler" },
  tips: { en: "Tips", tr: "İpuçları" },
  "future-self": { en: "Future Self", tr: "Gelecek Benlik" },
  psychology: { en: "Psychology", tr: "Psikoloji" },
  "letter-craft": { en: "Letter Craft", tr: "Mektup Yazımı" },
  "life-events": { en: "Life Events", tr: "Hayat Olayları" },
  privacy: { en: "Privacy", tr: "Gizlilik" },
  "use-cases": { en: "Use Cases", tr: "Kullanım Senaryoları" },
}

function getCategoryLabel(category: string, locale: string) {
  const labels = categoryLabels[category]
  if (!labels) return category
  return locale === "tr" ? labels.tr : labels.en
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === "en"

  const title = isEnglish
    ? "Blog | Letters to Your Future Self"
    : "Blog | Gelecekteki Kendine Mektuplar"

  const description = isEnglish
    ? "Stories, tips, and inspiration for writing meaningful letters to your future self. Explore ideas for time capsule letters, legacy messages, and more."
    : "Gelecekteki kendinize anlamlı mektuplar yazmak için hikayeler, ipuçları ve ilham. Zaman kapsülü mektupları, miras mesajları ve daha fazlası için fikirler keşfedin."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog`,
      languages: {
        en: `${appUrl}/blog`,
        tr: `${appUrl}/tr/blog`,
        "x-default": `${appUrl}/blog`,
      },
    },
  }
}

export default async function BlogHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const seoLocale = normalizeSeoLocale(locale)
  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const t = {
    badge: isEnglish ? "Blog" : "Blog",
    title: isEnglish ? "Stories & Inspiration" : "Hikayeler ve İlham",
    description: isEnglish
      ? "Discover ideas, tips, and stories about writing letters to your future self. Learn from others and find inspiration for your own journey."
      : "Gelecekteki kendinize mektup yazma hakkında fikirler, ipuçları ve hikayeler keşfedin. Başkalarından öğrenin ve kendi yolculuğunuz için ilham bulun.",
    featured: isEnglish ? "Featured" : "Öne Çıkan",
    readMore: isEnglish ? "Read More" : "Devamını Oku",
    minRead: isEnglish ? "min read" : "dk okuma",
  }

  // Get posts from centralized content registry
  const allPosts = getAllBlogPosts()
  const featuredPosts = getFeaturedBlogPosts()
  const recentPosts = allPosts.filter(({ data }) => !data.featured).slice(0, 10) // Show up to 10 recent posts

  // Schema.org data
  const schemaItems = allPosts.map(({ slug, data }, index) => ({
    name: data[locale === "tr" ? "tr" : "en"]?.title || slug,
    url: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog/${getBlogSlug(seoLocale, slug as BlogSlug)}`,
    position: index + 1,
  }))

  return (
    <LegalPageLayout>
      {/* Schema.org */}
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
          { name: t.badge, href: "/blog" },
        ]}
      />

      <LegalHero
        badge={t.badge}
        title={t.title}
        description={t.description}
        icon={Newspaper}
        accentColor="yellow"
      />

      {/* Featured Posts */}
      <section className="mt-10">
        <h2 className={cn("font-mono text-lg text-charcoal mb-6", uppercaseClass)}>
          {t.featured}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredPosts.map(({ slug, data: postData }) => {
	            const localizedData = postData[locale === "tr" ? "tr" : "en"]
	            const localizedSlug = getBlogSlug(seoLocale, slug as BlogSlug)

		            return (
		              <Link
		                key={slug}
		                href={{ pathname: "/blog/[slug]", params: { slug: localizedSlug } }}
		                className={cn(
		                  "group p-6 border-2 border-charcoal bg-white",
		                  "transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
		                )}
	                style={{ borderRadius: "2px" }}
	              >
	                <div className="flex items-center gap-3 mb-4">
	                  <span
	                    className={cn(
	                      "px-2 py-1 font-mono text-xs",
	                      categoryColors[postData.category] || "bg-gray-100 text-charcoal"
	                    )}
	                  >
	                    {getCategoryLabel(postData.category, locale)}
	                  </span>
	                  <span className="font-mono text-xs text-charcoal/50 flex items-center gap-1">
	                    <Calendar className="h-3 w-3" />
	                    {new Date(postData.datePublished).toLocaleDateString(locale)}
	                  </span>
	                </div>

	                <h3 className={cn("font-mono text-xl font-bold text-charcoal mb-3", uppercaseClass)}>
	                  {localizedData.title}
	                </h3>

	                <p className="font-mono text-sm text-charcoal/70 leading-relaxed mb-4">
	                  {localizedData.description}
	                </p>

	                <div className="flex items-center justify-between">
	                  <span className="font-mono text-xs text-charcoal/50 flex items-center gap-1">
	                    <Clock className="h-3 w-3" />
	                    {postData.readTime} {t.minRead}
	                  </span>
	                  <span className="flex items-center gap-2 text-charcoal font-mono text-sm group-hover:gap-3 transition-all">
	                    {t.readMore}
	                    <ArrowRight className="h-4 w-4" />
	                  </span>
	                </div>
	              </Link>
	            )
	          })}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="mt-12">
        <h2 className={cn("font-mono text-lg text-charcoal mb-6", uppercaseClass)}>
          {isEnglish ? "Recent Posts" : "Son Yazılar"}
        </h2>
        <div className="space-y-4">
          {recentPosts.map(({ slug, data: postData }) => {
	            const localizedData = postData[locale === "tr" ? "tr" : "en"]
	            const localizedSlug = getBlogSlug(seoLocale, slug as BlogSlug)

		            return (
		              <Link
		                key={slug}
		                href={{ pathname: "/blog/[slug]", params: { slug: localizedSlug } }}
		                className={cn(
		                  "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-charcoal bg-white",
		                  "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
		                )}
	                style={{ borderRadius: "2px" }}
	              >
	                <div className="flex-grow">
	                  <div className="flex items-center gap-3 mb-2">
	                    <span
	                      className={cn(
	                        "px-2 py-0.5 font-mono text-xs",
	                        categoryColors[postData.category] || "bg-gray-100 text-charcoal"
	                      )}
	                    >
	                      {getCategoryLabel(postData.category, locale)}
	                    </span>
	                    <span className="font-mono text-xs text-charcoal/50">
	                      {new Date(postData.datePublished).toLocaleDateString(locale)}
	                    </span>
	                  </div>
	                  <h3 className="font-mono text-base font-bold text-charcoal">
	                    {localizedData.title}
	                  </h3>
	                </div>
	                <ArrowRight className="h-5 w-5 text-charcoal/40 group-hover:text-charcoal group-hover:translate-x-1 transition-all flex-shrink-0" />
	              </Link>
	            )
	          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 pt-10 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "relative p-8 md:p-10 border-2 border-charcoal bg-duck-yellow",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-2xl md:text-3xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Ready to Start Writing?" : "Yazmaya Hazır mısınız?"}
          </h2>
          <p className="font-mono text-sm md:text-base text-charcoal/80 mb-6 max-w-xl">
            {isEnglish
              ? "Turn inspiration into action. Write your first letter to your future self today."
              : "İlhamı eyleme dönüştürün. Bugün gelecekteki kendinize ilk mektubunuzu yazın."}
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

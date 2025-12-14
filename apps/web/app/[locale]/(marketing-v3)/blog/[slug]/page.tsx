import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag } from "lucide-react"
import { notFound } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { RelatedContent } from "@/components/seo/related-content"
import { blogSlugs, type BlogSlug } from "@/lib/seo/content-registry"
import { getBlogPost } from "@/lib/seo/blog-content"
import { getRelatedContent, toRelatedItems } from "@/lib/seo/internal-links"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Category to color mapping
const categoryColors: Record<string, string> = {
  // Original categories
  inspiration: "bg-duck-yellow/20",
  ideas: "bg-teal-primary/20",
  guides: "bg-duck-blue/20",
  features: "bg-purple-100",
  tips: "bg-pink-100",
  // New cluster-based categories
  "future-self": "bg-duck-yellow/20",
  psychology: "bg-teal-primary/20",
  "letter-craft": "bg-duck-blue/20",
  "life-events": "bg-purple-100",
  privacy: "bg-pink-100",
  "use-cases": "bg-orange-100",
}

export async function generateStaticParams() {
  return blogSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  const post = getBlogPost(slug)
  if (!post) {
    return { title: "Not Found" }
  }

  const data = post[locale === "tr" ? "tr" : "en"]

  return {
    title: `${data.title} | Capsule Note Blog`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog/${slug}`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog/${slug}`,
      languages: {
        en: `${appUrl}/blog/${slug}`,
        tr: `${appUrl}/tr/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const post = getBlogPost(slug)
  if (!post) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const data = post[locale === "tr" ? "tr" : "en"]

  // Get related content using automated internal linking
  const relatedLinks = getRelatedContent("blog", slug, undefined, locale === "tr" ? "tr" : "en")
  const relatedItems = toRelatedItems(relatedLinks, locale === "tr" ? "tr" : "en")

  return (
    <LegalPageLayout>
      {/* Schema.org */}
      <ArticleSchema
        locale={locale}
        title={data.title}
        description={data.description}
        datePublished={post.datePublished}
        dateModified={post.dateModified}
        authorName="Capsule Note Team"
        url={`${appUrl}${locale === "en" ? "" : "/" + locale}/blog/${slug}`}
      />
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: data.title, href: `/blog/${slug}` },
        ]}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "All Posts" : "Tüm Yazılar"}
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={cn("px-3 py-1 font-mono text-xs", categoryColors[post.category] || "bg-gray-100")}>
            <Tag className="inline h-3 w-3 mr-1" />
            {post.category}
          </span>
        </div>
        <h1 className={cn("font-mono text-3xl md:text-4xl text-charcoal mb-4", uppercaseClass)}>
          {data.title}
        </h1>
        <p className="font-mono text-base text-charcoal/70 mb-6">
          {data.description}
        </p>
        <div className="flex items-center gap-6 text-sm font-mono text-charcoal/50">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {post.readTime} {isEnglish ? "min read" : "dk okuma"}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(post.datePublished).toLocaleDateString(locale)}
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
            "p-8 border-2 border-charcoal bg-duck-yellow/20",
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

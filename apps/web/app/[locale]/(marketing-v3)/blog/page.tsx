import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Newspaper, ArrowRight, Calendar, Clock } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"

// Blog posts (would come from CMS in production)
const blogPosts = [
  {
    slug: "why-write-to-future-self",
    category: "inspiration",
    date: "2024-12-10",
    readTime: 5,
    featured: true,
  },
  {
    slug: "new-year-letter-ideas",
    category: "ideas",
    date: "2024-12-05",
    readTime: 7,
    featured: true,
  },
  {
    slug: "graduation-letters-guide",
    category: "guides",
    date: "2024-11-20",
    readTime: 6,
    featured: false,
  },
  {
    slug: "physical-mail-vs-email",
    category: "features",
    date: "2024-11-15",
    readTime: 4,
    featured: false,
  },
  {
    slug: "letter-writing-tips",
    category: "tips",
    date: "2024-11-01",
    readTime: 8,
    featured: false,
  },
]

// Blog post metadata
const postData: Record<string, {
  en: { title: string; excerpt: string }
  tr: { title: string; excerpt: string }
}> = {
  "why-write-to-future-self": {
    en: {
      title: "Why Write to Your Future Self? The Power of Time-Traveling Messages",
      excerpt: "Discover the psychological benefits and transformative power of writing letters to your future self.",
    },
    tr: {
      title: "Neden Gelecekteki Kendine Yazmalısın? Zaman Yolculuğu Mesajlarının Gücü",
      excerpt: "Gelecekteki kendinize mektup yazmanın psikolojik faydalarını ve dönüştürücü gücünü keşfedin.",
    },
  },
  "new-year-letter-ideas": {
    en: {
      title: "25 New Year's Letter Ideas for 2025",
      excerpt: "Creative prompts and ideas to write a meaningful New Year's letter to your future self.",
    },
    tr: {
      title: "2025 için 25 Yeni Yıl Mektubu Fikri",
      excerpt: "Gelecekteki kendinize anlamlı bir Yeni Yıl mektubu yazmak için yaratıcı fikirler ve ipuçları.",
    },
  },
  "graduation-letters-guide": {
    en: {
      title: "Graduation Letters: A Complete Guide",
      excerpt: "How to write a powerful graduation letter that captures this milestone moment.",
    },
    tr: {
      title: "Mezuniyet Mektupları: Kapsamlı Rehber",
      excerpt: "Bu dönüm noktası anını yakalayan güçlü bir mezuniyet mektubu nasıl yazılır.",
    },
  },
  "physical-mail-vs-email": {
    en: {
      title: "Physical Mail vs Email: Which is Better for Future Letters?",
      excerpt: "Compare the experience of receiving a physical letter versus an email from your past self.",
    },
    tr: {
      title: "Fiziksel Posta vs E-posta: Gelecek Mektupları için Hangisi Daha İyi?",
      excerpt: "Geçmişteki benliğinizden fiziksel bir mektup almakla e-posta almayı karşılaştırın.",
    },
  },
  "letter-writing-tips": {
    en: {
      title: "10 Tips for Writing Letters Your Future Self Will Love",
      excerpt: "Expert tips to make your letters more meaningful, personal, and impactful.",
    },
    tr: {
      title: "Gelecekteki Benliğinizin Seveceği Mektuplar için 10 İpucu",
      excerpt: "Mektuplarınızı daha anlamlı, kişisel ve etkili hale getirmek için uzman ipuçları.",
    },
  },
}

const categoryColors: Record<string, string> = {
  inspiration: "bg-duck-yellow/20 text-charcoal",
  ideas: "bg-teal-primary/20 text-charcoal",
  guides: "bg-duck-blue/20 text-charcoal",
  features: "bg-purple-100 text-charcoal",
  tips: "bg-pink-100 text-charcoal",
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

  const featuredPosts = blogPosts.filter((p) => p.featured)
  const recentPosts = blogPosts.filter((p) => !p.featured)

  // Schema.org data
  const schemaItems = blogPosts.map((post, index) => ({
    name: postData[post.slug]?.[locale === "tr" ? "tr" : "en"]?.title || post.slug,
    url: `${appUrl}${locale === "en" ? "" : "/" + locale}/blog/${post.slug}`,
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
          {featuredPosts.map((post) => {
            const postInfo = postData[post.slug]
            if (!postInfo) return null
            const data = postInfo[locale === "tr" ? "tr" : "en"]

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}` as any}
                className={cn(
                  "group p-6 border-2 border-charcoal bg-white",
                  "transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn("px-2 py-1 font-mono text-xs", categoryColors[post.category])}>
                    {post.category}
                  </span>
                  <span className="font-mono text-xs text-charcoal/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString(locale)}
                  </span>
                </div>

                <h3 className={cn("font-mono text-xl font-bold text-charcoal mb-3", uppercaseClass)}>
                  {data.title}
                </h3>

                <p className="font-mono text-sm text-charcoal/70 leading-relaxed mb-4">
                  {data.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-charcoal/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} {t.minRead}
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
          {recentPosts.map((post) => {
            const postInfo = postData[post.slug]
            if (!postInfo) return null
            const data = postInfo[locale === "tr" ? "tr" : "en"]

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}` as any}
                className={cn(
                  "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-charcoal bg-white",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("px-2 py-0.5 font-mono text-xs", categoryColors[post.category])}>
                      {post.category}
                    </span>
                    <span className="font-mono text-xs text-charcoal/50">
                      {new Date(post.date).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <h3 className="font-mono text-base font-bold text-charcoal">
                    {data.title}
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

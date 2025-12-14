import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { BookOpen, ArrowRight, Clock, Brain, Shield, Heart, Lightbulb, Users } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Guide articles with SEO-optimized metadata
const guides = [
  {
    slug: "how-to-write-letter-to-future-self",
    icon: Lightbulb,
    readTime: 8,
    color: "bg-duck-yellow/20 border-duck-yellow",
  },
  {
    slug: "science-of-future-self",
    icon: Brain,
    readTime: 12,
    color: "bg-teal-primary/10 border-teal-primary",
  },
  {
    slug: "time-capsule-vs-future-letter",
    icon: Clock,
    readTime: 6,
    color: "bg-duck-blue/10 border-duck-blue",
  },
  {
    slug: "privacy-security-best-practices",
    icon: Shield,
    readTime: 10,
    color: "bg-purple-100 border-purple-400",
  },
  {
    slug: "letters-for-mental-health",
    icon: Heart,
    readTime: 15,
    color: "bg-pink-100 border-pink-400",
  },
  {
    slug: "legacy-letters-guide",
    icon: Users,
    readTime: 14,
    color: "bg-emerald-100 border-emerald-400",
  },
]

// Guide content metadata
const guideData: Record<string, {
  en: { title: string; description: string; excerpt: string }
  tr: { title: string; description: string; excerpt: string }
}> = {
  "how-to-write-letter-to-future-self": {
    en: {
      title: "How to Write a Letter to Your Future Self",
      description: "A complete guide to writing meaningful, impactful letters to your future self with prompts, tips, and examples.",
      excerpt: "Learn the art of writing letters to your future self. Discover prompts, techniques, and tips to create meaningful time capsules that your future self will treasure.",
    },
    tr: {
      title: "Gelecekteki Kendine Mektup Nasıl Yazılır",
      description: "İpuçları, teknikler ve örneklerle gelecekteki kendine anlamlı mektuplar yazmak için kapsamlı rehber.",
      excerpt: "Gelecekteki kendinize mektup yazma sanatını öğrenin. Gelecekteki benliğinizin değer vereceği anlamlı zaman kapsülleri oluşturmak için ipuçları ve teknikler keşfedin.",
    },
  },
  "science-of-future-self": {
    en: {
      title: "The Science of Future Self Connection",
      description: "Explore the psychology and neuroscience behind connecting with your future self for better decision-making.",
      excerpt: "Discover how temporal self-continuity works and why connecting with your future self leads to better choices, increased savings, and improved well-being.",
    },
    tr: {
      title: "Gelecek Benlik Bağlantısının Bilimi",
      description: "Daha iyi karar verme için gelecek benliğinizle bağlantı kurmanın ardındaki psikoloji ve nörobilimi keşfedin.",
      excerpt: "Zamansal benlik sürekliliğinin nasıl çalıştığını ve gelecek benliğinizle bağlantı kurmanın neden daha iyi seçimlere yol açtığını keşfedin.",
    },
  },
  "time-capsule-vs-future-letter": {
    en: {
      title: "Time Capsule vs Future Letter: What's the Difference?",
      description: "Compare time capsules and future letters to find the best way to preserve your memories and messages.",
      excerpt: "Understand the key differences between traditional time capsules and digital future letters, and which approach works best for your needs.",
    },
    tr: {
      title: "Zaman Kapsülü vs Gelecek Mektubu: Fark Nedir?",
      description: "Anılarınızı ve mesajlarınızı korumanın en iyi yolunu bulmak için zaman kapsüllerini ve gelecek mektuplarını karşılaştırın.",
      excerpt: "Geleneksel zaman kapsülleri ile dijital gelecek mektupları arasındaki temel farkları ve ihtiyaçlarınız için hangisinin daha iyi olduğunu anlayın.",
    },
  },
  "privacy-security-best-practices": {
    en: {
      title: "Privacy & Security Best Practices for Future Letters",
      description: "Learn how to keep your personal letters secure and private with encryption and safe storage practices.",
      excerpt: "Your letters contain your deepest thoughts. Learn how to protect them with end-to-end encryption, secure passwords, and safe storage practices.",
    },
    tr: {
      title: "Gelecek Mektupları için Gizlilik ve Güvenlik",
      description: "Şifreleme ve güvenli depolama uygulamalarıyla kişisel mektuplarınızı nasıl güvende tutacağınızı öğrenin.",
      excerpt: "Mektuplarınız en derin düşüncelerinizi içerir. Uçtan uca şifreleme ve güvenli depolama uygulamalarıyla onları nasıl koruyacağınızı öğrenin.",
    },
  },
  "letters-for-mental-health": {
    en: {
      title: "Using Letters for Mental Health & Wellbeing",
      description: "Discover therapeutic writing techniques and how letters to your future self can support mental health.",
      excerpt: "Explore how therapeutic letter writing can support your mental health journey, from gratitude practices to processing difficult emotions.",
    },
    tr: {
      title: "Ruh Sağlığı için Mektup Kullanımı",
      description: "Terapötik yazma tekniklerini ve gelecek mektuplarının ruh sağlığını nasıl destekleyebileceğini keşfedin.",
      excerpt: "Şükran uygulamalarından zor duyguları işlemeye kadar, terapötik mektup yazmanın ruh sağlığı yolculuğunuzu nasıl destekleyebileceğini keşfedin.",
    },
  },
  "legacy-letters-guide": {
    en: {
      title: "The Complete Guide to Legacy Letters",
      description: "Learn how to write meaningful legacy letters, ethical wills, and messages for future generations.",
      excerpt: "Create lasting messages for your loved ones. Learn how to write ethical wills, letters to future children, and other legacy documents.",
    },
    tr: {
      title: "Miras Mektupları Rehberi",
      description: "Anlamlı miras mektupları, etik vasiyetler ve gelecek nesillere mesajlar yazmayı öğrenin.",
      excerpt: "Sevdikleriniz için kalıcı mesajlar oluşturun. Etik vasiyetler, gelecek çocuklara mektuplar ve diğer miras belgelerini yazmayı öğrenin.",
    },
  },
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
    ? "Expert guides on writing letters to your future self. Learn about time capsules, privacy, mental health benefits, and legacy letters."
    : "Gelecekteki kendine mektup yazma konusunda uzman rehberler. Zaman kapsülleri, gizlilik, ruh sağlığı faydaları ve miras mektupları hakkında bilgi edinin."

  return {
    title,
    description,
    keywords: isEnglish
      ? ["future self guide", "time capsule guide", "letter writing tips", "legacy letter guide"]
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
  }

  // Schema.org data
  const schemaItems = guides.map((guide, index) => ({
    name: guideData[guide.slug]?.[locale === "tr" ? "tr" : "en"]?.title || guide.slug,
    url: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides/${guide.slug}`,
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

      {/* Guides Grid */}
      <section className="mt-10">
        <div className="space-y-4">
          {guides.map((guide) => {
            const guideInfo = guideData[guide.slug]
            if (!guideInfo) return null
            const data = guideInfo[locale === "tr" ? "tr" : "en"]
            const Icon = guide.icon

            return (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}` as any}
                className={cn(
                  "group flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-2 border-charcoal",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  guide.color
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-10 w-10 text-charcoal" strokeWidth={1.5} />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={cn("font-mono text-lg font-bold text-charcoal", uppercaseClass)}>
                      {data.title}
                    </h2>
                    <span className="font-mono text-xs text-charcoal/50">
                      {guide.readTime} {t.readTime}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
                    {data.excerpt}
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

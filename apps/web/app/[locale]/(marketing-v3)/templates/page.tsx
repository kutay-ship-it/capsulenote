import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { FileText, ArrowRight, Sparkles, Heart, Target, Users, Briefcase, Clock, Award, BookOpen } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"

// Template categories with SEO-optimized metadata
const templateCategories = [
  {
    slug: "self-reflection",
    icon: Sparkles,
    color: "bg-teal-primary/10 border-teal-primary",
    count: 12,
  },
  {
    slug: "goals",
    icon: Target,
    color: "bg-duck-blue/10 border-duck-blue",
    count: 8,
  },
  {
    slug: "gratitude",
    icon: Heart,
    color: "bg-duck-yellow/20 border-duck-yellow",
    count: 6,
  },
  {
    slug: "relationships",
    icon: Users,
    color: "bg-pink-100 border-pink-400",
    count: 10,
  },
  {
    slug: "career",
    icon: Briefcase,
    color: "bg-blue-100 border-blue-400",
    count: 7,
  },
  {
    slug: "life-transitions",
    icon: Clock,
    color: "bg-purple-100 border-purple-400",
    count: 9,
  },
  {
    slug: "milestones",
    icon: Award,
    color: "bg-amber-100 border-amber-400",
    count: 11,
  },
  {
    slug: "legacy",
    icon: BookOpen,
    color: "bg-emerald-100 border-emerald-400",
    count: 5,
  },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === "en"

  const title = isEnglish
    ? "Letter Templates | Write to Your Future Self"
    : "Mektup Şablonları | Gelecekteki Kendine Yaz"

  const description = isEnglish
    ? "Free letter templates for writing to your future self. Templates for self-reflection, goal-setting, gratitude, relationships, career milestones, and legacy letters."
    : "Gelecekteki kendine yazmak için ücretsiz mektup şablonları. Öz-düşünce, hedef belirleme, şükran, ilişkiler, kariyer ve miras mektupları için şablonlar."

  return {
    title,
    description,
    keywords: isEnglish
      ? ["letter template", "future self letter", "time capsule template", "self-reflection template", "goal setting template"]
      : ["mektup şablonu", "gelecek mektup", "zaman kapsülü", "öz-düşünce şablonu"],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates`,
      languages: {
        en: `${appUrl}/templates`,
        tr: `${appUrl}/tr/templates`,
      },
    },
  }
}

export default async function TemplatesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  // Translations (hardcoded for now, should move to translation files)
  const t = {
    badge: isEnglish ? "Templates" : "Şablonlar",
    title: isEnglish ? "Letter Templates" : "Mektup Şablonları",
    description: isEnglish
      ? "Start with a thoughtfully crafted template. Choose a category below to find the perfect framework for your letter to your future self."
      : "Özenle hazırlanmış bir şablonla başlayın. Gelecekteki kendinize mektup için mükemmel çerçeveyi bulmak üzere aşağıdan bir kategori seçin.",
    categories: {
      "self-reflection": {
        title: isEnglish ? "Self-Reflection" : "Öz-Düşünce",
        description: isEnglish
          ? "Templates for deep personal introspection and self-discovery"
          : "Derin kişisel iç gözlem ve kendini keşfetme şablonları",
      },
      "goals": {
        title: isEnglish ? "Goals & Dreams" : "Hedefler ve Hayaller",
        description: isEnglish
          ? "Set intentions and track your progress toward meaningful goals"
          : "Niyetler belirleyin ve anlamlı hedeflere doğru ilerlemenizi izleyin",
      },
      "gratitude": {
        title: isEnglish ? "Gratitude" : "Şükran",
        description: isEnglish
          ? "Express appreciation for life's blessings and cultivate positivity"
          : "Hayatın nimetlerine minnettarlığınızı ifade edin",
      },
      "relationships": {
        title: isEnglish ? "Relationships" : "İlişkiler",
        description: isEnglish
          ? "Letters about love, friendship, family, and human connections"
          : "Aşk, dostluk, aile ve insan bağlantıları hakkında mektuplar",
      },
      "career": {
        title: isEnglish ? "Career" : "Kariyer",
        description: isEnglish
          ? "Professional growth, work-life balance, and career milestones"
          : "Profesyonel gelişim, iş-yaşam dengesi ve kariyer dönüm noktaları",
      },
      "life-transitions": {
        title: isEnglish ? "Life Transitions" : "Yaşam Geçişleri",
        description: isEnglish
          ? "Navigate major life changes with intention and grace"
          : "Büyük yaşam değişikliklerini niyet ve zarafetle yönetin",
      },
      "milestones": {
        title: isEnglish ? "Milestones" : "Dönüm Noktaları",
        description: isEnglish
          ? "Celebrate and commemorate life's important moments"
          : "Hayatın önemli anlarını kutlayın ve anın",
      },
      "legacy": {
        title: isEnglish ? "Legacy Letters" : "Miras Mektupları",
        description: isEnglish
          ? "Create meaningful letters for future generations and loved ones"
          : "Gelecek nesiller ve sevdikleriniz için anlamlı mektuplar oluşturun",
      },
    },
    cta: {
      viewAll: isEnglish ? "View Templates" : "Şablonları Görüntüle",
      templates: isEnglish ? "templates" : "şablon",
    },
  }

  // Schema.org data for SEO
  const schemaItems = templateCategories.map((cat, index) => ({
    name: t.categories[cat.slug as keyof typeof t.categories].title,
    url: `${appUrl}/${locale === "en" ? "" : locale + "/"}templates/${cat.slug}`,
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
          { name: t.title, href: "/templates" },
        ]}
      />

      <LegalHero
        badge={t.badge}
        title={t.title}
        description={t.description}
        icon={FileText}
        accentColor="teal"
      />

      {/* Template Categories Grid */}
      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateCategories.map((category) => {
            const catData = t.categories[category.slug as keyof typeof t.categories]
            const Icon = category.icon

            return (
              <Link
                key={category.slug}
                href={`/templates/${category.slug}` as any}
                className={cn(
                  "group relative p-6 border-2 border-charcoal",
                  "transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  category.color
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-charcoal/60">
                    {category.count} {t.cta.templates}
                  </span>
                </div>

                <h2 className={cn("font-mono text-lg font-bold text-charcoal mb-2", uppercaseClass)}>
                  {catData.title}
                </h2>

                <p className="font-mono text-sm text-charcoal/70 leading-relaxed mb-4">
                  {catData.description}
                </p>

                <div className="flex items-center gap-2 text-charcoal font-mono text-sm group-hover:gap-3 transition-all">
                  <span>{t.cta.viewAll}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 pt-10 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "relative p-8 md:p-10 border-2 border-charcoal bg-teal-primary",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-2xl md:text-3xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Can't Find What You Need?" : "Aradığınızı Bulamıyor musunuz?"}
          </h2>
          <p className="font-mono text-sm md:text-base text-charcoal/80 mb-6 max-w-xl">
            {isEnglish
              ? "Start with a blank canvas and write your own unique letter. Our editor helps you craft the perfect message for your future self."
              : "Boş bir tuval ile başlayın ve kendi benzersiz mektubunuzu yazın. Editörümüz gelecekteki kendinize mükemmel mesajı oluşturmanıza yardımcı olur."}
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

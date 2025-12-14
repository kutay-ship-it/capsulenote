import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowRight, ArrowLeft, FileText } from "lucide-react"
import { notFound } from "next/navigation"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { HowToSchema, BreadcrumbSchema, ItemListSchema } from "@/components/seo/json-ld"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"

// Valid categories for static generation
const validCategories = [
  "self-reflection",
  "goals",
  "gratitude",
  "relationships",
  "career",
  "life-transitions",
  "milestones",
  "legacy",
] as const

type Category = (typeof validCategories)[number]

// Category metadata
const categoryData: Record<Category, {
  en: { title: string; description: string; seoTitle: string; seoDescription: string }
  tr: { title: string; description: string; seoTitle: string; seoDescription: string }
}> = {
  "self-reflection": {
    en: {
      title: "Self-Reflection Templates",
      description: "Explore templates for deep personal introspection, mindfulness, and self-discovery journeys.",
      seoTitle: "Self-Reflection Letter Templates | Future Self Letters",
      seoDescription: "Free self-reflection letter templates. Write meaningful letters about personal growth, mindfulness, and self-discovery to your future self.",
    },
    tr: {
      title: "Öz-Düşünce Şablonları",
      description: "Derin kişisel iç gözlem, farkındalık ve kendini keşfetme yolculukları için şablonları keşfedin.",
      seoTitle: "Öz-Düşünce Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz öz-düşünce mektup şablonları. Kişisel gelişim, farkındalık ve kendini keşfetme hakkında anlamlı mektuplar yazın.",
    },
  },
  "goals": {
    en: {
      title: "Goals & Dreams Templates",
      description: "Templates to set intentions, track progress, and document your journey toward meaningful goals.",
      seoTitle: "Goal Setting Letter Templates | Future Self Letters",
      seoDescription: "Free goal-setting letter templates. Document your dreams, set intentions, and track progress with letters to your future self.",
    },
    tr: {
      title: "Hedefler ve Hayaller Şablonları",
      description: "Niyetler belirlemek, ilerlemeyi izlemek ve anlamlı hedeflere doğru yolculuğunuzu belgelemek için şablonlar.",
      seoTitle: "Hedef Belirleme Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz hedef belirleme mektup şablonları. Hayallerinizi belgeleyin, niyetler belirleyin ve ilerlemenizi izleyin.",
    },
  },
  "gratitude": {
    en: {
      title: "Gratitude Templates",
      description: "Express appreciation, cultivate positivity, and document the blessings in your life.",
      seoTitle: "Gratitude Letter Templates | Future Self Letters",
      seoDescription: "Free gratitude letter templates. Express appreciation and cultivate positivity with heartfelt letters to your future self.",
    },
    tr: {
      title: "Şükran Şablonları",
      description: "Minnettarlığınızı ifade edin, pozitifliği geliştirin ve hayatınızdaki nimetleri belgeleyin.",
      seoTitle: "Şükran Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz şükran mektup şablonları. Minnettarlığınızı ifade edin ve içten mektuplarla pozitifliği geliştirin.",
    },
  },
  "relationships": {
    en: {
      title: "Relationship Templates",
      description: "Templates about love, friendship, family bonds, and meaningful human connections.",
      seoTitle: "Relationship Letter Templates | Future Self Letters",
      seoDescription: "Free relationship letter templates. Write about love, friendship, and family connections to your future self.",
    },
    tr: {
      title: "İlişki Şablonları",
      description: "Aşk, dostluk, aile bağları ve anlamlı insan ilişkileri hakkında şablonlar.",
      seoTitle: "İlişki Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz ilişki mektup şablonları. Aşk, dostluk ve aile bağları hakkında gelecekteki kendinize yazın.",
    },
  },
  "career": {
    en: {
      title: "Career Templates",
      description: "Document professional growth, work-life balance reflections, and career milestones.",
      seoTitle: "Career Letter Templates | Future Self Letters",
      seoDescription: "Free career letter templates. Document professional growth, milestones, and work-life balance in letters to your future self.",
    },
    tr: {
      title: "Kariyer Şablonları",
      description: "Profesyonel gelişimi, iş-yaşam dengesi düşüncelerini ve kariyer dönüm noktalarını belgeleyin.",
      seoTitle: "Kariyer Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz kariyer mektup şablonları. Profesyonel gelişimi ve dönüm noktalarını belgeleyin.",
    },
  },
  "life-transitions": {
    en: {
      title: "Life Transitions Templates",
      description: "Navigate major life changes like moving, graduation, marriage, or new beginnings with intention.",
      seoTitle: "Life Transition Letter Templates | Future Self Letters",
      seoDescription: "Free life transition letter templates. Navigate major changes like graduation, moving, or new beginnings with intention.",
    },
    tr: {
      title: "Yaşam Geçişleri Şablonları",
      description: "Taşınma, mezuniyet, evlilik veya yeni başlangıçlar gibi büyük yaşam değişikliklerini niyetle yönetin.",
      seoTitle: "Yaşam Geçişi Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz yaşam geçişi mektup şablonları. Mezuniyet, taşınma veya yeni başlangıçları belgeleyin.",
    },
  },
  "milestones": {
    en: {
      title: "Milestone Templates",
      description: "Celebrate and commemorate life's important moments and achievements.",
      seoTitle: "Milestone Letter Templates | Future Self Letters",
      seoDescription: "Free milestone letter templates. Celebrate birthdays, anniversaries, and achievements with letters to your future self.",
    },
    tr: {
      title: "Dönüm Noktası Şablonları",
      description: "Hayatın önemli anlarını ve başarılarını kutlayın ve anın.",
      seoTitle: "Dönüm Noktası Mektup Şablonları | Gelecek Mektupları",
      seoDescription: "Ücretsiz dönüm noktası mektup şablonları. Doğum günlerini, yıldönümlerini ve başarıları kutlayın.",
    },
  },
  "legacy": {
    en: {
      title: "Legacy Letter Templates",
      description: "Create meaningful letters for future generations, ethical wills, and messages for loved ones.",
      seoTitle: "Legacy Letter Templates | Ethical Will & Future Letters",
      seoDescription: "Free legacy letter templates. Create ethical wills, letters to future children, and meaningful messages for loved ones.",
    },
    tr: {
      title: "Miras Mektup Şablonları",
      description: "Gelecek nesiller, etik vasiyetler ve sevdiklerinize mesajlar için anlamlı mektuplar oluşturun.",
      seoTitle: "Miras Mektup Şablonları | Etik Vasiyet ve Gelecek Mektupları",
      seoDescription: "Ücretsiz miras mektup şablonları. Etik vasiyetler, gelecek çocuklara mektuplar ve sevdiklerinize mesajlar oluşturun.",
    },
  },
}

// Templates for each category with slugs matching detail pages
const getTemplatesForCategory = (category: Category, locale: string) => {
  const isEnglish = locale === "en"

  const templates: Record<Category, Array<{ slug: string; title: string }>> = {
    "self-reflection": [
      { slug: "annual-self-check", title: isEnglish ? "Annual Self-Check" : "Yıllık Öz-Kontrol" },
      { slug: "mindfulness-moment", title: isEnglish ? "Mindfulness Moment" : "Farkındalık Anı" },
      { slug: "values-reflection", title: isEnglish ? "Values Reflection" : "Değerler Düşüncesi" },
    ],
    "goals": [
      { slug: "new-years-resolution", title: isEnglish ? "New Year's Resolution" : "Yeni Yıl Kararı" },
      { slug: "five-year-vision", title: isEnglish ? "5-Year Vision" : "5 Yıllık Vizyon" },
      { slug: "monthly-goals", title: isEnglish ? "Monthly Goals" : "Aylık Hedefler" },
    ],
    "gratitude": [
      { slug: "daily-gratitude", title: isEnglish ? "Daily Gratitude" : "Günlük Şükran" },
      { slug: "people-im-thankful-for", title: isEnglish ? "People I'm Thankful For" : "Minnettar Olduğum İnsanlar" },
    ],
    "relationships": [
      { slug: "love-letter", title: isEnglish ? "Love Letter" : "Aşk Mektubu" },
      { slug: "friendship-appreciation", title: isEnglish ? "Friendship Appreciation" : "Dostluk Takdiri" },
    ],
    "career": [
      { slug: "first-day-new-job", title: isEnglish ? "First Day at New Job" : "Yeni İşte İlk Gün" },
      { slug: "career-milestone", title: isEnglish ? "Career Milestone" : "Kariyer Dönüm Noktası" },
    ],
    "life-transitions": [
      { slug: "moving-to-new-city", title: isEnglish ? "Moving to a New City" : "Yeni Şehre Taşınma" },
      { slug: "starting-fresh", title: isEnglish ? "Starting Fresh" : "Yeni Başlangıç" },
    ],
    "milestones": [
      { slug: "birthday-letter", title: isEnglish ? "Birthday Letter" : "Doğum Günü Mektubu" },
      { slug: "anniversary", title: isEnglish ? "Anniversary" : "Yıldönümü" },
    ],
    "legacy": [
      { slug: "letter-to-future-child", title: isEnglish ? "Letter to My Future Child" : "Gelecek Çocuğuma Mektup" },
      { slug: "ethical-will", title: isEnglish ? "Ethical Will" : "Etik Vasiyet" },
    ],
  }

  return templates[category] || []
}

export async function generateStaticParams() {
  const params = []
  for (const category of validCategories) {
    params.push({ category })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}): Promise<Metadata> {
  const { locale, category } = await params

  if (!validCategories.includes(category as Category)) {
    return { title: "Not Found" }
  }

  const data = categoryData[category as Category][locale === "tr" ? "tr" : "en"]

  return {
    title: data.seoTitle,
    description: data.seoDescription,
    openGraph: {
      title: data.seoTitle,
      description: data.seoDescription,
      type: "website",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates/${category}`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates/${category}`,
      languages: {
        en: `${appUrl}/templates/${category}`,
        tr: `${appUrl}/tr/templates/${category}`,
      },
    },
  }
}

export default async function TemplateCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params

  if (!validCategories.includes(category as Category)) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const data = categoryData[category as Category][locale === "tr" ? "tr" : "en"]
  const templates = getTemplatesForCategory(category as Category, locale)

  return (
    <LegalPageLayout>
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: isEnglish ? "Templates" : "Şablonlar", href: "/templates" },
          { name: data.title, href: `/templates/${category}` },
        ]}
      />

      {/* Item List Schema for templates - URLs point to detail pages */}
      <ItemListSchema
        locale={locale}
        name={data.title}
        description={data.description}
        items={templates.map((t, i) => ({
          name: t.title,
          url: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates/${category}/${t.slug}`,
          position: i + 1,
        }))}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "All Templates" : "Tüm Şablonlar"}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <span className={cn("font-mono text-xs text-charcoal/60 mb-2 block", uppercaseClass)}>
          {isEnglish ? "Template Category" : "Şablon Kategorisi"}
        </span>
        <h1 className={cn("font-mono text-3xl md:text-4xl text-charcoal mb-4", uppercaseClass)}>
          {data.title}
        </h1>
        <p className="font-mono text-base text-charcoal/70 max-w-2xl">
          {data.description}
        </p>
      </header>

      {/* Templates List */}
      <section className="space-y-4">
        {templates.map((template) => (
          <Link
            key={template.slug}
            href={`/templates/${category}/${template.slug}`}
            className={cn(
              "group flex items-center justify-between p-5 border-2 border-charcoal bg-white",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-charcoal/60" />
              <span className="font-mono text-base text-charcoal">{template.title}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-charcoal/40 group-hover:text-charcoal group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </section>

      {/* Coming Soon Notice */}
      <div className="mt-8 p-6 bg-duck-yellow/20 border-2 border-duck-yellow" style={{ borderRadius: "2px" }}>
        <p className="font-mono text-sm text-charcoal/80">
          {isEnglish
            ? "More templates coming soon! We're constantly adding new frameworks to help you write meaningful letters."
            : "Yakında daha fazla şablon! Anlamlı mektuplar yazmanıza yardımcı olmak için sürekli yeni çerçeveler ekliyoruz."}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-10 pt-8 border-t-2 border-charcoal/10">
        <h2 className={cn("font-mono text-xl text-charcoal mb-4", uppercaseClass)}>
          {isEnglish ? "Start Writing Now" : "Şimdi Yazmaya Başla"}
        </h2>
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
          {isEnglish ? "Create Your Letter" : "Mektubunuzu Oluşturun"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </LegalPageLayout>
  )
}

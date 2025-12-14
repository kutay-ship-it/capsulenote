import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Sparkles, ArrowRight, Heart, GraduationCap, Wine, PartyPopper, Briefcase, Users, Star, Cake } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ItemListSchema, BreadcrumbSchema } from "@/components/seo/json-ld"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Prompt themes with SEO-optimized metadata
const promptThemes = [
  {
    slug: "self-esteem",
    icon: Star,
    color: "bg-duck-yellow/20 border-duck-yellow",
    promptCount: 25,
  },
  {
    slug: "grief",
    icon: Heart,
    color: "bg-pink-100 border-pink-400",
    promptCount: 18,
  },
  {
    slug: "graduation",
    icon: GraduationCap,
    color: "bg-teal-primary/10 border-teal-primary",
    promptCount: 20,
  },
  {
    slug: "sobriety",
    icon: Wine,
    color: "bg-purple-100 border-purple-400",
    promptCount: 15,
  },
  {
    slug: "new-year",
    icon: PartyPopper,
    color: "bg-duck-blue/10 border-duck-blue",
    promptCount: 30,
  },
  {
    slug: "birthday",
    icon: Cake,
    color: "bg-amber-100 border-amber-400",
    promptCount: 22,
  },
  {
    slug: "career",
    icon: Briefcase,
    color: "bg-blue-100 border-blue-400",
    promptCount: 19,
  },
  {
    slug: "relationships",
    icon: Users,
    color: "bg-emerald-100 border-emerald-400",
    promptCount: 24,
  },
]

// Theme metadata
const themeData: Record<string, {
  en: { title: string; description: string; seoTitle: string; seoDescription: string }
  tr: { title: string; description: string; seoTitle: string; seoDescription: string }
}> = {
  "self-esteem": {
    en: {
      title: "Self-Esteem & Confidence",
      description: "Prompts to build self-worth, celebrate your achievements, and nurture self-compassion.",
      seoTitle: "Self-Esteem Writing Prompts | Letters to Future Self",
      seoDescription: "Free self-esteem writing prompts for letters to your future self. Build confidence and self-worth with thoughtful reflection.",
    },
    tr: {
      title: "Özsaygı ve Güven",
      description: "Özsaygı oluşturmak, başarılarınızı kutlamak ve öz-şefkati beslemek için ipuçları.",
      seoTitle: "Özsaygı Yazma İpuçları | Gelecek Mektupları",
      seoDescription: "Gelecekteki kendinize mektuplar için ücretsiz özsaygı yazma ipuçları. Düşünceli yansıma ile güven ve özsaygı oluşturun.",
    },
  },
  "grief": {
    en: {
      title: "Grief & Loss",
      description: "Gentle prompts for processing loss, honoring memories, and finding paths forward.",
      seoTitle: "Grief Writing Prompts | Healing Letters to Future Self",
      seoDescription: "Thoughtful grief writing prompts for letters to your future self. Process loss and honor memories through therapeutic writing.",
    },
    tr: {
      title: "Keder ve Kayıp",
      description: "Kaybı işlemek, anıları onurlandırmak ve ilerleme yolları bulmak için nazik ipuçları.",
      seoTitle: "Keder Yazma İpuçları | Şifa Mektupları",
      seoDescription: "Gelecekteki kendinize mektuplar için düşünceli keder yazma ipuçları. Terapötik yazı yoluyla kaybı işleyin.",
    },
  },
  "graduation": {
    en: {
      title: "Graduation & Transitions",
      description: "Capture this milestone moment and set intentions for the next chapter of your life.",
      seoTitle: "Graduation Writing Prompts | Future Self Letters",
      seoDescription: "Graduation writing prompts for meaningful letters to your future self. Capture milestone moments and set intentions.",
    },
    tr: {
      title: "Mezuniyet ve Geçişler",
      description: "Bu dönüm noktası anını yakalayın ve hayatınızın bir sonraki bölümü için niyetler belirleyin.",
      seoTitle: "Mezuniyet Yazma İpuçları | Gelecek Mektupları",
      seoDescription: "Gelecekteki kendinize anlamlı mektuplar için mezuniyet yazma ipuçları. Dönüm noktası anlarını yakalayın.",
    },
  },
  "sobriety": {
    en: {
      title: "Sobriety & Recovery",
      description: "Prompts to document your journey, celebrate milestones, and encourage your future self.",
      seoTitle: "Sobriety Writing Prompts | Recovery Letters",
      seoDescription: "Supportive sobriety writing prompts for letters to your future self. Document your recovery journey and celebrate milestones.",
    },
    tr: {
      title: "Ayıklık ve İyileşme",
      description: "Yolculuğunuzu belgelemek, dönüm noktalarını kutlamak ve gelecekteki benliğinizi cesaretlendirmek için ipuçları.",
      seoTitle: "Ayıklık Yazma İpuçları | İyileşme Mektupları",
      seoDescription: "Gelecekteki kendinize mektuplar için destekleyici ayıklık yazma ipuçları. İyileşme yolculuğunuzu belgeleyin.",
    },
  },
  "new-year": {
    en: {
      title: "New Year's Reflections",
      description: "Ring in the new year with thoughtful reflection, goal-setting, and hope for the future.",
      seoTitle: "New Year Writing Prompts | Future Self Letters 2025",
      seoDescription: "New Year's writing prompts for letters to your future self. Reflect on the past year and set intentions for 2025.",
    },
    tr: {
      title: "Yeni Yıl Düşünceleri",
      description: "Düşünceli yansıma, hedef belirleme ve gelecek için umutla yeni yılı karşılayın.",
      seoTitle: "Yeni Yıl Yazma İpuçları | Gelecek Mektupları 2025",
      seoDescription: "Gelecekteki kendinize mektuplar için Yeni Yıl yazma ipuçları. Geçen yılı düşünün ve 2025 için niyetler belirleyin.",
    },
  },
  "birthday": {
    en: {
      title: "Birthday Letters",
      description: "Celebrate another year of life with reflection, gratitude, and wishes for the year ahead.",
      seoTitle: "Birthday Writing Prompts | Letters to Future Self",
      seoDescription: "Birthday writing prompts for meaningful letters to your future self. Celebrate life and reflect on your journey.",
    },
    tr: {
      title: "Doğum Günü Mektupları",
      description: "Yansıma, şükran ve önümüzdeki yıl için dileklerle bir yıl daha hayatı kutlayın.",
      seoTitle: "Doğum Günü Yazma İpuçları | Gelecek Mektupları",
      seoDescription: "Gelecekteki kendinize anlamlı mektuplar için doğum günü yazma ipuçları. Hayatı kutlayın ve yolculuğunuzu düşünün.",
    },
  },
  "career": {
    en: {
      title: "Career & Professional Growth",
      description: "Document your professional journey, set career goals, and reflect on work-life balance.",
      seoTitle: "Career Writing Prompts | Professional Growth Letters",
      seoDescription: "Career writing prompts for letters to your future self. Document professional growth and set meaningful career goals.",
    },
    tr: {
      title: "Kariyer ve Profesyonel Gelişim",
      description: "Profesyonel yolculuğunuzu belgeleyin, kariyer hedefleri belirleyin ve iş-yaşam dengesini düşünün.",
      seoTitle: "Kariyer Yazma İpuçları | Profesyonel Gelişim Mektupları",
      seoDescription: "Gelecekteki kendinize mektuplar için kariyer yazma ipuçları. Profesyonel gelişimi belgeleyin ve anlamlı hedefler belirleyin.",
    },
  },
  "relationships": {
    en: {
      title: "Relationships & Love",
      description: "Explore your connections with others, express gratitude, and reflect on love in all its forms.",
      seoTitle: "Relationship Writing Prompts | Love Letters to Future Self",
      seoDescription: "Relationship writing prompts for letters to your future self. Reflect on love, friendship, and meaningful connections.",
    },
    tr: {
      title: "İlişkiler ve Aşk",
      description: "Başkalarıyla bağlantılarınızı keşfedin, şükranınızı ifade edin ve aşkı tüm biçimleriyle düşünün.",
      seoTitle: "İlişki Yazma İpuçları | Gelecek Aşk Mektupları",
      seoDescription: "Gelecekteki kendinize mektuplar için ilişki yazma ipuçları. Aşk, dostluk ve anlamlı bağlantıları düşünün.",
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
    ? "Writing Prompts | Letters to Your Future Self"
    : "Yazma İpuçları | Gelecekteki Kendine Mektuplar"

  const description = isEnglish
    ? "Free writing prompts for letters to your future self. Explore themes like self-esteem, grief, graduation, sobriety, relationships, and more."
    : "Gelecekteki kendinize mektuplar için ücretsiz yazma ipuçları. Özsaygı, keder, mezuniyet, ayıklık, ilişkiler ve daha fazlası gibi temaları keşfedin."

  return {
    title,
    description,
    keywords: isEnglish
      ? ["writing prompts", "future self prompts", "letter writing ideas", "self-reflection prompts"]
      : ["yazma ipuçları", "gelecek benlik ipuçları", "mektup yazma fikirleri"],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/prompts`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/prompts`,
      languages: {
        en: `${appUrl}/prompts`,
        tr: `${appUrl}/tr/prompts`,
      },
    },
  }
}

export default async function PromptsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const t = {
    badge: isEnglish ? "Prompts" : "İpuçları",
    title: isEnglish ? "Writing Prompts" : "Yazma İpuçları",
    description: isEnglish
      ? "Not sure what to write? Browse our collection of thoughtful prompts organized by theme. Find the perfect starting point for your letter to your future self."
      : "Ne yazacağınızdan emin değil misiniz? Temaya göre düzenlenmiş düşünceli ipuçları koleksiyonumuza göz atın. Gelecekteki kendinize mektubunuz için mükemmel başlangıç noktasını bulun.",
    prompts: isEnglish ? "prompts" : "ipucu",
    explore: isEnglish ? "Explore Prompts" : "İpuçlarını Keşfet",
  }

  // Schema.org data
  const schemaItems = promptThemes.map((theme, index) => ({
    name: themeData[theme.slug]?.[locale === "tr" ? "tr" : "en"]?.title || theme.slug,
    url: `${appUrl}${locale === "en" ? "" : "/" + locale}/prompts/${theme.slug}`,
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
          { name: t.badge, href: "/prompts" },
        ]}
      />

      <LegalHero
        badge={t.badge}
        title={t.title}
        description={t.description}
        icon={Sparkles}
        accentColor="teal"
      />

      {/* Prompt Themes Grid */}
      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promptThemes.map((theme) => {
            const themeInfo = themeData[theme.slug]
            if (!themeInfo) return null
            const data = themeInfo[locale === "tr" ? "tr" : "en"]
            const Icon = theme.icon

            return (
              <Link
                key={theme.slug}
                href={`/prompts/${theme.slug}` as any}
                className={cn(
                  "group relative p-6 border-2 border-charcoal",
                  "transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  theme.color
                )}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-charcoal/60">
                    {theme.promptCount} {t.prompts}
                  </span>
                </div>

                <h2 className={cn("font-mono text-lg font-bold text-charcoal mb-2", uppercaseClass)}>
                  {data.title}
                </h2>

                <p className="font-mono text-sm text-charcoal/70 leading-relaxed mb-4">
                  {data.description}
                </p>

                <div className="flex items-center gap-2 text-charcoal font-mono text-sm group-hover:gap-3 transition-all">
                  <span>{t.explore}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Random Prompt CTA */}
      <section className="mt-12 pt-10 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "relative p-8 md:p-10 border-2 border-charcoal bg-purple-100",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-2xl md:text-3xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Feeling Spontaneous?" : "Kendiliğinden Hissediyorsunuz?"}
          </h2>
          <p className="font-mono text-sm md:text-base text-charcoal/80 mb-6 max-w-xl">
            {isEnglish
              ? "Skip the browsing and jump straight into writing. Our editor will guide you with prompts as you go."
              : "Göz atmayı atlayın ve doğrudan yazmaya başlayın. Editörümüz sizi ilerledikçe ipuçlarıyla yönlendirecek."}
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

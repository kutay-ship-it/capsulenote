import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react"
import { notFound } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { RelatedContent } from "@/components/seo/related-content"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Valid guide slugs
const validSlugs = [
  "how-to-write-letter-to-future-self",
  "science-of-future-self",
  "time-capsule-vs-future-letter",
  "privacy-security-best-practices",
  "letters-for-mental-health",
  "legacy-letters-guide",
] as const

type GuideSlug = (typeof validSlugs)[number]

// Guide content metadata
const guideData: Record<GuideSlug, {
  en: { title: string; description: string; content: string[] }
  tr: { title: string; description: string; content: string[] }
  readTime: number
  datePublished: string
  dateModified: string
}> = {
  "how-to-write-letter-to-future-self": {
    en: {
      title: "How to Write a Letter to Your Future Self",
      description: "A complete guide to writing meaningful, impactful letters to your future self with prompts, tips, and examples.",
      content: [
        "Writing a letter to your future self is one of the most powerful personal development exercises you can do. It creates a bridge between who you are now and who you'll become.",
        "The best time to write is during moments of transition: New Year's Day, birthdays, graduations, or any milestone that marks a new chapter in your life.",
        "Start by choosing when you want to receive your letter. One year is a popular choice, but five or ten years can create even more powerful revelations.",
        "Be honest and vulnerable. Your future self deserves to hear your true thoughts, fears, hopes, and dreams. Don't censor yourself.",
        "Include specific details about your current life: where you live, who you love, what challenges you're facing, what brings you joy.",
        "Ask questions to your future self. What did you learn? What changed? What stayed the same? These create a dialogue across time.",
        "End with encouragement and compassion. Your future self will appreciate kindness, no matter what has transpired.",
      ],
    },
    tr: {
      title: "Gelecekteki Kendine Mektup Nasıl Yazılır",
      description: "İpuçları, teknikler ve örneklerle gelecekteki kendine anlamlı mektuplar yazmak için kapsamlı rehber.",
      content: [
        "Gelecekteki kendine mektup yazmak, yapabileceğiniz en güçlü kişisel gelişim egzersizlerinden biridir. Şu anki benliğiniz ile olacağınız kişi arasında bir köprü oluşturur.",
        "Yazmanın en iyi zamanı geçiş anlarıdır: Yeni yıl, doğum günleri, mezuniyetler veya hayatınızda yeni bir bölümü işaret eden herhangi bir dönüm noktası.",
        "Mektubunuzu ne zaman almak istediğinizi seçerek başlayın. Bir yıl popüler bir seçimdir, ancak beş veya on yıl daha güçlü keşifler yaratabilir.",
        "Dürüst ve savunmasız olun. Gelecekteki benliğiniz gerçek düşüncelerinizi, korkularınızı, umutlarınızı ve hayallerinizi duymayı hak ediyor.",
        "Mevcut hayatınız hakkında spesifik detaylar ekleyin: nerede yaşıyorsunuz, kimi seviyorsunuz, hangi zorluklarla karşılaşıyorsunuz.",
        "Gelecekteki kendinize sorular sorun. Ne öğrendiniz? Ne değişti? Ne aynı kaldı? Bunlar zaman boyunca bir diyalog oluşturur.",
        "Teşvik ve şefkatle bitirin. Gelecekteki benliğiniz, ne olursa olsun, nezaketi takdir edecektir.",
      ],
    },
    readTime: 8,
    datePublished: "2024-01-15",
    dateModified: "2024-12-01",
  },
  "science-of-future-self": {
    en: {
      title: "The Science of Future Self Connection",
      description: "Explore the psychology and neuroscience behind connecting with your future self for better decision-making.",
      content: [
        "Research by UCLA psychologist Hal Hershfield reveals that many people view their future selves as strangers, leading to poor long-term decisions.",
        "Brain imaging studies show that when people think about their future selves, the brain activity patterns are similar to thinking about strangers.",
        "The concept of 'temporal self-continuity' describes how connected we feel to our future selves across time.",
        "Studies show that people with stronger future-self continuity save more money, make healthier choices, and report higher life satisfaction.",
        "Writing letters to your future self is one of the most effective interventions for strengthening this connection.",
        "Even brief visualization exercises of your future self can improve decision-making and reduce procrastination.",
        "The key is to make your future self feel real, specific, and emotionally connected to your present self.",
      ],
    },
    tr: {
      title: "Gelecek Benlik Bağlantısının Bilimi",
      description: "Daha iyi karar verme için gelecek benliğinizle bağlantı kurmanın ardındaki psikoloji ve nörobilimi keşfedin.",
      content: [
        "UCLA psikoloğu Hal Hershfield'ın araştırması, birçok insanın gelecekteki benliklerini yabancılar olarak gördüğünü ve bunun kötü uzun vadeli kararlara yol açtığını ortaya koyuyor.",
        "Beyin görüntüleme çalışmaları, insanların gelecekteki benlikleri hakkında düşündüklerinde beyin aktivite kalıplarının yabancılar hakkında düşünmeye benzer olduğunu gösteriyor.",
        "'Zamansal benlik sürekliliği' kavramı, gelecekteki benliklerimize zaman içinde ne kadar bağlı hissettiğimizi tanımlar.",
        "Çalışmalar, daha güçlü gelecek-benlik sürekliliğine sahip insanların daha fazla para biriktirdiğini ve daha sağlıklı seçimler yaptığını gösteriyor.",
        "Gelecekteki kendinize mektup yazmak, bu bağlantıyı güçlendirmek için en etkili müdahalelerden biridir.",
        "Gelecekteki benliğinizin kısa görselleştirme egzersizleri bile karar vermeyi iyileştirebilir ve ertelemeyi azaltabilir.",
        "Anahtar, gelecekteki benliğinizi gerçek, spesifik ve şimdiki benliğinize duygusal olarak bağlı hissettirmektir.",
      ],
    },
    readTime: 12,
    datePublished: "2024-02-20",
    dateModified: "2024-11-15",
  },
  "time-capsule-vs-future-letter": {
    en: {
      title: "Time Capsule vs Future Letter: What's the Difference?",
      description: "Compare time capsules and future letters to find the best way to preserve your memories and messages.",
      content: [
        "Time capsules and future letters serve similar purposes but differ in execution and experience.",
        "Traditional time capsules are physical containers buried or hidden, containing objects, photos, and sometimes letters.",
        "Digital future letters focus purely on written communication, delivered electronically at a specified future date.",
        "Time capsules excel at preserving physical artifacts and creating a tangible discovery experience.",
        "Future letters excel at emotional expression, can be longer and more detailed, and are reliably delivered.",
        "Consider your goals: preserving objects vs. communicating thoughts? One-time discovery vs. repeated reflection?",
        "Many people find value in combining both: a physical time capsule with objects, plus digital letters for deeper personal reflection.",
      ],
    },
    tr: {
      title: "Zaman Kapsülü vs Gelecek Mektubu: Fark Nedir?",
      description: "Anılarınızı ve mesajlarınızı korumanın en iyi yolunu bulmak için zaman kapsüllerini ve gelecek mektuplarını karşılaştırın.",
      content: [
        "Zaman kapsülleri ve gelecek mektupları benzer amaçlara hizmet eder ancak uygulama ve deneyim açısından farklılık gösterir.",
        "Geleneksel zaman kapsülleri, nesneler, fotoğraflar ve bazen mektuplar içeren gömülü veya gizlenmiş fiziksel kaplardır.",
        "Dijital gelecek mektupları tamamen yazılı iletişime odaklanır ve belirli bir gelecek tarihte elektronik olarak teslim edilir.",
        "Zaman kapsülleri fiziksel eserleri korumada ve somut bir keşif deneyimi yaratmada üstündür.",
        "Gelecek mektupları duygusal ifadede üstündür, daha uzun ve detaylı olabilir ve güvenilir bir şekilde teslim edilir.",
        "Hedeflerinizi düşünün: nesneleri korumak mı, düşünceleri iletmek mi? Tek seferlik keşif mi, tekrarlanan düşünce mi?",
        "Birçok kişi her ikisini birleştirmekte değer buluyor: nesnelerle fiziksel bir zaman kapsülü ve daha derin kişisel düşünce için dijital mektuplar.",
      ],
    },
    readTime: 6,
    datePublished: "2024-03-10",
    dateModified: "2024-10-20",
  },
  "privacy-security-best-practices": {
    en: {
      title: "Privacy & Security Best Practices for Future Letters",
      description: "Learn how to keep your personal letters secure and private with encryption and safe storage practices.",
      content: [
        "Your letters to your future self contain your most personal thoughts. Protecting them is essential.",
        "End-to-end encryption means only you can read your letters - not even the service provider can access them.",
        "Look for services that use AES-256 encryption, the same standard used by governments and banks.",
        "Use strong, unique passwords and enable two-factor authentication when available.",
        "Consider what happens to your letters if the service shuts down - do they offer data export?",
        "For legacy letters, designate a trusted person who can access them if needed.",
        "Review privacy policies carefully - avoid services that may sell your data or use it for advertising.",
      ],
    },
    tr: {
      title: "Gelecek Mektupları için Gizlilik ve Güvenlik",
      description: "Şifreleme ve güvenli depolama uygulamalarıyla kişisel mektuplarınızı nasıl güvende tutacağınızı öğrenin.",
      content: [
        "Gelecekteki kendinize yazdığınız mektuplar en kişisel düşüncelerinizi içerir. Onları korumak esastır.",
        "Uçtan uca şifreleme, yalnızca sizin mektuplarınızı okuyabileceğiniz anlamına gelir - hizmet sağlayıcı bile erişemez.",
        "Hükümetler ve bankalar tarafından kullanılan aynı standart olan AES-256 şifreleme kullanan hizmetleri arayın.",
        "Güçlü, benzersiz şifreler kullanın ve mümkün olduğunda iki faktörlü kimlik doğrulamayı etkinleştirin.",
        "Hizmet kapanırsa mektuplarınıza ne olacağını düşünün - veri dışa aktarma sunuyorlar mı?",
        "Miras mektupları için, gerektiğinde erişebilecek güvenilir bir kişi belirleyin.",
        "Gizlilik politikalarını dikkatlice inceleyin - verilerinizi satabilecek veya reklam için kullanabilecek hizmetlerden kaçının.",
      ],
    },
    readTime: 10,
    datePublished: "2024-04-05",
    dateModified: "2024-12-10",
  },
  "letters-for-mental-health": {
    en: {
      title: "Using Letters for Mental Health & Wellbeing",
      description: "Discover therapeutic writing techniques and how letters to your future self can support mental health.",
      content: [
        "Therapeutic letter writing has been used by mental health professionals for decades.",
        "Writing to your future self creates psychological distance, helping you process emotions more effectively.",
        "Gratitude letters - to yourself or others - have been shown to increase happiness and reduce depression.",
        "Self-compassion letters can help combat negative self-talk and build resilience.",
        "Processing difficult emotions through writing activates different brain regions than verbal expression.",
        "Letters can serve as a record of progress, reminding you how far you've come during tough times.",
        "Important: Letter writing is a complement to, not a replacement for, professional mental health care when needed.",
      ],
    },
    tr: {
      title: "Ruh Sağlığı için Mektup Kullanımı",
      description: "Terapötik yazma tekniklerini ve gelecek mektuplarının ruh sağlığını nasıl destekleyebileceğini keşfedin.",
      content: [
        "Terapötik mektup yazma, onlarca yıldır ruh sağlığı profesyonelleri tarafından kullanılmaktadır.",
        "Gelecekteki kendinize yazmak psikolojik mesafe yaratır ve duyguları daha etkili bir şekilde işlemenize yardımcı olur.",
        "Şükran mektupları - kendinize veya başkalarına - mutluluğu artırır ve depresyonu azaltır.",
        "Öz-şefkat mektupları olumsuz iç konuşmayla mücadele etmeye ve dayanıklılık oluşturmaya yardımcı olabilir.",
        "Zor duyguları yazarak işlemek, sözlü ifadeden farklı beyin bölgelerini aktive eder.",
        "Mektuplar, zor zamanlarda ne kadar ilerlediğinizi hatırlatan bir ilerleme kaydı olarak hizmet edebilir.",
        "Önemli: Mektup yazmak, gerektiğinde profesyonel ruh sağlığı bakımının yerini tutmaz, onu tamamlar.",
      ],
    },
    readTime: 15,
    datePublished: "2024-05-15",
    dateModified: "2024-11-30",
  },
  "legacy-letters-guide": {
    en: {
      title: "The Complete Guide to Legacy Letters",
      description: "Learn how to write meaningful legacy letters, ethical wills, and messages for future generations.",
      content: [
        "Legacy letters are messages intended for loved ones after you're gone or for future generations.",
        "Unlike legal wills, ethical wills focus on values, life lessons, hopes, and love rather than material possessions.",
        "Consider writing letters to future children or grandchildren, even if they don't exist yet.",
        "Share stories from your life, wisdom you've gained, and values you hope to pass on.",
        "Include your hopes and dreams for your loved ones, without being prescriptive about their choices.",
        "Update your legacy letters periodically as your life and perspectives evolve.",
        "Store legacy letters securely with clear instructions for when and how they should be delivered.",
      ],
    },
    tr: {
      title: "Miras Mektupları Rehberi",
      description: "Anlamlı miras mektupları, etik vasiyetler ve gelecek nesillere mesajlar yazmayı öğrenin.",
      content: [
        "Miras mektupları, siz gittikten sonra sevdikleriniz veya gelecek nesiller için tasarlanmış mesajlardır.",
        "Yasal vasiyetlerin aksine, etik vasiyetler maddi mal yerine değerlere, hayat derslerine, umutlara ve sevgiye odaklanır.",
        "Henüz var olmasa bile gelecek çocuklara veya torunlara mektuplar yazmayı düşünün.",
        "Hayatınızdan hikayeler, kazandığınız bilgelik ve aktarmak istediğiniz değerleri paylaşın.",
        "Sevdikleriniz için umutlarınızı ve hayallerinizi ekleyin, ancak seçimleri konusunda kuralcı olmayın.",
        "Hayatınız ve perspektifleriniz geliştikçe miras mektuplarınızı düzenli olarak güncelleyin.",
        "Miras mektuplarını, ne zaman ve nasıl teslim edilmeleri gerektiğine dair açık talimatlarla güvenli bir şekilde saklayın.",
      ],
    },
    readTime: 14,
    datePublished: "2024-06-01",
    dateModified: "2024-12-05",
  },
}

/**
 * Guide → Template mapping for internal linking (SEO)
 * Maps each guide to relevant template categories
 */
const guideToTemplates: Record<GuideSlug, Array<{ category: string; slug: string; en: string; tr: string }>> = {
  "how-to-write-letter-to-future-self": [
    { category: "self-reflection", slug: "annual-self-check", en: "Annual Self-Check", tr: "Yıllık Öz-Kontrol" },
    { category: "self-reflection", slug: "mindfulness-moment", en: "Mindfulness Moment", tr: "Farkındalık Anı" },
    { category: "self-reflection", slug: "values-reflection", en: "Values Reflection", tr: "Değerler Düşüncesi" },
  ],
  "science-of-future-self": [
    { category: "goals", slug: "new-years-resolution", en: "New Year's Resolution", tr: "Yeni Yıl Kararı" },
    { category: "goals", slug: "five-year-vision", en: "5-Year Vision", tr: "5 Yıllık Vizyon" },
    { category: "goals", slug: "monthly-goals", en: "Monthly Goals", tr: "Aylık Hedefler" },
  ],
  "letters-for-mental-health": [
    { category: "self-reflection", slug: "mindfulness-moment", en: "Mindfulness Moment", tr: "Farkındalık Anı" },
    { category: "self-reflection", slug: "values-reflection", en: "Values Reflection", tr: "Değerler Düşüncesi" },
    { category: "gratitude", slug: "daily-gratitude", en: "Daily Gratitude", tr: "Günlük Şükran" },
    { category: "gratitude", slug: "people-im-thankful-for", en: "People I'm Thankful For", tr: "Minnettar Olduğum İnsanlar" },
  ],
  "legacy-letters-guide": [
    { category: "legacy", slug: "letter-to-future-child", en: "Letter to My Future Child", tr: "Gelecek Çocuğuma Mektup" },
    { category: "legacy", slug: "ethical-will", en: "Ethical Will", tr: "Etik Vasiyet" },
  ],
  "time-capsule-vs-future-letter": [
    { category: "legacy", slug: "letter-to-future-child", en: "Letter to My Future Child", tr: "Gelecek Çocuğuma Mektup" },
    { category: "milestones", slug: "birthday-letter", en: "Birthday Letter", tr: "Doğum Günü Mektubu" },
    { category: "milestones", slug: "anniversary", en: "Anniversary", tr: "Yıldönümü" },
  ],
  "privacy-security-best-practices": [], // Security-focused, no template recommendations
}

/**
 * Generate related templates for a guide
 */
function getRelatedTemplates(guideSlug: GuideSlug, locale: string) {
  const templates = guideToTemplates[guideSlug]
  const isEnglish = locale === "en"

  return templates.map(t => ({
    title: isEnglish ? t.en : t.tr,
    href: `/templates/${t.category}/${t.slug}`,
  }))
}

export async function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  if (!validSlugs.includes(slug as GuideSlug)) {
    return { title: "Not Found" }
  }

  const guide = guideData[slug as GuideSlug]
  const data = guide[locale === "tr" ? "tr" : "en"]

  return {
    title: `${data.title} | Capsule Note Guides`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "article",
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides/${slug}`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/guides/${slug}`,
      languages: {
        en: `${appUrl}/guides/${slug}`,
        tr: `${appUrl}/tr/guides/${slug}`,
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

  if (!validSlugs.includes(slug as GuideSlug)) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const guide = guideData[slug as GuideSlug]
  const data = guide[locale === "tr" ? "tr" : "en"]
  const relatedTemplates = getRelatedTemplates(slug as GuideSlug, locale)

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
        url={`${appUrl}${locale === "en" ? "" : "/" + locale}/guides/${slug}`}
      />
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: isEnglish ? "Guides" : "Rehberler", href: "/guides" },
          { name: data.title, href: `/guides/${slug}` },
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
        {data.content.map((paragraph, index) => (
          <p key={index} className="font-mono text-base text-charcoal/80 leading-relaxed mb-6">
            {paragraph}
          </p>
        ))}
      </article>

      {/* Related Templates Section */}
      {relatedTemplates.length > 0 && (
        <RelatedContent
          items={relatedTemplates}
          title={isEnglish ? "Try These Templates" : "Bu Şablonları Deneyin"}
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

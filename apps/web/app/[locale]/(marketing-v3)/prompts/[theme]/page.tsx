import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react"
import { notFound, permanentRedirect } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { BreadcrumbSchema } from "@/components/seo/json-ld"
import { SEO_LOCALES, getPromptThemePath, getPromptThemeSlug, getPromptThemeSlugInfo, normalizeSeoLocale } from "@/lib/seo/localized-slugs"
import { promptThemes, type PromptTheme } from "@/lib/seo/content-registry"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Theme metadata with prompts
const themeData: Record<PromptTheme, {
  en: { title: string; description: string; prompts: string[] }
  tr: { title: string; description: string; prompts: string[] }
}> = {
  "self-esteem": {
    en: {
      title: "Self-Esteem & Confidence Prompts",
      description: "Writing prompts to build self-worth and celebrate your unique journey.",
      prompts: [
        "What are three things you love about yourself today?",
        "Describe a challenge you overcame that you're proud of.",
        "What would you tell yourself if you were your own best friend?",
        "List five accomplishments, big or small, from this year.",
        "What qualities make you a good friend/partner/colleague?",
        "Describe a moment when you surprised yourself with your strength.",
        "What dreams have you achieved that once seemed impossible?",
        "Write about a time you stood up for yourself.",
        "What makes you unique and valuable to the world?",
        "What do you want your future self to remember about your worth?",
      ],
    },
    tr: {
      title: "Özsaygı ve Güven İpuçları",
      description: "Özsaygı oluşturmak ve benzersiz yolculuğunuzu kutlamak için yazma ipuçları.",
      prompts: [
        "Bugün kendiniz hakkında sevdiğiniz üç şey nedir?",
        "Gurur duyduğunuz, üstesinden geldiğiniz bir zorluğu anlatın.",
        "Kendi en iyi arkadaşınız olsaydınız kendinize ne söylerdiniz?",
        "Bu yıldan büyük veya küçük beş başarınızı listeleyin.",
        "Hangi özellikler sizi iyi bir arkadaş/partner/meslektaş yapıyor?",
        "Gücünüzle kendinizi şaşırttığınız bir anı anlatın.",
        "Bir zamanlar imkansız görünen hangi hayalleri gerçekleştirdiniz?",
        "Kendinize sahip çıktığınız bir zamanı yazın.",
        "Sizi dünyaya benzersiz ve değerli kılan nedir?",
        "Gelecekteki benliğinizin değeriniz hakkında ne hatırlamasını istiyorsunuz?",
      ],
    },
  },
  "grief": {
    en: {
      title: "Grief & Loss Prompts",
      description: "Gentle prompts for processing loss and honoring precious memories.",
      prompts: [
        "What is your favorite memory with the person you've lost?",
        "What would you want to tell them if you could have one more conversation?",
        "How has this loss changed your perspective on life?",
        "What traditions or habits help you feel connected to their memory?",
        "Describe a way they influenced who you are today.",
        "What advice do you think they would give you right now?",
        "How do you want to honor their memory in the future?",
        "What have you learned about yourself through this grief?",
        "Write about a dream you hope to achieve in their honor.",
        "What would you want your future self to remember about healing?",
      ],
    },
    tr: {
      title: "Keder ve Kayıp İpuçları",
      description: "Kaybı işlemek ve değerli anıları onurlandırmak için nazik ipuçları.",
      prompts: [
        "Kaybettiğiniz kişiyle en sevdiğiniz anınız nedir?",
        "Bir konuşma daha yapabilseydiniz onlara ne söylemek isterdiniz?",
        "Bu kayıp hayata bakış açınızı nasıl değiştirdi?",
        "Hangi gelenekler veya alışkanlıklar anılarına bağlı hissetmenize yardımcı oluyor?",
        "Bugün kim olduğunuzu nasıl etkilediklerini anlatın.",
        "Şu anda size hangi tavsiyeyi vereceklerini düşünüyorsunuz?",
        "Gelecekte anılarını nasıl onurlandırmak istiyorsunuz?",
        "Bu keder sürecinde kendiniz hakkında ne öğrendiniz?",
        "Onların onuruna gerçekleştirmeyi umduğunuz bir hayali yazın.",
        "Gelecekteki benliğinizin iyileşme hakkında ne hatırlamasını istiyorsunuz?",
      ],
    },
  },
  "graduation": {
    en: {
      title: "Graduation & Transition Prompts",
      description: "Capture this milestone and set intentions for your next chapter.",
      prompts: [
        "What are you most proud of accomplishing during this chapter?",
        "Who helped you get here, and how do you want to thank them?",
        "What fears do you have about this transition?",
        "Describe your ideal life one year from graduation.",
        "What lessons from this experience will you carry forward?",
        "What do you hope your future self has accomplished?",
        "Write advice to someone just starting the journey you completed.",
        "What surprised you most about this experience?",
        "How have you grown as a person during this time?",
        "What dreams do you have for the next chapter of your life?",
      ],
    },
    tr: {
      title: "Mezuniyet ve Geçiş İpuçları",
      description: "Bu dönüm noktasını yakalayın ve bir sonraki bölümünüz için niyetler belirleyin.",
      prompts: [
        "Bu bölümde başardığınız en gurur verici şey nedir?",
        "Buraya gelmenize kim yardımcı oldu ve onlara nasıl teşekkür etmek istiyorsunuz?",
        "Bu geçişle ilgili hangi korkularınız var?",
        "Mezuniyetten bir yıl sonra ideal hayatınızı anlatın.",
        "Bu deneyimden hangi dersleri ileriye taşıyacaksınız?",
        "Gelecekteki benliğinizin neyi başarmış olmasını umuyorsunuz?",
        "Tamamladığınız yolculuğa yeni başlayan birine tavsiye yazın.",
        "Bu deneyimde sizi en çok ne şaşırttı?",
        "Bu süre zarfında bir insan olarak nasıl büyüdünüz?",
        "Hayatınızın bir sonraki bölümü için hangi hayalleriniz var?",
      ],
    },
  },
  "sobriety": {
    en: {
      title: "Sobriety & Recovery Prompts",
      description: "Document your journey and encourage your future self.",
      prompts: [
        "Why did you decide to pursue sobriety?",
        "What has been the hardest part of this journey so far?",
        "Describe a moment of strength you're proud of.",
        "What tools or strategies have helped you most?",
        "Who has supported you, and how do you feel about that support?",
        "What do you want to remember on difficult days?",
        "How has your life improved since starting this journey?",
        "What advice would you give to someone just starting out?",
        "Describe the person you're becoming through recovery.",
        "What milestones are you looking forward to celebrating?",
      ],
    },
    tr: {
      title: "Ayıklık ve İyileşme İpuçları",
      description: "Yolculuğunuzu belgeleyin ve gelecekteki benliğinizi cesaretlendirin.",
      prompts: [
        "Neden ayıklığı sürdürmeye karar verdiniz?",
        "Şu ana kadar bu yolculuğun en zor kısmı ne oldu?",
        "Gurur duyduğunuz bir güç anını anlatın.",
        "Size en çok hangi araçlar veya stratejiler yardımcı oldu?",
        "Sizi kim destekledi ve bu destek hakkında ne hissediyorsunuz?",
        "Zor günlerde ne hatırlamak istiyorsunuz?",
        "Bu yolculuğa başladığınızdan beri hayatınız nasıl iyileşti?",
        "Yeni başlayan birine hangi tavsiyeyi verirdiniz?",
        "İyileşme yoluyla olmakta olduğunuz kişiyi anlatın.",
        "Hangi dönüm noktalarını kutlamayı sabırsızlıkla bekliyorsunuz?",
      ],
    },
  },
  "new-year": {
    en: {
      title: "New Year's Reflection Prompts",
      description: "Reflect on the past year and set meaningful intentions for the new one.",
      prompts: [
        "What were your biggest wins this year?",
        "What challenges taught you the most valuable lessons?",
        "How did you grow as a person over the past year?",
        "What are you most grateful for from this year?",
        "What do you want to leave behind in the old year?",
        "What are your top three goals for the coming year?",
        "How do you want to feel at the end of next year?",
        "What habits do you want to build or break?",
        "Who do you want to become in the next year?",
        "What message do you want your future self to remember?",
      ],
    },
    tr: {
      title: "Yeni Yıl Düşünce İpuçları",
      description: "Geçen yılı düşünün ve yeni yıl için anlamlı niyetler belirleyin.",
      prompts: [
        "Bu yılın en büyük kazanımlarınız nelerdi?",
        "Hangi zorluklar size en değerli dersleri öğretti?",
        "Geçen yıl boyunca bir insan olarak nasıl büyüdünüz?",
        "Bu yıldan en çok minnettarlık duyduğunuz şey nedir?",
        "Eski yılda neyi geride bırakmak istiyorsunuz?",
        "Gelecek yıl için en önemli üç hedefiniz nedir?",
        "Gelecek yılın sonunda nasıl hissetmek istiyorsunuz?",
        "Hangi alışkanlıkları oluşturmak veya kırmak istiyorsunuz?",
        "Gelecek yıl kim olmak istiyorsunuz?",
        "Gelecekteki benliğinizin hatırlamasını istediğiniz mesaj nedir?",
      ],
    },
  },
  "birthday": {
    en: {
      title: "Birthday Letter Prompts",
      description: "Celebrate another year of life with reflection and gratitude.",
      prompts: [
        "What are you most proud of from this past year of life?",
        "How have you changed since your last birthday?",
        "What are three things you want to accomplish before your next birthday?",
        "Who made this year special, and how can you thank them?",
        "What wisdom have you gained in your current age?",
        "Describe your perfect birthday one year from now.",
        "What fears do you want to conquer in your next year of life?",
        "How do you want to celebrate your next birthday?",
        "What message would you send to your younger self?",
        "What do you hope to tell yourself on your next birthday?",
      ],
    },
    tr: {
      title: "Doğum Günü Mektubu İpuçları",
      description: "Yansıma ve şükranla bir yıl daha hayatı kutlayın.",
      prompts: [
        "Bu geçen yılda en çok neyle gurur duyuyorsunuz?",
        "Son doğum gününüzden bu yana nasıl değiştiniz?",
        "Bir sonraki doğum gününüzden önce başarmak istediğiniz üç şey nedir?",
        "Bu yılı kim özel kıldı ve onlara nasıl teşekkür edebilirsiniz?",
        "Şu anki yaşınızda hangi bilgeliği kazandınız?",
        "Bir yıl sonra mükemmel doğum gününüzü anlatın.",
        "Hayatınızın bir sonraki yılında hangi korkuları yenmek istiyorsunuz?",
        "Bir sonraki doğum gününüzü nasıl kutlamak istiyorsunuz?",
        "Daha genç benliğinize hangi mesajı gönderirdiniz?",
        "Bir sonraki doğum gününüzde kendinize ne söylemeyi umuyorsunuz?",
      ],
    },
  },
  "career": {
    en: {
      title: "Career & Professional Growth Prompts",
      description: "Document your professional journey and set meaningful career goals.",
      prompts: [
        "What professional accomplishment are you most proud of?",
        "Where do you see your career in five years?",
        "What skills do you want to develop in the coming year?",
        "How do you define success in your career?",
        "What challenges are you currently facing at work?",
        "Describe your ideal work-life balance.",
        "Who has been a mentor or inspiration in your career?",
        "What would you do if you knew you couldn't fail?",
        "How do you want to make an impact through your work?",
        "What career advice would you give to your past self?",
      ],
    },
    tr: {
      title: "Kariyer ve Profesyonel Gelişim İpuçları",
      description: "Profesyonel yolculuğunuzu belgeleyin ve anlamlı kariyer hedefleri belirleyin.",
      prompts: [
        "En çok gurur duyduğunuz profesyonel başarı nedir?",
        "Beş yıl içinde kariyerinizi nerede görüyorsunuz?",
        "Gelecek yıl hangi becerileri geliştirmek istiyorsunuz?",
        "Kariyerinizde başarıyı nasıl tanımlıyorsunuz?",
        "İşte şu anda hangi zorluklarla karşı karşıyasınız?",
        "İdeal iş-yaşam dengenizi anlatın.",
        "Kariyerinizde kim mentor veya ilham kaynağı oldu?",
        "Başarısız olamayacağınızı bilseniz ne yapardınız?",
        "İşiniz aracılığıyla nasıl bir etki yaratmak istiyorsunuz?",
        "Geçmişteki benliğinize hangi kariyer tavsiyesini verirdiniz?",
      ],
    },
  },
  "relationships": {
    en: {
      title: "Relationships & Love Prompts",
      description: "Explore your connections and reflect on love in all its forms.",
      prompts: [
        "What do you value most in your closest relationships?",
        "How do you show love to the people important to you?",
        "What relationship patterns do you want to change?",
        "Describe a relationship that has shaped who you are.",
        "What have your past relationships taught you?",
        "How do you want to improve as a partner/friend/family member?",
        "What does healthy love look like to you?",
        "Who do you need to forgive, including yourself?",
        "What do you want your future relationships to look like?",
        "Write about a moment of deep connection you've experienced.",
      ],
    },
    tr: {
      title: "İlişkiler ve Aşk İpuçları",
      description: "Bağlantılarınızı keşfedin ve aşkı tüm biçimleriyle düşünün.",
      prompts: [
        "En yakın ilişkilerinizde en çok neye değer veriyorsunuz?",
        "Sizin için önemli olan insanlara sevginizi nasıl gösteriyorsunuz?",
        "Hangi ilişki kalıplarını değiştirmek istiyorsunuz?",
        "Kim olduğunuzu şekillendiren bir ilişkiyi anlatın.",
        "Geçmiş ilişkileriniz size ne öğretti?",
        "Bir partner/arkadaş/aile üyesi olarak nasıl gelişmek istiyorsunuz?",
        "Sağlıklı aşk sizin için nasıl görünüyor?",
        "Kendiniz dahil kimi affetmeniz gerekiyor?",
        "Gelecekteki ilişkilerinizin nasıl görünmesini istiyorsunuz?",
        "Yaşadığınız derin bir bağlantı anını yazın.",
      ],
    },
  },
}

export async function generateStaticParams() {
  const params: Array<{ locale: string; theme: string }> = []
  for (const locale of SEO_LOCALES) {
    for (const theme of promptThemes) {
      params.push({ locale, theme: getPromptThemeSlug(locale, theme) })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; theme: string }>
}): Promise<Metadata> {
  const { locale, theme } = await params

  const seoLocale = normalizeSeoLocale(locale)
  const themeInfo = getPromptThemeSlugInfo(seoLocale, theme)
  if (!themeInfo) {
    return { title: "Not Found" }
  }

  const data = themeData[themeInfo.id][locale === "tr" ? "tr" : "en"]
  const canonicalPath = getPromptThemePath(seoLocale, themeInfo.id)

  return {
    title: `${data.title} | Capsule Note`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "website",
      url: `${appUrl}${seoLocale === "en" ? "" : "/" + seoLocale}${canonicalPath}`,
    },
    alternates: {
      canonical: `${appUrl}${seoLocale === "en" ? "" : "/" + seoLocale}${canonicalPath}`,
      languages: {
        en: `${appUrl}${getPromptThemePath("en", themeInfo.id)}`,
        tr: `${appUrl}/tr${getPromptThemePath("tr", themeInfo.id)}`,
        "x-default": `${appUrl}${getPromptThemePath("en", themeInfo.id)}`,
      },
    },
  }
}

export default async function PromptThemePage({
  params,
}: {
  params: Promise<{ locale: string; theme: string }>
}) {
  const { locale, theme } = await params

  const seoLocale = normalizeSeoLocale(locale)
  const themeInfo = getPromptThemeSlugInfo(seoLocale, theme)
  if (!themeInfo) {
    notFound()
  }

  if (!themeInfo.isCanonical) {
    const canonicalPath = getPromptThemePath(seoLocale, themeInfo.id)
    const localePrefix = seoLocale === "en" ? "" : `/${seoLocale}`
    permanentRedirect(`${localePrefix}${canonicalPath}`)
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const data = themeData[themeInfo.id][locale === "tr" ? "tr" : "en"]
  const currentPath = getPromptThemePath(seoLocale, themeInfo.id)

  return (
    <LegalPageLayout>
      {/* Schema.org - Breadcrumbs only, no ItemListSchema to avoid query URL bloat */}
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: isEnglish ? "Prompts" : "İpuçları", href: "/prompts" },
          { name: data.title, href: currentPath },
        ]}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "All Prompts" : "Tüm İpuçları"}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <span className={cn("font-mono text-xs text-charcoal/60 mb-2 block", uppercaseClass)}>
          {isEnglish ? "Writing Prompts" : "Yazma İpuçları"}
        </span>
        <h1 className={cn("font-mono text-3xl md:text-4xl text-charcoal mb-4", uppercaseClass)}>
          {data.title}
        </h1>
        <p className="font-mono text-base text-charcoal/70 max-w-2xl">
          {data.description}
        </p>
      </header>

      {/* Prompts List */}
      <section className="space-y-3">
        {data.prompts.map((prompt, index) => (
          <Link
            key={index}
            href={`/write-letter?prompt=${encodeURIComponent(prompt)}` as "/write-letter"}
            className={cn(
              "group flex items-start gap-4 p-5 border-2 border-charcoal bg-white",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-duck-yellow/30 border border-charcoal/20" style={{ borderRadius: "2px" }}>
              <Lightbulb className="h-4 w-4 text-charcoal" />
            </div>
            <div className="flex-grow">
              <p className="font-mono text-base text-charcoal leading-relaxed">
                {prompt}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          </Link>
        ))}
      </section>

      {/* CTA */}
      <div className="mt-10 pt-8 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "p-8 border-2 border-charcoal bg-purple-100/50",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-xl text-charcoal mb-4", uppercaseClass)}>
            {isEnglish ? "Have Your Own Prompt Idea?" : "Kendi İpucu Fikriniz mi Var?"}
          </h2>
          <p className="font-mono text-sm text-charcoal/70 mb-6">
            {isEnglish
              ? "You don't need a prompt to write a meaningful letter. Start with a blank canvas and let your thoughts flow."
              : "Anlamlı bir mektup yazmak için bir ipucuna ihtiyacınız yok. Boş bir tuvalle başlayın ve düşüncelerinizin akmasına izin verin."}
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

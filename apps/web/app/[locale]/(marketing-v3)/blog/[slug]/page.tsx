import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag } from "lucide-react"
import { notFound } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../_components/legal-page-layout"
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { RelatedContent } from "@/components/seo/related-content"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Valid blog post slugs
const validSlugs = [
  "why-write-to-future-self",
  "new-year-letter-ideas",
  "graduation-letters-guide",
  "physical-mail-vs-email",
  "letter-writing-tips",
] as const

type BlogSlug = (typeof validSlugs)[number]

// Blog post data
const postData: Record<BlogSlug, {
  en: { title: string; description: string; content: string[] }
  tr: { title: string; description: string; content: string[] }
  category: string
  readTime: number
  datePublished: string
  dateModified: string
}> = {
  "why-write-to-future-self": {
    en: {
      title: "Why Write to Your Future Self? The Power of Time-Traveling Messages",
      description: "Discover the psychological benefits and transformative power of writing letters to your future self.",
      content: [
        "In our fast-paced digital world, the simple act of writing a letter to your future self might seem quaint or even pointless. But this practice carries profound psychological benefits that science is only beginning to understand.",
        "Writing to your future self creates what psychologists call 'temporal self-continuity' - a sense of connection between who you are now and who you'll become. This connection is surprisingly fragile; brain imaging studies show that when people think about their future selves, the neural activity resembles thinking about a stranger.",
        "By writing a letter, you're essentially building a bridge across time. You're forcing your brain to recognize that your future self is still you - with all your hopes, fears, dreams, and memories.",
        "The benefits extend beyond psychology. Research shows that people with stronger connections to their future selves make better financial decisions, engage in healthier behaviors, and experience greater life satisfaction.",
        "There's also the simple magic of receiving a message from your past. When that letter arrives - whether by email or physical mail - you get a snapshot of who you were at a specific moment in time. Your priorities, your concerns, your dreams. It's like having a conversation with a version of yourself that no longer exists.",
        "The act of writing itself is therapeutic. It forces you to slow down, reflect, and articulate thoughts that might otherwise remain vague feelings. You can't write to your future self without first understanding your present self.",
        "So why write to your future self? Because it makes you more present, more connected to your journey through life, and more intentional about who you're becoming. In a world full of noise and distraction, that's a gift worth giving yourself.",
      ],
    },
    tr: {
      title: "Neden Gelecekteki Kendine Yazmalısın? Zaman Yolculuğu Mesajlarının Gücü",
      description: "Gelecekteki kendinize mektup yazmanın psikolojik faydalarını ve dönüştürücü gücünü keşfedin.",
      content: [
        "Hızlı tempolu dijital dünyamızda, gelecekteki kendinize mektup yazmak basit eylemi modası geçmiş veya anlamsız görünebilir. Ancak bu uygulama, bilimin henüz anlamaya başladığı derin psikolojik faydalar taşımaktadır.",
        "Gelecekteki kendinize yazmak, psikologların 'zamansal benlik sürekliliği' dediği şeyi yaratır - şu anda kim olduğunuz ile kim olacağınız arasında bir bağlantı hissi.",
        "Bir mektup yazarak, esasen zaman boyunca bir köprü inşa ediyorsunuz. Beyninizi, gelecekteki benliğinizin hala siz olduğunu - tüm umutlarınız, korkularınız, hayalleriniz ve anılarınızla - kabul etmeye zorluyorsunuz.",
        "Faydalar psikolojinin ötesine uzanır. Araştırmalar, gelecekteki benlikleriyle daha güçlü bağlantıları olan insanların daha iyi finansal kararlar aldığını ve daha sağlıklı davranışlarda bulunduğunu göstermektedir.",
        "Ayrıca geçmişinizden bir mesaj almanın basit büyüsü var. O mektup geldiğinde - ister e-posta ister fiziksel posta olsun - belirli bir andaki kim olduğunuzun bir anlık görüntüsünü alırsınız.",
        "Yazma eyleminin kendisi terapötiktir. Yavaşlamanızı, düşünmenizi ve aksi takdirde belirsiz duygular olarak kalabilecek düşünceleri ifade etmenizi zorlar.",
        "Peki neden gelecekteki kendinize yazmalısınız? Çünkü sizi daha şimdiki, hayattaki yolculuğunuza daha bağlı ve kim olacağınız konusunda daha niyetli kılar.",
      ],
    },
    category: "inspiration",
    readTime: 5,
    datePublished: "2024-12-10",
    dateModified: "2024-12-10",
  },
  "new-year-letter-ideas": {
    en: {
      title: "25 New Year's Letter Ideas for 2025",
      description: "Creative prompts and ideas to write a meaningful New Year's letter to your future self.",
      content: [
        "The turn of a new year is one of the most powerful times to write a letter to your future self. Here are 25 ideas to inspire your New Year's letter for 2025.",
        "1. Reflect on your biggest win of the past year. What made it special? 2. Describe where you are right now - physically, emotionally, professionally. 3. List three fears you want to conquer in the new year.",
        "4. Write about a relationship that grew stronger. 5. Share a lesson learned the hard way. 6. Describe your ideal day one year from now. 7. What habits do you want to build or break?",
        "8. Write a thank-you note to your past self. 9. Share your wildest dream, no matter how impossible it seems. 10. Describe how you want to feel at the end of next year.",
        "11. What would you tell yourself if you could go back to last January? 12. List the people who made this year meaningful. 13. What books, movies, or songs defined your year?",
        "14. Write about a moment of unexpected joy. 15. Share a goal you achieved that once seemed impossible. 16. What do you want to be remembered for? 17. Describe a risk you want to take.",
        "18. Write about what home means to you. 19. Share a piece of advice you received this year. 20. What brings you peace? 21. Describe your relationship with yourself.",
        "22. What would you do if you knew you couldn't fail? 23. Write about someone who inspires you. 24. Share a tradition you want to start. 25. End with a message of hope for your future self.",
        "Remember, there's no right or wrong way to write your New Year's letter. The most important thing is that it comes from your heart.",
      ],
    },
    tr: {
      title: "2025 için 25 Yeni Yıl Mektubu Fikri",
      description: "Gelecekteki kendinize anlamlı bir Yeni Yıl mektubu yazmak için yaratıcı fikirler ve ipuçları.",
      content: [
        "Yeni bir yılın başlangıcı, gelecekteki kendinize mektup yazmak için en güçlü zamanlardan biridir. İşte 2025 Yeni Yıl mektubunuz için ilham verecek 25 fikir.",
        "1. Geçen yılın en büyük kazancınızı düşünün. 2. Şu anda nerede olduğunuzu anlatın - fiziksel, duygusal, profesyonel olarak. 3. Yeni yılda yenmek istediğiniz üç korkuyu listeleyin.",
        "4. Güçlenen bir ilişki hakkında yazın. 5. Zor yoldan öğrenilen bir ders paylaşın. 6. Bir yıl sonra ideal gününüzü anlatın. 7. Hangi alışkanlıkları oluşturmak veya kırmak istiyorsunuz?",
        "8. Geçmiş benliğinize bir teşekkür notu yazın. 9. Ne kadar imkansız görünürse görünsün en çılgın hayalinizi paylaşın. 10. Gelecek yılın sonunda nasıl hissetmek istediğinizi anlatın.",
        "11. Geçen Ocak ayına geri dönebilseydiniz kendinize ne söylerdiniz? 12. Bu yılı anlamlı kılan insanları listeleyin. 13. Hangi kitaplar, filmler veya şarkılar yılınızı tanımladı?",
        "14. Beklenmedik bir sevinç anı hakkında yazın. 15. Bir zamanlar imkansız görünen, başardığınız bir hedefi paylaşın. 16. Ne için hatırlanmak istiyorsunuz?",
        "17. Almak istediğiniz bir riski anlatın. 18. Ev sizin için ne anlama geliyor yazın. 19. Bu yıl aldığınız bir tavsiyeyi paylaşın. 20. Size ne huzur veriyor?",
        "21. Kendinizle ilişkinizi anlatın. 22. Başarısız olamayacağınızı bilseniz ne yapardınız? 23. Size ilham veren biri hakkında yazın. 24. Başlatmak istediğiniz bir gelenek paylaşın.",
        "25. Gelecekteki benliğinize bir umut mesajıyla bitirin. Unutmayın, Yeni Yıl mektubunuzu yazmanın doğru veya yanlış bir yolu yok. En önemli şey kalpten gelmesi.",
      ],
    },
    category: "ideas",
    readTime: 7,
    datePublished: "2024-12-05",
    dateModified: "2024-12-05",
  },
  "graduation-letters-guide": {
    en: {
      title: "Graduation Letters: A Complete Guide",
      description: "How to write a powerful graduation letter that captures this milestone moment.",
      content: [
        "Graduation marks one of life's most significant transitions. Whether you're finishing high school, college, or a graduate program, writing a letter to your future self can help capture this moment and set intentions for what comes next.",
        "Start by acknowledging where you are. Describe the feelings of this moment - the excitement, the uncertainty, the pride, the fear. Your future self will want to remember exactly how it felt.",
        "Reflect on your journey. What challenges did you overcome? Who helped you along the way? What moments defined your experience? These details become precious with time.",
        "Write about your hopes and dreams. Where do you see yourself in 5 years? What kind of person do you want to become? What impact do you want to make? Don't hold back - dream big.",
        "Address your fears. What worries you about the future? By naming your fears, you give your future self context and perspective. Often, the things we fear most never come to pass.",
        "Include advice for your future self. What do you know now that you want to remember? What lessons from this chapter should you carry forward?",
        "End with encouragement. Remind your future self that you believe in them. This might seem simple, but receiving words of support from your past self is surprisingly powerful.",
        "Choose when to receive your letter. One year is a popular choice - you'll be past the initial transition and into your new chapter. Five years shows dramatic change. Ten years offers profound perspective.",
        "Consider making this a tradition. Many people write graduation letters at every major milestone, creating a series of time capsules documenting their growth.",
      ],
    },
    tr: {
      title: "Mezuniyet Mektupları: Kapsamlı Rehber",
      description: "Bu dönüm noktası anını yakalayan güçlü bir mezuniyet mektubu nasıl yazılır.",
      content: [
        "Mezuniyet, hayatın en önemli geçişlerinden birini işaret eder. İster lise, ister üniversite, ister yüksek lisans programı bitiriyor olun, gelecekteki kendinize bir mektup yazmak bu anı yakalamanıza yardımcı olabilir.",
        "Nerede olduğunuzu kabul ederek başlayın. Bu anın duygularını anlatın - heyecan, belirsizlik, gurur, korku. Gelecekteki benliğiniz tam olarak nasıl hissettirdiğini hatırlamak isteyecek.",
        "Yolculuğunuzu düşünün. Hangi zorlukların üstesinden geldiniz? Kim size yol boyunca yardımcı oldu? Hangi anlar deneyiminizi tanımladı? Bu ayrıntılar zamanla değerli hale gelir.",
        "Umutlarınız ve hayalleriniz hakkında yazın. 5 yıl içinde kendinizi nerede görüyorsunuz? Ne tür bir insan olmak istiyorsunuz? Kendinizi tutmayın - büyük hayaller kurun.",
        "Korkularınıza değinin. Gelecek hakkında sizi ne endişelendiriyor? Korkularınızı adlandırarak, gelecekteki benliğinize bağlam ve perspektif veriyorsunuz.",
        "Gelecekteki benliğinize tavsiye ekleyin. Hatırlamak istediğiniz şu anda ne biliyorsunuz? Bu bölümden hangi dersleri ileriye taşımalısınız?",
        "Cesaretlendirmeyle bitirin. Gelecekteki benliğinize onlara inandığınızı hatırlatın. Bu basit görünebilir, ancak geçmiş benliğinizden destek sözleri almak şaşırtıcı derecede güçlüdür.",
        "Mektubunuzu ne zaman alacağınızı seçin. Bir yıl popüler bir seçimdir - ilk geçişin ötesinde olacaksınız. Beş yıl dramatik değişim gösterir. On yıl derin bir perspektif sunar.",
        "Bunu bir gelenek haline getirmeyi düşünün. Birçok insan her büyük dönüm noktasında mezuniyet mektupları yazar ve büyümelerini belgeleyen bir dizi zaman kapsülü oluşturur.",
      ],
    },
    category: "guides",
    readTime: 6,
    datePublished: "2024-11-20",
    dateModified: "2024-11-20",
  },
  "physical-mail-vs-email": {
    en: {
      title: "Physical Mail vs Email: Which is Better for Future Letters?",
      description: "Compare the experience of receiving a physical letter versus an email from your past self.",
      content: [
        "When writing to your future self, one of the first decisions you'll make is how you want to receive your letter. Both physical mail and email have their advantages.",
        "Email delivery is reliable and convenient. It arrives exactly when scheduled, whether you're traveling, moved to a new address, or simply checking your inbox. There's no risk of lost mail.",
        "Physical mail offers something email can't: a tangible connection to the past. Holding a letter that traveled through time, seeing your own handwriting or a professionally printed message - this creates a visceral, emotional experience.",
        "Many people describe receiving a physical letter from their past self as more 'real' and impactful. There's ceremony in opening an envelope, unfolding paper, reading words that aren't backlit by a screen.",
        "Consider your lifestyle and preferences. Do you keep a consistent mailing address? Do you prefer digital or physical keepsakes? Are you sentimental about paper and ink?",
        "Some services, like Capsule Note, offer both options. You can receive an email immediately while a physical letter takes its slower journey. This gives you two touchpoints with your past self.",
        "The best choice is the one you'll actually use. A letter sent via email is infinitely better than a physical letter never written. Start with what feels natural, and you can always try the other method next time.",
      ],
    },
    tr: {
      title: "Fiziksel Posta vs E-posta: Gelecek Mektupları için Hangisi Daha İyi?",
      description: "Geçmişteki benliğinizden fiziksel bir mektup almakla e-posta almayı karşılaştırın.",
      content: [
        "Gelecekteki kendinize yazarken, vereceğiniz ilk kararlardan biri mektubunuzu nasıl almak istediğinizdir. Hem fiziksel posta hem de e-postanın avantajları vardır.",
        "E-posta teslimatı güvenilir ve uygundur. Seyahatte olsanız, yeni bir adrese taşınsanız veya sadece gelen kutunuzu kontrol ediyor olsanız bile tam olarak planlandığında gelir.",
        "Fiziksel posta, e-postanın sunamayacağı bir şey sunar: geçmişle somut bir bağlantı. Zaman içinde yolculuk yapmış bir mektubu tutmak, kendi el yazınızı veya profesyonelce basılmış bir mesajı görmek - bu içsel, duygusal bir deneyim yaratır.",
        "Birçok insan, geçmiş benliklerinden fiziksel bir mektup almayı daha 'gerçek' ve etkili olarak tanımlar. Bir zarfı açmanın, kağıdı açmanın, ekran tarafından aydınlatılmayan sözleri okumanın bir töreni vardır.",
        "Yaşam tarzınızı ve tercihlerinizi düşünün. Tutarlı bir posta adresiniz var mı? Dijital mi yoksa fiziksel hatıraları mı tercih edersiniz? Kağıt ve mürekkep konusunda duygusal mısınız?",
        "Capsule Note gibi bazı hizmetler her iki seçeneği de sunar. Fiziksel bir mektup daha yavaş yolculuğuna çıkarken hemen bir e-posta alabilirsiniz. Bu size geçmiş benliğinizle iki temas noktası verir.",
        "En iyi seçim, gerçekten kullanacağınız seçimdir. E-posta ile gönderilen bir mektup, hiç yazılmamış fiziksel bir mektuptan sonsuz derecede iyidir. Doğal hissettiren şeyle başlayın.",
      ],
    },
    category: "features",
    readTime: 4,
    datePublished: "2024-11-15",
    dateModified: "2024-11-15",
  },
  "letter-writing-tips": {
    en: {
      title: "10 Tips for Writing Letters Your Future Self Will Love",
      description: "Expert tips to make your letters more meaningful, personal, and impactful.",
      content: [
        "1. Be specific about the present. Don't just say 'things are good.' Describe your apartment, your morning routine, your favorite coffee order. These details become treasures.",
        "2. Write as if to a friend. Your future self is someone who cares about you deeply. Use a warm, conversational tone. Avoid being too formal or stiff.",
        "3. Include the mundane. What seems ordinary today will be fascinating tomorrow. Your commute, your playlist, the show you're binging - all of it matters.",
        "4. Ask questions. What do you hope has changed? What do you hope stayed the same? Questions create a dialogue across time.",
        "5. Be honest about your feelings. Don't perform happiness or success. If you're struggling, say so. Your future self will appreciate the authenticity.",
        "6. Include photos or references. Mention the photo you attached, or describe what you're wearing. Visual anchors make letters more vivid.",
        "7. Share your dreams, even silly ones. The trip you want to take, the skill you want to learn, the person you want to become. Dreams, documented, become roadmaps.",
        "8. Write about people you love. How do you feel about your friends, family, partner? These reflections on relationships are often the most treasured.",
        "9. Include gratitude. What are you thankful for right now? Gratitude letters, whether to yourself or others, have profound psychological benefits.",
        "10. End with encouragement. Tell your future self that you're proud of them, no matter what. This simple act of self-compassion echoes across time.",
      ],
    },
    tr: {
      title: "Gelecekteki Benliğinizin Seveceği Mektuplar için 10 İpucu",
      description: "Mektuplarınızı daha anlamlı, kişisel ve etkili hale getirmek için uzman ipuçları.",
      content: [
        "1. Şimdiki zaman hakkında spesifik olun. Sadece 'her şey iyi' demeyin. Dairenizi, sabah rutininizi, en sevdiğiniz kahve siparişinizi anlatın. Bu ayrıntılar hazine haline gelir.",
        "2. Bir arkadaşa yazıyormuş gibi yazın. Gelecekteki benliğiniz sizi derinden önemseyen biridir. Sıcak, konuşma tarzı bir ton kullanın. Çok resmi veya katı olmaktan kaçının.",
        "3. Sıradan olanı dahil edin. Bugün sıradan görünen şey yarın büyüleyici olacak. İşe gidişiniz, çalma listeniz, izlediğiniz dizi - hepsi önemli.",
        "4. Sorular sorun. Neyin değişmiş olmasını umuyorsunuz? Neyin aynı kalmasını umuyorsunuz? Sorular zaman boyunca bir diyalog yaratır.",
        "5. Duygularınız hakkında dürüst olun. Mutluluk veya başarı performansı sergilemeyin. Mücadele ediyorsanız, söyleyin. Gelecekteki benliğiniz özgünlüğü takdir edecek.",
        "6. Fotoğraflar veya referanslar ekleyin. Eklediğiniz fotoğraftan bahsedin veya ne giydiğinizi anlatın. Görsel çapalar mektupları daha canlı hale getirir.",
        "7. Aptalca olsa bile hayallerinizi paylaşın. Yapmak istediğiniz gezi, öğrenmek istediğiniz beceri, olmak istediğiniz kişi. Belgelenen hayaller yol haritaları haline gelir.",
        "8. Sevdiğiniz insanlar hakkında yazın. Arkadaşlarınız, aileniz, partneriniz hakkında nasıl hissediyorsunuz? İlişkiler üzerine bu düşünceler genellikle en değerli olanlardır.",
        "9. Şükran ekleyin. Şu anda minnettarlık duyduğunuz şey nedir? Kendinize veya başkalarına şükran mektupları derin psikolojik faydalara sahiptir.",
        "10. Cesaretlendirmeyle bitirin. Gelecekteki benliğinize, ne olursa olsun, onlarla gurur duyduğunuzu söyleyin. Bu basit öz-şefkat eylemi zaman boyunca yankılanır.",
      ],
    },
    category: "tips",
    readTime: 8,
    datePublished: "2024-11-01",
    dateModified: "2024-11-01",
  },
}

const categoryColors: Record<string, string> = {
  inspiration: "bg-duck-yellow/20",
  ideas: "bg-teal-primary/20",
  guides: "bg-duck-blue/20",
  features: "bg-purple-100",
  tips: "bg-pink-100",
}

/**
 * Blog → Template mapping for internal linking (SEO)
 * Maps each blog post to relevant template categories
 */
const blogToTemplates: Record<BlogSlug, Array<{ category: string; slug: string; en: string; tr: string }>> = {
  "why-write-to-future-self": [
    { category: "self-reflection", slug: "annual-self-check", en: "Annual Self-Check", tr: "Yıllık Öz-Kontrol" },
    { category: "self-reflection", slug: "values-reflection", en: "Values Reflection", tr: "Değerler Düşüncesi" },
    { category: "goals", slug: "five-year-vision", en: "5-Year Vision", tr: "5 Yıllık Vizyon" },
  ],
  "new-year-letter-ideas": [
    { category: "goals", slug: "new-years-resolution", en: "New Year's Resolution", tr: "Yeni Yıl Kararı" },
    { category: "goals", slug: "five-year-vision", en: "5-Year Vision", tr: "5 Yıllık Vizyon" },
    { category: "goals", slug: "monthly-goals", en: "Monthly Goals", tr: "Aylık Hedefler" },
  ],
  "graduation-letters-guide": [
    { category: "life-transitions", slug: "starting-fresh", en: "Starting Fresh", tr: "Yeni Başlangıç" },
    { category: "milestones", slug: "birthday-letter", en: "Birthday Letter", tr: "Doğum Günü Mektubu" },
    { category: "career", slug: "first-day-new-job", en: "First Day at New Job", tr: "Yeni İşte İlk Gün" },
  ],
  "physical-mail-vs-email": [], // Feature comparison, no template recommendations
  "letter-writing-tips": [
    { category: "self-reflection", slug: "mindfulness-moment", en: "Mindfulness Moment", tr: "Farkındalık Anı" },
    { category: "gratitude", slug: "daily-gratitude", en: "Daily Gratitude", tr: "Günlük Şükran" },
    { category: "gratitude", slug: "people-im-thankful-for", en: "People I'm Thankful For", tr: "Minnettar Olduğum İnsanlar" },
  ],
}

/**
 * Generate related templates for a blog post
 */
function getRelatedTemplates(blogSlug: BlogSlug, locale: string) {
  const templates = blogToTemplates[blogSlug]
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

  if (!validSlugs.includes(slug as BlogSlug)) {
    return { title: "Not Found" }
  }

  const post = postData[slug as BlogSlug]
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

  if (!validSlugs.includes(slug as BlogSlug)) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const post = postData[slug as BlogSlug]
  const data = post[locale === "tr" ? "tr" : "en"]
  const relatedTemplates = getRelatedTemplates(slug as BlogSlug, locale)

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
          <span className={cn("px-3 py-1 font-mono text-xs", categoryColors[post.category])}>
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

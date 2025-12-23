import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { ArrowLeft, ArrowRight, Clock, FileText, CheckCircle, Lightbulb } from "lucide-react"
import { notFound } from "next/navigation"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../../../_components/legal-page-layout"
import { HowToSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { RelatedContent } from "@/components/seo/related-content"
import { encodeTemplateId } from "@/lib/seo/template-ids"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

/**
 * Convert human-readable time (e.g., "20-30 min") to ISO 8601 duration format (e.g., "PT30M")
 * Uses the upper bound of the range for Schema.org compliance
 */
function toISO8601Duration(humanTime: string): string {
  const match = humanTime.match(/(\d+)(?:-(\d+))?\s*min/)
  if (!match || !match[1]) return "PT30M" // fallback default
  const upperBound = match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)
  return `PT${upperBound}M`
}

/**
 * Generate related templates from the same category
 * Used for internal linking and SEO
 */
function getRelatedTemplates(
  currentCategory: Category,
  currentSlug: string,
  locale: string
) {
  const isEnglish = locale === "en"
  const categoryTemplates = templateSlugs[currentCategory]
  const categoryData = templateData[currentCategory]

  return categoryTemplates
    .filter(slug => slug !== currentSlug)
    .map(slug => {
      const template = categoryData[slug]
      if (!template) return null
      return {
        title: template[isEnglish ? "en" : "tr"].title,
        href: `/templates/${currentCategory}/${slug}`,
      }
    })
    .filter((item): item is { title: string; href: string } => item !== null)
}

// Valid categories
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

// Category display names
const categoryNames: Record<Category, { en: string; tr: string }> = {
  "self-reflection": { en: "Self-Reflection", tr: "Öz-Düşünce" },
  "goals": { en: "Goals & Dreams", tr: "Hedefler" },
  "gratitude": { en: "Gratitude", tr: "Şükran" },
  "relationships": { en: "Relationships", tr: "İlişkiler" },
  "career": { en: "Career", tr: "Kariyer" },
  "life-transitions": { en: "Life Transitions", tr: "Yaşam Geçişleri" },
  "milestones": { en: "Milestones", tr: "Dönüm Noktaları" },
  "legacy": { en: "Legacy", tr: "Miras" },
}

// Template slugs per category
const templateSlugs: Record<Category, string[]> = {
  "self-reflection": ["annual-self-check", "mindfulness-moment", "values-reflection"],
  "goals": ["new-years-resolution", "five-year-vision", "monthly-goals"],
  "gratitude": ["daily-gratitude", "people-im-thankful-for"],
  "relationships": ["love-letter", "friendship-appreciation"],
  "career": ["first-day-new-job", "career-milestone"],
  "life-transitions": ["moving-to-new-city", "starting-fresh"],
  "milestones": ["birthday-letter", "anniversary"],
  "legacy": ["letter-to-future-child", "ethical-will"],
}

// Template content data
interface TemplateContent {
  en: {
    title: string
    description: string
    seoTitle: string
    seoDescription: string
    content: string[]
    guidingQuestions: string[]
    sampleOpening: string
    howToSteps: Array<{ name: string; text: string }>
  }
  tr: {
    title: string
    description: string
    seoTitle: string
    seoDescription: string
    content: string[]
    guidingQuestions: string[]
    sampleOpening: string
    howToSteps: Array<{ name: string; text: string }>
  }
  estimatedTime: string
}

const templateData: Record<Category, Record<string, TemplateContent>> = {
  "self-reflection": {
    "annual-self-check": {
      en: {
        title: "Annual Self-Check",
        description: "A yearly ritual of honest reflection on your growth, challenges, and aspirations.",
        seoTitle: "Annual Self-Check Letter Template | Capsule Note",
        seoDescription: "Write a yearly reflection letter to your future self. Review your growth, celebrate wins, and set intentions for the year ahead.",
        content: [
          "The annual self-check is a powerful practice of pausing once a year to take stock of where you are, where you've been, and where you want to go. It's a moment to be honest with yourself about your growth, your setbacks, and your dreams.",
          "This template guides you through the key questions that make an annual reflection meaningful. You'll capture not just what happened, but how it shaped you and what you want to carry forward.",
          "When you receive this letter in the future, you'll have a window into who you were at this moment - your hopes, fears, and the small details of daily life that memory tends to blur over time.",
        ],
        guidingQuestions: [
          "What were your biggest wins this year?",
          "What challenges did you overcome, and what did they teach you?",
          "What are you most grateful for right now?",
          "What do you want to remember about this time in your life?",
          "What are your hopes and dreams for the year ahead?",
          "What advice would you give your future self?",
        ],
        sampleOpening: "Dear Future Me, as I sit down to write this on [date], I'm reflecting on a year that has been...",
        howToSteps: [
          { name: "Find a quiet moment", text: "Set aside 30 minutes in a calm, comfortable space where you won't be interrupted." },
          { name: "Review your year", text: "Look through photos, journals, or calendars to remember key moments and milestones." },
          { name: "Answer the guiding questions", text: "Work through each question honestly, writing from your heart without self-censorship." },
          { name: "Add personal details", text: "Include specifics about your current life that you might forget - where you live, who you spend time with, what brings you joy." },
          { name: "Schedule delivery", text: "Choose a meaningful date one year from now, perhaps the same date next year." },
        ],
      },
      tr: {
        title: "Yillik Oz-Kontrol",
        description: "Buyumeniz, zorluklariniz ve hedefleriniz uzerine durust bir yillik dusunce ritueli.",
        seoTitle: "Yillik Oz-Kontrol Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize yillik bir dusunce mektubu yazin. Buyumenizi gozden gecirin, basarilarinizi kutlayin.",
        content: [
          "Yillik oz-kontrol, nerede oldugunuzu, nerede bulundugunuzu ve nereye gitmek istediginizi degerlendirmek icin yilda bir kez duraklamanin guclu bir uygulamasidir.",
          "Bu sablon, yillik bir dusunceyi anlamli kilan temel sorularda size rehberlik eder. Sadece ne oldugunu degil, sizi nasil sekillendirdigini ve ne tasimak istediginizi yakalayacaksiniz.",
          "Gelecekte bu mektubu aldiginizda, bu andaki kendinize bir pencere acilacak - umutlariniz, korkulariniz ve hafizanin zamanla bulaniklastirdigi gunluk yasamin kucuk detaylari.",
        ],
        guidingQuestions: [
          "Bu yil en buyuk basarilariniz neydi?",
          "Hangi zorluklarin ustesinden geldiniz ve size ne ogrettiler?",
          "Su anda en cok neye minnettar hissediyorsunuz?",
          "Hayatinizin bu doneminden ne hatirlamak istiyorsunuz?",
          "Onumuzdeki yil icin umutlariniz ve hayalleriniz neler?",
          "Gelecekteki kendinize ne tavsiye verirsiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, [tarih] tarihinde bunu yazarken, ... olan bir yili dusunuyorum.",
        howToSteps: [
          { name: "Sessiz bir an bul", text: "Rahatsiz edilmeyeceginiz sakin, rahat bir alanda 30 dakika ayirin." },
          { name: "Yilinizi gozden gecirin", text: "Onemli anlari ve kilometre taslarini hatirlamak icin fotograflara, gunluklere veya takvimlere bakin." },
          { name: "Rehber sorulari cevaplayin", text: "Her soruyu durustce, oz-sansur yapmadan kalbinizden yazarak cevaplayin." },
          { name: "Kisisel detaylar ekleyin", text: "Unutabileceginiz mevcut yasaminiz hakkinda ayrintilar ekleyin." },
          { name: "Teslimat zamani", text: "Bir yil sonra anlamli bir tarih secin." },
        ],
      },
      estimatedTime: "20-30 min",
    },
    "mindfulness-moment": {
      en: {
        title: "Mindfulness Moment",
        description: "Capture your present state of mind with awareness and compassion.",
        seoTitle: "Mindfulness Moment Letter Template | Capsule Note",
        seoDescription: "Write a mindful letter to your future self. Capture your present thoughts, feelings, and awareness with compassion.",
        content: [
          "A mindfulness moment letter invites you to pause and truly notice what's present in your experience right now - without judgment, with curiosity and compassion.",
          "This practice helps create a snapshot of your inner world that your future self can revisit. It's an anchor point that reminds you how you once experienced life.",
          "When you read this letter later, you'll reconnect with a version of yourself who took the time to be fully present, which can be a powerful gift during busy or challenging times.",
        ],
        guidingQuestions: [
          "What sensations do you notice in your body right now?",
          "What emotions are present for you in this moment?",
          "What thoughts keep arising, and can you observe them without attachment?",
          "What are you grateful for in this present moment?",
          "What do you want your future self to remember about being present?",
        ],
        sampleOpening: "Dear Future Me, I'm writing this from a place of presence, noticing...",
        howToSteps: [
          { name: "Ground yourself", text: "Take three deep breaths and settle into your body." },
          { name: "Notice without judgment", text: "Observe your thoughts, feelings, and sensations with curiosity rather than criticism." },
          { name: "Write from awareness", text: "Capture what you notice in simple, honest language." },
          { name: "Express compassion", text: "Include kind words for your future self." },
          { name: "Choose your delivery date", text: "Select a time when you might need this reminder of presence." },
        ],
      },
      tr: {
        title: "Farkindalik Ani",
        description: "Mevcut zihin durumunuzu farkindalik ve sefkatle yakalay in.",
        seoTitle: "Farkindalik Ani Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize farkinda bir mektup yazin. Mevcut dusuncelerinizi ve duygularinizi yakalay in.",
        content: [
          "Bir farkindalik ani mektubu, sizi durdurmaya ve su anda deneyiminizde neyin mevcut oldugunu gercekten fark etmeye davet eder.",
          "Bu uygulama, gelecekteki benliginizin yeniden ziyaret edebilecegi ic dunyanizin bir anlk goruntusunu olusturmaya yardimci olur.",
          "Bu mektubu daha sonra okudugunda, tam anlamiyla mevcut olmak icin zaman ayiran bir kendinle yeniden baglanti kuracaksiniz.",
        ],
        guidingQuestions: [
          "Su anda vucudunuzda hangi hisleri fark ediyorsunuz?",
          "Bu anda sizin icin hangi duygular mevcut?",
          "Hangi dusunceler ortaya cikmaya devam ediyor?",
          "Su anki anda neye minnettar hissediyorsunuz?",
          "Gelecekteki benliginizin mevcut olmak hakkinda ne hatilamasini istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bunu bir mevcudiyet yerinden yaziyorum, fark ederek...",
        howToSteps: [
          { name: "Kendinizi topraklayın", text: "Uc derin nefes alin ve vucudunuza yerlesin." },
          { name: "Yargilamadan fark edin", text: "Dusuncelerinizi, duygularinizi merakla gozlemleyin." },
          { name: "Farkindaliktan yazin", text: "Fark ettiklerinizi basit, durust bir dilde yakalay in." },
          { name: "Sefkat ifade edin", text: "Gelecekteki kendiniz icin nazik sozler ekleyin." },
          { name: "Teslimat tarihinizi secin", text: "Bu mevcudiyet hatilatmasina ihtiyac duyabileceginiz bir zaman secin." },
        ],
      },
      estimatedTime: "15-20 min",
    },
    "values-reflection": {
      en: {
        title: "Values Reflection",
        description: "Explore and document your core values and how you're living them.",
        seoTitle: "Values Reflection Letter Template | Capsule Note",
        seoDescription: "Write a letter exploring your core values. Document what matters most and how you're living your values.",
        content: [
          "Understanding your core values is essential for living a meaningful, authentic life. This template helps you articulate what matters most to you and reflect on how well your life aligns with those values.",
          "Values can shift over time as we grow and change. This letter creates a record of what you believe in now, which your future self can compare to see how you've evolved.",
          "By writing about your values, you strengthen your commitment to them and give your future self a compass for decision-making.",
        ],
        guidingQuestions: [
          "What are the 3-5 values that matter most to you?",
          "How are you currently living these values in your daily life?",
          "Where do you feel misaligned with your values?",
          "What would living more fully aligned with your values look like?",
          "What do you want your future self to remember about what matters?",
        ],
        sampleOpening: "Dear Future Me, I've been thinking deeply about what truly matters to me, and I want to share...",
        howToSteps: [
          { name: "Identify your values", text: "Reflect on what principles guide your decisions and bring you fulfillment." },
          { name: "Assess alignment", text: "Honestly evaluate how well your current life reflects these values." },
          { name: "Acknowledge gaps", text: "Note areas where you're not living in alignment and why." },
          { name: "Set intentions", text: "Write about how you want to live these values going forward." },
          { name: "Schedule for reflection", text: "Choose a date 6-12 months out to check in on your values." },
        ],
      },
      tr: {
        title: "Degerler Dusuncesi",
        description: "Temel degerlerinizi ve onlari nasil yasadiginizi kesfedin ve belgeleyin.",
        seoTitle: "Degerler Dusuncesi Mektup Sablonu | Capsule Note",
        seoDescription: "Temel degerlerinizi kesfeden bir mektup yazin. En onemli seyleri belgeleyin.",
        content: [
          "Temel degerlerinizi anlamak, anlamli ve otantik bir yasam surmek icin onemlidir.",
          "Degerler buyudukce ve degistikce zamanla degisebilir. Bu mektup, su anda neye indiginizin bir kaydini olusturur.",
          "Degerleriniz hakkinda yazarak, onlara bagiliginizi guclendirir ve gelecekteki kendinize karar verme icin bir pusula verirsiniz.",
        ],
        guidingQuestions: [
          "Sizin icin en onemli 3-5 deger nedir?",
          "Simdi bu degerleri gunluk hayatinizda nasil yasiyorsunuz?",
          "Degerlerinizle uyumsuz oldugunu nerede hissediyorsunuz?",
          "Degerlerinizle daha tam uyumlu yasamak neye benzerdi?",
          "Gelecekteki benliginizin neyin onemli oldugunu hatirlamasini istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, benim icin gercekten neyin onemli oldugunu derinden dusunuyordum...",
        howToSteps: [
          { name: "Degerlerinizi belirleyin", text: "Kararlarinizi yonlendiren ilkeleri dusunun." },
          { name: "Uyumu degerlendirin", text: "Mevcut yasaminizin bu degerleri ne kadar iyi yansittigini durustce degerlendirin." },
          { name: "Bosluklari kabul edin", text: "Uyum icinde yasamadiginiz alanlari not edin." },
          { name: "Niyetler belirleyin", text: "Bu degerleri ileriye dogru nasil yasamak istediginizi yazin." },
          { name: "Dusunce icin planlyin", text: "Degerlerinizi kontrol etmek icin 6-12 ay sonra bir tarih secin." },
        ],
      },
      estimatedTime: "25-30 min",
    },
  },
  "goals": {
    "new-years-resolution": {
      en: {
        title: "New Year's Resolution",
        description: "Set meaningful intentions and document your hopes for the year ahead.",
        seoTitle: "New Year's Resolution Letter Template | Capsule Note",
        seoDescription: "Write a New Year's resolution letter to your future self. Set meaningful goals and intentions for the year ahead.",
        content: [
          "New Year's resolutions are more powerful when written to your future self. Instead of a vague promise, you create a personal contract with accountability built in.",
          "This template helps you move beyond typical resolutions to deeper intentions. You'll articulate not just what you want to achieve, but why it matters to you.",
          "When your letter arrives next year, you'll see exactly what you hoped to accomplish and have the opportunity to reflect on your journey.",
        ],
        guidingQuestions: [
          "What do you most want to change or improve this year?",
          "Why does this goal matter deeply to you?",
          "What specific steps will you take to make it happen?",
          "What obstacles do you anticipate, and how will you overcome them?",
          "How will you know you've succeeded?",
          "What message do you want to send to your future self about this goal?",
        ],
        sampleOpening: "Dear Future Me, as we begin a new year, I'm making a commitment to myself about...",
        howToSteps: [
          { name: "Reflect on the past year", text: "Consider what worked and what didn't before setting new goals." },
          { name: "Choose meaningful goals", text: "Focus on 1-3 goals that truly matter rather than a long list." },
          { name: "Write your commitment", text: "Document your goals, your reasons, and your plan." },
          { name: "Anticipate challenges", text: "Address potential obstacles and how you'll handle them." },
          { name: "Schedule for December", text: "Set delivery for late December to review before the next new year." },
        ],
      },
      tr: {
        title: "Yeni Yil Karari",
        description: "Anlamli niyetler belirleyin ve onumuzdeki yil icin umutlarinizi belgeleyin.",
        seoTitle: "Yeni Yil Karari Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize bir yeni yil karari mektubu yazin. Anlamli hedefler ve niyetler belirleyin.",
        content: [
          "Yeni yil kararlari, gelecekteki kendinize yazildiginda daha gucludur.",
          "Bu sablon, tipik kararların otesine, daha derin niyetlere gecmenize yardimci olur.",
          "Mektubunuz gelecek yil geldiginde, baaşarmak istediginizi tam olarak goreceksiniz.",
        ],
        guidingQuestions: [
          "Bu yil en cok neyi degistirmek veya gelistirmek istiyorsunuz?",
          "Bu hedef neden sizin icin derinden onemli?",
          "Gerceklestirmek icin hangi spesifik adimları atacaksiniz?",
          "Hangi engelleri ongoryorsunuz ve onlarin ustesinden nasil geleceksiniz?",
          "Basardiginizi nasil bileceksiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, yeni bir yila baslarken, ... hakkinda kendime bir taahhut veriyorum.",
        howToSteps: [
          { name: "Gecen yili dusunun", text: "Yeni hedefler koymadan once neyin ise yaradigini dusunun." },
          { name: "Anlamli hedefler secin", text: "Uzun bir liste yerine gercekten onemli 1-3 hedefe odaklanin." },
          { name: "Taahutunuzu yazin", text: "Hedeflerinizi, nedenlerinizi ve planinizi belgeleyin." },
          { name: "Zorluklari ongorn", text: "Potansiyel engelleri ve onlarla nasil baş edeceginizi ele alin." },
          { name: "Aralik icin planlyin", text: "Yeni yildan once incelemek icin aralik sonuna teslimat ayarlayin." },
        ],
      },
      estimatedTime: "20-25 min",
    },
    "five-year-vision": {
      en: {
        title: "5-Year Vision",
        description: "Imagine and document your ideal life five years from now.",
        seoTitle: "5-Year Vision Letter Template | Capsule Note",
        seoDescription: "Write a letter envisioning your life 5 years from now. Document your dreams, goals, and the life you want to create.",
        content: [
          "A five-year vision letter is one of the most transformative exercises you can do. It forces you to think beyond immediate concerns and imagine the life you truly want.",
          "This template guides you to be specific about your vision - not just career goals, but relationships, health, personal growth, and how you want to feel.",
          "When you read this letter in five years, you'll gain invaluable perspective on how far you've come and how your dreams have evolved.",
        ],
        guidingQuestions: [
          "Where do you want to be living in 5 years?",
          "What kind of work do you want to be doing?",
          "What does your ideal day look like?",
          "Who are the important people in your life?",
          "How do you want to feel in your daily life?",
          "What will you have accomplished that makes you proud?",
        ],
        sampleOpening: "Dear Future Me, I'm writing to you from 2024, and I want to share my vision for who we'll become...",
        howToSteps: [
          { name: "Dream without limits", text: "Allow yourself to imagine without practical constraints at first." },
          { name: "Get specific", text: "Move from vague wishes to concrete details about your ideal life." },
          { name: "Cover all life areas", text: "Address career, relationships, health, home, and personal growth." },
          { name: "Include how you'll feel", text: "Emotions and wellbeing matter as much as achievements." },
          { name: "Set for 5 years out", text: "Schedule delivery for exactly 5 years from now." },
        ],
      },
      tr: {
        title: "5 Yillik Vizyon",
        description: "Bundan bes yil sonraki ideal hayatinizi hayal edin ve belgeleyin.",
        seoTitle: "5 Yillik Vizyon Mektup Sablonu | Capsule Note",
        seoDescription: "5 yil sonraki hayatinizi hayal eden bir mektup yazin. Hayallerinizi ve hedeflerinizi belgeleyin.",
        content: [
          "Bes yillik bir vizyon mektubu, yapabileceginiz en donusturucu egzersizlerden biridir.",
          "Bu sablon, vizyonunuz hakkinda spesifik olmaniz icin size rehberlik eder.",
          "Bu mektubu bes yil icinde okudugunda, ne kadar ilerlediginize dair paha bicilmez bir bakis acisi kazanacaksiniz.",
        ],
        guidingQuestions: [
          "5 yil icinde nerede yasamak istiyorsunuz?",
          "Ne tur bir is yapmak istiyorsunuz?",
          "Ideal gununuz neye benziyor?",
          "Hayatinizdaki onemli kisiler kimler?",
          "Gunluk hayatinizda nasil hissetmek istiyorsunuz?",
          "Sizi gurur duydurtan neyi başarmis olacaksiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, 2024'ten yaziyorum ve kim olacagimiza dair vizyonumu paylasmak istiyorum...",
        howToSteps: [
          { name: "Sinir olmadan hayal edin", text: "Kendinizi once pratik kisitlamalar olmadan hayal etmeye izin verin." },
          { name: "Spesifik olun", text: "Belirsiz dileklerden ideal hayatiniz hakkinda somut ayrintilara gecin." },
          { name: "Tum yasam alanlarini kapsyin", text: "Kariyer, iliskiler, saglik, ev ve kisisel gelisimi ele alin." },
          { name: "Nasil hissedeceginizi ekleyin", text: "Duygular ve iyilik hali başarilar kadar onemlidir." },
          { name: "5 yil icin ayarlayin", text: "Tam olarak 5 yil sonra teslimat planlyin." },
        ],
      },
      estimatedTime: "30-40 min",
    },
    "monthly-goals": {
      en: {
        title: "Monthly Goals",
        description: "Set and track monthly goals with a letter to your near-future self.",
        seoTitle: "Monthly Goals Letter Template | Capsule Note",
        seoDescription: "Write a monthly goals letter to your future self. Set intentions and track progress month by month.",
        content: [
          "Monthly goal letters create a rhythm of intention-setting and reflection that builds momentum over time.",
          "Unlike annual resolutions that fade by February, monthly letters keep you engaged with your growth throughout the year.",
          "Each month, you'll receive your past letter, reflect on your progress, and set new intentions - creating a powerful cycle of continuous improvement.",
        ],
        guidingQuestions: [
          "What are your top 3 priorities for this month?",
          "What habits do you want to build or maintain?",
          "What's one thing that would make this month a success?",
          "What might get in your way, and how will you handle it?",
          "What do you want to celebrate or acknowledge at month's end?",
        ],
        sampleOpening: "Dear Future Me, as we begin this new month, here's what I'm committing to...",
        howToSteps: [
          { name: "Review last month", text: "If you have a previous letter, read it first and reflect." },
          { name: "Choose 3 priorities", text: "Less is more - focus on what really matters this month." },
          { name: "Be specific", text: "Write concrete, measurable goals rather than vague intentions." },
          { name: "Anticipate challenges", text: "Name what might derail you and plan around it." },
          { name: "Schedule for month end", text: "Set delivery for the last day of the month." },
        ],
      },
      tr: {
        title: "Aylik Hedefler",
        description: "Yakin gelecekteki kendinize bir mektupla aylik hedefler belirleyin ve takip edin.",
        seoTitle: "Aylik Hedefler Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize aylik hedefler mektubu yazin. Niyetler belirleyin ve ilerlemeyi takip edin.",
        content: [
          "Aylik hedef mektuplari, zamanla ivme olusturan bir niyet belirleme ve dusunme ritmi olusturur.",
          "Subat'a kadar solan yillik kararlarin aksine, aylik mektuplar sizi yil boyunca buyumenizle mesgul tutar.",
          "Her ay, gecmis mektubunuzu alacak, ilerlemenizi dusunecek ve yeni niyetler belirleyeceksiniz.",
        ],
        guidingQuestions: [
          "Bu ay icin en onemli 3 onceliginiz nedir?",
          "Hangi aliskanliklari olusturmak veya surdurmek istiyorsunuz?",
          "Bu ayi başarili kilacak bir sey nedir?",
          "Yolunuza ne cikabilir ve bununla nasil başa cikacaksiniz?",
          "Ay sonunda neyi kutlamak veya kabul etmek istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bu yeni aya baslarken, taahut ettigim seyler sunlar...",
        howToSteps: [
          { name: "Gecen ayi gozden gecirin", text: "Onceki bir mektubunuz varsa, once onu okuyun ve dusunun." },
          { name: "3 oncelik secin", text: "Az coktur - bu ay gercekten neyin onemli olduguna odaklanin." },
          { name: "Spesifik olun", text: "Belirsiz niyetler yerine somut, olculebilir hedefler yazin." },
          { name: "Zorluklari ongorn", text: "Sizi raydan cikartabilecekleri adlandirin ve bunun etrafinda plan yapin." },
          { name: "Ay sonu icin planlyin", text: "Ayin son gunu icin teslimat ayarlayin." },
        ],
      },
      estimatedTime: "15-20 min",
    },
  },
  "gratitude": {
    "daily-gratitude": {
      en: {
        title: "Daily Gratitude",
        description: "Cultivate appreciation by documenting what you're grateful for today.",
        seoTitle: "Daily Gratitude Letter Template | Capsule Note",
        seoDescription: "Write a gratitude letter to your future self. Document what you appreciate today for future reflection.",
        content: [
          "Gratitude letters are powerful tools for mental wellbeing. Research shows that regularly expressing gratitude increases happiness and reduces depression.",
          "This template helps you capture not just what you're grateful for, but why it matters and how it makes you feel.",
          "Receiving a gratitude letter from your past self can brighten a difficult day and remind you of the good things in your life.",
        ],
        guidingQuestions: [
          "What three things are you most grateful for today?",
          "Who in your life are you thankful for, and why?",
          "What small pleasure brought you joy recently?",
          "What challenge are you grateful for because of what it taught you?",
          "What do you want your future self to appreciate about today?",
        ],
        sampleOpening: "Dear Future Me, I want to share what's filling my heart with gratitude today...",
        howToSteps: [
          { name: "Pause and reflect", text: "Take a few moments to really consider what you're thankful for." },
          { name: "Be specific", text: "Instead of 'family,' write about a specific moment or person." },
          { name: "Feel the gratitude", text: "Don't just list - actually feel appreciation as you write." },
          { name: "Include the unexpected", text: "Note gratitude for challenges or surprises." },
          { name: "Choose your delivery", text: "Send it to tomorrow, next week, or months from now." },
        ],
      },
      tr: {
        title: "Gunluk Sukran",
        description: "Bugun icin minnettar olduklarinizi belgeleyerek takdiri gelistirin.",
        seoTitle: "Gunluk Sukran Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize bir sukran mektubu yazin. Bugun takdir ettiklerinizi belgeleyin.",
        content: [
          "Sukran mektuplari zihinsel iyilik icin guclu araclardir.",
          "Bu sablon, sadece neye minnettar oldugunuzu degil, neden onemli oldugunu ve nasil hissettirdigini yakalamaniza yardimci olur.",
          "Gecmis benliginizden bir sukran mektubu almak zor bir gunu aydinlatabilir.",
        ],
        guidingQuestions: [
          "Bugun en cok minnettar oldugunuz uc sey nedir?",
          "Hayatinizda kime sukran duyuyorsunuz ve neden?",
          "Son zamanlarda size hangi kucuk zevk mutluluk getirdi?",
          "Size ogrettikleri nedeniyle hangi zorluga minnettar siniz?",
          "Gelecekteki benliginizin bugün hakkinda neyi takdir etmesini istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugün kalbimi sukranla dolduran seyleri paylasmak istiyorum...",
        howToSteps: [
          { name: "Durun ve dusunun", text: "Neye minnettar oldugunuzu gercekten dusunmek icin birkac dakika ayirin." },
          { name: "Spesifik olun", text: "'Aile' yerine belirli bir an veya kisi hakkinda yazin." },
          { name: "Sukrani hissedin", text: "Sadece listelemek yerine, yazarken gercekten takdir hissedin." },
          { name: "Beklenmedikleri ekleyin", text: "Zorluklar veya surprizler icin sukrani not edin." },
          { name: "Teslimati secin", text: "Yarina, gelecek haftaya veya aylar sonrasina gonderin." },
        ],
      },
      estimatedTime: "10-15 min",
    },
    "people-im-thankful-for": {
      en: {
        title: "People I'm Thankful For",
        description: "Honor the people who matter most by writing about why you appreciate them.",
        seoTitle: "People I'm Thankful For Letter Template | Capsule Note",
        seoDescription: "Write about the people you're grateful for. Create a meaningful record of appreciation for your loved ones.",
        content: [
          "Taking time to document your gratitude for specific people creates a meaningful record that your future self can cherish.",
          "This template helps you articulate what specific people mean to you - something we often feel but rarely express in detail.",
          "This letter can serve as a reminder to express your appreciation to these people, or as a treasured memory if circumstances change.",
        ],
        guidingQuestions: [
          "Who are the people who have most positively impacted your life?",
          "What specific qualities do you appreciate about each person?",
          "What have they taught you or helped you become?",
          "What moment or memory best represents your gratitude for them?",
          "What do you wish you could tell them?",
        ],
        sampleOpening: "Dear Future Me, I want to record my gratitude for the extraordinary people in my life...",
        howToSteps: [
          { name: "List your people", text: "Think of 3-5 people who have made a significant impact on you." },
          { name: "Go deep, not wide", text: "Focus on meaningful details rather than general praise." },
          { name: "Include memories", text: "Capture specific moments that illustrate your gratitude." },
          { name: "Write what you'd say", text: "Include things you'd want to tell them directly." },
          { name: "Consider sharing", text: "You might choose to share parts of this letter with them too." },
        ],
      },
      tr: {
        title: "Minnettar Oldugum Insanlar",
        description: "Onlari neden takdir ettiginizi yazarak en onemli insanlari onurlandirin.",
        seoTitle: "Minnettar Oldugum Insanlar Mektup Sablonu | Capsule Note",
        seoDescription: "Minnettar oldugunuz insanlar hakkinda yazin. Sevdikleriniz icin anlamli bir takdir kaydi olusturun.",
        content: [
          "Belirli insanlara sukraninizi belgelemek icin zaman ayirmak, gelecekteki benliginizin degerlendirdigi anlamli bir kayit olusturur.",
          "Bu sablon, belirli insanlarin sizin icin ne ifade ettigini ifade etmenize yardimci olur.",
          "Bu mektup, bu insanlara takdirinizi ifade etmenizi hatirlatan veya kosullar degisirse degerli bir ani olarak hizmet edebilir.",
        ],
        guidingQuestions: [
          "Hayatinizi en olumlu etkileyen insanlar kimler?",
          "Her kisinin hangi spesifik ozelliklerini takdir ediyorsunuz?",
          "Size ne ogrettiler veya olmaniza yardimci oldular?",
          "Onlara sukraninizi en iyi temsil eden hangi an veya ani?",
          "Onlara ne soylemek isterdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, hayatimdaki olaganustü insanlara sukranimi kaydetmek istiyorum...",
        howToSteps: [
          { name: "Insanlarinizi listeleyin", text: "Sizin uzerinizde onemli bir etki yapan 3-5 kisiyi dusunun." },
          { name: "Genis degil derin gidin", text: "Genel ovgu yerine anlamli ayrintilara odaklanin." },
          { name: "Anilari ekleyin", text: "Sukraninizi gosteren spesifik anilari yakalay in." },
          { name: "Soyleyeceklerinizi yazin", text: "Onlara dogrudan soylemek isteyeceginiz seyleri ekleyin." },
          { name: "Paylasmay i dusunun", text: "Bu mektubun bazı bolumlerini onlarla da paylasmay i secebilirsiniz." },
        ],
      },
      estimatedTime: "20-30 min",
    },
  },
  "relationships": {
    "love-letter": {
      en: {
        title: "Love Letter",
        description: "Express your love and appreciation for someone special in your life.",
        seoTitle: "Love Letter to Future Self Template | Capsule Note",
        seoDescription: "Write a love letter about someone special. Document your feelings and the love in your life.",
        content: [
          "A love letter to your future self about someone you love creates a time capsule of your deepest feelings.",
          "This template helps you articulate feelings that can be hard to express - capturing the essence of your love at this moment in time.",
          "Whether your relationship endures or evolves, this letter becomes a treasure - either a celebration of lasting love or a precious memory.",
        ],
        guidingQuestions: [
          "What do you love most about this person?",
          "How has loving them changed you?",
          "What moments together do you treasure most?",
          "What do you dream about for your future together?",
          "What do you want to remember about how you feel right now?",
        ],
        sampleOpening: "Dear Future Me, I want to capture how it feels to love [name] at this moment in our lives...",
        howToSteps: [
          { name: "Choose your subject", text: "This could be a romantic partner, family member, or dear friend." },
          { name: "Write from the heart", text: "Don't worry about being eloquent - be genuine." },
          { name: "Capture specific details", text: "Include the small things that make this love unique." },
          { name: "Express vulnerability", text: "Share your hopes, fears, and deepest feelings." },
          { name: "Choose a meaningful date", text: "An anniversary, birthday, or other significant date." },
        ],
      },
      tr: {
        title: "Ask Mektubu",
        description: "Hayatinizdaki ozel birine askinizi ve takdirinizi ifade edin.",
        seoTitle: "Gelecege Ask Mektubu Sablonu | Capsule Note",
        seoDescription: "Ozel biri hakkinda bir ask mektubu yazin. Duygularinizi ve hayatinizdaki aski belgeleyin.",
        content: [
          "Sevdiginiz biri hakkinda gelecekteki kendinize bir ask mektubu, en derin duygularinizin bir zaman kapsulunu olusturur.",
          "Bu sablon, ifade edilmesi zor olabilen duygulari dile getirmenize yardimci olur.",
          "Iliskiniz surse de evrilse de, bu mektup bir hazine haline gelir.",
        ],
        guidingQuestions: [
          "Bu kisinin en cok neyi seviyorsunuz?",
          "Onu sevmek sizi nasil degistirdi?",
          "Birlikte hangi anlari en cok degerli buluyorsunuz?",
          "Birlikte geleceginiz hakkinda ne hayali kuruyorsunuz?",
          "Su anda nasil hissettiginizi ne hatirlamak istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, hayatimizin bu aninda [isim]'i sevmenin nasil hissettirdigini yakalamak istiyorum...",
        howToSteps: [
          { name: "Konunuzu secin", text: "Bu romantik bir partner, aile uyesi veya sevgili bir arkadas olabilir." },
          { name: "Kalpten yazin", text: "Zarif olmak konusunda endiselenmeyin - icten olun." },
          { name: "Spesifik detaylari yakalay in", text: "Bu aski benzersiz kilan kucuk seyleri ekleyin." },
          { name: "Savunmaziz lig ifade edin", text: "Umutlarinizi, korkularinizi ve en derin duygularinizi paylasin." },
          { name: "Anlamli bir tarih secin", text: "Bir yildonumu, dogum gunu veya baska onemli bir tarih." },
        ],
      },
      estimatedTime: "20-30 min",
    },
    "friendship-appreciation": {
      en: {
        title: "Friendship Appreciation",
        description: "Celebrate and document the friendships that enrich your life.",
        seoTitle: "Friendship Appreciation Letter Template | Capsule Note",
        seoDescription: "Write a letter appreciating your friendships. Document what your friends mean to you.",
        content: [
          "Friendships are among life's greatest treasures, yet we rarely take time to fully appreciate them.",
          "This template helps you articulate what your friends mean to you and create a record of these important relationships.",
          "Reading this letter in the future will remind you of the people who matter and perhaps inspire you to reach out.",
        ],
        guidingQuestions: [
          "Who are the friends that have made the biggest impact on your life?",
          "What makes these friendships special?",
          "What have you experienced or learned together?",
          "How have these friends supported you in difficult times?",
          "What do you want to remember about these friendships?",
        ],
        sampleOpening: "Dear Future Me, I want to celebrate the friends who make my life richer...",
        howToSteps: [
          { name: "Identify your key friends", text: "Think about 2-4 friends who really matter to you." },
          { name: "Reflect on each friendship", text: "Consider what makes each relationship unique and valuable." },
          { name: "Include shared memories", text: "Capture moments that define these friendships." },
          { name: "Express your appreciation", text: "Write what you'd want them to know about their impact." },
          { name: "Consider the timing", text: "Send to a future you who might need this reminder." },
        ],
      },
      tr: {
        title: "Dostluk Takdiri",
        description: "Hayatinizi zenginlestiren dostluklari kutlayin ve belgeleyin.",
        seoTitle: "Dostluk Takdiri Mektup Sablonu | Capsule Note",
        seoDescription: "Dostluklarinizi takdir eden bir mektup yazin. Arkadaslarinizin sizin icin ne ifade ettigini belgeleyin.",
        content: [
          "Dostluklar yasamin en buyuk hazineleri arasindadir, ancak nadiren onlari tam olarak takdir etmek icin zaman ayiririz.",
          "Bu sablon, arkadaslarinizin sizin icin ne anlama geldigini dile getirmenize yardimci olur.",
          "Gelecekte bu mektubu okumak size onemli insanlari hatilatacak.",
        ],
        guidingQuestions: [
          "Hayatinizda en buyuk etkiyi yapmis arkadaslar kimler?",
          "Bu dostluklari ozel kilan nedir?",
          "Birlikte ne deneyimlediniz veya ogrendiniz?",
          "Bu arkadaslar zor zamanlarda size nasil destek oldular?",
          "Bu dostluklar hakkinda ne hatirlamak istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, hayatimi zenginlestiren arkadaslari kutlamak istiyorum...",
        howToSteps: [
          { name: "Anahtar arkadaslarinizi belirleyin", text: "Sizin icin gercekten onemli olan 2-4 arkadasi dusunun." },
          { name: "Her dostlugu dusunun", text: "Her iliskiyi benzersiz ve degerli kilan seyi dusunun." },
          { name: "Paylasilan anilari ekleyin", text: "Bu dostluklari tanimlayan anilari yakalay in." },
          { name: "Takdirinizi ifade edin", text: "Etkileri hakkinda bilmelerini istediginiz seyleri yazin." },
          { name: "Zamanimay i dusunun", text: "Bu hatiratmaya ihtiyac duyabilecek gelecekteki kendinize gonderin." },
        ],
      },
      estimatedTime: "20-25 min",
    },
  },
  "career": {
    "first-day-new-job": {
      en: {
        title: "First Day at New Job",
        description: "Capture the excitement and nerves of starting a new professional chapter.",
        seoTitle: "First Day New Job Letter Template | Capsule Note",
        seoDescription: "Write a letter on your first day at a new job. Document your hopes, expectations, and early impressions.",
        content: [
          "Your first day at a new job is filled with unique emotions - excitement, nervousness, hope, and uncertainty all mixed together.",
          "This template helps you capture this moment before it fades into routine, creating a record of who you were at the start.",
          "Reading this letter later will remind you how far you've come and what you hoped to achieve when you began.",
        ],
        guidingQuestions: [
          "What are you most excited about in this new role?",
          "What are your biggest hopes for this job?",
          "What first impressions do you have of your new workplace and colleagues?",
          "What do you hope to learn or accomplish in your first year?",
          "What concerns or nerves do you have, and how will you address them?",
        ],
        sampleOpening: "Dear Future Me, today is my first day at [company], and I want to capture everything I'm feeling...",
        howToSteps: [
          { name: "Write the same day", text: "Capture your first impressions while they're fresh." },
          { name: "Be honest about emotions", text: "Include both excitement and any anxiety you feel." },
          { name: "Note first impressions", text: "Your initial observations will be fascinating to revisit." },
          { name: "Set intentions", text: "Document what you hope to achieve and become." },
          { name: "Schedule for 1 year", text: "Your first anniversary at the job is perfect." },
        ],
      },
      tr: {
        title: "Yeni Iste Ilk Gun",
        description: "Yeni bir profesyonel bolume baslamanin heyecanini ve gerginligini yakalay in.",
        seoTitle: "Yeni Iste Ilk Gun Mektup Sablonu | Capsule Note",
        seoDescription: "Yeni bir iste ilk gununuzde bir mektup yazin. Umutlarinizi ve beklentilerinizi belgeleyin.",
        content: [
          "Yeni bir isteki ilk gununuz benzersiz duygularla doludur.",
          "Bu sablon, rutine donusmeden once bu ani yakalamaniza yardimci olur.",
          "Bu mektubu daha sonra okumak size ne kadar ilerlediginizi hatilatacak.",
        ],
        guidingQuestions: [
          "Bu yeni rolde en cok neyi merak ediyorsunuz?",
          "Bu is icin en buyuk umutlariniz neler?",
          "Yeni is yeriniz ve meslektaslariniz hakkinda ilk izlenimleriniz neler?",
          "Ilk yilinizda ne ogrenmek veya başarmak istiyorsunuz?",
          "Hangi endiseleriniz veya gerginlikleriniz var?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugun [sirket]'teki ilk gunum ve hissettiklerimin hepsini yakalamak istiyorum...",
        howToSteps: [
          { name: "Ayni gun yazin", text: "Ilk izlenimlerinizi tazeiken yakalay in." },
          { name: "Duygular hakkinda durust olun", text: "Hem heyecani hem de endiseyi ekleyin." },
          { name: "Ilk izlenimleri not edin", text: "Baslangic gozlemlerinizi yeniden ziyaret etmek buyuleyici olacak." },
          { name: "Niyetler belirleyin", text: "Ne başarmak ve olmak istediginizi belgeleyin." },
          { name: "1 yil icin planlyin", text: "Isteki ilk yildonumunuz mukemmeldir." },
        ],
      },
      estimatedTime: "15-20 min",
    },
    "career-milestone": {
      en: {
        title: "Career Milestone",
        description: "Document and celebrate significant achievements in your professional journey.",
        seoTitle: "Career Milestone Letter Template | Capsule Note",
        seoDescription: "Write a letter celebrating career milestones. Document promotions, achievements, and professional growth.",
        content: [
          "Career milestones deserve to be documented. Whether it's a promotion, completing a major project, or reaching a goal, these moments shape your professional identity.",
          "This template helps you capture not just what you achieved, but how you got there and what it means to you.",
          "Future you will appreciate having a record of your achievements, especially during challenging times when you need a reminder of your capabilities.",
        ],
        guidingQuestions: [
          "What milestone are you celebrating?",
          "What did it take to achieve this?",
          "Who helped you along the way?",
          "How does this achievement make you feel?",
          "What's next in your professional journey?",
        ],
        sampleOpening: "Dear Future Me, I'm writing to celebrate and document a significant moment in my career...",
        howToSteps: [
          { name: "Describe the achievement", text: "Be specific about what you accomplished." },
          { name: "Document the journey", text: "Capture what it took to get here." },
          { name: "Acknowledge others", text: "Note the people who helped make this possible." },
          { name: "Reflect on meaning", text: "Write about why this matters to you." },
          { name: "Look ahead", text: "Consider what you want to accomplish next." },
        ],
      },
      tr: {
        title: "Kariyer Donumu Noktasi",
        description: "Profesyonel yolculuginizdaki onemli başarilari belgeleyin ve kutlayin.",
        seoTitle: "Kariyer Donum Noktasi Mektup Sablonu | Capsule Note",
        seoDescription: "Kariyer donumlarini kutlayan bir mektup yazin. Terfileri ve başarilari belgeleyin.",
        content: [
          "Kariyer donumleri belgelenmey i hak eder.",
          "Bu sablon, sadece ne başardiginizi degil, oraya nasil geldiginizi ve sizin icin ne anlama geldigini yakalamaniza yardimci olur.",
          "Gelecekteki benliginiz, özellikle yeteneklerinizin hatiratmasina ihtiyac duydugunuz zorlu zamanlarda başarilarinizin kaydina sahip olmay i takdir edecektir.",
        ],
        guidingQuestions: [
          "Hangi donum noktasini kutluyorsunuz?",
          "Bunu başarmak icin ne gerekti?",
          "Yol boyunca size kim yardim etti?",
          "Bu başari size nasil hissettiriyor?",
          "Profesyonel yolculugonuzda sirada ne var?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, kariyerimde onemli bir ani kutlamak ve belgelemek icin yaziyorum...",
        howToSteps: [
          { name: "Başariyi tanimlayin", text: "Ne başardiginiz konusunda spesifik olun." },
          { name: "Yolculugu belgeleyin", text: "Buraya gelmek icin ne gerektigini yakalay in." },
          { name: "Baskalarini kabul edin", text: "Bunu mumkun kilan insanlari not edin." },
          { name: "Anlam uzerine dusunun", text: "Bunun neden sizin icin onemli oldugunu yazin." },
          { name: "Ileriye bakin", text: "Sirada ne başarmak istediginizi dusunun." },
        ],
      },
      estimatedTime: "20-25 min",
    },
  },
  "life-transitions": {
    "moving-to-new-city": {
      en: {
        title: "Moving to a New City",
        description: "Document the transition of relocating and starting fresh in a new place.",
        seoTitle: "Moving to New City Letter Template | Capsule Note",
        seoDescription: "Write a letter about moving to a new city. Capture your hopes, fears, and first impressions of your new home.",
        content: [
          "Moving to a new city is one of life's biggest transitions. It's filled with excitement, uncertainty, and the promise of new beginnings.",
          "This template helps you capture your state of mind during this transition, including what you're leaving behind and what you hope to find.",
          "When you read this letter from your new city, settled and established, you'll treasure the reminder of who you were at the start of this adventure.",
        ],
        guidingQuestions: [
          "Why are you making this move?",
          "What are you most excited about in your new city?",
          "What will you miss about where you're leaving?",
          "What do you hope to discover or become in this new place?",
          "What are your first impressions of your new home?",
        ],
        sampleOpening: "Dear Future Me, I'm writing during one of the biggest changes of my life - moving to [city]...",
        howToSteps: [
          { name: "Write during the transition", text: "Capture your feelings while they're still raw." },
          { name: "Honor what you're leaving", text: "Acknowledge the people, places, and routines you'll miss." },
          { name: "Express your hopes", text: "Write about what you want this move to bring." },
          { name: "Note first impressions", text: "Your early observations will be precious later." },
          { name: "Schedule for 1 year", text: "See how settled you've become in your new home." },
        ],
      },
      tr: {
        title: "Yeni Sehre Tasinma",
        description: "Tasınma ve yeni bir yerde yeniden baslamanin gecisini belgeleyin.",
        seoTitle: "Yeni Sehre Tasinma Mektup Sablonu | Capsule Note",
        seoDescription: "Yeni bir sehre tasinma hakkinda bir mektup yazin. Umutlarinizi ve ilk izlenimlerinizi yakalay in.",
        content: [
          "Yeni bir sehre tasinmak yasamin en buyuk gecislerinden biridir.",
          "Bu sablon, bu gecis sirasindaki ruh halinizi yakalamaniza yardimci olur.",
          "Bu mektubu yeni sehrinizden okudugunda, bu maceranin basinda kim oldugunuzun hatirasini degerli bulacaksiniz.",
        ],
        guidingQuestions: [
          "Bu tasınmay i neden yapiyorsunuz?",
          "Yeni sehrinizde en cok neyi merak ediyorsunuz?",
          "Ayrildiginiz yer hakkinda neyi ozleyeceksiniz?",
          "Bu yeni yerde neyi kesfetmek veya olmak istiyorsunuz?",
          "Yeni eviniz hakkindaki ilk izlenimleriniz neler?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, hayatimin en buyuk degisikliklerinden biri sirasinda yaziyorum - [sehir]'e tasınma...",
        howToSteps: [
          { name: "Gecis sirasinda yazin", text: "Duygularinizi hala tazeyken yakalay in." },
          { name: "Biraktiklarinizi onurlandirin", text: "Ozleyeceginiz insanlari, yerleri ve rutinleri kabul edin." },
          { name: "Umutlarinizi ifade edin", text: "Bu tasınmanin ne getirmesini istediginizi yazin." },
          { name: "Ilk izlenimleri not edin", text: "Erken gozlemleriniz daha sonra degerli olacak." },
          { name: "1 yil icin planlyin", text: "Yeni evinizde ne kadar yerlestginizi gorun." },
        ],
      },
      estimatedTime: "20-25 min",
    },
    "starting-fresh": {
      en: {
        title: "Starting Fresh",
        description: "Document a new beginning in any area of your life.",
        seoTitle: "Starting Fresh Letter Template | Capsule Note",
        seoDescription: "Write a letter about starting fresh. Document new beginnings and the person you're choosing to become.",
        content: [
          "Starting fresh is an act of courage. Whether after a ending, a failure, a loss, or simply a decision to change, new beginnings are filled with possibility.",
          "This template helps you mark this moment of renewal and document your intentions for what comes next.",
          "Your future self will cherish this letter as a record of your resilience and hope.",
        ],
        guidingQuestions: [
          "What are you leaving behind, and why?",
          "What does 'starting fresh' mean to you in this moment?",
          "What do you hope this new beginning will bring?",
          "What lessons from the past will you carry forward?",
          "Who do you want to become in this new chapter?",
        ],
        sampleOpening: "Dear Future Me, I'm writing at the beginning of something new...",
        howToSteps: [
          { name: "Acknowledge the past", text: "Briefly recognize what you're moving on from." },
          { name: "Define 'fresh' for you", text: "Articulate what this new beginning means specifically." },
          { name: "Set intentions", text: "Write about what you want to create going forward." },
          { name: "Take lessons forward", text: "Note wisdom you've gained that will serve you." },
          { name: "Choose your timing", text: "When would revisiting this be most meaningful?" },
        ],
      },
      tr: {
        title: "Yeniden Baslamak",
        description: "Hayatinizin herhangi bir alaninda yeni bir baslangici belgeleyin.",
        seoTitle: "Yeniden Baslamak Mektup Sablonu | Capsule Note",
        seoDescription: "Yeniden baslamak hakkinda bir mektup yazin. Yeni baslangiclarι ve olmayι sectginiz kisyi belgeleyin.",
        content: [
          "Yeniden baslamak bir cesaret eylemidir.",
          "Bu sablon, bu yenilenme anini isaretlemenize ve sonraki icin niyetlerinizi belgelemenize yardimci olur.",
          "Gelecekteki benliginiz, dayaniklilik ve umudunuzun kaydi olarak bu mektubu degerli bulacaktir.",
        ],
        guidingQuestions: [
          "Neyi geride birakiyorsunuz ve neden?",
          "Bu anda 'yeniden baslamak' sizin icin ne anlama geliyor?",
          "Bu yeni baslangicin ne getirmesini umuyorsunuz?",
          "Gecmisten hangi dersleri ileriye tasiyacaksiniz?",
          "Bu yeni bolumde kim olmak istiyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, yeni bir seyin basinda yaziyorum...",
        howToSteps: [
          { name: "Gecmisi kabul edin", text: "Kisaca neden ilerlediginizi kabul edin." },
          { name: "'Taze'yi kendiniz icin tanimlayin", text: "Bu yeni baslangicin ozellikle ne anlama geldigini ifade edin." },
          { name: "Niyetler belirleyin", text: "Ileriye dogru ne yaratmak istediginizi yazin." },
          { name: "Dersleri ileriye tasiyin", text: "Size hizmet edecek kazandiginiz bilgeligi not edin." },
          { name: "Zamanimay i secin", text: "Bunu yeniden ziyaret etmek ne zaman en anlamli olur?" },
        ],
      },
      estimatedTime: "20-25 min",
    },
  },
  "milestones": {
    "birthday-letter": {
      en: {
        title: "Birthday Letter",
        description: "Write a reflective letter to yourself on your birthday.",
        seoTitle: "Birthday Letter to Future Self Template | Capsule Note",
        seoDescription: "Write a birthday letter to your future self. Document your age, achievements, and hopes for the year ahead.",
        content: [
          "Your birthday is a natural time for reflection - a moment to look back on the year behind and ahead to the year to come.",
          "This template guides you to capture not just what happened this year, but who you've become and who you hope to be.",
          "Receiving this letter on your next birthday creates a beautiful tradition of connecting with your past self.",
        ],
        guidingQuestions: [
          "What are you most proud of from this past year?",
          "How have you grown or changed?",
          "What do you want to remember about this age?",
          "What are your hopes for the year ahead?",
          "What wisdom would you share with your older self?",
        ],
        sampleOpening: "Dear Future Me, happy birthday from your [age]-year-old self...",
        howToSteps: [
          { name: "Write on your birthday", text: "Make it a birthday tradition to write to your future self." },
          { name: "Reflect on the past year", text: "Consider your growth, challenges, and highlights." },
          { name: "Capture this age", text: "Document what life is like at this specific age." },
          { name: "Set birthday wishes", text: "Write your hopes for the year ahead." },
          { name: "Schedule for next birthday", text: "Send to arrive on your next birthday." },
        ],
      },
      tr: {
        title: "Dogum Gunu Mektubu",
        description: "Dogum gununde kendinize dusunen bir mektup yazin.",
        seoTitle: "Gelecege Dogum Gunu Mektubu Sablonu | Capsule Note",
        seoDescription: "Gelecekteki kendinize bir dogum gunu mektubu yazin. Yasinizi, başarilarinizi belgeleyin.",
        content: [
          "Dogum gununuz dusunme icin dogal bir zamandir.",
          "Bu sablon, sadece bu yil ne oldugunu degil, kim oldugunuzu ve olmay i umdugunuzu yakalamaniza rehberlik eder.",
          "Bu mektubu bir sonraki dogum gununuzde almak, gecmis benliginizle baglanti kurmanin guzel bir gelenegi olusturur.",
        ],
        guidingQuestions: [
          "Gecen yildan en cok neyle gurur duyuyorsunuz?",
          "Nasil buyudunuz veya degistiniz?",
          "Bu yas hakkinda ne hatirlamak istiyorsunuz?",
          "Onumuzdeki yil icin umutlariniz neler?",
          "Yasli benliginizle hangi bilgeligi paylasmak istersiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, [yas] yasindaki benliginizden mutlu yillar...",
        howToSteps: [
          { name: "Dogum gununuzde yazin", text: "Gelecekteki kendinize yazmay i bir dogum gunu gelenegi haline getirin." },
          { name: "Gecen yili dusunun", text: "Buyumenizi, zorluklarinizi ve one cikan anlarinizi dusunun." },
          { name: "Bu yasi yakalay in", text: "Bu spesifik yasta hayatin neye benzedigini belgeleyin." },
          { name: "Dogum gunu dilekleri belirleyin", text: "Onumuzdeki yil icin umutlarinizi yazin." },
          { name: "Gelecek dogum gunu icin planlyin", text: "Bir sonraki dogum gununuzde varmak icin gonderin." },
        ],
      },
      estimatedTime: "20-25 min",
    },
    "anniversary": {
      en: {
        title: "Anniversary",
        description: "Commemorate an anniversary and reflect on the journey so far.",
        seoTitle: "Anniversary Letter Template | Capsule Note",
        seoDescription: "Write an anniversary letter. Document relationship milestones and memories to celebrate together.",
        content: [
          "Anniversaries mark the passage of time in our most important relationships. They're opportunities to reflect on the journey you've shared.",
          "This template helps you capture what your relationship means to you at this moment, creating a record to cherish in years to come.",
          "Whether it's a relationship, wedding, or other significant anniversary, documenting these milestones creates a beautiful tradition.",
        ],
        guidingQuestions: [
          "What are you celebrating today?",
          "What moments from this year together stand out?",
          "How has your relationship grown or deepened?",
          "What do you appreciate most about your partner/this relationship?",
          "What are your hopes for the next year together?",
        ],
        sampleOpening: "Dear Future Me, today marks [number] years of [relationship], and I want to capture how it feels...",
        howToSteps: [
          { name: "Write on the anniversary", text: "Use the anniversary as your writing ritual." },
          { name: "Reflect on the past year", text: "Document highlights, challenges overcome, and growth." },
          { name: "Express appreciation", text: "Write what you love and appreciate about your partner." },
          { name: "Look ahead together", text: "Share your hopes for the relationship's future." },
          { name: "Schedule for next anniversary", text: "Make it an annual tradition." },
        ],
      },
      tr: {
        title: "Yildonumu",
        description: "Bir yildonumunu anin ve simdiye kadarki yolculugu dusunun.",
        seoTitle: "Yildonumu Mektup Sablonu | Capsule Note",
        seoDescription: "Bir yildonumu mektubu yazin. Iliski kilometre taslarini ve anilari belgeleyin.",
        content: [
          "Yildonumleri en onemli iliskilerimizde zamanin gecisini isaretler.",
          "Bu sablon, iliskinizin bu anda sizin icin ne anlama geldigini yakalamaniza yardimci olur.",
          "Bir iliski, dugun veya baska onemli bir yildonumu olsun, bu kilometre taslarini belgelemek guzel bir gelenek olusturur.",
        ],
        guidingQuestions: [
          "Bugun neyi kutluyorsunuz?",
          "Bu yil birlikte hangi anlar one cikti?",
          "Iliskiniz nasil buyudu veya derinlesti?",
          "Partneriniz/bu iliski hakkinda en cok neyi takdir ediyorsunuz?",
          "Birlikte gelecek yil icin umutlariniz neler?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugun [sayi] yillik [iliski]'yi aniyor ve nasil hissettirdigini yakalamak istiyorum...",
        howToSteps: [
          { name: "Yildonumunde yazin", text: "Yildonumunu yazma ritualiniz olarak kullanin." },
          { name: "Gecen yili dusunun", text: "One cikan anları, ustesinden gelinen zorluklari ve buyumeyi belgeleyin." },
          { name: "Takdir ifade edin", text: "Partneriniz hakkinda sevdiginiz ve takdir ettiginiz seyleri yazin." },
          { name: "Birlikte ileriye bakin", text: "Iliskinizin gelecegi icin umutlarinizi paylasin." },
          { name: "Gelecek yildonumu icin planlyin", text: "Bunu yillik bir gelenek haline getirin." },
        ],
      },
      estimatedTime: "20-25 min",
    },
  },
  "legacy": {
    "letter-to-future-child": {
      en: {
        title: "Letter to Future Child",
        description: "Write a letter to a child who doesn't exist yet, or to your child when they're older.",
        seoTitle: "Letter to Future Child Template | Capsule Note",
        seoDescription: "Write a letter to your future child. Document your hopes, wisdom, and love for a child not yet born or grown.",
        content: [
          "A letter to a future child is one of the most profound things you can write. Whether you're writing to a child you hope to have or to your own child when they're grown, this letter captures your love across time.",
          "This template helps you express your hopes, share your wisdom, and create a gift that will be treasured for years to come.",
          "Imagine the moment when this letter is read - the connection across time between who you are now and the child you're writing to.",
        ],
        guidingQuestions: [
          "Who are you writing to, and when do you imagine they'll read this?",
          "What do you want them to know about who you were at this time?",
          "What values and wisdom do you want to pass on?",
          "What hopes and dreams do you have for their life?",
          "What do you want them to know about your love for them?",
        ],
        sampleOpening: "Dear [child's name or 'my future child'], I'm writing this before you even exist / while you're still young...",
        howToSteps: [
          { name: "Imagine your reader", text: "Picture the child at the age they'll receive this letter." },
          { name: "Share your current self", text: "Help them understand who you are at this moment." },
          { name: "Pass on wisdom", text: "Share lessons you've learned that might help them." },
          { name: "Express unconditional love", text: "Make sure they know they're loved no matter what." },
          { name: "Choose delivery timing", text: "A significant birthday, graduation, or other milestone." },
        ],
      },
      tr: {
        title: "Gelecek Cocuga Mektup",
        description: "Henuz var olmayan bir cocuga veya buyuduklerinde cocugunuza bir mektup yazin.",
        seoTitle: "Gelecek Cocuga Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecek cocugunuza bir mektup yazin. Henuz dogmamis veya buyumemis bir cocuk icin umutlarinizi belgeleyin.",
        content: [
          "Gelecek bir cocuga mektup yazabileceginiz en derin seylerden biridir.",
          "Bu sablon, umutlarinizi ifade etmenize, bilgeliginizi paylasmaniza yardimci olur.",
          "Bu mektubun okunacagi ani hayal edin - su anki kendiniz ile yazdiginiz cocuk arasindaki zaman boyunca baglanti.",
        ],
        guidingQuestions: [
          "Kime yaziyorsunuz ve bunu ne zaman okuyacaklarini hayal ediyorsunuz?",
          "Bu zamanda kim oldugunuz hakkinda ne bilmelerini istiyorsunuz?",
          "Hangi degerleri ve bilgeligi aktarmak istiyorsunuz?",
          "Hayatlari icin hangi umutlariniz ve hayalleriniz var?",
          "Onlara olan askiniz hakkinda ne bilmelerini istiyorsunuz?",
        ],
        sampleOpening: "Sevgili [cocugun adi veya 'gelecek cocugum'], siz daha var olmadan / siz hala kucukken bunu yaziyorum...",
        howToSteps: [
          { name: "Okuyucunuzu hayal edin", text: "Bu mektubu alacaklari yasta cocugu hayal edin." },
          { name: "Mevcut benliginizi paylasin", text: "Bu anda kim oldugunuzu anlamalarina yardimci olun." },
          { name: "Bilgelik aktarin", text: "Onlara yardimci olabilecek ogrendiginiz dersleri paylasin." },
          { name: "Kosulsuz ask ifade edin", text: "Ne olursa olsun sevildiglerinden emin olmalarini saglayin." },
          { name: "Teslimat zamani secin", text: "Onemli bir dogum gunu, mezuniyet veya baska bir kilometre tasi." },
        ],
      },
      estimatedTime: "30-45 min",
    },
    "ethical-will": {
      en: {
        title: "Ethical Will",
        description: "Document your values, life lessons, and wishes for future generations.",
        seoTitle: "Ethical Will Letter Template | Capsule Note",
        seoDescription: "Write an ethical will documenting your values and life lessons for future generations.",
        content: [
          "An ethical will is different from a legal will - instead of distributing possessions, you pass on values, life lessons, hopes, and love.",
          "This ancient tradition helps ensure that your wisdom and values live on, independent of material inheritance.",
          "This template guides you through the profound exercise of articulating what matters most and what you hope to pass on.",
        ],
        guidingQuestions: [
          "What are the core values that have guided your life?",
          "What are the most important lessons you've learned?",
          "What do you hope your loved ones will remember about you?",
          "What wisdom do you want to pass on to future generations?",
          "What are your hopes and wishes for your family's future?",
        ],
        sampleOpening: "To my loved ones, I write this not to give you things, but to give you something more lasting...",
        howToSteps: [
          { name: "Reflect on your values", text: "Consider what principles have been most important to you." },
          { name: "Distill your wisdom", text: "What lessons would you most want to pass on?" },
          { name: "Express your love", text: "Make sure your loved ones know how you feel." },
          { name: "Share your hopes", text: "What do you wish for the people you love?" },
          { name: "Update regularly", text: "Review and update this letter every few years as you grow." },
        ],
      },
      tr: {
        title: "Etik Vasiyet",
        description: "Degerlerinizi, hayat derslerinizi ve gelecek nesiller icin dileklerinizi belgeleyin.",
        seoTitle: "Etik Vasiyet Mektup Sablonu | Capsule Note",
        seoDescription: "Gelecek nesiller icin degerlerinizi ve hayat derslerinizi belgeleyen etik bir vasiyet yazin.",
        content: [
          "Etik vasiyet, yasal vasiyetten farklidir - mallar dagitmak yerine degerler, hayat dersleri, umutlar ve ask aktarirsiniz.",
          "Bu kadim gelenek, bilgeliginizin ve degerlerinizin maddi mirastan bagimsiz olarak yasamasini saglamaya yardimci olur.",
          "Bu sablon, en onemli seyleri ve aktarmak istediklerinizi ifade etmenin derin egzersizinde size rehberlik eder.",
        ],
        guidingQuestions: [
          "Hayatiniza yol gosteren temel degerler nelerdir?",
          "Ogrendiginiz en onemli dersler nelerdir?",
          "Sevdiklerinizin sizin hakkinda ne hatirlamasini umuyorsunuz?",
          "Gelecek nesillere hangi bilgeligi aktarmak istiyorsunuz?",
          "Ailenizin gelecegi icin umutlariniz ve dilekleriniz neler?",
        ],
        sampleOpening: "Sevdiklerime, bunu size bir sey vermek icin degil, daha kalici bir sey vermek icin yaziyorum...",
        howToSteps: [
          { name: "Degerlerinizi dusunun", text: "Sizin icin hangi ilkelerin en onemli oldugunu dusunun." },
          { name: "Bilgeliginizi daminin", text: "En cok hangi dersleri aktarmak isterdiniz?" },
          { name: "Askinizi ifade edin", text: "Sevdiklerinizin nasil hissettiginizi bildiginden emin olun." },
          { name: "Umutlarinizi paylasin", text: "Sevdiginiz insanlar icin ne diliyorsunuz?" },
          { name: "Duzenlili olarak guncelleyin", text: "Buyudukce bu mektubu her birkac yilda bir gozden gecirin ve guncelleyin." },
        ],
      },
      estimatedTime: "45-60 min",
    },
  },
}

// Helper to get all valid template combinations
function getAllTemplateCombinations(): Array<{ category: Category; slug: string }> {
  const combinations: Array<{ category: Category; slug: string }> = []
  for (const category of validCategories) {
    for (const slug of templateSlugs[category]) {
      combinations.push({ category, slug })
    }
  }
  return combinations
}

export async function generateStaticParams() {
  return getAllTemplateCombinations()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>
}): Promise<Metadata> {
  const { locale, category, slug } = await params

  if (!validCategories.includes(category as Category)) {
    return { title: "Not Found" }
  }

  const categoryTemplates = templateData[category as Category]
  if (!categoryTemplates || !categoryTemplates[slug]) {
    return { title: "Not Found" }
  }

  const template = categoryTemplates[slug]
  const data = template[locale === "tr" ? "tr" : "en"]

  return {
    title: data.seoTitle,
    description: data.seoDescription,
    openGraph: {
      title: data.title,
      description: data.seoDescription,
      type: "article",
      url: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates/${category}/${slug}`,
    },
    alternates: {
      canonical: `${appUrl}${locale === "en" ? "" : "/" + locale}/templates/${category}/${slug}`,
      languages: {
        en: `${appUrl}/templates/${category}/${slug}`,
        tr: `${appUrl}/tr/templates/${category}/${slug}`,
        "x-default": `${appUrl}/templates/${category}/${slug}`,
      },
    },
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>
}) {
  const { locale, category, slug } = await params

  // Validate category
  if (!validCategories.includes(category as Category)) {
    notFound()
  }
  const categoryId = category as Category

  // Validate slug exists for this category
  const categoryTemplates = templateData[categoryId]
  if (!categoryTemplates || !categoryTemplates[slug]) {
    notFound()
  }

  setRequestLocale(locale)

  const isEnglish = locale === "en"
  const uppercaseClass = locale === "tr" ? "" : "uppercase"
  const template = categoryTemplates[slug]
  const data = template[locale === "tr" ? "tr" : "en"]
  const categoryDisplayName = categoryNames[categoryId][locale === "tr" ? "tr" : "en"]
  const relatedTemplates = getRelatedTemplates(categoryId, slug, locale)

  return (
    <LegalPageLayout>
      {/* Schema.org HowTo */}
      <HowToSchema
        locale={locale}
        title={data.title}
        description={data.description}
        totalTime={toISO8601Duration(template.estimatedTime)}
        steps={data.howToSteps}
      />

      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEnglish ? "Home" : "Ana Sayfa", href: "/" },
          { name: isEnglish ? "Templates" : "Şablonlar", href: "/templates" },
          { name: categoryDisplayName, href: `/templates/${categoryId}` },
          { name: data.title, href: `/templates/${categoryId}/${slug}` },
        ]}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href={{ pathname: "/templates/[category]", params: { category: categoryId } }}
          className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {categoryDisplayName}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={cn("font-mono text-xs text-charcoal/60", uppercaseClass)}>
            {isEnglish ? "Letter Template" : "Mektup Sablonu"}
          </span>
          <span className="font-mono text-xs text-charcoal/40">|</span>
          <span className="flex items-center gap-1 font-mono text-xs text-charcoal/60">
            <Clock className="h-3 w-3" />
            {template.estimatedTime}
          </span>
        </div>
        <h1 className={cn("font-mono text-3xl md:text-4xl text-charcoal mb-4", uppercaseClass)}>
          {data.title}
        </h1>
        <p className="font-mono text-base text-charcoal/70 max-w-2xl">
          {data.description}
        </p>
      </header>

      {/* Content */}
      <article className="space-y-8">
        {/* Description */}
        <section>
          {data.content.map((paragraph, index) => (
            <p key={index} className="font-mono text-base text-charcoal/80 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </section>

        {/* Guiding Questions */}
        <section
          className="p-6 border-2 border-charcoal bg-duck-yellow/10"
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-lg text-charcoal mb-4 flex items-center gap-2", uppercaseClass)}>
            <Lightbulb className="h-5 w-5" />
            {isEnglish ? "Guiding Questions" : "Rehber Sorular"}
          </h2>
          <ul className="space-y-3">
            {data.guidingQuestions.map((question, index) => (
              <li key={index} className="font-mono text-sm text-charcoal/80 flex items-start gap-3">
                <span className="text-charcoal/40 font-bold">{index + 1}.</span>
                {question}
              </li>
            ))}
          </ul>
        </section>

        {/* Sample Opening */}
        <section
          className="p-6 border-2 border-charcoal bg-teal-primary/10"
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-lg text-charcoal mb-3 flex items-center gap-2", uppercaseClass)}>
            <FileText className="h-5 w-5" />
            {isEnglish ? "Sample Opening" : "Ornek Acilis"}
	          </h2>
	          <p className="font-mono text-sm text-charcoal/80 italic">
	            &quot;{data.sampleOpening}&quot;
	          </p>
	        </section>

        {/* How to Use Steps */}
        <section>
          <h2 className={cn("font-mono text-xl text-charcoal mb-6", uppercaseClass)}>
            {isEnglish ? "How to Use This Template" : "Bu Sablonu Nasil Kullanilir"}
          </h2>
          <div className="space-y-4">
            {data.howToSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border-2 border-charcoal/20 bg-white"
                style={{ borderRadius: "2px" }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 border-2 border-charcoal bg-charcoal text-white font-mono text-sm font-bold shrink-0"
                  style={{ borderRadius: "2px" }}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-charcoal mb-1">
                    {step.name}
                  </h3>
                  <p className="font-mono text-sm text-charcoal/70">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* CTA */}
      <div className="mt-12 pt-8 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "p-8 border-2 border-charcoal bg-duck-blue/20",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-charcoal" />
            <h2 className={cn("font-mono text-xl text-charcoal", uppercaseClass)}>
              {isEnglish ? "Ready to Write?" : "Yazmaya Hazir misiniz?"}
            </h2>
          </div>
          <p className="font-mono text-sm text-charcoal/70 mb-6">
            {isEnglish
              ? "Use this template as your guide. Our editor will help you write a meaningful letter to your future self."
              : "Bu sablonu rehberiniz olarak kullanin. Editorumuz gelecekteki kendinize anlamli bir mektup yazmaniza yardimci olacak."}
          </p>
          <Link
            href={`/write-letter?templateId=${encodeTemplateId(categoryId, slug)}` as "/write-letter"}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "border-2 border-charcoal bg-charcoal text-white",
              "font-mono text-sm tracking-wide",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              uppercaseClass
            )}
            style={{ borderRadius: "2px" }}
          >
            {isEnglish ? "Use This Template" : "Bu Şablonu Kullan"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Related Templates Section */}
      {relatedTemplates.length > 0 && (
        <RelatedContent
          items={relatedTemplates}
          title={isEnglish ? "More in This Category" : "Bu Kategoride Daha Fazla"}
          locale={locale}
          variant="compact"
        />
      )}
    </LegalPageLayout>
  )
}

/**
 * Internal Linking Automation
 *
 * Generates contextually relevant internal links based on content clusters.
 * Used for SEO to distribute page authority and improve crawlability.
 *
 * Strategy:
 * 1. Same cluster, different type (highest relevance)
 * 2. Same pillar pages (category hubs)
 * 3. Related clusters
 * 4. CTA pages (conversion)
 */

import {
  blogSlugs,
  guideSlugs,
  type BlogSlug,
  type GuideSlug,
  type TemplateCategory,
  type PromptTheme,
} from "./content-registry"
import { getBlogPath, getPromptThemePath } from "./localized-slugs"

// ============================================================================
// Types
// ============================================================================

export type ContentType = "blog" | "guide" | "template" | "prompt"

export type ClusterType =
  | "future-self"
  | "letter-craft"
  | "life-events"
  | "privacy-security"
  | "use-cases"
  | "goals"
  | "relationships"
  | "mental-health"
  | "legacy"
  | "milestones"

export interface RelatedLink {
  href: string
  title: string
  titleTr?: string
  category?: string
  type: ContentType
  relevance: "high" | "medium" | "low"
}

// ============================================================================
// Cluster Mappings
// ============================================================================

/**
 * Map content slugs to clusters for automated linking
 */
const blogClusterMap: Record<string, ClusterType> = {
  "why-write-to-future-self": "future-self",
  "new-year-letter-ideas": "life-events",
  "graduation-letters-guide": "life-events",
  "physical-mail-vs-email": "privacy-security",
  "letter-writing-tips": "letter-craft",
  // New blog posts (from CONTENT_PLAN.md)
  "psychological-benefits-journaling": "future-self",
  "time-perception-psychology": "future-self",
  "delayed-gratification-letters": "future-self",
  "identity-continuity-research": "future-self",
  "nostalgia-psychology": "future-self",
  "memory-consolidation-writing": "future-self",
  "self-compassion-future-self": "future-self",
  "how-to-write-meaningful-letter": "letter-craft",
  "letter-prompts-beginners": "letter-craft",
  "overcoming-writers-block": "letter-craft",
  "emotional-expression-writing": "letter-craft",
  "letter-formatting-guide": "letter-craft",
  "storytelling-letters": "letter-craft",
  "wedding-anniversary-letters": "life-events",
  "birthday-milestone-letters": "life-events",
  "career-transition-letters": "life-events",
  "retirement-letters-future": "life-events",
  "pregnancy-baby-letters": "life-events",
  "moving-new-chapter-letters": "life-events",
  "encryption-explained-simple": "privacy-security",
  "digital-legacy-planning": "privacy-security",
  "therapy-journaling-letters": "use-cases",
  "corporate-team-building-letters": "use-cases",
  "education-classroom-letters": "use-cases",
}

const guideClusterMap: Record<string, ClusterType> = {
  "how-to-write-letter-to-future-self": "future-self",
  "science-of-future-self": "future-self",
  "time-capsule-vs-future-letter": "privacy-security",
  "privacy-security-best-practices": "privacy-security",
  "letters-for-mental-health": "mental-health",
  "legacy-letters-guide": "legacy",
  // New guides
  "complete-beginners-guide": "letter-craft",
  "letter-delivery-timing-guide": "letter-craft",
  "physical-mail-delivery-guide": "privacy-security",
  "template-customization-guide": "letter-craft",
  "multiple-recipients-guide": "letter-craft",
  "international-delivery-guide": "letter-craft",
  "business-use-cases-guide": "use-cases",
  "family-history-letters-guide": "legacy",
  "mental-health-journaling-guide": "mental-health",
}

const templateCategoryClusterMap: Record<TemplateCategory, ClusterType> = {
  "self-reflection": "future-self",
  "goals": "goals",
  "gratitude": "mental-health",
  "relationships": "relationships",
  "career": "life-events",
  "life-transitions": "life-events",
  "milestones": "milestones",
  "legacy": "legacy",
}

const promptClusterMap: Record<string, ClusterType> = {
  "self-esteem": "mental-health",
  "grief": "mental-health",
  "graduation": "life-events",
  "sobriety": "mental-health",
  "new-year": "goals",
  "birthday": "milestones",
  "career": "life-events",
  "relationships": "relationships",
}

// ============================================================================
// Cluster Relationships
// ============================================================================

/**
 * Define which clusters are related to each other
 */
const clusterRelationships: Record<ClusterType, ClusterType[]> = {
  "future-self": ["letter-craft", "mental-health", "goals"],
  "letter-craft": ["future-self", "use-cases"],
  "life-events": ["milestones", "goals", "relationships"],
  "privacy-security": ["future-self", "letter-craft"],
  "use-cases": ["letter-craft", "future-self"],
  "goals": ["future-self", "life-events", "milestones"],
  "relationships": ["life-events", "mental-health", "legacy"],
  "mental-health": ["future-self", "relationships", "goals"],
  "legacy": ["relationships", "milestones", "life-events"],
  "milestones": ["life-events", "goals", "relationships"],
}

// ============================================================================
// Content Data (for link generation)
// ============================================================================

const blogTitles: Record<string, { en: string; tr: string }> = {
  // Existing 5 posts
  "why-write-to-future-self": {
    en: "Why Write to Your Future Self?",
    tr: "Neden Gelecekteki Kendine Yazmalısın?",
  },
  "new-year-letter-ideas": {
    en: "25 New Year's Letter Ideas",
    tr: "25 Yeni Yıl Mektubu Fikri",
  },
  "graduation-letters-guide": {
    en: "Graduation Letters: A Complete Guide",
    tr: "Mezuniyet Mektupları: Kapsamlı Rehber",
  },
  "physical-mail-vs-email": {
    en: "Physical Mail vs Email: Which is Better?",
    tr: "Fiziksel Posta vs E-posta: Hangisi Daha İyi?",
  },
  "letter-writing-tips": {
    en: "10 Tips for Writing Meaningful Letters",
    tr: "Anlamlı Mektup Yazmak için 10 İpucu",
  },
  // Future Self Psychology (7)
  "psychological-benefits-journaling": {
    en: "The Psychological Benefits of Journaling",
    tr: "Günlük Tutmanın Psikolojik Faydaları",
  },
  "time-perception-psychology": {
    en: "Time Perception Psychology",
    tr: "Zaman Algısı Psikolojisi",
  },
  "delayed-gratification-letters": {
    en: "The Power of Delayed Gratification",
    tr: "Gecikmiş Tatminin Gücü",
  },
  "identity-continuity-research": {
    en: "Identity Continuity Research",
    tr: "Kimlik Sürekliliği Araştırması",
  },
  "nostalgia-psychology": {
    en: "The Psychology of Nostalgia",
    tr: "Nostalji Psikolojisi",
  },
  "memory-consolidation-writing": {
    en: "Memory Consolidation and Writing",
    tr: "Bellek Konsolidasyonu ve Yazma",
  },
  "self-compassion-future-self": {
    en: "Self-Compassion and Your Future Self",
    tr: "Öz-Şefkat ve Gelecekteki Benliğiniz",
  },
  // Letter Writing Craft (6)
  "how-to-write-meaningful-letter": {
    en: "How to Write a Meaningful Letter",
    tr: "Anlamlı Mektup Nasıl Yazılır",
  },
  "letter-prompts-beginners": {
    en: "50 Letter Prompts for Beginners",
    tr: "Yeni Başlayanlar için 50 Mektup İpucu",
  },
  "overcoming-writers-block": {
    en: "Overcoming Writer's Block",
    tr: "Yazar Tıkanıklığını Aşmak",
  },
  "emotional-expression-writing": {
    en: "Emotional Expression in Letter Writing",
    tr: "Mektup Yazımında Duygusal İfade",
  },
  "letter-formatting-guide": {
    en: "Letter Formatting Guide",
    tr: "Mektup Biçimlendirme Rehberi",
  },
  "storytelling-letters": {
    en: "Storytelling in Letters",
    tr: "Mektuplarda Hikaye Anlatımı",
  },
  // Life Events (6)
  "wedding-anniversary-letters": {
    en: "Wedding Anniversary Letters",
    tr: "Evlilik Yıldönümü Mektupları",
  },
  "birthday-milestone-letters": {
    en: "Birthday Milestone Letters",
    tr: "Doğum Günü Dönüm Noktası Mektupları",
  },
  "career-transition-letters": {
    en: "Career Transition Letters",
    tr: "Kariyer Geçişi Mektupları",
  },
  "retirement-letters-future": {
    en: "Retirement Letters",
    tr: "Emeklilik Mektupları",
  },
  "pregnancy-baby-letters": {
    en: "Pregnancy and Baby Letters",
    tr: "Hamilelik ve Bebek Mektupları",
  },
  "moving-new-chapter-letters": {
    en: "Moving to a New City: Letters for Fresh Starts",
    tr: "Yeni Şehre Taşınma: Yeni Başlangıçlar için Mektuplar",
  },
  // Privacy & Security (2)
  "encryption-explained-simple": {
    en: "Encryption Explained Simply",
    tr: "Şifreleme Basitçe Açıklandı",
  },
  "digital-legacy-planning": {
    en: "Digital Legacy Planning",
    tr: "Dijital Miras Planlaması",
  },
  // Use Cases (3)
  "therapy-journaling-letters": {
    en: "Therapeutic Journaling Through Letters",
    tr: "Mektuplarla Terapötik Günlük Tutma",
  },
  "corporate-team-building-letters": {
    en: "Corporate Team Building Through Letters",
    tr: "Mektuplarla Kurumsal Takım Oluşturma",
  },
  "education-classroom-letters": {
    en: "Future Letters in Education",
    tr: "Eğitimde Gelecek Mektupları",
  },
}

const guideTitles: Record<string, { en: string; tr: string }> = {
  // Original 6 guides
  "how-to-write-letter-to-future-self": {
    en: "How to Write a Letter to Your Future Self",
    tr: "Gelecekteki Kendine Nasıl Mektup Yazılır",
  },
  "science-of-future-self": {
    en: "The Science of Future Self Connection",
    tr: "Gelecek Benlik Bağlantısının Bilimi",
  },
  "time-capsule-vs-future-letter": {
    en: "Time Capsule vs Future Letter",
    tr: "Zaman Kapsülü vs Gelecek Mektubu",
  },
  "privacy-security-best-practices": {
    en: "Privacy and Security Best Practices",
    tr: "Gizlilik ve Güvenlik İçin En İyi Uygulamalar",
  },
  "letters-for-mental-health": {
    en: "Letters for Mental Health",
    tr: "Ruh Sağlığı için Mektuplar",
  },
  "legacy-letters-guide": {
    en: "Legacy Letters Guide",
    tr: "Miras Mektupları Rehberi",
  },
  // Letter Craft & Delivery guides (3)
  "complete-beginners-guide": {
    en: "Complete Beginner's Guide to Future Letters",
    tr: "Gelecek Mektupları için Başlangıç Rehberi",
  },
  "letter-delivery-timing-guide": {
    en: "Letter Delivery Timing Guide",
    tr: "Mektup Teslimat Zamanlama Rehberi",
  },
  "physical-mail-delivery-guide": {
    en: "Physical Mail Delivery Guide",
    tr: "Fiziksel Posta Teslimat Rehberi",
  },
  // Additional Craft guides (3)
  "template-customization-guide": {
    en: "Template Customization Guide",
    tr: "Şablon Özelleştirme Rehberi",
  },
  "multiple-recipients-guide": {
    en: "Multiple Recipients Guide",
    tr: "Çoklu Alıcılar Rehberi",
  },
  "international-delivery-guide": {
    en: "International Delivery Guide",
    tr: "Uluslararası Teslimat Rehberi",
  },
  // Specialized guides (3)
  "business-use-cases-guide": {
    en: "Business Use Cases Guide",
    tr: "İş Kullanım Alanları Rehberi",
  },
  "family-history-letters-guide": {
    en: "Family History Letters Guide",
    tr: "Aile Tarihi Mektupları Rehberi",
  },
  "mental-health-journaling-guide": {
    en: "Mental Health Journaling Guide",
    tr: "Ruh Sağlığı Günlük Yazma Rehberi",
  },
}

const promptTitles: Record<PromptTheme, { en: string; tr: string }> = {
  "self-esteem": {
    en: "Self-Esteem Writing Prompts",
    tr: "Özsaygı Yazma İpuçları",
  },
  "grief": {
    en: "Grief Writing Prompts",
    tr: "Keder Yazma İpuçları",
  },
  "graduation": {
    en: "Graduation Writing Prompts",
    tr: "Mezuniyet Yazma İpuçları",
  },
  "sobriety": {
    en: "Sobriety Writing Prompts",
    tr: "Ayıklık Yazma İpuçları",
  },
  "new-year": {
    en: "New Year Writing Prompts",
    tr: "Yeni Yıl Yazma İpuçları",
  },
  "birthday": {
    en: "Birthday Writing Prompts",
    tr: "Doğum Günü Yazma İpuçları",
  },
  "career": {
    en: "Career Writing Prompts",
    tr: "Kariyer Yazma İpuçları",
  },
  "relationships": {
    en: "Relationship Writing Prompts",
    tr: "İlişkiler Yazma İpuçları",
  },
}

const templateCategoryTitles: Record<TemplateCategory, { en: string; tr: string }> = {
  "self-reflection": {
    en: "Self-Reflection",
    tr: "Kendini Yansıtma",
  },
  "goals": {
    en: "Goals",
    tr: "Hedefler",
  },
  "gratitude": {
    en: "Gratitude",
    tr: "Şükran",
  },
  "relationships": {
    en: "Relationships",
    tr: "İlişkiler",
  },
  "career": {
    en: "Career",
    tr: "Kariyer",
  },
  "life-transitions": {
    en: "Life Transitions",
    tr: "Hayat Geçişleri",
  },
  "milestones": {
    en: "Milestones",
    tr: "Dönüm Noktaları",
  },
  "legacy": {
    en: "Legacy",
    tr: "Miras",
  },
}

// ============================================================================
// Link Generation Functions
// ============================================================================

/**
 * Get cluster for a content item
 */
export function getContentCluster(
  type: ContentType,
  slug: string,
  category?: string
): ClusterType | undefined {
  switch (type) {
    case "blog":
      return blogClusterMap[slug]
    case "guide":
      return guideClusterMap[slug]
    case "template":
      return category ? templateCategoryClusterMap[category as TemplateCategory] : undefined
    case "prompt":
      return promptClusterMap[slug]
    default:
      return undefined
  }
}

/**
 * Get related content from the same cluster
 */
function getSameClusterContent(
  cluster: ClusterType,
  currentType: ContentType,
  currentSlug: string,
  limit: number,
  locale: "en" | "tr"
): RelatedLink[] {
  const links: RelatedLink[] = []

  // Add blogs from same cluster
  if (currentType !== "blog") {
    for (const [slug, blogCluster] of Object.entries(blogClusterMap)) {
      if (blogCluster === cluster && blogSlugs.includes(slug as BlogSlug)) {
        if (slug === currentSlug) continue
        const titles = blogTitles[slug]
        if (titles) {
          const blogSlug = slug as BlogSlug
          links.push({
            href: getBlogPath(locale, blogSlug),
            title: titles.en,
            titleTr: titles.tr,
            category: "Blog",
            type: "blog",
            relevance: "high",
          })
        }
      }
      if (links.length >= limit) break
    }
  }

  // Add guides from same cluster
  if (currentType !== "guide" && links.length < limit) {
    for (const [slug, guideCluster] of Object.entries(guideClusterMap)) {
      if (guideCluster === cluster && guideSlugs.includes(slug as GuideSlug)) {
        if (slug === currentSlug) continue
        const titles = guideTitles[slug]
        if (titles) {
          links.push({
            href: `/guides/${slug}`,
            title: titles.en,
            titleTr: titles.tr,
            category: locale === "tr" ? "Rehber" : "Guide",
            type: "guide",
            relevance: "high",
          })
        }
      }
      if (links.length >= limit) break
    }
  }

  // Add templates from same cluster
  if (currentType !== "template" && links.length < limit) {
    for (const [category, templateCluster] of Object.entries(templateCategoryClusterMap)) {
      if (templateCluster === cluster) {
        const titles = templateCategoryTitles[category as TemplateCategory]
        links.push({
          href: `/templates/${category}`,
          title: `${titles?.en ?? category} Templates`,
          titleTr: titles ? `${titles.tr} Şablonları` : undefined,
          category: locale === "tr" ? "Şablonlar" : "Templates",
          type: "template",
          relevance: "medium",
        })
      }
      if (links.length >= limit) break
    }
  }

  // Add prompts from same cluster
  if (currentType !== "prompt" && links.length < limit) {
    for (const [theme, promptCluster] of Object.entries(promptClusterMap)) {
      if (promptCluster === cluster) {
        if (theme === currentSlug) continue
        const titles = promptTitles[theme as PromptTheme]
        links.push({
          href: getPromptThemePath(locale, theme as PromptTheme),
          title: titles?.en ?? `${theme} Prompts`,
          titleTr: titles?.tr,
          category: locale === "tr" ? "İpuçları" : "Prompts",
          type: "prompt",
          relevance: "medium",
        })
      }
      if (links.length >= limit) break
    }
  }

  return links.slice(0, limit)
}

/**
 * Get related content from related clusters
 */
function getRelatedClusterContent(
  cluster: ClusterType,
  currentType: ContentType,
  currentSlug: string,
  limit: number,
  locale: "en" | "tr"
): RelatedLink[] {
  const relatedClusters = clusterRelationships[cluster] || []
  const links: RelatedLink[] = []

  for (const relatedCluster of relatedClusters) {
    const clusterLinks = getSameClusterContent(relatedCluster, currentType, currentSlug, 2, locale)
    links.push(...clusterLinks.map(link => ({ ...link, relevance: "low" as const })))
    if (links.length >= limit) break
  }

  return links.slice(0, limit)
}

/**
 * Main function: Get all related content for a page
 */
export function getRelatedContent(
  type: ContentType,
  slug: string,
  category?: string,
  locale: "en" | "tr" = "en"
): RelatedLink[] {
  const cluster = getContentCluster(type, slug, category)

  if (!cluster) {
    // Fallback: return popular content
    return getDefaultRelatedContent(locale)
  }

  const links: RelatedLink[] = []

  // 1. Same cluster content (3 items, high relevance)
  links.push(...getSameClusterContent(cluster, type, slug, 3, locale))

  // 2. Related cluster content (2 items, low relevance)
  links.push(...getRelatedClusterContent(cluster, type, slug, 2, locale))

  // 3. Always add CTA (write-letter)
  links.push({
    href: "/write-letter",
    title: locale === "tr" ? "Mektup Yaz" : "Write a Letter",
    category: locale === "tr" ? "Başla" : "Get Started",
    type: "blog", // dummy type
    relevance: "high",
  })

  // Deduplicate and limit
  const seen = new Set<string>()
  return links.filter(link => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  }).slice(0, 5)
}

/**
 * Default related content when cluster is unknown
 */
function getDefaultRelatedContent(locale: "en" | "tr"): RelatedLink[] {
  return [
    {
      href: "/guides/how-to-write-letter-to-future-self",
      title: locale === "tr" ? "Gelecekteki Kendine Nasıl Mektup Yazılır" : "How to Write a Letter to Your Future Self",
      category: locale === "tr" ? "Rehber" : "Guide",
      type: "guide",
      relevance: "high",
    },
    {
      href: "/templates",
      title: locale === "tr" ? "Şablonlara Göz At" : "Browse Templates",
      category: locale === "tr" ? "Şablonlar" : "Templates",
      type: "template",
      relevance: "medium",
    },
    {
      href: getPromptThemePath(locale, "new-year"),
      title: locale === "tr" ? "Yeni Yıl Yazı İpuçları" : "New Year Writing Prompts",
      category: locale === "tr" ? "İpuçları" : "Prompts",
      type: "prompt",
      relevance: "medium",
    },
    {
      href: getBlogPath(locale, "why-write-to-future-self"),
      title: locale === "tr" ? "Neden Gelecekteki Kendine Yazmalısın?" : "Why Write to Your Future Self?",
      category: locale === "tr" ? "Blog" : "Blog",
      type: "blog",
      relevance: "medium",
    },
    {
      href: "/write-letter",
      title: locale === "tr" ? "Mektup Yaz" : "Write a Letter",
      category: locale === "tr" ? "Başla" : "Get Started",
      type: "blog",
      relevance: "high",
    },
  ]
}

/**
 * Convert RelatedLink to format expected by RelatedContent component
 */
export function toRelatedItems(
  links: RelatedLink[],
  locale: "en" | "tr" = "en"
): Array<{ title: string; href: string; category?: string; description?: string }> {
  return links.map(link => ({
    title: locale === "tr" && link.titleTr ? link.titleTr : link.title,
    href: link.href,
    category: link.category,
  }))
}

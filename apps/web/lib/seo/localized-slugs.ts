import {
  isValidBlogSlug,
  isValidGuideSlug,
  isValidPromptTheme,
  type BlogSlug,
  type GuideSlug,
  type PromptTheme,
} from "./content-registry"

export const SEO_LOCALES = ["en", "tr"] as const
export type SeoLocale = (typeof SEO_LOCALES)[number]

export function normalizeSeoLocale(locale: string): SeoLocale {
  return locale === "tr" ? "tr" : "en"
}

const BLOG_SLUGS_TR: Record<BlogSlug, string> = {
  "why-write-to-future-self": "neden-gelecekteki-kendine-yazmalisin",
  "new-year-letter-ideas": "yeni-yil-mektubu-fikirleri",
  "graduation-letters-guide": "mezuniyet-mektuplari-rehberi",
  "physical-mail-vs-email": "fiziksel-posta-vs-e-posta",
  "letter-writing-tips": "anlamli-mektup-yazma-icin-10-ipucu",

  "psychological-benefits-journaling": "gunluk-tutmanin-psikolojik-faydalari",
  "time-perception-psychology": "zaman-algisi-psikolojisi",
  "delayed-gratification-letters": "gecikmis-tatminin-gucu",
  "identity-continuity-research": "kimlik-surekliligi-arastirmasi",
  "nostalgia-psychology": "nostalji-psikolojisi",
  "memory-consolidation-writing": "bellek-konsolidasyonu-ve-yazma",
  "self-compassion-future-self": "oz-sefkat-ve-gelecekteki-benlik",

  "how-to-write-meaningful-letter": "anlamli-mektup-nasil-yazilir",
  "letter-prompts-beginners": "yeni-baslayanlar-icin-50-mektup-ipucu",
  "overcoming-writers-block": "yazar-tikanikligini-asmak",
  "emotional-expression-writing": "mektup-yaziminda-duygusal-ifade",
  "letter-formatting-guide": "mektup-bicimlendirme-rehberi",
  "storytelling-letters": "mektuplarda-hikaye-anlatimi",

  "wedding-anniversary-letters": "evlilik-yildonumu-mektuplari",
  "birthday-milestone-letters": "dogum-gunu-donum-noktasi-mektuplari",
  "career-transition-letters": "kariyer-gecisi-mektuplari",
  "retirement-letters-future": "emeklilik-mektuplari",
  "pregnancy-baby-letters": "hamilelik-ve-bebek-mektuplari",
  "moving-new-chapter-letters": "yeni-sehre-tasinma-yeni-baslangic-mektuplari",

  "encryption-explained-simple": "sifreleme-basitce-aciklandi",
  "digital-legacy-planning": "dijital-miras-planlamasi",

  "therapy-journaling-letters": "mektuplarla-terapotik-gunluk-tutma",
  "corporate-team-building-letters": "mektuplarla-kurumsal-takim-olusturma",
  "education-classroom-letters": "egitimde-gelecek-mektuplari",
}

const BLOG_SLUGS_TR_REVERSE = new Map<string, BlogSlug>(
  Object.entries(BLOG_SLUGS_TR).map(([enSlug, trSlug]) => [trSlug, enSlug as BlogSlug])
)

const PROMPT_THEMES_TR: Record<PromptTheme, string> = {
  "self-esteem": "ozsaygi",
  "grief": "keder",
  "graduation": "mezuniyet",
  "sobriety": "ayiklik",
  "new-year": "yeni-yil",
  "birthday": "dogum-gunu",
  "career": "kariyer",
  "relationships": "iliskiler",
}

const PROMPT_THEMES_TR_REVERSE = new Map<string, PromptTheme>(
  Object.entries(PROMPT_THEMES_TR).map(([enSlug, trSlug]) => [trSlug, enSlug as PromptTheme])
)

// =============================================================================
// GUIDE SLUG LOCALIZATION
// =============================================================================

const GUIDE_SLUGS_TR: Record<GuideSlug, string> = {
  // EXISTING (6)
  "how-to-write-letter-to-future-self": "gelecekteki-kendine-mektup-nasil-yazilir",
  "science-of-future-self": "gelecek-benlik-bilimi",
  "time-capsule-vs-future-letter": "zaman-kapsulu-ve-gelecek-mektubu",
  "privacy-security-best-practices": "gizlilik-guvenlik-en-iyi-uygulamalar",
  "letters-for-mental-health": "ruh-sagligi-icin-mektuplar",
  "legacy-letters-guide": "miras-mektuplari-rehberi",

  // NEW (9)
  "complete-beginners-guide": "yeni-baslayanlar-icin-rehber",
  "letter-delivery-timing-guide": "mektup-teslimat-zamanlama-rehberi",
  "physical-mail-delivery-guide": "fiziksel-posta-teslimat-rehberi",
  "template-customization-guide": "sablon-ozellestirme-rehberi",
  "multiple-recipients-guide": "birden-fazla-alici-rehberi",
  "international-delivery-guide": "uluslararasi-teslimat-rehberi",
  "business-use-cases-guide": "kurumsal-kullanim-senaryolari-rehberi",
  "family-history-letters-guide": "aile-tarihi-mektuplari-rehberi",
  "mental-health-journaling-guide": "ruh-sagligi-gunluk-rehberi",
}

const GUIDE_SLUGS_TR_REVERSE = new Map<string, GuideSlug>(
  Object.entries(GUIDE_SLUGS_TR).map(([enSlug, trSlug]) => [trSlug, enSlug as GuideSlug])
)

export function getBlogSlug(locale: SeoLocale, id: BlogSlug): string {
  return locale === "tr" ? BLOG_SLUGS_TR[id] : id
}

export function getBlogPath(locale: SeoLocale, id: BlogSlug): string {
  return `/blog/${getBlogSlug(locale, id)}`
}

export function getBlogSlugInfo(
  locale: SeoLocale,
  slugParam: string
): { id: BlogSlug; canonicalSlug: string; isCanonical: boolean } | null {
  const id =
    isValidBlogSlug(slugParam) ? slugParam : locale === "tr" ? BLOG_SLUGS_TR_REVERSE.get(slugParam) : null

  if (!id) return null

  const canonicalSlug = getBlogSlug(locale, id)
  return { id, canonicalSlug, isCanonical: slugParam === canonicalSlug }
}

export function getPromptThemeSlug(locale: SeoLocale, id: PromptTheme): string {
  return locale === "tr" ? PROMPT_THEMES_TR[id] : id
}

export function getPromptThemePath(locale: SeoLocale, id: PromptTheme): string {
  return `/prompts/${getPromptThemeSlug(locale, id)}`
}

export function getPromptThemeSlugInfo(
  locale: SeoLocale,
  themeParam: string
): { id: PromptTheme; canonicalSlug: string; isCanonical: boolean } | null {
  const id =
    isValidPromptTheme(themeParam)
      ? themeParam
      : locale === "tr"
        ? PROMPT_THEMES_TR_REVERSE.get(themeParam)
        : null

  if (!id) return null

  const canonicalSlug = getPromptThemeSlug(locale, id)
  return { id, canonicalSlug, isCanonical: themeParam === canonicalSlug }
}

// =============================================================================
// GUIDE SLUG FUNCTIONS
// =============================================================================

export function getGuideSlug(locale: SeoLocale, id: GuideSlug): string {
  return locale === "tr" ? GUIDE_SLUGS_TR[id] : id
}

export function getGuidePath(locale: SeoLocale, id: GuideSlug): string {
  return `/guides/${getGuideSlug(locale, id)}`
}

export function getGuideSlugInfo(
  locale: SeoLocale,
  slugParam: string
): { id: GuideSlug; canonicalSlug: string; isCanonical: boolean } | null {
  const id =
    isValidGuideSlug(slugParam)
      ? slugParam
      : locale === "tr"
        ? GUIDE_SLUGS_TR_REVERSE.get(slugParam)
        : null

  if (!id) return null

  const canonicalSlug = getGuideSlug(locale, id)
  return { id, canonicalSlug, isCanonical: slugParam === canonicalSlug }
}

/**
 * Translate SEO pathnames that contain locale-specific slugs (e.g. `/blog/:slug`)
 * when switching locales on the client.
 */
export function translateSeoPathnameForLocaleSwitch(
  pathname: string,
  fromLocale: SeoLocale,
  toLocale: SeoLocale
): string {
  if (fromLocale === toLocale) return pathname

  const blogMatch = pathname.match(/^\/blog\/([^/]+?)(?:\/)?$/)
  if (blogMatch) {
    const slugParam = blogMatch[1]
    if (!slugParam) return pathname
    const slugInfo = getBlogSlugInfo(fromLocale, slugParam)
    return slugInfo ? getBlogPath(toLocale, slugInfo.id) : pathname
  }

  const promptMatch = pathname.match(/^\/prompts\/([^/]+?)(?:\/)?$/)
  if (promptMatch) {
    const themeParam = promptMatch[1]
    if (!themeParam) return pathname
    const themeInfo = getPromptThemeSlugInfo(fromLocale, themeParam)
    return themeInfo ? getPromptThemePath(toLocale, themeInfo.id) : pathname
  }

  // Guide pattern: /guides/:slug
  const guideMatch = pathname.match(/^\/guides\/([^/]+?)(?:\/)?$/)
  if (guideMatch) {
    const slugParam = guideMatch[1]
    if (!slugParam) return pathname
    const slugInfo = getGuideSlugInfo(fromLocale, slugParam)
    return slugInfo ? getGuidePath(toLocale, slugInfo.id) : pathname
  }

  return pathname
}

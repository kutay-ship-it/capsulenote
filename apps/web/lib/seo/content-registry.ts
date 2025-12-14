/**
 * SEO Content Registry
 *
 * Single source of truth for all programmatic SEO content.
 * Used by: sitemap.ts, blog hub/detail pages, guides hub/detail pages,
 * templates hub/category/detail pages, prompts hub/theme pages.
 *
 * When adding new content:
 * 1. Add the slug/category here
 * 2. Add the content data in the respective page component
 * 3. Sitemap will auto-include via this registry
 */

// =============================================================================
// BLOG CONTENT
// =============================================================================

export const blogSlugs = [
  // EXISTING (5)
  "why-write-to-future-self",
  "new-year-letter-ideas",
  "graduation-letters-guide",
  "physical-mail-vs-email",
  "letter-writing-tips",

  // NEW - Future Self Psychology (7)
  "psychological-benefits-journaling",
  "time-perception-psychology",
  "delayed-gratification-letters",
  "identity-continuity-research",
  "nostalgia-psychology",
  "memory-consolidation-writing",
  "self-compassion-future-self",

  // NEW - Letter Writing Craft (6)
  "how-to-write-meaningful-letter",
  "letter-prompts-beginners",
  "overcoming-writers-block",
  "emotional-expression-writing",
  "letter-formatting-guide",
  "storytelling-letters",

  // NEW - Life Events (6)
  "wedding-anniversary-letters",
  "birthday-milestone-letters",
  "career-transition-letters",
  "retirement-letters-future",
  "pregnancy-baby-letters",
  "moving-new-chapter-letters",

  // NEW - Privacy & Security (2)
  "encryption-explained-simple",
  "digital-legacy-planning",

  // NEW - Use Cases (3)
  "therapy-journaling-letters",
  "corporate-team-building-letters",
  "education-classroom-letters",
] as const

export type BlogSlug = (typeof blogSlugs)[number]

// =============================================================================
// GUIDES CONTENT
// =============================================================================

export const guideSlugs = [
  // EXISTING (6)
  "how-to-write-letter-to-future-self",
  "science-of-future-self",
  "time-capsule-vs-future-letter",
  "privacy-security-best-practices",
  "letters-for-mental-health",
  "legacy-letters-guide",

  // NEW (9)
  "complete-beginners-guide",
  "letter-delivery-timing-guide",
  "physical-mail-delivery-guide",
  "template-customization-guide",
  "multiple-recipients-guide",
  "international-delivery-guide",
  "business-use-cases-guide",
  "family-history-letters-guide",
  "mental-health-journaling-guide",
] as const

export type GuideSlug = (typeof guideSlugs)[number]

// =============================================================================
// TEMPLATES CONTENT
// =============================================================================

export const templateCategories = [
  "self-reflection",
  "goals",
  "gratitude",
  "relationships",
  "career",
  "life-transitions",
  "milestones",
  "legacy",
] as const

export type TemplateCategory = (typeof templateCategories)[number]

export const templateDetailSlugs: Record<TemplateCategory, readonly string[]> = {
  "self-reflection": ["annual-self-check", "mindfulness-moment", "values-reflection"],
  "goals": ["new-years-resolution", "five-year-vision", "monthly-goals"],
  "gratitude": ["daily-gratitude", "people-im-thankful-for"],
  "relationships": ["love-letter", "friendship-appreciation"],
  "career": ["first-day-new-job", "career-milestone"],
  "life-transitions": ["moving-to-new-city", "starting-fresh"],
  "milestones": ["birthday-letter", "anniversary"],
  "legacy": ["letter-to-future-child", "ethical-will"],
} as const

// Flatten all template slugs for validation
export const allTemplateSlugs = Object.values(templateDetailSlugs).flat()

// =============================================================================
// PROMPTS CONTENT
// =============================================================================

export const promptThemes = [
  "self-esteem",
  "grief",
  "graduation",
  "sobriety",
  "new-year",
  "birthday",
  "career",
  "relationships",
] as const

export type PromptTheme = (typeof promptThemes)[number]

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a blog slug is valid
 */
export function isValidBlogSlug(slug: string): slug is BlogSlug {
  return (blogSlugs as readonly string[]).includes(slug)
}

/**
 * Check if a guide slug is valid
 */
export function isValidGuideSlug(slug: string): slug is GuideSlug {
  return (guideSlugs as readonly string[]).includes(slug)
}

/**
 * Check if a template category is valid
 */
export function isValidTemplateCategory(category: string): category is TemplateCategory {
  return (templateCategories as readonly string[]).includes(category)
}

/**
 * Check if a template slug is valid for a given category
 */
export function isValidTemplateSlug(category: TemplateCategory, slug: string): boolean {
  return templateDetailSlugs[category]?.includes(slug) ?? false
}

/**
 * Check if a prompt theme is valid
 */
export function isValidPromptTheme(theme: string): theme is PromptTheme {
  return (promptThemes as readonly string[]).includes(theme)
}

/**
 * Get all template slugs for a category
 */
export function getTemplateSlugsForCategory(category: TemplateCategory): readonly string[] {
  return templateDetailSlugs[category] ?? []
}

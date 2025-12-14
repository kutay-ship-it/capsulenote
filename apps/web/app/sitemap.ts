import type { MetadataRoute } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

const locales = ["en", "tr"] as const
const defaultLocale = "en"

// Static marketing routes
const staticRoutes: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  // Core pages
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/write-letter", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },

  // Content hubs (high priority for SEO)
  { path: "/templates", priority: 0.85, changeFrequency: "weekly" },
  { path: "/guides", priority: 0.85, changeFrequency: "weekly" },
  { path: "/prompts", priority: 0.85, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.85, changeFrequency: "daily" },

  // Trust & info pages
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/security", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.75, changeFrequency: "monthly" },

  // Legal pages
  { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
]

// Template categories for programmatic SEO
const templateCategories = [
  "self-reflection",
  "goals",
  "gratitude",
  "relationships",
  "career",
  "life-transitions",
  "milestones",
  "legacy",
]

// Template detail slugs by category (18 total templates)
const templateDetailSlugs: Record<string, string[]> = {
  "self-reflection": ["annual-self-check", "mindfulness-moment", "values-reflection"],
  "goals": ["new-years-resolution", "five-year-vision", "monthly-goals"],
  "gratitude": ["daily-gratitude", "people-im-thankful-for"],
  "relationships": ["love-letter", "friendship-appreciation"],
  "career": ["first-day-new-job", "career-milestone"],
  "life-transitions": ["moving-to-new-city", "starting-fresh"],
  "milestones": ["birthday-letter", "anniversary"],
  "legacy": ["letter-to-future-child", "ethical-will"],
}

// Prompt themes for programmatic SEO
const promptThemes = [
  "self-esteem",
  "grief",
  "graduation",
  "sobriety",
  "new-year",
  "birthday",
  "career",
  "relationships",
]

// Guide slugs for programmatic SEO
const guideSlugs = [
  "how-to-write-letter-to-future-self",
  "science-of-future-self",
  "time-capsule-vs-future-letter",
  "privacy-security-best-practices",
  "letters-for-mental-health",
  "legacy-letters-guide",
]

// Blog post slugs for programmatic SEO
const blogSlugs = [
  "why-write-to-future-self",
  "new-year-letter-ideas",
  "graduation-letters-guide",
  "physical-mail-vs-email",
  "letter-writing-tips",
]

// Build-time timestamp to avoid constantly changing lastModified dates
// This is more accurate than new Date() which would change on every request
const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Helper to create localized entries with hreflang
  function addLocalizedEntry(
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  ) {
    const languages: Record<string, string> = {}

    for (const locale of locales) {
      const localePath = locale === defaultLocale ? path : `/${locale}${path}`
      languages[locale] = `${appUrl}${localePath}`
    }
    languages["x-default"] = `${appUrl}${path}`

    for (const locale of locales) {
      const localePath = locale === defaultLocale ? path : `/${locale}${path}`
      sitemapEntries.push({
        url: `${appUrl}${localePath}`,
        lastModified: BUILD_TIME,
        changeFrequency,
        priority,
        alternates: {
          languages,
        },
      })
    }
  }

  // Add all static routes
  for (const { path, priority, changeFrequency } of staticRoutes) {
    addLocalizedEntry(path, priority, changeFrequency)
  }

  // Add template category pages (programmatic SEO)
  for (const category of templateCategories) {
    addLocalizedEntry(`/templates/${category}`, 0.75, "weekly")
  }

  // Add template detail pages (programmatic SEO)
  for (const category of templateCategories) {
    const slugs = templateDetailSlugs[category] || []
    for (const slug of slugs) {
      addLocalizedEntry(`/templates/${category}/${slug}`, 0.7, "monthly")
    }
  }

  // Add prompt theme pages (programmatic SEO)
  for (const theme of promptThemes) {
    addLocalizedEntry(`/prompts/${theme}`, 0.75, "weekly")
  }

  // Add guide pages (programmatic SEO)
  for (const slug of guideSlugs) {
    addLocalizedEntry(`/guides/${slug}`, 0.7, "monthly")
  }

  // Add blog post pages (programmatic SEO)
  for (const slug of blogSlugs) {
    addLocalizedEntry(`/blog/${slug}`, 0.7, "monthly")
  }

  return sitemapEntries
}

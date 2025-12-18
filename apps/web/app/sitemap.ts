import type { MetadataRoute } from "next"

import {
  blogSlugs,
  guideSlugs,
  templateCategories,
  templateDetailSlugs,
  promptThemes,
  type TemplateCategory,
} from "@/lib/seo/content-registry"
import { getBlogPost } from "@/lib/seo/blog-content"
import { getGuide } from "@/lib/seo/guide-content"
import { getBlogPath, getPromptThemePath } from "@/lib/seo/localized-slugs"

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

// Build-time timestamp to avoid constantly changing lastModified dates
// This is more accurate than new Date() which would change on every request
const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Helper to create localized entries with hreflang
  function addLocalizedEntryByLocale(
    paths: Record<(typeof locales)[number], string>,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    lastModified?: Date | string
  ) {
    const languages: Record<string, string> = {}

    for (const locale of locales) {
      const path = paths[locale]
      const localePath = locale === defaultLocale ? path : `/${locale}${path}`
      languages[locale] = `${appUrl}${localePath}`
    }
    languages["x-default"] = `${appUrl}${paths[defaultLocale]}`

    // Convert string dates to Date objects
    const modifiedDate = lastModified
      ? typeof lastModified === "string"
        ? new Date(lastModified)
        : lastModified
      : BUILD_TIME

    for (const locale of locales) {
      const path = paths[locale]
      const localePath = locale === defaultLocale ? path : `/${locale}${path}`
      sitemapEntries.push({
        url: `${appUrl}${localePath}`,
        lastModified: modifiedDate,
        changeFrequency,
        priority,
        alternates: {
          languages,
        },
      })
    }
  }

  function addLocalizedEntry(
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    lastModified?: Date | string
  ) {
    addLocalizedEntryByLocale({ en: path, tr: path }, priority, changeFrequency, lastModified)
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
    const slugs = templateDetailSlugs[category as TemplateCategory] || []
    for (const slug of slugs) {
      addLocalizedEntry(`/templates/${category}/${slug}`, 0.7, "monthly")
    }
  }

  // Add prompt theme pages (programmatic SEO)
  for (const theme of promptThemes) {
    addLocalizedEntryByLocale(
      { en: getPromptThemePath("en", theme), tr: getPromptThemePath("tr", theme) },
      0.75,
      "weekly"
    )
  }

  // Add guide pages (programmatic SEO) with per-guide dateModified
  for (const slug of guideSlugs) {
    const guide = getGuide(slug)
    addLocalizedEntry(`/guides/${slug}`, 0.7, "monthly", guide?.dateModified)
  }

  // Add blog post pages (programmatic SEO) with per-post dateModified
  for (const slug of blogSlugs) {
    const post = getBlogPost(slug)
    addLocalizedEntryByLocale(
      { en: getBlogPath("en", slug), tr: getBlogPath("tr", slug) },
      0.7,
      "monthly",
      post?.dateModified
    )
  }

  return sitemapEntries
}

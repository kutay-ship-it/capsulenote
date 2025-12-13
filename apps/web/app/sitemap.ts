import type { MetadataRoute } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

const locales = ["en", "tr"] as const
const defaultLocale = "en"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const routes: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/write-letter", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/security", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const { path, priority, changeFrequency } of routes) {
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
        lastModified,
        changeFrequency,
        priority,
        alternates: {
          languages,
        },
      })
    }
  }

  return sitemapEntries
}

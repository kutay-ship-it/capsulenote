import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Routes that should never be indexed
const disallow = [
  "/api/",
  "/admin",
  "/subscribe",
  "/checkout",
  "/view",
  "/welcome",
  "/sso-callback",
  "/reset-password",
  "/global-error",
  "/error",
  "/cron",
  "/letters",
  "/settings",
  "/journey",
]

const nonDefaultLocales = routing.locales.filter((locale) => locale !== routing.defaultLocale)
const localizedDisallow = nonDefaultLocales.flatMap((locale) =>
  disallow.map((path) => `/${locale}${path}`)
)
const disallowWithLocales = Array.from(new Set([...disallow, ...localizedDisallow]))

// Content routes that AI crawlers can access for training/search
const aiAllowedRoutes = [
  "/pricing",
  "/about",
  "/contact",
  "/security",
  "/blog",
  "/guides",
  "/templates",
  "/prompts",
  "/write-letter",
]
const aiAllowedLocalized = nonDefaultLocales.flatMap((locale) =>
  aiAllowedRoutes.map((path) => `/${locale}${path}`)
)
const aiAllowedRoot = ["/$", ...nonDefaultLocales.map((locale) => `/${locale}$`)]
const aiAllowlist = Array.from(new Set([...aiAllowedRoot, ...aiAllowedRoutes, ...aiAllowedLocalized]))

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === "production"

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: ["/"],
      },
      sitemap: `${appUrl}/sitemap.xml`,
    }
  }

  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowWithLocales,
      },
      // AI crawlers - allow content pages for AI search/training
      {
        userAgent: "GPTBot",
        allow: aiAllowlist,
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: aiAllowlist,
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        allow: aiAllowlist,
        disallow: ["/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: aiAllowlist,
        disallow: ["/"],
      },
      {
        userAgent: "Amazonbot",
        allow: aiAllowlist,
        disallow: ["/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}

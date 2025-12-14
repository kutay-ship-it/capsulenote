import type { MetadataRoute } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// Routes that should never be indexed
const disallow = [
  "/api/",
  "/sandbox",
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
  "/dashboard",
  "/letters",
  "/settings",
  "/journey",
]

// Content routes that AI crawlers can access for training/search
const aiAllowedRoutes = [
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/security",
  "/blog/",
  "/guides/",
  "/templates/",
  "/prompts/",
  "/write-letter",
]

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
        disallow,
      },
      // AI crawlers - allow content pages for AI search/training
      {
        userAgent: "GPTBot",
        allow: aiAllowedRoutes,
        disallow,
      },
      {
        userAgent: "ChatGPT-User",
        allow: aiAllowedRoutes,
        disallow,
      },
      {
        userAgent: "Claude-Web",
        allow: aiAllowedRoutes,
        disallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: aiAllowedRoutes,
        disallow,
      },
      {
        userAgent: "Amazonbot",
        allow: aiAllowedRoutes,
        disallow,
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}

import type { MetadataRoute } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")
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
  "/pricing",
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
      {
        userAgent: "*",
        allow: ["/"],
        disallow,
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}

import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "tr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/pricing": "/pricing",
    "/write-letter": "/write-letter",
    "/demo-letter": "/demo-letter",
    "/subscribe": "/subscribe",
    "/subscribe/success": "/subscribe/success",
    "/subscribe/error": "/subscribe/error",
    "/sign-in": "/sign-in",
    "/sign-up": "/sign-up",
    "/reset-password": "/reset-password",
    "/sso-callback": "/sso-callback",
    "/welcome": "/welcome",
    "/checkout": "/checkout",
    "/checkout/success": "/checkout/success",
    "/checkout/cancel": "/checkout/cancel",
    "/letters": "/letters",
    "/letters/new": "/letters/new",
    "/letters/[id]": "/letters/[id]",
    "/letters/[id]/schedule": "/letters/[id]/schedule",
    "/letters/[id]/edit": "/letters/[id]/edit",
    "/unlock/[id]": "/unlock/[id]",
    "/settings": "/settings",
    "/journey": "/journey",
    "/view/[token]": "/view/[token]",
    "/admin": "/admin",
    "/admin/audit": "/admin/audit",
    // Legal/Info pages (V3)
    "/about": "/about",
    "/contact": "/contact",
    "/privacy": "/privacy",
    "/terms": "/terms",
    "/security": "/security",
    "/faq": "/faq",
    // SEO Content Hubs
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/guides": "/guides",
    "/guides/[slug]": "/guides/[slug]",
    "/templates": "/templates",
    "/templates/[category]": "/templates/[category]",
    "/templates/[category]/[slug]": "/templates/[category]/[slug]",
    "/prompts": "/prompts",
    "/prompts/[theme]": "/prompts/[theme]",
  },
})

export type Locale = (typeof routing.locales)[number]

export const { Link, usePathname, useRouter, redirect, getPathname } = createNavigation(routing)

export type AppHref = Parameters<typeof Link>[0]["href"]

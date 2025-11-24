import { createLocalizedPathnamesNavigation, defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "tr"],
  defaultLocale: "en",
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
    "/dashboard": "/dashboard",
    "/letters": "/letters",
    "/letters/drafts": "/letters/drafts",
    "/letters/[id]": "/letters/[id]",
    "/deliveries": "/deliveries",
    "/settings": "/settings",
    "/view/[token]": "/view/[token]",
    "/admin": "/admin",
    "/admin/audit": "/admin/audit",
    "/sandbox": "/sandbox",
    "/sandbox/dashboard": "/sandbox/dashboard",
    "/sandbox/letters": "/sandbox/letters",
    "/sandbox/inbox": "/sandbox/inbox",
    "/sandbox/upcoming": "/sandbox/upcoming",
    "/sandbox/editor": "/sandbox/editor",
    "/sandbox/retention": "/sandbox/retention",
    "/sandbox/compare-editors": "/sandbox/compare-editors",
    "/sandbox/aftercare": "/sandbox/aftercare",
    "/sandbox/entitlements": "/sandbox/entitlements",
    "/sandbox/schedule": "/sandbox/schedule",
    "/sandbox/settings": "/sandbox/settings",
  },
})

export type Locale = (typeof routing.locales)[number]

export const { Link, usePathname, useRouter, redirect } = createLocalizedPathnamesNavigation(routing)

"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname as useNextPathname } from "next/navigation"
import { clsx } from "clsx"
import { useAuth } from "@clerk/nextjs"

import { routing, useRouter, type Locale } from "@/i18n/routing"

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const currentLocale = useLocale()
  const pathname = useNextPathname() // Full pathname (e.g., "/tr" or "/tr/pricing" or "/pricing")
  const router = useRouter()
  const t = useTranslations("common")
  const { isSignedIn } = useAuth()

  // Get pathname without locale prefix
  const getPathnameWithoutLocale = (path: string): string => {
    for (const loc of routing.locales) {
      if (path === `/${loc}`) return "/"
      if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    }
    return path
  }

  // Get the internal pathname for next-intl router
  const internalPathname = getPathnameWithoutLocale(pathname)

  // Handle locale change with proper navigation and refresh
  const handleLocaleChange = (targetLocale: string) => {
    // Fire-and-forget Clerk preference persistence (cross-device sync)
    if (isSignedIn) {
      fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: targetLocale }),
        keepalive: true,
      }).catch(() => {})
    }

    // Navigate to the same page with new locale and refresh
    router.replace(internalPathname as Parameters<typeof router.replace>[0], { locale: targetLocale })
    router.refresh()
  }

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <span className="sr-only">{t("language.label")}</span>
      <div className="flex items-center gap-2">
        {routing.locales.map((loc) => {
          const label = loc === "en" ? t("language.english") : t("language.turkish")
          const isActive = loc === currentLocale

          return (
            <button
              key={loc}
              type="button"
              aria-current={isActive ? "true" : "false"}
              onClick={() => handleLocaleChange(loc)}
              className={clsx(
                "px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors border-2 border-charcoal",
                isActive ? "bg-charcoal text-white" : "bg-white hover:bg-duck-yellow"
              )}
              style={{ borderRadius: "2px" }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

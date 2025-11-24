"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname as useNextPathname } from "next/navigation"
import { clsx } from "clsx"
import { useAuth } from "@clerk/nextjs"

import { Link, routing, type Locale } from "@/i18n/routing"

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const currentLocale = useLocale()
  const pathname = useNextPathname() // Full pathname (e.g., "/tr" or "/tr/pricing" or "/pricing")
  const t = useTranslations("common")
  const { isSignedIn } = useAuth()

  // Fire-and-forget Clerk preference persistence (cross-device sync)
  const persistPreference = (targetLocale: string) => {
    if (!isSignedIn) return

    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: targetLocale }),
      keepalive: true,
    }).catch(() => {})
  }

  // Get pathname without locale prefix
  const getPathnameWithoutLocale = (path: string): string => {
    for (const loc of routing.locales) {
      if (path === `/${loc}`) return "/"
      if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    }
    return path
  }

  // Get the internal pathname for next-intl Link
  const internalPathname = getPathnameWithoutLocale(pathname)

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <span className="sr-only">{t("language.label")}</span>
      <div className="flex items-center gap-2">
        {routing.locales.map((loc) => {
          const label = loc === "en" ? t("language.english") : t("language.turkish")
          const isActive = loc === currentLocale

          return (
            <Link
              key={loc}
              // @ts-expect-error -- Dynamic pathname from current route
              href={internalPathname}
              locale={loc}
              aria-current={isActive ? "true" : "false"}
              onClick={() => persistPreference(loc)}
              className={clsx(
                "px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors border-2 border-charcoal",
                isActive ? "bg-charcoal text-white" : "bg-white hover:bg-duck-yellow"
              )}
              style={{ borderRadius: "2px" }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useLocale, useTranslations } from "next-intl"
import { clsx } from "clsx"
import { useCallback } from "react"
import { useAuth } from "@clerk/nextjs"

import { Link, usePathname, routing } from "@/i18n/routing"

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations("common")
  const { isSignedIn } = useAuth()

  const persistPreference = useCallback(
    (targetLocale: string) => {
      if (!isSignedIn) return
      // Fire-and-forget; navigation handles locale switching
      fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: targetLocale }),
        keepalive: true,
      }).catch(() => {})
    },
    [isSignedIn]
  )

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <span className="sr-only">{t("language.label")}</span>
      <div className="flex items-center gap-2">
        {routing.locales.map((loc) => {
          const label =
            loc === "en" ? t("language.english") : t("language.turkish")
          const isActive = loc === locale

          return (
            <Link
              key={loc}
              href={pathname}
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

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { usePathname as useNextPathname, useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { translateSeoPathnameForLocaleSwitch } from "@/lib/seo/localized-slugs"
import { buildLocalePathWithQuery, stripLocalePrefix } from "@/lib/locale-paths"

// ============================================================================
// LOCALE STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PREFERENCE: "capsule-locale-preference",
  BANNER_DISMISSED: "capsule-locale-banner-dismissed",
} as const

type Locale = "en" | "tr"

// ============================================================================
// SHARED V3 COMPONENTS
// ============================================================================

function V3Button({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "dark" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "border-2 border-charcoal",
        "font-mono font-bold uppercase tracking-wider",
        "transition-all duration-150",
        "hover:-translate-y-0.5 hover:translate-x-0.5",
        "shadow-[-4px_4px_0_theme(colors.charcoal)]",
        "hover:shadow-[-6px_6px_0_theme(colors.charcoal)]",
        "active:translate-x-1 active:-translate-y-0 active:shadow-[-2px_2px_0_theme(colors.charcoal)]",
        variant === "primary" && "bg-duck-yellow text-charcoal",
        variant === "secondary" && "bg-white text-charcoal",
        variant === "dark" && "bg-charcoal text-white",
        variant === "ghost" && "bg-transparent text-charcoal shadow-none hover:shadow-none",
        size === "default" && "h-[50px] px-6 text-sm",
        size === "sm" && "h-[42px] px-4 text-xs",
        size === "lg" && "h-[58px] px-8 text-base",
        className
      )}
      style={{ borderRadius: "2px" }}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================================
// LOCALE DETECTION UTILITIES
// ============================================================================

/**
 * Detect if user is likely from Turkey based on available signals
 */
function detectTurkishUser(): boolean {
  if (typeof window === "undefined") return false

  // 1. Check browser language
  type NavigatorWithUserLanguage = Navigator & { userLanguage?: string }
  const browserLang = navigator.language || (navigator as NavigatorWithUserLanguage).userLanguage || ""
  if (browserLang.toLowerCase().startsWith("tr")) {
    return true
  }

  // 2. Check timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone === "Europe/Istanbul") {
      return true
    }
  } catch {
    // Ignore timezone detection errors
  }

  // 3. Check other language preferences
  const languages = navigator.languages || [browserLang]
  if (languages.some((lang) => lang.toLowerCase().startsWith("tr"))) {
    return true
  }

  return false
}

/**
 * Get saved locale preference from localStorage
 */
function getSavedLocale(): Locale | null {
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCE)
  if (saved && (saved === "en" || saved === "tr")) {
    return saved
  }
  return null
}

/**
 * Save locale preference to localStorage
 */
function saveLocale(locale: Locale): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.PREFERENCE, locale)
}

/**
 * Check if banner was dismissed
 */
function wasBannerDismissed(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED) === "true"
}

/**
 * Mark banner as dismissed
 */
function dismissBanner(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, "true")
}

// ============================================================================
// V1: BRUTALIST TOP BANNER
// ============================================================================

interface LocaleBannerProps {
  isVisible: boolean
  onSelectLocale: (locale: Locale) => void
  onDismiss: () => void
}

function LocaleBanner({ isVisible, onSelectLocale, onDismiss }: LocaleBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          <div className="relative border-b-2 border-charcoal bg-cream overflow-visible">
        
            <div className="container py-6 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Message */}
                <p className="font-mono text-sm text-charcoal text-center md:text-left">
                  Türkiye&apos;den mi bağlanıyorsunuz? Türkçe siteyi tercih edebilirsiniz.
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <V3Button variant="primary" size="sm" onClick={() => onSelectLocale("tr")}>
                    <span className="text-lg">🇹🇷</span>
                    Türkçe
                  </V3Button>

                  <V3Button variant="secondary" size="sm" onClick={() => onSelectLocale("en")}>
                    <span className="text-lg">🇬🇧</span>
                    English
                  </V3Button>

                  <button
                    onClick={onDismiss}
                    className={cn(
                      "p-2 border-2 border-charcoal bg-white",
                      "transition-all duration-150",
                      "hover:bg-coral hover:text-white"
                    )}
                    style={{ borderRadius: "2px" }}
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// LOCALE DETECTOR COMPONENT
// ============================================================================

interface LocaleDetectorProps {
  /** Server-detected country code (from x-vercel-ip-country header) */
  serverCountry?: string
}

export function LocaleDetector({ serverCountry }: LocaleDetectorProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { isSignedIn } = useAuth()
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = useNextPathname()

  const internalPathname = stripLocalePrefix(pathname)

  useEffect(() => {
    const savedLocale = getSavedLocale()
    const shouldShowBanner =
      !savedLocale && !wasBannerDismissed() && (serverCountry === "TR" || detectTurkishUser())

    const timer = setTimeout(() => {
      setIsClient(true)
      if (shouldShowBanner) setShowBanner(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [serverCountry])

  const handleSelectLocale = async (locale: Locale) => {
    // Save to localStorage
    saveLocale(locale)
    setShowBanner(false)

    // Persist to server if signed in
    if (isSignedIn) {
      fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
        keepalive: true,
      }).catch(() => {})
    }

    // Navigate to the selected locale, preserving query string and hash
    const translatedPathname = translateSeoPathnameForLocaleSwitch(internalPathname, currentLocale, locale)
    const search = typeof window !== "undefined" ? window.location.search : ""
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    router.replace(buildLocalePathWithQuery(translatedPathname, locale, search, hash))
    router.refresh()
  }

  const handleDismiss = () => {
    dismissBanner()
    setShowBanner(false)
  }

  // Don't render during SSR to prevent hydration mismatch
  if (!isClient) {
    return null
  }

  return (
    <LocaleBanner isVisible={showBanner} onSelectLocale={handleSelectLocale} onDismiss={handleDismiss} />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export { STORAGE_KEYS, getSavedLocale, saveLocale }
export type { Locale }

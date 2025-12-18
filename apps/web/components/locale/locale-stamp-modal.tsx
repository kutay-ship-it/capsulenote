"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, X, Check, ArrowRight, Stamp } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useLocale } from "next-intl"
import { useRouter as useNextIntlRouter } from "@/i18n/routing"
import { usePathname as useNextPathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { routing } from "@/i18n/routing"
import { saveLocale, type Locale } from "./locale-detector"
import { translateSeoPathnameForLocaleSwitch } from "@/lib/seo/localized-slugs"

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

function V3FloatingBadge({
  icon,
  label,
  variant = "yellow",
}: {
  icon?: React.ReactNode
  label: string
  variant?: "yellow" | "blue" | "teal" | "dark"
}) {
  return (
    <div
      className={cn(
        "absolute -top-3 left-4 flex items-center gap-1.5",
        "px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        "border-2 border-charcoal",
        variant === "yellow" && "bg-duck-yellow text-charcoal",
        variant === "blue" && "bg-duck-blue text-charcoal",
        variant === "teal" && "bg-teal-primary text-white",
        variant === "dark" && "bg-charcoal text-white"
      )}
      style={{ borderRadius: "2px" }}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function V3Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={cn(
          "w-5 h-5 border-2 border-charcoal flex items-center justify-center",
          "transition-all duration-150",
          checked ? "bg-duck-yellow" : "bg-white group-hover:bg-cream"
        )}
        style={{ borderRadius: "2px" }}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check className="h-3 w-3 text-charcoal" strokeWidth={3} />}
      </div>
      <span className="font-mono text-xs text-charcoal/70">{label}</span>
    </label>
  )
}

// ============================================================================
// LOCALE DATA
// ============================================================================

const LOCALES = [
  { code: "tr" as Locale, flag: "🇹🇷", name: "Türkçe", region: "Türkiye" },
  { code: "en" as Locale, flag: "🇬🇧", name: "English", region: "Global" },
]

// ============================================================================
// LOCALE STAMP MODAL (V5)
// ============================================================================

interface LocaleStampModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LocaleStampModal({ isOpen, onClose }: LocaleStampModalProps) {
  const currentLocale = useLocale()
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale as Locale)
  const [rememberChoice, setRememberChoice] = useState(true)
  const { isSignedIn } = useAuth()
  const router = useNextIntlRouter()
  const pathname = useNextPathname()

  // Get pathname without locale prefix for navigation
  const getPathnameWithoutLocale = (path: string): string => {
    for (const loc of routing.locales) {
      if (path === `/${loc}`) return "/"
      if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    }
    return path
  }

  const internalPathname = getPathnameWithoutLocale(pathname)

  const handleConfirm = async () => {
    // Save to localStorage if remember is checked
    if (rememberChoice) {
      saveLocale(selectedLocale)
    }

    // Persist to server if signed in
    if (isSignedIn) {
      fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: selectedLocale }),
        keepalive: true,
      }).catch(() => {})
    }

    onClose()

    // Navigate to the selected locale
    if (selectedLocale !== currentLocale) {
      const translatedPathname = translateSeoPathnameForLocaleSwitch(
        internalPathname,
        currentLocale as "en" | "tr",
        selectedLocale as "en" | "tr"
      )
      router.replace(translatedPathname as Parameters<typeof router.replace>[0], { locale: selectedLocale })
      router.refresh()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full max-w-lg border-2 border-charcoal bg-cream p-8 pt-10",
              "shadow-[-8px_8px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {/* Floating Badge */}
            <V3FloatingBadge
              icon={<Globe className="h-3 w-3" />}
              label="Dil Seç / Select Language"
              variant="teal"
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-3 right-3 p-1 border-2 border-charcoal bg-white",
                "transition-all duration-150 hover:bg-coral hover:text-white"
              )}
              style={{ borderRadius: "2px" }}
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            {/* Stamp Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {LOCALES.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => setSelectedLocale(locale.code)}
                  className={cn(
                    "relative border-2 border-charcoal p-6 transition-all duration-150",
                    "hover:-translate-y-0.5 hover:translate-x-0.5",
                    selectedLocale === locale.code
                      ? "bg-duck-yellow shadow-[-6px_6px_0_theme(colors.charcoal)]"
                      : "bg-white shadow-[-4px_4px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Selected Indicator */}
                  {selectedLocale === locale.code && (
                    <div
                      className={cn(
                        "absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center",
                        "border-2 border-charcoal bg-teal-primary"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Stamp Content */}
                  <div className="text-center">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-16 h-16 mb-3",
                        "border-2 border-dashed border-charcoal/30"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      <span className="text-4xl">{locale.flag}</span>
                    </div>
                    <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                      {locale.name}
                    </h4>
                    <p className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wide mt-1">
                      {locale.region}
                    </p>
                  </div>

                  {/* Stamp Decoration */}
                  <Stamp className="absolute bottom-2 right-2 h-4 w-4 text-charcoal/20" />
                </button>
              ))}
            </div>

            {/* Dashed Separator */}
            <div className="border-t-2 border-dashed border-charcoal/30 mb-4" />

            {/* Remember Checkbox */}
            <div className="mb-6">
              <V3Checkbox
                checked={rememberChoice}
                onChange={setRememberChoice}
                label="Tercihimi hatırla / Remember my choice"
              />
            </div>

            {/* Confirm Button */}
            <V3Button variant="primary" className="w-full" onClick={handleConfirm}>
              Onayla / Confirm
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </V3Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// FOOTER LANGUAGE BUTTON
// ============================================================================

interface FooterLanguageButtonProps {
  className?: string
}

export function FooterLanguageButton({ className }: FooterLanguageButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const currentLocale = useLocale()

  // Find current locale data or fallback to English
  const currentLocaleData = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[1]!

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          "border-2 border-charcoal bg-white",
          "font-mono text-xs uppercase tracking-wider text-charcoal",
          "transition-all duration-150",
          "hover:-translate-y-0.5 hover:translate-x-0.5",
          "shadow-[-2px_2px_0_theme(colors.charcoal)]",
          "hover:shadow-[-4px_4px_0_theme(colors.charcoal)]",
          className
        )}
        style={{ borderRadius: "2px" }}
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{currentLocaleData.flag}</span>
        <span>{currentLocaleData.name}</span>
      </button>

      <LocaleStampModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

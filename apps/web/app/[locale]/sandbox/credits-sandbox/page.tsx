"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Mail, X, Check, ArrowRight, Stamp } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// SHARED V3 COMPONENTS
// ============================================================================

type Locale = "tr" | "en"

interface LocaleSelectorProps {
  isVisible: boolean
  onSelectLocale: (locale: Locale) => void
  onDismiss: () => void
}

// V3 Button Component
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
        // Variants
        variant === "primary" && "bg-duck-yellow text-charcoal",
        variant === "secondary" && "bg-white text-charcoal",
        variant === "dark" && "bg-charcoal text-white",
        variant === "ghost" && "bg-transparent text-charcoal shadow-none hover:shadow-none",
        // Sizes
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

// V3 Floating Badge Component
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

// V3 Checkbox Component
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
// VARIATION 1: BRUTALIST TOP BANNER
// Apple-style pattern with V3 aesthetics
// ============================================================================

function LocaleBannerV3({ isVisible, onSelectLocale, onDismiss }: LocaleSelectorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div
            className="relative border-b-2 border-charcoal bg-cream"
          >
            {/* Floating Badge */}
            <V3FloatingBadge icon={<Globe className="h-3 w-3" />} label="Locale" variant="dark" />

            <div className="container py-6 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Message */}
                <p className="font-mono text-sm text-charcoal text-center md:text-left">
                  Türkiye&apos;den mi bağlanıyorsunuz? Türkçe siteyi tercih edebilirsiniz.
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <V3Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectLocale("tr")}
                  >
                    <span className="text-lg">🇹🇷</span>
                    Türkçe
                  </V3Button>

                  <V3Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectLocale("en")}
                  >
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
// VARIATION 2: POSTAL CARD (Floating Corner)
// Letter/stamp themed floating notification
// ============================================================================

function LocaleCardV3({ isVisible, onSelectLocale, onDismiss }: LocaleSelectorProps) {
  const [rememberChoice, setRememberChoice] = useState(true)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div
            className={cn(
              "relative border-2 border-charcoal bg-cream p-6 pt-8",
              "shadow-[-4px_4px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {/* Floating Badge */}
            <V3FloatingBadge icon={<Mail className="h-3 w-3" />} label="Mektup" variant="blue" />

            {/* Close Button */}
            <button
              onClick={onDismiss}
              className={cn(
                "absolute top-3 right-3 p-1 border-2 border-charcoal bg-white",
                "transition-all duration-150 hover:bg-coral hover:text-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            {/* Content */}
            <div className="space-y-4">
              {/* Flag + Greeting */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">🇹🇷</span>
                <div>
                  <h3 className="font-mono text-xl font-bold text-charcoal uppercase tracking-wider">
                    Merhaba!
                  </h3>
                  <p className="font-mono text-xs text-charcoal/70">
                    Türkiye&apos;den mi bağlanıyorsunuz?
                  </p>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t-2 border-dashed border-charcoal/30" />

              {/* Buttons */}
              <div className="flex gap-3">
                <V3Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectLocale("tr")}
                >
                  Türkçe
                </V3Button>
                <V3Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectLocale("en")}
                >
                  English
                </V3Button>
              </div>

              {/* Remember Checkbox */}
              <V3Checkbox
                checked={rememberChoice}
                onChange={setRememberChoice}
                label="Tercihimi hatırla"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// VARIATION 3: SPLIT SCREEN GATE
// Full viewport welcome experience
// ============================================================================

function LocaleGateV3({ isVisible, onSelectLocale }: Omit<LocaleSelectorProps, "onDismiss">) {
  const [hoveredSide, setHoveredSide] = useState<Locale | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null)

  const handleSelect = (locale: Locale) => {
    setSelectedLocale(locale)
    setIsExiting(true)
    setTimeout(() => onSelectLocale(locale), 500)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-cream"
        >
          <div className="h-full flex flex-col md:flex-row">
            {/* English Side */}
            <motion.div
              className={cn(
                "flex-1 relative flex items-center justify-center p-8 cursor-pointer",
                "transition-colors duration-200",
                hoveredSide === "en" ? "bg-white" : "bg-cream"
              )}
              animate={{
                flex: isExiting ? (selectedLocale === "en" ? 2 : 0) : 1,
                opacity: isExiting && selectedLocale === "tr" ? 0 : 1,
              }}
              transition={{ duration: 0.4 }}
              onMouseEnter={() => setHoveredSide("en")}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => handleSelect("en")}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={cn(
                  "relative border-2 border-charcoal bg-white p-8 md:p-12 max-w-md",
                  "shadow-[-4px_4px_0_theme(colors.charcoal)]",
                  "transition-all duration-200",
                  hoveredSide === "en" && "shadow-[-8px_8px_0_theme(colors.charcoal)] -translate-y-1 translate-x-1"
                )}
                style={{ borderRadius: "2px" }}
              >
                <V3FloatingBadge icon={<span className="text-sm">🇬🇧</span>} label="English" variant="blue" />

                <div className="text-center pt-4">
                  <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wider text-charcoal mb-4">
                    Letters to your
                    <br />
                    <span className="text-duck-blue">future self</span>
                  </h2>

                  <p className="font-mono text-sm text-charcoal/70 mb-8">
                    Write now. Receive later.
                  </p>

                  <V3Button variant={hoveredSide === "en" ? "primary" : "secondary"}>
                    Continue
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </V3Button>
                </div>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="hidden md:block w-1 bg-charcoal"
              animate={{ opacity: isExiting ? 0 : 1 }}
            />
            <motion.div
              className="md:hidden h-1 bg-charcoal"
              animate={{ opacity: isExiting ? 0 : 1 }}
            />

            {/* Turkish Side */}
            <motion.div
              className={cn(
                "flex-1 relative flex items-center justify-center p-8 cursor-pointer",
                "transition-colors duration-200",
                hoveredSide === "tr" ? "bg-duck-yellow/10" : "bg-cream"
              )}
              animate={{
                flex: isExiting ? (selectedLocale === "tr" ? 2 : 0) : 1,
                opacity: isExiting && selectedLocale === "en" ? 0 : 1,
              }}
              transition={{ duration: 0.4 }}
              onMouseEnter={() => setHoveredSide("tr")}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => handleSelect("tr")}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className={cn(
                  "relative border-2 border-charcoal bg-white p-8 md:p-12 max-w-md",
                  "shadow-[-4px_4px_0_theme(colors.charcoal)]",
                  "transition-all duration-200",
                  hoveredSide === "tr" && "shadow-[-8px_8px_0_theme(colors.charcoal)] -translate-y-1 translate-x-1"
                )}
                style={{ borderRadius: "2px" }}
              >
                <V3FloatingBadge icon={<span className="text-sm">🇹🇷</span>} label="Türkçe" variant="yellow" />

                <div className="text-center pt-4">
                  <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wider text-charcoal mb-4">
                    Geleceğe
                    <br />
                    <span className="text-duck-yellow">mektuplar</span>
                  </h2>

                  <p className="font-mono text-sm text-charcoal/70 mb-8">
                    Şimdi yaz. Sonra al.
                  </p>

                  <V3Button variant={hoveredSide === "tr" ? "primary" : "secondary"}>
                    Devam Et
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </V3Button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 left-0 right-0 text-center"
          >
            <p className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
              Your words, delivered when they matter most
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// VARIATION 4: TOAST NOTIFICATION
// Minimal bottom bar notification
// ============================================================================

function LocaleToastV3({ isVisible, onSelectLocale, onDismiss }: LocaleSelectorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:w-auto"
        >
          <div
            className={cn(
              "flex items-center gap-4 border-2 border-charcoal bg-charcoal px-4 py-3",
              "shadow-[-4px_4px_0_theme(colors.duck-yellow)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <span className="text-2xl">🇹🇷</span>
            <p className="font-mono text-xs text-white hidden sm:block">
              Türkiye için site mevcut
            </p>
            <V3Button
              variant="primary"
              size="sm"
              onClick={() => onSelectLocale("tr")}
              className="shadow-none hover:shadow-none"
            >
              Türkçe&apos;ye Geç
            </V3Button>
            <button
              onClick={onDismiss}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// VARIATION 5: STAMP GRID MODAL
// Interactive stamp-style language selection
// ============================================================================

function LocaleStampsV3({ isVisible, onSelectLocale, onDismiss }: LocaleSelectorProps) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr")
  const [rememberChoice, setRememberChoice] = useState(true)

  const locales = [
    { code: "tr" as Locale, flag: "🇹🇷", name: "Türkçe", region: "Türkiye" },
    { code: "en" as Locale, flag: "🇬🇧", name: "English", region: "Global" },
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50"
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
              onClick={onDismiss}
              className={cn(
                "absolute top-3 right-3 p-1 border-2 border-charcoal bg-white",
                "transition-all duration-150 hover:bg-coral hover:text-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            {/* Stamp Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {locales.map((locale) => (
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
            <V3Button
              variant="primary"
              className="w-full"
              onClick={() => onSelectLocale(selectedLocale)}
            >
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
// MAIN SANDBOX PAGE
// ============================================================================

type VariationType = 1 | 2 | 3 | 4 | 5

const VARIATIONS = [
  { num: 1, name: "Brutalist Banner", desc: "Top bar with floating badge" },
  { num: 2, name: "Postal Card", desc: "Floating corner notification" },
  { num: 3, name: "Split Gate", desc: "Full-page welcome experience" },
  { num: 4, name: "Toast", desc: "Minimal bottom notification" },
  { num: 5, name: "Stamp Grid", desc: "Interactive modal selection" },
] as const

export default function LocaleSelectorSandboxV3() {
  const [activeVersion, setActiveVersion] = useState<VariationType>(1)
  const [showBanner, setShowBanner] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null)

  // Reset banner when switching versions
  useEffect(() => {
    setShowBanner(true)
    setSelectedLocale(null)
  }, [activeVersion])

  const handleDismiss = () => {
    setShowBanner(false)
  }

  const handleSelectLocale = (locale: Locale) => {
    setSelectedLocale(locale)
    setShowBanner(false)
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-cream",
        activeVersion === 1 && showBanner && "pt-24"
      )}
    >
      {/* Render Active Variation */}
      {activeVersion === 1 && (
        <LocaleBannerV3
          isVisible={showBanner}
          onSelectLocale={handleSelectLocale}
          onDismiss={handleDismiss}
        />
      )}
      {activeVersion === 2 && (
        <LocaleCardV3
          isVisible={showBanner}
          onSelectLocale={handleSelectLocale}
          onDismiss={handleDismiss}
        />
      )}
      {activeVersion === 3 && (
        <LocaleGateV3
          isVisible={showBanner}
          onSelectLocale={handleSelectLocale}
        />
      )}
      {activeVersion === 4 && (
        <LocaleToastV3
          isVisible={showBanner}
          onSelectLocale={handleSelectLocale}
          onDismiss={handleDismiss}
        />
      )}
      {activeVersion === 5 && (
        <LocaleStampsV3
          isVisible={showBanner}
          onSelectLocale={handleSelectLocale}
          onDismiss={handleDismiss}
        />
      )}

      {/* Main Content (hidden when gate is visible) */}
      <div className={cn(activeVersion === 3 && showBanner && "hidden")}>
        <div className="container py-12">
          {/* Header */}
          <div className="mb-12">
            <div
              className="relative border-2 border-charcoal bg-white p-8 shadow-[-4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <V3FloatingBadge icon={<Globe className="h-3 w-3" />} label="i18n UX Sandbox" variant="teal" />
              <div className="pt-4">
                <h1 className="font-mono text-3xl font-bold uppercase tracking-wider text-charcoal mb-2">
                  Language Selection UX
                </h1>
                <p className="font-mono text-sm text-charcoal/70">
                  V3 Neo-Brutalist variations for locale detection and switching
                </p>
              </div>
            </div>
          </div>

          {/* Version Selector */}
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-4">
              Select Variation
            </p>
            <div className="flex flex-wrap gap-3">
              {VARIATIONS.map((v) => (
                <button
                  key={v.num}
                  onClick={() => setActiveVersion(v.num as VariationType)}
                  className={cn(
                    "border-2 border-charcoal px-4 py-3 font-mono text-left",
                    "transition-all duration-150",
                    "hover:-translate-y-0.5 hover:translate-x-0.5",
                    activeVersion === v.num
                      ? "bg-duck-yellow shadow-[-6px_6px_0_theme(colors.charcoal)]"
                      : "bg-white shadow-[-4px_4px_0_theme(colors.charcoal)] hover:shadow-[-6px_6px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    V{v.num}: {v.name}
                  </div>
                  <div className="text-[10px] text-charcoal/60 mt-1">
                    {v.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {!showBanner && (
            <div className="mb-8">
              <V3Button variant="dark" onClick={() => setShowBanner(true)}>
                Show Variation Again
              </V3Button>
              {selectedLocale && (
                <p className="font-mono text-xs text-charcoal/70 mt-3">
                  Selected locale: <strong className="uppercase">{selectedLocale}</strong>
                </p>
              )}
            </div>
          )}

          {/* Documentation */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Design System Compliance */}
            <div
              className="relative border-2 border-charcoal bg-white p-6 shadow-[-4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <V3FloatingBadge icon={<Check className="h-3 w-3" />} label="V3 Compliant" variant="teal" />
              <div className="pt-4 space-y-3">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                  Design System Compliance
                </h3>
                <ul className="font-mono text-xs text-charcoal/70 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> 2px border-radius only
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> Hard offset shadows
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> Monospace typography
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> V3 color palette
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> Floating badge pattern
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-teal-primary" /> Brutalist hover effects
                  </li>
                </ul>
              </div>
            </div>

            {/* Recommended Usage */}
            <div
              className="relative border-2 border-charcoal bg-white p-6 shadow-[-4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <V3FloatingBadge icon={<ArrowRight className="h-3 w-3" />} label="Usage" variant="blue" />
              <div className="pt-4 space-y-3">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                  Recommended Strategy
                </h3>
                <div className="font-mono text-xs text-charcoal/70 space-y-2">
                  <p><strong className="text-charcoal">MVP:</strong> V4 Toast - Minimal, unobtrusive</p>
                  <p><strong className="text-charcoal">Default:</strong> V1 Banner - Clear, proven</p>
                  <p><strong className="text-charcoal">First Visit:</strong> V3 Gate - Brand moment</p>
                  <p><strong className="text-charcoal">Settings:</strong> V5 Stamps - Manual switching</p>
                </div>
              </div>
            </div>

            {/* Technical Detection */}
            <div
              className="relative border-2 border-charcoal bg-white p-6 shadow-[-4px_4px_0_theme(colors.charcoal)] md:col-span-2"
              style={{ borderRadius: "2px" }}
            >
              <V3FloatingBadge icon={<Globe className="h-3 w-3" />} label="Detection" variant="dark" />
              <div className="pt-4">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
                  Locale Detection Strategy
                </h3>
                <div
                  className="font-mono text-xs bg-charcoal text-cream p-4 overflow-x-auto"
                  style={{ borderRadius: "2px" }}
                >
                  <pre>{`// Priority order for locale detection:
1. localStorage.getItem('locale-preference')  // Saved choice
2. Cloudflare CF-IPCountry header             // Server-side geo
3. navigator.language                          // Browser pref
4. Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Istanbul'

// Persistence:
localStorage.setItem('locale-preference', 'tr')
localStorage.setItem('locale-banner-dismissed', 'true')`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

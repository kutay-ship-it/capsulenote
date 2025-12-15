"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface NavbarV3Props {
  isSignedIn?: boolean
}

export function NavbarV3({ isSignedIn = false }: NavbarV3Props) {
  const locale = useLocale()
  const t = useTranslations("marketing.nav")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Avoid locale-insensitive uppercase transformations for Turkish text
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const navLinks = [
    { label: t("features"), href: "#features" },
    { label: t("howItWorks"), href: "#how-it-works" },
  ]

  // Use IntersectionObserver instead of scroll event listener for better performance
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible (scrolled past), navbar is "scrolled"
        setIsScrolled(!entry?.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Invisible sentinel element at top of page for scroll detection */}
      <div ref={sentinelRef} className="absolute top-0 left-0 h-5 w-full pointer-events-none" aria-hidden="true" />

      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-200",
          isScrolled
            ? "bg-cream/95 backdrop-blur-sm border-b-2 border-charcoal"
            : "bg-transparent"
        )}
      >
        <nav className="container px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal sm:text-xl">
                Capsule<span className="text-duck-blue">Note</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "font-mono text-sm tracking-wide text-charcoal transition-opacity hover:opacity-70",
                  uppercaseClass
                )}
              >
                {link.label}
              </a>
            ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 md:flex">
              {isSignedIn ? (
                <Link href="/letters">
                  <Button size="sm" className="gap-2">
                    {t("letters")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      {t("signIn")}
                    </Button>
                  </Link>
                  <a href="#try-demo">
                    <Button size="sm" className="gap-2">
                      {t("getStarted")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white md:hidden"
              style={{ borderRadius: "2px" }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - CSS transitions instead of framer-motion */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-cream pt-20 md:hidden overflow-y-auto transition-all duration-200",
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="container px-4 pb-6">
          <div className="flex flex-col gap-2 py-6">
            {navLinks.map((link, i) => (
              <div
                key={link.label}
                className={cn(
                  "transition-all duration-200",
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : "0ms" }}
              >
                <a
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block border-b-2 border-charcoal/10 py-4 font-mono text-lg tracking-wide text-charcoal",
                    uppercaseClass
                  )}
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "flex flex-col gap-3 pt-4 transition-all duration-200",
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: isMobileMenuOpen ? "150ms" : "0ms" }}
          >
            {isSignedIn ? (
              <Link href="/letters" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full gap-2">
                  {t("letters")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <a href="#try-demo" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full gap-2">
                    {t("getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t("signIn")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

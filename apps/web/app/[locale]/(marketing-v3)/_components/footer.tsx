"use client"

import { Mail } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import type { AppHref } from "@/i18n/routing"
import { FooterLanguageButton } from "@/components/locale"
import { cn } from "@/lib/utils"

type FooterHref = AppHref | `#${string}`

function isHashHref(href: FooterHref): href is `#${string}` {
  return typeof href === "string" && href.startsWith("#")
}

export function Footer() {
  const locale = useLocale()
  const t = useTranslations("marketing.footer")
  const currentYear = new Date().getFullYear()
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const links: Record<string, Array<{ label: string; href: FooterHref }>> = {
    product: [
      { label: t("links.pricing"), href: "/pricing" },
      { label: t("links.writeLetter"), href: "/write-letter" },
      { label: t("links.features"), href: "#features" },
    ],
    learn: [
      { label: t("links.templates"), href: "/templates" },
      { label: t("links.guides"), href: "/guides" },
      { label: t("links.prompts"), href: "/prompts" },
      { label: t("links.blog"), href: "/blog" },
    ],
    company: [
      { label: t("links.about"), href: "/about" },
      { label: t("links.contact"), href: "/contact" },
    ],
    legal: [
      { label: t("links.privacy"), href: "/privacy" },
      { label: t("links.terms"), href: "/terms" },
      { label: t("links.security"), href: "/security" },
    ],
  }

  const categoryLabels: Record<string, string> = {
    product: t("product"),
    learn: t("learn"),
    company: t("company"),
    legal: t("legal"),
  }

  return (
    <footer className="border-t-2 border-charcoal bg-cream">
      {/* Main Footer */}
      <div className="container px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <span className={cn("font-mono text-xl font-bold tracking-wide text-charcoal", uppercaseClass)}>
                Capsule<span className="text-duck-blue">Note</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs font-mono text-sm leading-relaxed text-charcoal/70">
              {t("tagline")}
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:hello@capsulenote.com"
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                style={{ borderRadius: "2px" }}
                aria-label="Email"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(links).map(([category, categoryLinks]) => (
            <div key={category}>
              <h4
                className={cn(
                  "mb-4 font-mono text-sm font-bold tracking-wider text-charcoal",
                  uppercaseClass
                )}
              >
                {categoryLabels[category]}
              </h4>
              <ul className="space-y-3">
                {categoryLinks.map((link) => (
                  <li key={link.label}>
                    {isHashHref(link.href) ? (
                      <a
                        href={link.href}
                        className="font-mono text-sm text-charcoal/70 transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-mono text-sm text-charcoal/70 transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-charcoal/10 bg-off-white py-6">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="font-mono text-xs text-charcoal/60">
              {currentYear} {t("copyright")}
            </p>
            <div className="flex items-center gap-4">
              <p className="font-mono text-xs text-charcoal/60">
                {t("madeWith")}
              </p>
              <FooterLanguageButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

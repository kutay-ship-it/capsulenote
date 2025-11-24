import { getTranslations } from "next-intl/server"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"

import { Link as LocalizedLink } from "@/i18n/routing"

interface NavbarProps {
  isSignedIn?: boolean
}

export async function Navbar({ isSignedIn = false }: NavbarProps) {
  const t = await getTranslations({ namespace: "common" })

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-white">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <LocalizedLink
          href="/"
          className="flex items-center gap-2 transition-transform hover:-translate-y-0.5"
        >
          <div
            className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
          </div>
          <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            {t("brand")}
          </span>
        </LocalizedLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <LocalizedLink
            href={{ pathname: "/", hash: "write-letter" }}
            className="font-mono text-sm uppercase tracking-wide text-charcoal transition-colors hover:text-duck-blue"
          >
            {t("actions.tryEditor")}
          </LocalizedLink>
          <LocalizedLink
            href={{ pathname: "/", hash: "how-it-works" }}
            className="font-mono text-sm uppercase tracking-wide text-charcoal transition-colors hover:text-duck-blue"
          >
            {t("actions.howItWorks")}
          </LocalizedLink>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:flex" />
          {isSignedIn ? (
            <LocalizedLink href="/dashboard">
              <Button
                size="sm"
                className="font-mono uppercase tracking-wide"
                style={{
                  borderRadius: "2px",
                  boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                }}
              >
                {t("actions.dashboard")}
              </Button>
            </LocalizedLink>
          ) : (
            <>
              <LocalizedLink href="/sign-in" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-charcoal font-mono uppercase tracking-wide"
                  style={{ borderRadius: "2px" }}
                >
                  {t("actions.signIn")}
                </Button>
              </LocalizedLink>
              <LocalizedLink href="/sign-up">
                <Button
                  size="sm"
                  className="font-mono uppercase tracking-wide"
                  style={{
                    borderRadius: "2px",
                    boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                  }}
                >
                  {t("actions.signUp")}
                </Button>
              </LocalizedLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

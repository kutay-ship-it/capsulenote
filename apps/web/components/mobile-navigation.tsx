"use client"

import { useState } from "react"
import { Menu, Home, FileText, Settings, Mail } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  translations: {
    brand: string
    dashboard: string
    letters: string
    settings: string
    openMenu: string
  }
}

export function MobileNavigation({ translations }: MobileNavigationProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: translations.dashboard, icon: Home },
    { href: "/letters", label: translations.letters, icon: FileText },
    { href: "/settings", label: translations.settings, icon: Settings },
  ]

  const isActive = (href: string) => {
    // Remove locale prefix for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "")
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden border-2 border-charcoal bg-off-white hover:bg-duck-yellow/20"
          style={{ borderRadius: "2px" }}
          aria-label={translations.openMenu}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-r-2 border-charcoal bg-off-white p-0"
        style={{ borderRadius: "0" }}
      >
        <SheetHeader className="border-b-2 border-charcoal p-6">
          <SheetTitle className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <span className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
              {translations.brand}
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 font-mono text-base uppercase tracking-wide transition-colors",
                  "border-2 border-transparent",
                  active
                    ? "border-charcoal bg-duck-yellow text-charcoal"
                    : "text-charcoal hover:bg-duck-yellow/20"
                )}
                style={{ borderRadius: "2px", marginBottom: "8px" }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

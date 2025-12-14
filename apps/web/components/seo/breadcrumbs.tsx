"use client"

import { ChevronRight, Home } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale?: string
  className?: string
}

/**
 * Breadcrumb navigation component with SEO-friendly markup
 * Use alongside BreadcrumbSchema from json-ld.tsx for rich results
 */
export function Breadcrumbs({ items, locale = "en", className }: BreadcrumbsProps) {
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  return (
    <nav
      aria-label={locale === "tr" ? "Breadcrumb" : "Breadcrumb"}
      className={cn("flex items-center gap-1 text-sm font-mono", className)}
    >
      <Link
        href="/"
        className="flex items-center text-charcoal/50 hover:text-charcoal transition-colors"
        aria-label={locale === "tr" ? "Ana Sayfa" : "Home"}
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-charcoal/30" />
            {isLast ? (
              <span
                className={cn("text-charcoal/70 truncate max-w-[200px]", uppercaseClass)}
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href as any}
                className={cn(
                  "text-charcoal/50 hover:text-charcoal transition-colors truncate max-w-[150px]",
                  uppercaseClass
                )}
              >
                {item.name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

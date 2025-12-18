"use client"

import { ArrowRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface RelatedItem {
  title: string
  href: string
  description?: string
  category?: string
}

interface RelatedContentProps {
  items: RelatedItem[]
  title?: string
  locale?: string
  className?: string
  variant?: "compact" | "expanded"
}

/**
 * Related content component for internal linking
 * Helps with SEO by creating contextual cross-links between pages
 */
export function RelatedContent({
  items,
  title,
  locale = "en",
  className,
  variant = "compact",
}: RelatedContentProps) {
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const defaultTitle = locale === "tr" ? "İlgili İçerikler" : "Related Content"

  if (items.length === 0) return null

  return (
    <section className={cn("mt-10 pt-8 border-t-2 border-charcoal/10", className)}>
      <h2 className={cn("font-mono text-lg text-charcoal mb-6", uppercaseClass)}>
        {title || defaultTitle}
      </h2>

      {variant === "compact" ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href as "/"}
              className={cn(
                "group flex items-center justify-between p-4 border-2 border-charcoal/20 bg-white",
                "transition-all hover:border-charcoal hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal/20)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-center gap-3">
                {item.category && (
                  <span className={cn("font-mono text-xs text-charcoal/40", uppercaseClass)}>
                    {item.category}
                  </span>
                )}
                <span className="font-mono text-sm text-charcoal group-hover:text-charcoal/80">
                  {item.title}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href as "/"}
              className={cn(
                "group p-5 border-2 border-charcoal/20 bg-white",
                "transition-all hover:border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal/20)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {item.category && (
                <span className={cn("font-mono text-xs text-charcoal/40 block mb-2", uppercaseClass)}>
                  {item.category}
                </span>
              )}
              <h3 className={cn("font-mono text-base font-bold text-charcoal mb-2", uppercaseClass)}>
                {item.title}
              </h3>
              {item.description && (
                <p className="font-mono text-sm text-charcoal/60 leading-relaxed mb-3">
                  {item.description}
                </p>
              )}
              <span className="flex items-center gap-2 text-charcoal/60 font-mono text-sm group-hover:text-charcoal group-hover:gap-3 transition-all">
                {locale === "tr" ? "Devamını Oku" : "Read More"}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Utility to generate related items from a content type
 * Can be used with templates, guides, prompts, or blog posts
 */
export function generateRelatedItems(
  currentSlug: string,
  allItems: Array<{ slug: string; title: string; category?: string; description?: string }>,
  basePath: string,
  limit = 5
): RelatedItem[] {
  return allItems
    .filter((item) => item.slug !== currentSlug)
    .slice(0, limit)
    .map((item) => ({
      title: item.title,
      href: `${basePath}/${item.slug}`,
      category: item.category,
      description: item.description,
    }))
}

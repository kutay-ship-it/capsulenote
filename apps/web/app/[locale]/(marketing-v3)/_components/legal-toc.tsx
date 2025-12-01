"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  title: string
  number?: string
}

interface LegalTocProps {
  items: TocItem[]
  title?: string
}

/**
 * Table of Contents with scroll-spy for legal pages
 *
 * V3 Design: Brutalist card, monospace, highlight active section
 * Client Component - uses IntersectionObserver for scroll tracking
 */
export function LegalToc({ items, title = "Contents" }: LegalTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0% -70% 0%",
        threshold: 0,
      }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
    }
  }

  return (
    <nav
      className={cn(
        "p-5 border-2 border-charcoal bg-white",
        "shadow-[3px_3px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
      aria-label="Table of contents"
    >
      {/* TOC Title */}
      <h3 className="font-mono text-xs uppercase tracking-wider text-charcoal mb-4 font-bold">
        {title}
      </h3>

      {/* TOC Items */}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                "flex items-baseline gap-2 py-1.5 font-mono text-sm transition-colors",
                activeId === item.id
                  ? "text-duck-blue font-medium"
                  : "text-charcoal/60 hover:text-charcoal"
              )}
            >
              {item.number && (
                <span className="text-xs text-charcoal/40 w-5 flex-shrink-0">
                  {item.number}
                </span>
              )}
              <span className="leading-tight">{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Mobile TOC dropdown - shown on smaller screens
 */
export function LegalTocMobile({ items, title = "Jump to section" }: LegalTocProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "border-2 border-charcoal bg-white",
          "font-mono text-sm uppercase tracking-wide text-charcoal",
          "shadow-[2px_2px_0_theme(colors.charcoal)]",
          "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]"
        )}
        style={{ borderRadius: "2px" }}
      >
        <span>{title}</span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="mt-2 p-4 border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleSelect(item.id)}
                  className="flex items-baseline gap-2 w-full text-left py-1 font-mono text-sm text-charcoal/70 hover:text-duck-blue transition-colors"
                >
                  {item.number && (
                    <span className="text-xs text-charcoal/40 w-5 flex-shrink-0">
                      {item.number}
                    </span>
                  )}
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

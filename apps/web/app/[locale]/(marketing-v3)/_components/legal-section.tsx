import { cn } from "@/lib/utils"

interface LegalSectionProps {
  id: string
  title: string
  number?: string
  children: React.ReactNode
  className?: string
}

/**
 * Content section for legal/info pages
 *
 * V3 Design: Numbered heading, anchor-linkable, dashed separator
 * Server Component for optimal performance
 */
export function LegalSection({
  id,
  title,
  number,
  children,
  className,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 mb-10 pb-10",
        "border-b-2 border-dashed border-charcoal/10 last:border-0 last:pb-0",
        className
      )}
    >
      {/* Section Heading with optional number */}
      <h2 className="flex items-baseline gap-3 font-mono text-xl md:text-2xl uppercase tracking-wide text-charcoal mb-6">
        {number && (
          <span className="text-duck-blue font-bold">{number}</span>
        )}
        <span>{title}</span>
      </h2>

      {/* Content */}
      <div className="font-mono text-sm md:text-base text-charcoal/80 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}

/**
 * Paragraph component for legal content
 * Ensures consistent styling for text blocks
 */
export function LegalParagraph({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("font-mono text-sm md:text-base text-charcoal/80 leading-relaxed", className)}>
      {children}
    </p>
  )
}

/**
 * Bulleted list for legal content
 */
export function LegalList({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  return (
    <ul className={cn("space-y-2 pl-6", className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className="font-mono text-sm md:text-base text-charcoal/80 leading-relaxed list-disc marker:text-duck-blue"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

/**
 * Highlight box for important notices
 */
export function LegalHighlight({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode
  variant?: "info" | "warning" | "success"
  className?: string
}) {
  const variants = {
    info: "bg-duck-blue/10 border-duck-blue",
    warning: "bg-duck-yellow/20 border-duck-yellow",
    success: "bg-teal-primary/10 border-teal-primary",
  }

  return (
    <div
      className={cn(
        "p-4 border-2 font-mono text-sm text-charcoal/80 leading-relaxed",
        variants[variant],
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {children}
    </div>
  )
}

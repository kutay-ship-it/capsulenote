import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalHeroProps {
  badge: string
  title: string
  description?: string
  lastUpdated?: string
  icon?: LucideIcon
  accentColor?: "yellow" | "blue" | "teal" | "coral"
}

const accentColors = {
  yellow: "bg-duck-yellow",
  blue: "bg-duck-blue",
  teal: "bg-teal-primary",
  coral: "bg-coral",
}

/**
 * Hero section for legal/info pages
 *
 * V3 Design: Brutalist badge, uppercase title, monospace typography
 * Server Component - no client-side animations for performance
 */
export function LegalHero({
  badge,
  title,
  description,
  lastUpdated,
  icon: Icon,
  accentColor = "yellow",
}: LegalHeroProps) {
  return (
    <section className="mb-12 pb-10 border-b-2 border-charcoal/10">
      {/* Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 mb-6",
          "border-2 border-charcoal",
          "font-mono text-xs uppercase tracking-widest text-charcoal",
          "shadow-[3px_3px_0_theme(colors.charcoal)]",
          accentColors[accentColor]
        )}
        style={{ borderRadius: "2px" }}
      >
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        <span>{badge}</span>
      </div>

      {/* Title */}
      <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide text-charcoal mb-4">
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p className="font-mono text-base md:text-lg text-charcoal/70 max-w-2xl mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="font-mono text-sm text-charcoal/50">
          Last updated: {lastUpdated}
        </p>
      )}
    </section>
  )
}

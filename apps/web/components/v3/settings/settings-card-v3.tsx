import { cn } from "@/lib/utils"

interface SettingsCardV3Props {
  icon: React.ReactNode
  title: string
  description?: string
  badgeBg?: string
  badgeText?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * V3 Settings Card with floating badge pattern
 * Matches the brutalist design from letter-card-v3 and seal-confirmation-v3
 */
export function SettingsCardV3({
  icon,
  title,
  description,
  badgeBg = "bg-duck-yellow",
  badgeText = "text-charcoal",
  children,
  actions,
  className,
}: SettingsCardV3Props) {
  return (
    <div
      className={cn(
        "relative border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Floating Badge */}
      <div
        className={cn(
          "absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
          badgeBg,
          badgeText
        )}
        style={{ borderRadius: "2px" }}
      >
        {icon}
        <span>{title}</span>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-5">
        {description && (
          <p className="font-mono text-xs text-charcoal/60">{description}</p>
        )}
        {children}
      </div>

      {/* Optional Actions */}
      {actions && (
        <>
          <div className="my-5 w-full border-t-2 border-dashed border-charcoal/10" />
          <div className="flex justify-end">{actions}</div>
        </>
      )}
    </div>
  )
}

/**
 * Skeleton loader for SettingsCardV3
 */
export function SettingsCardV3Skeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative border-2 border-charcoal bg-white p-6 animate-pulse",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Badge skeleton */}
      <div
        className="absolute -top-3 left-6 h-5 w-24 bg-charcoal/20"
        style={{ borderRadius: "2px" }}
      />

      {/* Content skeleton */}
      <div className="mt-4 space-y-4">
        <div className="h-4 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
        <div className="h-4 w-1/2 bg-charcoal/10" style={{ borderRadius: "2px" }} />
        <div className="h-10 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
      </div>
    </div>
  )
}

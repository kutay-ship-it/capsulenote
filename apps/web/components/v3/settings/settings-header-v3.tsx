interface SettingsHeaderV3Props {
  title: string
  description?: string
}

/**
 * V3 Settings Page Header
 * Matches the header pattern from journey and letters
 */
export function SettingsHeaderV3({ title, description }: SettingsHeaderV3Props) {
  return (
    <header className="space-y-2">
      <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="font-mono text-sm text-charcoal/70">{description}</p>
      )}
    </header>
  )
}

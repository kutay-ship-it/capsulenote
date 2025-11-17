export function calculatePresetDate(preset: '6m' | '1y' | '3y' | '5y'): Date {
  const now = new Date()
  const multipliers = { '6m': 0.5, '1y': 1, '3y': 3, '5y': 5 }
  const years = multipliers[preset]

  const futureDate = new Date(now)
  futureDate.setFullYear(futureDate.getFullYear() + years)

  return futureDate
}

export function formatDate(date: Date | null): string {
  if (!date) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

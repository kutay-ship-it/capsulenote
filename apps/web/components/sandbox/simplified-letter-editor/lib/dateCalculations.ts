export function calculatePresetDate(preset: '6m' | '1y' | '3y' | '5y'): Date {
  const now = new Date()
  // Use UTC components to avoid timezone/DST drift while preserving wall-clock time
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const day = now.getUTCDate()
  const hours = now.getUTCHours()
  const minutes = now.getUTCMinutes()
  const seconds = now.getUTCSeconds()
  const ms = now.getUTCMilliseconds()

  let targetYear = year
  let targetMonth = month

  switch (preset) {
    case '6m':
      targetMonth += 6
      break
    case '1y':
      targetYear += 1
      break
    case '3y':
      targetYear += 3
      break
    case '5y':
      targetYear += 5
      break
  }

  // Handle month overflow
  while (targetMonth > 11) {
    targetMonth -= 12
    targetYear += 1
  }

  // Clamp day to end of target month to handle shorter months/leap-year rollovers
  const endOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const safeDay = Math.min(day, endOfTargetMonth)

  return new Date(Date.UTC(targetYear, targetMonth, safeDay, hours, minutes, seconds, ms))
}

export function formatDate(date: Date | null): string {
  if (!date) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // keep consistent regardless of local TZ
  }).format(date)
}

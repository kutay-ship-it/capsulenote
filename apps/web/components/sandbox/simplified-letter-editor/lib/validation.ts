import type { LetterData } from '../types'

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateLetterData(data: Partial<LetterData>): {
  success: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!data.content || data.content.trim() === '' || data.content === '<p></p>') {
    errors.content = 'Please write your letter'
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email required'
  }

  if (!data.arriveInDate) {
    errors.arriveInDate = 'Please select a delivery date'
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Unit Tests for Date Utilities
 *
 * Tests date calculation and formatting functions used throughout the app.
 * Critical for letter scheduling and delivery date calculations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculatePresetDate, formatDate } from '../../components/sandbox/simplified-letter-editor/lib/dateCalculations'

describe('Date Utilities', () => {
  describe('calculatePresetDate', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15 for consistent testing
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate 6 months preset correctly', () => {
      const result = calculatePresetDate('6m')

      const expected = new Date('2024-07-15T12:00:00Z')
      expect(result.getTime()).toBe(expected.getTime())
    })

    it('should calculate 1 year preset correctly', () => {
      const result = calculatePresetDate('1y')

      const expected = new Date('2025-01-15T12:00:00Z')
      expect(result.getTime()).toBe(expected.getTime())
    })

    it('should calculate 3 years preset correctly', () => {
      const result = calculatePresetDate('3y')

      const expected = new Date('2027-01-15T12:00:00Z')
      expect(result.getTime()).toBe(expected.getTime())
    })

    it('should calculate 5 years preset correctly', () => {
      const result = calculatePresetDate('5y')

      const expected = new Date('2029-01-15T12:00:00Z')
      expect(result.getTime()).toBe(expected.getTime())
    })

    it('should handle leap year calculations', () => {
      // Set current date to Feb 29, 2024 (leap year)
      vi.setSystemTime(new Date('2024-02-29T12:00:00Z'))

      const result = calculatePresetDate('1y')

      // Feb 29, 2024 + 1 year = Feb 28, 2025 (not a leap year)
      // Note: JavaScript Date handles this automatically
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(1) // February (0-indexed)
    })

    it('should return future dates only', () => {
      const now = new Date()
      const sixMonthsFuture = calculatePresetDate('6m')
      const oneYearFuture = calculatePresetDate('1y')
      const threeYearsFuture = calculatePresetDate('3y')
      const fiveYearsFuture = calculatePresetDate('5y')

      expect(sixMonthsFuture.getTime()).toBeGreaterThan(now.getTime())
      expect(oneYearFuture.getTime()).toBeGreaterThan(now.getTime())
      expect(threeYearsFuture.getTime()).toBeGreaterThan(now.getTime())
      expect(fiveYearsFuture.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should preserve time component when calculating future dates', () => {
      vi.setSystemTime(new Date('2024-01-15T15:30:45.123Z'))

      const result = calculatePresetDate('1y')

      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
      expect(result.getMilliseconds()).toBe(123)
    })
  })

  describe('formatDate', () => {
    it('should format date in long format', () => {
      const date = new Date('2024-01-15T12:00:00Z')

      const result = formatDate(date)

      expect(result).toBe('January 15, 2024')
    })

    it('should format date consistently regardless of time', () => {
      const date1 = new Date('2024-12-25T00:00:00Z')
      const date2 = new Date('2024-12-25T23:59:59Z')

      const result1 = formatDate(date1)
      const result2 = formatDate(date2)

      expect(result1).toContain('December 25, 2024')
      expect(result2).toContain('December 25, 2024')
    })

    it('should return empty string for null date', () => {
      const result = formatDate(null)

      expect(result).toBe('')
    })

    it('should format year boundaries correctly', () => {
      const newYear = new Date('2025-01-01T00:00:00Z')
      const newYearEve = new Date('2024-12-31T23:59:59Z')

      const resultNewYear = formatDate(newYear)
      const resultNewYearEve = formatDate(newYearEve)

      expect(resultNewYear).toContain('January 1, 2025')
      expect(resultNewYearEve).toContain('December 31, 2024')
    })

    it('should handle leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z')

      const result = formatDate(leapDay)

      expect(result).toBe('February 29, 2024')
    })

    it('should format different months correctly', () => {
      const jan = formatDate(new Date('2024-01-15'))
      const jul = formatDate(new Date('2024-07-15'))
      const dec = formatDate(new Date('2024-12-15'))

      expect(jan).toBe('January 15, 2024')
      expect(jul).toBe('July 15, 2024')
      expect(dec).toBe('December 15, 2024')
    })
  })
})

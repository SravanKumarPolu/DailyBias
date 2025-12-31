import { describe, it, expect } from 'vitest'
import { getCategoryColor, getCategoryColorHex, getCategoryLabel } from '@/lib/category-utils'
import type { BiasCategory } from '@/lib/types'

describe('category-utils', () => {
  const categories: BiasCategory[] = ['decision', 'memory', 'social', 'perception', 'misc']

  describe('getCategoryColor', () => {
    it('should return color classes for all categories', () => {
      categories.forEach((category) => {
        const color = getCategoryColor(category)
        expect(color).toBeTruthy()
        expect(typeof color).toBe('string')
        expect(color).toContain('bg-category-')
      })
    })

    it('should return different colors for different categories', () => {
      const colors = categories.map((cat) => getCategoryColor(cat))
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(categories.length)
    })
  })

  describe('getCategoryColorHex', () => {
    it('should return hex color values for all categories', () => {
      categories.forEach((category) => {
        const color = getCategoryColorHex(category)
        expect(color).toBeTruthy()
        expect(typeof color).toBe('string')
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('should return different hex colors for different categories', () => {
      const colors = categories.map((cat) => getCategoryColorHex(cat))
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(categories.length)
    })

    it('should return valid hex colors', () => {
      expect(getCategoryColorHex('decision')).toBe('#3b82f6')
      expect(getCategoryColorHex('memory')).toBe('#8b5cf6')
      expect(getCategoryColorHex('social')).toBe('#ec4899')
      expect(getCategoryColorHex('perception')).toBe('#f59e0b')
      expect(getCategoryColorHex('misc')).toBe('#6b7280')
    })
  })

  describe('getCategoryLabel', () => {
    it('should return labels for all categories', () => {
      categories.forEach((category) => {
        const label = getCategoryLabel(category)
        expect(label).toBeTruthy()
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      })
    })

    it('should return human-readable labels', () => {
      expect(getCategoryLabel('decision')).toBe('Decision Making')
      expect(getCategoryLabel('memory')).toBe('Memory')
      expect(getCategoryLabel('social')).toBe('Social')
      expect(getCategoryLabel('perception')).toBe('Perception')
      expect(getCategoryLabel('misc')).toBe('Miscellaneous')
    })
  })
})


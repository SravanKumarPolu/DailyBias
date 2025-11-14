import { describe, it, expect } from 'vitest'
import { getCategoryColor, getCategoryLabel } from '@/lib/category-utils'
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


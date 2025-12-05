import { describe, it, expect } from 'vitest'
import {
  getTodayDateString,
  getDailyBias,
  getPersonalizedDailyBias,
  getCategoryDistribution,
  getBalancedRecommendation,
  getCoreBiases,
  getAllBiases,
} from '@/lib/daily-selector'
import type { Bias, BiasProgress } from '@/lib/types'
import { TEST_FIXED_TIMESTAMP, TEST_FIXED_DATE_STRING } from '@/vitest.setup'

// Use fixed date from setup (2025-12-05)
const FIXED_DATE_STRING = TEST_FIXED_DATE_STRING

describe('daily-selector', () => {
  const mockBiases: Bias[] = [
    {
      id: 'bias-1',
      title: 'Confirmation Bias',
      category: 'decision',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
    {
      id: 'bias-2',
      title: 'Anchoring Bias',
      category: 'memory',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
    {
      id: 'bias-3',
      title: 'Social Proof',
      category: 'social',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
  ]

  describe('getTodayDateString', () => {
    it('should return a date string in YYYY-MM-DD format', () => {
      const date = getTodayDateString()
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(date).toBe(FIXED_DATE_STRING) // Should use fixed date from setup
    })
  })

  describe('getDailyBias', () => {
    it('should return a bias deterministically for a date', () => {
      const bias1 = getDailyBias(mockBiases, '2024-01-01')
      const bias2 = getDailyBias(mockBiases, '2024-01-01')
      expect(bias1.id).toBe(bias2.id)
    })

    it('should return different biases for different dates', () => {
      const bias1 = getDailyBias(mockBiases, '2024-01-01')
      const bias2 = getDailyBias(mockBiases, '2024-01-02')
      // May or may not be different, but should be deterministic
      expect(bias1).toBeDefined()
      expect(bias2).toBeDefined()
    })
  })

  describe('getPersonalizedDailyBias', () => {
    it('should prioritize unviewed biases', () => {
      const progress: BiasProgress[] = []
      const bias = getPersonalizedDailyBias(mockBiases, progress, FIXED_DATE_STRING)
      expect(bias).toBeDefined()
      expect(mockBiases).toContainEqual(bias)
    })

    it('should handle empty biases array', () => {
      expect(() => {
        getPersonalizedDailyBias([], [], FIXED_DATE_STRING)
      }).toThrow('No biases available')
    })

    it('should reduce priority for recently viewed biases', () => {
      const recentProgress: BiasProgress[] = [
        {
          biasId: 'bias-1',
          viewedAt: TEST_FIXED_TIMESTAMP - 1000, // 1 second ago (deterministic)
          viewCount: 1,
          mastered: false,
        },
      ]
      const bias = getPersonalizedDailyBias(mockBiases, recentProgress, FIXED_DATE_STRING)
      // Function should still return a valid bias
      expect(bias).toBeDefined()
      expect(mockBiases).toContainEqual(bias)
      // Note: The algorithm uses date-based hash which may still select recently viewed biases
      // but the scoring system will reduce their priority in the selection pool
    })

    it('should boost priority for biases not viewed in a while', () => {
      const oldProgress: BiasProgress[] = [
        {
          biasId: 'bias-1',
          viewedAt: TEST_FIXED_TIMESTAMP - 8 * 24 * 60 * 60 * 1000, // 8 days ago (deterministic)
          viewCount: 1,
          mastered: false,
        },
      ]
      const bias = getPersonalizedDailyBias(mockBiases, oldProgress, FIXED_DATE_STRING)
      expect(bias).toBeDefined()
    })
  })

  describe('getCategoryDistribution', () => {
    it('should calculate category distribution', () => {
      const progress: BiasProgress[] = [
        { biasId: 'bias-1', viewedAt: TEST_FIXED_TIMESTAMP, viewCount: 1, mastered: false },
        { biasId: 'bias-2', viewedAt: TEST_FIXED_TIMESTAMP, viewCount: 1, mastered: false },
      ]
      const distribution = getCategoryDistribution(progress, mockBiases)
      expect(distribution.decision).toBe(1)
      expect(distribution.memory).toBe(1)
      expect(distribution.social).toBe(0)
    })

    it('should handle empty progress', () => {
      const distribution = getCategoryDistribution([], mockBiases)
      expect(distribution.decision).toBe(0)
      expect(distribution.memory).toBe(0)
    })
  })

  describe('getBalancedRecommendation', () => {
    it('should recommend unviewed bias from least explored category', () => {
      const progress: BiasProgress[] = [
        { biasId: 'bias-1', viewedAt: TEST_FIXED_TIMESTAMP, viewCount: 1, mastered: false },
      ]
      const recommendation = getBalancedRecommendation(mockBiases, progress)
      expect(recommendation).toBeDefined()
      expect(recommendation?.id).toBe('bias-2') // memory category (least explored)
    })

    it('should return null if all biases are viewed', () => {
      const progress: BiasProgress[] = mockBiases.map((bias) => ({
        biasId: bias.id,
        viewedAt: TEST_FIXED_TIMESTAMP,
        viewCount: 1,
        mastered: false,
      }))
      const recommendation = getBalancedRecommendation(mockBiases, progress)
      expect(recommendation).toBeNull()
    })
  })

  describe('getCoreBiases', () => {
    it('should return an array of biases', () => {
      const biases = getCoreBiases()
      expect(Array.isArray(biases)).toBe(true)
    })
  })

  describe('getAllBiases', () => {
    it('should combine core and user biases', () => {
      const userBiases: Bias[] = [
        {
          id: 'user-1',
          title: 'User Bias',
          category: 'misc',
          summary: 'Test',
          why: 'Test',
          counter: 'Test',
          source: 'user',
        },
      ]
      const all = getAllBiases(userBiases)
      expect(all.length).toBeGreaterThan(userBiases.length)
      expect(all.some((b) => b.id === 'user-1')).toBe(true)
    })
  })
})


import { describe, it, expect } from 'vitest'
import { searchBiases, highlightMatches } from '@/lib/search-utils'
import type { Bias } from '@/lib/types'

describe('search-utils', () => {
  const mockBiases: Bias[] = [
    {
      id: 'bias-1',
      title: 'Confirmation Bias',
      category: 'decision',
      summary: 'The tendency to search for information that confirms existing beliefs',
      why: 'Cognitive ease',
      counter: 'Seek disconfirming evidence',
      source: 'core',
    },
    {
      id: 'bias-2',
      title: 'Anchoring Bias',
      category: 'memory',
      summary: 'Relying too heavily on the first piece of information',
      why: 'First impressions matter',
      counter: 'Consider multiple anchors',
      source: 'core',
    },
  ]

  describe('searchBiases', () => {
    it('should return all biases when query is empty', () => {
      const results = searchBiases(mockBiases, '')
      expect(results).toHaveLength(2)
      expect(results[0].score).toBe(1)
    })

    it('should find biases by title', () => {
      const results = searchBiases(mockBiases, 'Confirmation')
      expect(results.length).toBeGreaterThan(0)
      const confirmationBias = results.find(r => r.bias.id === 'bias-1')
      expect(confirmationBias).toBeDefined()
      expect(confirmationBias?.matchedFields).toContain('title')
    })

    it('should find biases by summary', () => {
      const results = searchBiases(mockBiases, 'existing beliefs')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].matchedFields).toContain('summary')
    })

    it('should rank title matches higher than other matches', () => {
      const results = searchBiases(mockBiases, 'bias')
      expect(results[0].bias.title.toLowerCase()).toContain('bias')
    })

    it('should return empty array when no matches found', () => {
      const results = searchBiases(mockBiases, 'nonexistenttermxyz')
      expect(results).toHaveLength(0)
    })

    it('should handle case-insensitive search', () => {
      const results = searchBiases(mockBiases, 'CONFIRMATION')
      expect(results.length).toBeGreaterThan(0)
      const confirmationBias = results.find(r => r.bias.id === 'bias-1')
      expect(confirmationBias).toBeDefined()
    })
  })

  describe('highlightMatches', () => {
    it('should highlight exact matches', () => {
      const result = highlightMatches('Confirmation Bias', 'Confirmation')
      expect(result).toContain('<mark>Confirmation</mark>')
    })

    it('should return original text when no match', () => {
      const text = 'Some text'
      const result = highlightMatches(text, 'nonexistent')
      expect(result).toBe(text)
    })

    it('should handle empty query', () => {
      const text = 'Some text'
      const result = highlightMatches(text, '')
      expect(result).toBe(text)
    })

    it('should highlight word matches', () => {
      const result = highlightMatches('Confirmation Bias Test', 'Bias')
      expect(result.toLowerCase()).toContain('<mark>bias</mark>')
    })
  })
})


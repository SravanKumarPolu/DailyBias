import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLocalFlag,
  setLocalFlag,
  getLocalString,
  setLocalString,
  getCachedDailyBias,
  cacheDailyBias,
} from '@/lib/storage'

// Mock localStorage properly
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

describe('localStorage helpers', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorage.clear()
  })

  describe('getLocalFlag', () => {
    it('should return default value when key does not exist', () => {
      expect(getLocalFlag('non-existent', false)).toBe(false)
      expect(getLocalFlag('non-existent', true)).toBe(true)
    })

    it('should return stored boolean value', () => {
      localStorage.setItem('test-flag', 'true')
      expect(getLocalFlag('test-flag', false)).toBe(true)

      localStorage.setItem('test-flag', 'false')
      expect(getLocalFlag('test-flag', true)).toBe(false)
    })
  })

  describe('setLocalFlag', () => {
    it('should store boolean value as JSON', () => {
      setLocalFlag('test-flag', true)
      expect(localStorage.getItem('test-flag')).toBe('true')

      setLocalFlag('test-flag', false)
      expect(localStorage.getItem('test-flag')).toBe('false')
    })
  })

  describe('getLocalString', () => {
    it('should return default value when key does not exist', () => {
      expect(getLocalString('non-existent', 'default')).toBe('default')
      expect(getLocalString('non-existent')).toBe('')
    })

    it('should return stored string value', () => {
      localStorage.setItem('test-string', 'stored-value')
      expect(getLocalString('test-string', 'default')).toBe('stored-value')
    })
  })

  describe('setLocalString', () => {
    it('should store string value', () => {
      setLocalString('test-string', 'value')
      expect(localStorage.getItem('test-string')).toBe('value')
    })
  })

  describe('daily bias cache', () => {
    it('should cache and retrieve daily bias', () => {
      const date = '2024-01-01'
      const biasId = 'bias-123'

      cacheDailyBias(date, biasId)
      expect(getCachedDailyBias(date)).toBe(biasId)
    })

    it('should return null for different date', () => {
      cacheDailyBias('2024-01-01', 'bias-123')
      expect(getCachedDailyBias('2024-01-02')).toBeNull()
    })

    it('should return null when cache is empty', () => {
      expect(getCachedDailyBias('2024-01-01')).toBeNull()
    })

    it('should handle invalid cache data gracefully', () => {
      localStorage.setItem('daily-bias-cache', 'invalid-json')
      expect(getCachedDailyBias('2024-01-01')).toBeNull()
    })
  })
})


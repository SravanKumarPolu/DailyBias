// Import fake-indexeddb FIRST before any other imports that might use indexedDB
import 'fake-indexeddb/auto'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Deterministic time setup - freeze time to fixed date
// 2025-12-05T08:00:00+05:30 (Asia/Kolkata)
const FIXED_DATE_STRING = '2025-12-05T08:00:00+05:30'
const FIXED_DATE = new Date(FIXED_DATE_STRING)
const FIXED_TIMESTAMP = FIXED_DATE.getTime()
const FIXED_DATE_STRING_ISO = '2025-12-05' // Date string format used in the app

// Mock timezone-utils to return consistent date
vi.mock('@/lib/timezone-utils', async () => {
  const actual = await vi.importActual('@/lib/timezone-utils')
  return {
    ...actual,
    getLocalDateString: vi.fn(() => FIXED_DATE_STRING_ISO),
    detectTimezone: vi.fn(() => ({
      timezone: 'Asia/Kolkata',
      offset: '+05:30',
      region: 'Asia',
      city: 'Kolkata',
    })),
  }
})

beforeEach(() => {
  // Use real timers for integration tests to allow async operations
  // Date is already mocked via timezone-utils mock for date strings
  vi.useRealTimers()
  
  // Mock Date.now() to return fixed timestamp for deterministic testing
  // Note: vi.setSystemTime() only works with fake timers, so we mock Date.now() directly
  vi.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP)
  
  // Clear localStorage
  localStorage.clear()
  
  // Clear test biases (will be set by test utilities)
  // @ts-ignore - global variable for test mocking
  globalThis.__TEST_BIASES__ = undefined
  
  // Reset pathname to default
  // @ts-ignore - global variable for test mocking
  globalThis.__TEST_PATHNAME__ = '/'
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Global variables for test mocking
declare global {
  var __TEST_BIASES__: any[] | undefined
  var __TEST_PATHNAME__: string | undefined
}

// Mock getCoreBiases to use test biases if available
vi.mock('@/lib/daily-selector', async () => {
  const actual = await vi.importActual('@/lib/daily-selector')
  return {
    ...actual,
    getCoreBiases: () => {
      // Use test biases if set, otherwise use actual core biases
      if (globalThis.__TEST_BIASES__ && globalThis.__TEST_BIASES__.length > 0) {
        return globalThis.__TEST_BIASES__
      }
      return (actual as any).getCoreBiases()
    },
    getAllBiases: (userBiases: any[] = []) => {
      const coreBiases = globalThis.__TEST_BIASES__ && globalThis.__TEST_BIASES__.length > 0
        ? globalThis.__TEST_BIASES__
        : (actual as any).getCoreBiases()
      return [...coreBiases, ...userBiases]
    },
  }
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    pathname: globalThis.__TEST_PATHNAME__ || '/',
    query: {},
    asPath: globalThis.__TEST_PATHNAME__ || '/',
  }),
  usePathname: () => globalThis.__TEST_PATHNAME__ || '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const React = require('react')
    return React.createElement('img', props)
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage with proper implementation
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
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// IndexedDB is mocked via fake-indexeddb/auto import above

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock SpeechSynthesis with addEventListener
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as any

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(public text?: string) {}
} as any

// Note: window.location is read-only in vmThreads, so we skip mocking it
// Tests should work fine without location.reload mock

// Export constants for use in tests
export const TEST_FIXED_DATE = FIXED_DATE
export const TEST_FIXED_TIMESTAMP = FIXED_TIMESTAMP
export const TEST_FIXED_DATE_STRING = FIXED_DATE_STRING_ISO

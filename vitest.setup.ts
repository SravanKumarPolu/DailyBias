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
  // Use fake timers with fixed time
  vi.useFakeTimers({
    now: FIXED_TIMESTAMP,
    shouldAdvanceTime: false,
  })
  
  // Clear localStorage
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
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

// Mock IndexedDB
global.indexedDB = {
  open: vi.fn(),
} as any

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

// Mock SpeechSynthesis
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
} as any

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(public text?: string) {}
} as any

// Mock window.location
delete (window as any).location
window.location = {
  ...window.location,
  reload: vi.fn(),
  href: 'http://localhost:3000',
} as any

// Export constants for use in tests
export const TEST_FIXED_DATE = FIXED_DATE
export const TEST_FIXED_TIMESTAMP = FIXED_TIMESTAMP
export const TEST_FIXED_DATE_STRING = FIXED_DATE_STRING_ISO

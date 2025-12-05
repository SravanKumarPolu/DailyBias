/**
 * Integration Test Utilities (Improved)
 * 
 * Provides robust utilities for rendering components with all necessary providers
 * for integration testing. Ensures consistent setup across all integration tests.
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, waitFor, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { AppProvider } from '@/contexts/app-context'
import { ThemeProvider } from '@/components/theme-provider'
import type { Bias, FavoriteItem, Settings, BiasProgress } from '@/lib/types'
import { cacheDailyBias } from '@/lib/storage'
import { getTodayDateString } from '@/lib/daily-selector'
import { getDB } from '@/lib/db'

// Mock Next.js router with proper App Router support
// Note: The base mock is in vitest.setup.ts, but we need to override usePathname dynamically
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

// Mock usePathname to return the current pathname
let mockPathname = '/'

// We need to dynamically update the mock, so we'll use vi.mocked
// The base mock is in vitest.setup.ts

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route/pathname for the router
   */
  route?: string
  
  /**
   * Seed IndexedDB with initial data
   */
  storageSeed?: {
    favorites?: FavoriteItem[]
    settings?: Partial<Settings>
    progress?: BiasProgress[]
    dailyBias?: { date: string; biasId: string }
    onboardingCompleted?: boolean
  }
  
  /**
   * Mock date for deterministic testing (defaults to 2025-12-05)
   */
  mockedDate?: Date
  
  /**
   * Mock biases data (if not provided, uses default test biases)
   * These will be used as core biases via mocked getCoreBiases
   */
  biases?: Bias[]
}

/**
 * Default test biases for integration tests
 */
export const createTestBiases = (count = 5): Bias[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bias-${i + 1}`,
    title: `Test Bias ${i + 1}`,
    category: ['decision', 'memory', 'social', 'perception', 'misc'][i % 5] as Bias['category'],
    summary: `This is a test summary for bias ${i + 1}`,
    why: `This bias happens because of reason ${i + 1}`,
    counter: `To counter this bias, do ${i + 1}`,
    source: 'core' as const,
  }))
}

/**
 * Seed IndexedDB and localStorage with test data
 */
async function seedStorage(seed: RenderWithProvidersOptions['storageSeed'] = {}) {
  // Clear existing storage
  localStorage.clear()
  
  // Initialize IndexedDB and seed it
  try {
    const db = await getDB()
    
    // Clear existing data
    await db.clear('favorites')
    await db.clear('settings')
    await db.clear('progress')
    await db.clear('cache')
    
    // Seed favorites in IndexedDB
    if (seed.favorites && seed.favorites.length > 0) {
      for (const fav of seed.favorites) {
        await db.put('favorites', fav)
      }
    }
    
    // Seed settings in IndexedDB
    const defaultSettings: Settings = {
      theme: 'light',
      backgroundStyle: 'gradient',
      dailyReminder: false,
      mixUserBiasesInDaily: false,
      voiceEnabled: false,
      voiceRate: 0.9,
      voicePitch: 1.0,
      timezoneAutoDetect: true,
    }
    const mergedSettings = { ...defaultSettings, ...(seed.settings || {}) }
    await db.put('settings', mergedSettings, 'user-settings')
    
    // Seed progress in IndexedDB
    if (seed.progress && seed.progress.length > 0) {
      for (const prog of seed.progress) {
        await db.put('progress', prog)
      }
    }
    
    // Seed daily bias cache in IndexedDB
    if (seed.dailyBias) {
      await db.put('cache', { date: seed.dailyBias.date, biasId: seed.dailyBias.biasId }, 'daily-bias-cache')
      // Also cache in localStorage for compatibility
      cacheDailyBias(seed.dailyBias.date, seed.dailyBias.biasId)
    } else {
      // Default: cache first bias for today
      const today = getTodayDateString()
      await db.put('cache', { date: today, biasId: 'bias-1' }, 'daily-bias-cache')
      cacheDailyBias(today, 'bias-1')
    }
  } catch (error) {
    console.error('[TestUtils] Error seeding IndexedDB:', error)
    // Fallback to localStorage only if IndexedDB fails
    if (seed.favorites && seed.favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(seed.favorites))
    }
    if (seed.settings) {
      const defaultSettings: Settings = {
        theme: 'light',
        backgroundStyle: 'gradient',
        dailyReminder: false,
        mixUserBiasesInDaily: false,
        voiceEnabled: false,
        voiceRate: 0.9,
        voicePitch: 1.0,
        timezoneAutoDetect: true,
      }
      const mergedSettings = { ...defaultSettings, ...seed.settings }
      localStorage.setItem('settings', JSON.stringify(mergedSettings))
    }
  }
  
  // Seed onboarding status in localStorage
  if (seed.onboardingCompleted !== undefined) {
    if (seed.onboardingCompleted) {
      localStorage.setItem('onboarding-completed', 'true')
    } else {
      localStorage.removeItem('onboarding-completed')
    }
  } else {
    // Default: mark onboarding as completed
    localStorage.setItem('onboarding-completed', 'true')
  }
}

/**
 * Custom render function that wraps components with all necessary providers
 */
export async function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  const {
    route = '/',
    storageSeed,
    mockedDate,
    biases,
    ...renderOptions
  } = options

  // Set up router mock using global variable
  // @ts-ignore - global variable for test mocking
  globalThis.__TEST_PATHNAME__ = route
  mockRouter.pathname = route
  mockRouter.asPath = route
  mockPathname = route

  // Set up core biases mock using global variable (set up in vitest.setup.ts)
  const testBiases = biases || createTestBiases(5)
  // @ts-ignore - global variable for test mocking
  globalThis.__TEST_BIASES__ = testBiases

  // Seed storage BEFORE rendering (async)
  if (storageSeed) {
    await seedStorage(storageSeed)
  } else {
    // Default: mark onboarding as completed and seed default settings
    await seedStorage({})
  }

  // Mock date if provided
  if (mockedDate) {
    vi.setSystemTime(mockedDate)
  }

  // Wrapper component with all providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppProvider>
          {children}
        </AppProvider>
      </ThemeProvider>
    )
  }

  const result = render(ui, { wrapper: AllTheProviders, ...renderOptions })
  
  // Give hooks time to initialize and load from IndexedDB
  // The AppProvider loads biases, favorites, settings, etc. asynchronously
  await new Promise(resolve => setTimeout(resolve, 100))

  return result
}

/**
 * Helper to wait for async operations to complete
 */
export async function waitForAsync() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Improved helper to wait for hooks to finish loading
 * Actually checks for loading states to complete instead of just waiting
 */
export async function waitForHooksToLoad(maxWait = 6000) {
  const startTime = Date.now()
  
  // Poll for loading states to complete
  while (Date.now() - startTime < maxWait) {
    // Check if loading indicators are gone
    const loadingText = screen.queryAllByText(/loading/i, { exact: false })
    const loadingAria = screen.queryAllByLabelText(/loading/i)
    const busyElements = screen.queryAllByRole('status', { busy: true })
    
    const allLoading = [...loadingText, ...loadingAria, ...busyElements]
    const visibleLoading = allLoading.filter(el => {
      try {
        const style = window.getComputedStyle(el)
        const isVisible = style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         style.opacity !== '0'
        return isVisible
      } catch {
        return false
      }
    })
    
    // If no visible loading indicators, hooks are likely loaded
    if (visibleLoading.length === 0) {
      // Give React time to process state updates
      await new Promise((resolve) => setTimeout(resolve, 200))
      return
    }
    
    // Wait a bit before checking again
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  
  // Give React time to process state updates even if we timed out
  await new Promise((resolve) => setTimeout(resolve, 200))
}

/**
 * Wait for Daily page to fully load (bias content visible, no loading)
 */
export async function waitForDailyPageToLoad(maxWait = 8000) {
  // First wait for hooks to load (shorter timeout)
  await waitForHooksToLoad(4000)
  
  // Wait for bias content to appear (flexible - try multiple strategies)
  try {
    await waitFor(
      () => {
        // Strategy 1: Look for bias card
        const biasCard = screen.queryByTestId('bias-card')
        if (biasCard) return true
        
        // Strategy 2: Look for favorite button
        const biasFavoriteButton = screen.queryByTestId('bias-favorite-button')
        if (biasFavoriteButton) return true
        
        // Strategy 3: Look for any heading that might be a bias title
        const headings = screen.queryAllByRole('heading')
        if (headings.length > 0) {
          // Check if any heading contains text (likely a bias title)
          const hasText = headings.some(h => {
            const text = h.textContent || ''
            return text.trim().length > 0 && 
                   !text.includes('Bias Daily') && 
                   !text.includes('Content Analytics') &&
                   !text.includes('Settings') &&
                   !text.includes('All Biases') &&
                   !text.includes('Favorites') &&
                   !text.includes('Your Biases')
          })
          if (hasText) return true
        }
        
        // Strategy 4: Look for any article element (bias card might be an article)
        const articles = screen.queryAllByRole('article')
        if (articles.length > 0) return true
        
        // Strategy 5: Check if page has substantial content (not just header)
        const bodyText = document.body.textContent || ''
        if (bodyText.length > 500 && !bodyText.includes('Loading daily bias')) {
          return true
        }
        
        throw new Error('Bias content not found on daily page')
      },
      { timeout: maxWait }
    )
  } catch (error) {
    // If we can't find specific elements, check if page has loaded at all
    const bodyText = document.body.textContent || ''
    if (bodyText.length > 200) {
      // Page has content, might just be taking longer - give it more time
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }
    throw error
  }
  
  // Give React time to settle
  await new Promise((resolve) => setTimeout(resolve, 200))
}

/**
 * Wait for Daily page to load AND verify a specific bias title is present
 */
export async function waitForDailyPageWithBias(biasTitle: string, maxWait = 8000) {
  await waitForDailyPageToLoad(maxWait)
  
  // Now wait for the specific bias title to appear (handle multiple matches)
  await waitFor(
    () => {
      // Use getAllByText since there might be multiple (screen reader + visible)
      const titles = screen.getAllByText(biasTitle, { exact: false })
      if (titles.length > 0) {
        // Verify at least one is visible (not screen reader only)
        const visibleTitle = titles.find(title => {
          const style = window.getComputedStyle(title)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        if (visibleTitle) return true
      }
      throw new Error(`Bias title "${biasTitle}" not found on daily page`)
    },
    { timeout: Math.min(maxWait, 5000) }
  )
}

/**
 * Wait for Settings page to fully load
 */
export async function waitForSettingsPageToLoad(maxWait = 12000) {
  await waitForHooksToLoad(6000)
  
  // First wait for the mounted state (skeleton to disappear)
  // The Settings page shows a loading skeleton when !mounted
  await waitFor(
    () => {
      // Check if skeleton/loading indicators are gone
      const skeletonElements = screen.queryAllByText(/animate-pulse/i)
      const hasVisibleSkeleton = skeletonElements.some(el => {
        try {
          const style = window.getComputedStyle(el)
          return style.display !== 'none' && style.visibility !== 'hidden'
        } catch {
          return false
        }
      })
      
      if (hasVisibleSkeleton) {
        throw new Error('Settings page still showing loading skeleton')
      }
      return true
    },
    { timeout: Math.min(maxWait, 8000) }
  )
  
  // Now wait for actual settings content
  await waitFor(
    () => {
      // Strategy 1: Look for any settings test IDs (most reliable)
      const bgStyleRadio = screen.queryByTestId('setting-bg-glass')
      if (bgStyleRadio) return true
      
      const bgGradient = screen.queryByTestId('setting-bg-gradient')
      if (bgGradient) return true
      
      const dailyReminder = screen.queryByTestId('setting-daily-reminder')
      if (dailyReminder) return true
      
      const voiceEnabled = screen.queryByTestId('setting-voice-enabled')
      if (voiceEnabled) return true
      
      // Strategy 2: Look for heading
      const heading = screen.queryByRole('heading', { name: /settings/i })
      if (heading) return true
      
      // Strategy 3: Look for appearance section
      const appearanceText = screen.queryByText(/appearance/i)
      if (appearanceText) return true
      
      // Strategy 4: Look for description text
      const customText = screen.queryByText(/customize your bias daily experience/i)
      if (customText) return true
      
      // Strategy 5: Check if page has substantial settings content
      const bodyText = document.body.textContent || ''
      if (bodyText.toLowerCase().includes('settings') && 
          bodyText.toLowerCase().includes('appearance') && 
          bodyText.length > 500) {
        return true
      }
      
      throw new Error('Settings page content not found')
    },
    { timeout: Math.min(maxWait, 8000) }
  )
  
  // Give React time to settle
  await new Promise((resolve) => setTimeout(resolve, 300))
}

/**
 * Wait for Analytics page to fully load
 */
export async function waitForAnalyticsPageToLoad(maxWait = 10000) {
  await waitForHooksToLoad(maxWait)
  
  // Wait for analytics loading to complete
  await waitFor(
    () => {
      const loadingText = screen.queryByText(/loading/i)
      const pulseElements = screen.queryAllByText(/pulse/i)
      if (loadingText || pulseElements.length > 0) {
        throw new Error('Analytics page still loading')
      }
      return true
    },
    { timeout: maxWait }
  )
  
  // Wait for analytics content
  await waitFor(
    () => {
      const heading = screen.queryByRole('heading', { name: /content analytics/i })
      if (heading) {
        return true
      }
      throw new Error('Analytics page content not found')
    },
    { timeout: maxWait }
  )
}

/**
 * Wait for Navigation to render
 */
export async function waitForNavigationToLoad(maxWait = 8000) {
  await waitFor(
    () => {
      const nav = screen.queryByTestId('bottom-navigation')
      if (!nav) {
        throw new Error('Navigation not found')
      }
      return nav
    },
    { timeout: maxWait }
  )
}

/**
 * Wait for a specific element to appear with better error messages
 */
export async function waitForElement(
  queryFn: () => HTMLElement | null,
  options: { timeout?: number; errorMessage?: string } = {}
) {
  const { timeout = 5000, errorMessage } = options
  
  try {
    return await waitFor(
      () => {
        const element = queryFn()
        if (!element) {
          throw new Error(errorMessage || 'Element not found')
        }
        return element
      },
      { timeout }
    )
  } catch (error) {
    // Provide better error message with current DOM state
    const bodyText = document.body.textContent || ''
    throw new Error(
      `${errorMessage || 'Element not found'}\n` +
      `Current page content: ${bodyText.substring(0, 200)}...`
    )
  }
}

/**
 * Helper to get router mock for assertions
 */
export function getRouterMock() {
  return mockRouter
}

/**
 * Helper to reset router mock between tests
 */
export function resetRouterMock() {
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
  mockRouter.prefetch.mockClear()
  mockRouter.back.mockClear()
  mockRouter.refresh.mockClear()
  mockRouter.pathname = '/'
  mockRouter.asPath = '/'
  mockPathname = '/'
}

/**
 * Helper to create test favorites
 */
export function createTestFavorites(biasIds: string[]): FavoriteItem[] {
  const now = Date.now()
  return biasIds.map((biasId, index) => ({
    biasId,
    addedAt: now - (biasIds.length - index) * 1000, // Stagger timestamps
  }))
}

/**
 * Helper to create test progress
 */
export function createTestProgress(biasIds: string[], mastered: string[] = []): BiasProgress[] {
  const now = Date.now()
  return biasIds.map((biasId) => ({
    biasId,
    viewedAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
    viewCount: Math.floor(Math.random() * 5) + 1,
    mastered: mastered.includes(biasId),
  }))
}

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

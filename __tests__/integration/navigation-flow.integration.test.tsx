/**
 * Integration Test: Navigation + Active State
 * 
 * Tests navigation between pages and active state updates:
 * 1. Render app with navigation
 * 2. Click each navigation tab
 * 3. Verify correct page content loads
 * 4. Verify active tab state updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'
import AllPage from '@/app/all/page'
import FavoritesPage from '@/app/favorites/page'
import AddPage from '@/app/add/page'
import AnalyticsPage from '@/app/analytics/page'
import SettingsPage from '@/app/settings/page'
import { renderWithProviders, createTestBiases, waitForHooksToLoad, resetRouterMock, waitForNavigationToLoad, waitForSettingsPageToLoad, waitForDailyPageToLoad } from './test-utils'
import { getTodayDateString } from '@/lib/daily-selector'

describe('Navigation + Active State', () => {
  const testBiases = createTestBiases(5)
  const today = getTodayDateString()

  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMock()
    localStorage.clear()
  })

  it('should render navigation with all tabs', async () => {
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      route: '/',
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForDailyPageToLoad(8000)
    await waitForNavigationToLoad(6000)

    // Verify all navigation items are present (use aria-label to avoid header link)
    const nav = screen.getByTestId('bottom-navigation')
    expect(nav).toBeInTheDocument()
    
    // Find links within navigation only
    const navLinks = nav.querySelectorAll('a[aria-label]')
    const linkLabels = Array.from(navLinks).map(link => link.getAttribute('aria-label') || '')
    
    expect(linkLabels.some(label => /daily/i.test(label))).toBe(true)
    expect(linkLabels.some(label => /all/i.test(label))).toBe(true)
    expect(linkLabels.some(label => /favorites/i.test(label))).toBe(true)
    expect(linkLabels.some(label => /add/i.test(label))).toBe(true)
    expect(linkLabels.some(label => /analytics/i.test(label))).toBe(true)
    expect(linkLabels.some(label => /settings/i.test(label))).toBe(true)
  })

  it('should show active state for current route', async () => {
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      route: '/',
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForDailyPageToLoad(8000)
    await waitForNavigationToLoad(6000)

    // Check for active state - find the navigation link specifically
    await waitFor(() => {
      const nav = screen.getByTestId('bottom-navigation')
      const dailyLink = nav.querySelector('a[aria-label*="Daily"]')
      expect(dailyLink).toBeTruthy()
      expect(dailyLink).toHaveAttribute('aria-current', 'page')
    }, { timeout: 5000 })
  })

  it('should navigate to All page and show content', async () => {
    await renderWithProviders(<AllPage />, {
      biases: testBiases,
      route: '/all',
    })

    await waitForHooksToLoad()

    await waitFor(() => {
      // Verify All page content - look for heading
      const heading = screen.getByRole('heading', { name: /all biases/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 5000 })

    // Verify navigation link is active
    const allLink = screen.getByRole('link', { name: /all/i })
    expect(allLink).toHaveAttribute('aria-current', 'page')
  })

  it('should navigate to Favorites page and show content', async () => {
    await renderWithProviders(<FavoritesPage />, {
      biases: testBiases,
      route: '/favorites',
      storageSeed: {
        favorites: [{ biasId: testBiases[0].id, addedAt: Date.now() }],
      },
    })

    await waitForHooksToLoad()

    await waitFor(() => {
      // Look for favorites page heading
      const heading = screen.getByRole('heading', { name: /favorites/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 5000 })

    const favoritesLink = screen.getByRole('link', { name: /favorites/i })
    expect(favoritesLink).toHaveAttribute('aria-current', 'page')
  })

  it('should navigate to Add page and show content', async () => {
    await renderWithProviders(<AddPage />, {
      biases: testBiases,
      route: '/add',
    })

    await waitForHooksToLoad()

    await waitFor(() => {
      // Look for add page heading - it says "Your Biases"
      const heading = screen.getByRole('heading', { name: /your biases/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 5000 })

    const addLink = screen.getByRole('link', { name: /add/i })
    expect(addLink).toHaveAttribute('aria-current', 'page')
  })

  it('should navigate to Analytics page and show content', async () => {
    await renderWithProviders(<AnalyticsPage />, {
      biases: testBiases,
      route: '/analytics',
      storageSeed: {
        progress: [
          {
            biasId: testBiases[0].id,
            viewedAt: Date.now() - 1000,
            viewCount: 1,
            mastered: false,
          },
        ],
      },
    })

    await waitForHooksToLoad()

    await waitFor(() => {
      // Look for analytics page heading - it says "Content Analytics"
      const heading = screen.getByRole('heading', { name: /content analytics/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 5000 })

    const analyticsLink = screen.getByRole('link', { name: /analytics/i })
    expect(analyticsLink).toHaveAttribute('aria-current', 'page')
  })

  it('should navigate to Settings page and show content', async () => {
    await renderWithProviders(<SettingsPage />, {
      biases: testBiases,
      route: '/settings',
    })

    await waitForHooksToLoad()

    await waitForSettingsPageToLoad(15000)

    const settingsLink = screen.getByRole('link', { name: /settings/i })
    expect(settingsLink).toHaveAttribute('aria-current', 'page')
  })
})



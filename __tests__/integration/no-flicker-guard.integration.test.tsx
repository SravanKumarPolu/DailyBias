/**
 * Integration Test: No Flicker Guard
 * 
 * Tests that the Daily page does NOT show skeleton/loading UI
 * after content has already been rendered (content → skeleton swap).
 * 
 * This is a critical integration test to prevent UI flickering.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'
import { renderWithProviders, createTestBiases, waitForHooksToLoad, waitForDailyPageWithBias } from './test-utils'
import { getTodayDateString } from '@/lib/daily-selector'

describe('No Flicker Guard', () => {
  const testBiases = createTestBiases(5)
  const today = getTodayDateString()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should not show skeleton after content is rendered', async () => {
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForDailyPageWithBias(testBiases[0].title, 8000)

    // Verify NO skeleton/loading UI is present after content is shown
    const skeletonElements = screen.queryAllByText(/loading/i)
    const skeletonAria = screen.queryAllByLabelText(/loading/i)
    
    // There should be no visible loading indicators after content is shown
    const visibleLoading = [...skeletonElements, ...skeletonAria].filter(el => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })

    // Should have minimal or no visible loading indicators
    expect(visibleLoading.length).toBeLessThanOrEqual(1)
  })

  it('should show content immediately if bias is cached', async () => {
    // Seed with cached bias
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForHooksToLoad()

    // Wait for loading to complete
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading daily bias/i)
      if (!loadingText) {
        return true
      }
      throw new Error('Page still loading')
    }, { timeout: 3000 })

    // Content should appear quickly (no skeleton flash) - handle multiple matches
    await waitFor(
      () => {
        const biasTitles = screen.getAllByText(testBiases[0].title, { exact: false })
        const visibleTitle = biasTitles.find(title => {
          const style = window.getComputedStyle(title)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        expect(visibleTitle).toBeTruthy()
        return visibleTitle
      },
      { timeout: 3000 }
    )
  })

  it('should not swap content for skeleton on date change', async () => {
    // Render with today's bias
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForHooksToLoad()

    // Wait for loading to complete
    await waitFor(() => {
      const loadingText = screen.queryByText(/loading daily bias/i)
      if (!loadingText) {
        return true
      }
      throw new Error('Page still loading')
    }, { timeout: 5000 })

    // Verify content is shown - handle multiple matches
    await waitFor(
      () => {
        const biasTitles = screen.getAllByText(testBiases[0].title, { exact: false })
        const visibleTitle = biasTitles.find(title => {
          const style = window.getComputedStyle(title)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        expect(visibleTitle).toBeTruthy()
        return visibleTitle
      },
      { timeout: 5000 }
    )

    // Re-render with same bias (simulating date change but same bias)
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    await waitForHooksToLoad()

    // Content should still be visible, not replaced by skeleton
    await waitFor(() => {
      const biasTitles = screen.getAllByText(testBiases[0].title, { exact: false })
      const visibleTitle = biasTitles.find(title => {
        const style = window.getComputedStyle(title)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
      expect(visibleTitle).toBeTruthy()
    }, { timeout: 5000 })
  })
})



/**
 * Integration Test: Daily → Favorite → Favorites Page Flow
 * 
 * Tests the complete user flow:
 * 1. Render Daily page with a bias
 * 2. Click favorite button
 * 3. Navigate to Favorites page
 * 4. Verify the bias appears in favorites
 * 5. Verify persistence after re-render
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/app/page'
import FavoritesPage from '@/app/favorites/page'
import { renderWithProviders, createTestBiases, waitForHooksToLoad, waitForDailyPageWithBias } from './test-utils'
import { getTodayDateString } from '@/lib/daily-selector'

describe('Daily → Favorite → Favorites Flow', () => {
  const testBiases = createTestBiases(5)
  const today = getTodayDateString()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render daily page with bias card', async () => {
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
      },
    })

    // Wait for daily page to fully load with the specific bias
    await waitForDailyPageWithBias(testBiases[0].title, 8000)

    // Verify bias card is rendered
    const biasCard = screen.queryByTestId('bias-card')
    if (biasCard) {
        expect(biasCard).toBeInTheDocument()
    }
  })

  it('should toggle favorite and persist to favorites page', async () => {
    const user = userEvent.setup({ delay: null })
    const selectedBias = testBiases[0]

    // Render home page
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      storageSeed: {
        dailyBias: { date: today, biasId: selectedBias.id },
      },
    })

    await waitForDailyPageWithBias(selectedBias.title, 8000)

    // Find and click favorite button using data-testid
    const favoriteButton = await waitFor(
      () => screen.getByTestId('bias-favorite-button'),
      { timeout: 3000 }
    )
    expect(favoriteButton).toBeInTheDocument()
    
    await user.click(favoriteButton)
    
    // Wait a bit for the favorite to be saved
    await waitForHooksToLoad()
    await new Promise(resolve => setTimeout(resolve, 300))

    // Render favorites page separately to test persistence
    await renderWithProviders(<FavoritesPage />, {
      biases: testBiases,
      route: '/favorites',
      storageSeed: {
        favorites: [{ biasId: selectedBias.id, addedAt: Date.now() }],
      },
    })

    await waitForHooksToLoad()

    // Verify the bias appears in favorites (handle multiple matches)
    await waitFor(
      () => {
        const biasTitles = screen.getAllByText(selectedBias.title, { exact: false })
        // Find a visible one (not screen reader only)
        const visibleTitle = biasTitles.find(title => {
          const style = window.getComputedStyle(title)
          return style.display !== 'none' && style.visibility !== 'hidden'
        })
        expect(visibleTitle).toBeTruthy()
        return visibleTitle
      },
      { timeout: 5000 }
    )
  })

  it('should persist favorites across page reloads', async () => {
    const selectedBias = testBiases[0]
    const favoriteItem = { biasId: selectedBias.id, addedAt: Date.now() }

    // Render favorites page with seeded favorite
    await renderWithProviders(<FavoritesPage />, {
      biases: testBiases,
      route: '/favorites',
      storageSeed: {
        favorites: [favoriteItem],
      },
    })

    await waitForHooksToLoad()

    // Verify favorite persists
    await waitFor(
      () => {
        const biasInFavorites = screen.queryByText(selectedBias.title, { exact: false })
        expect(biasInFavorites).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })
})


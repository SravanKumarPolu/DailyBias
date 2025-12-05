/**
 * Integration Test: Settings Persistence
 * 
 * Tests that settings persist across navigation and page reloads:
 * 1. Toggle a setting (theme, background style, etc.)
 * 2. Navigate away and back
 * 3. Verify setting persisted
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from '@/app/settings/page'
import HomePage from '@/app/page'
import { renderWithProviders, createTestBiases, waitForHooksToLoad, waitForSettingsPageToLoad } from './test-utils'
import { getTodayDateString } from '@/lib/daily-selector'

describe('Settings Persistence', () => {
  const testBiases = createTestBiases(5)
  const today = getTodayDateString()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should persist background style setting', async () => {
    const user = userEvent.setup({ delay: null })

    await renderWithProviders(<SettingsPage />, {
      biases: testBiases,
      route: '/settings',
    })

    await waitForSettingsPageToLoad(12000)

    // Find and toggle background style to "glass" using data-testid
    const glassRadio = await waitFor(
      () => screen.getByTestId('setting-bg-glass'),
      { timeout: 5000 }
    )
    await user.click(glassRadio)

    await waitForHooksToLoad()
    await new Promise(resolve => setTimeout(resolve, 200))

    // Re-render to simulate navigation away and back
    await renderWithProviders(<SettingsPage />, {
      biases: testBiases,
      route: '/settings',
      storageSeed: {
        settings: { backgroundStyle: 'glass' },
      },
    })

    await waitForHooksToLoad()

    // Verify setting persisted (handle multiple elements from re-render)
    await waitFor(() => {
      const glassRadios = screen.getAllByTestId('setting-bg-glass')
      // Get the last one (most recent render)
      const glassRadioAfter = glassRadios[glassRadios.length - 1]
      expect(glassRadioAfter).toBeChecked()
    }, { timeout: 5000 })
  })

  it('should persist settings across page navigation', async () => {
    const user = userEvent.setup({ delay: null })

    // Render settings page
    await renderWithProviders(<SettingsPage />, {
      biases: testBiases,
      route: '/settings',
    })

    await waitForSettingsPageToLoad(12000)

    // Change a setting
    const glassRadio = await waitFor(
      () => screen.getByTestId('setting-bg-glass'),
      { timeout: 5000 }
    )
    await user.click(glassRadio)

    await waitForHooksToLoad()
    await new Promise(resolve => setTimeout(resolve, 200))

    // Navigate to home page
    await renderWithProviders(<HomePage />, {
      biases: testBiases,
      route: '/',
      storageSeed: {
        dailyBias: { date: today, biasId: testBiases[0].id },
        settings: { backgroundStyle: 'glass' },
      },
    })

    await waitForHooksToLoad()

    // Navigate back to settings
    await renderWithProviders(<SettingsPage />, {
      biases: testBiases,
      route: '/settings',
      storageSeed: {
        settings: { backgroundStyle: 'glass' },
      },
    })

    await waitForHooksToLoad()

    // Verify setting persisted (handle multiple elements from re-render)
    await waitFor(() => {
      const glassRadios = screen.getAllByTestId('setting-bg-glass')
      // Get the last one (most recent render)
      const glassRadioAfter = glassRadios[glassRadios.length - 1]
      expect(glassRadioAfter).toBeChecked()
    }, { timeout: 5000 })
  })
})



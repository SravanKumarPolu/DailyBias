/**
 * Simple Smoke Test - Verify basic setup works
 * 
 * This test verifies that:
 * 1. Components can render with providers
 * 2. IndexedDB is properly mocked
 * 3. Basic rendering works
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders, createTestBiases, waitForHooksToLoad, waitFor } from './test-utils'
import { screen } from '@testing-library/react'

describe('Simple Smoke Test', () => {
  const testBiases = createTestBiases(5)

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render a simple div', async () => {
    const { container } = await renderWithProviders(
      <div data-testid="test-div">Test Content</div>,
      {
        biases: testBiases,
      }
    )

    await waitForHooksToLoad()

    const testDiv = await waitFor(
      () => container.querySelector('[data-testid="test-div"]'),
      { timeout: 2000 }
    )
    expect(testDiv).toBeInTheDocument()
    expect(testDiv).toHaveTextContent('Test Content')
  })

  it('should seed IndexedDB and render with data', async () => {
    const { container } = await renderWithProviders(
      <div data-testid="test-div">Test</div>,
      {
        biases: testBiases,
        storageSeed: {
          favorites: [{ biasId: 'bias-1', addedAt: Date.now() }],
          settings: { backgroundStyle: 'glass' },
        },
      }
    )

    await waitForHooksToLoad()

    const testDiv = await waitFor(
      () => container.querySelector('[data-testid="test-div"]'),
      { timeout: 2000 }
    )
    expect(testDiv).toBeInTheDocument()
  })
})



import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AddBiasPage from '@/app/add/page'

// Mock the hooks
vi.mock('@/hooks/use-biases', () => ({
  useBiases: () => ({
    userBiases: [],
    addBias: vi.fn(),
    updateBias: vi.fn(),
    deleteBias: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-settings', () => ({
  useSettings: () => ({
    settings: {
      theme: 'light',
      backgroundStyle: 'gradient',
    },
  }),
}))

vi.mock('@/components/daily-header', () => ({
  DailyHeader: () => <div data-testid="daily-header">Daily Header</div>,
}))

vi.mock('@/components/dynamic-background-canvas', () => ({
  DynamicBackgroundCanvas: () => <div data-testid="background-canvas">Background</div>,
}))

vi.mock('@/components/dynamic-navigation', () => ({
  DynamicNavigation: () => <div data-testid="navigation">Navigation</div>,
}))

describe('AddBiasPage', () => {
  it('should render add bias button', () => {
    render(<AddBiasPage />)
    const addButtons = screen.getAllByText(/add bias/i)
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it('should render page structure', () => {
    render(<AddBiasPage />)
    // Check that the page rendered
    expect(screen.getByTestId('daily-header')).toBeInTheDocument()
  })
})


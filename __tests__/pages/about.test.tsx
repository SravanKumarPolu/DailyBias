import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

// Mock the hooks and components
vi.mock('@/hooks/use-settings', () => ({
  useSettings: () => ({
    settings: {
      theme: 'light',
      backgroundStyle: 'gradient',
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
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

describe('AboutPage', () => {
  it('should render the page title', () => {
    render(<AboutPage />)
    const titles = screen.getAllByText('Bias Daily')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('should render features section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('should render content quality section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Content Quality & Sources')).toBeInTheDocument()
  })

  it('should render about biases section', () => {
    render(<AboutPage />)
    expect(screen.getByText('About the Biases')).toBeInTheDocument()
  })

  it('should render technology section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })
})


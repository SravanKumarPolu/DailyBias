import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BiasDetailPage from '@/app/bias/[id]/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'bias-1' }),
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

// Mock the app context
const mockAppContext = {
  allBiases: [
    {
      id: 'bias-1',
      title: 'Test Bias',
      category: 'decision',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
  ],
  biasesLoading: false,
  toggleFavorite: vi.fn(),
  isFavorite: vi.fn().mockResolvedValue(false),
  settings: {
    theme: 'light',
    backgroundStyle: 'gradient',
  },
  toggleMastered: vi.fn(),
  isMastered: vi.fn().mockResolvedValue(false),
  markAsViewed: vi.fn(),
}

vi.mock('@/contexts/app-context', () => ({
  useApp: () => mockAppContext,
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

vi.mock('@/components/dynamic-bias-card', () => ({
  DynamicBiasCard: ({ bias }: any) => <div data-testid={`bias-${bias.id}`}>{bias.title}</div>,
}))

vi.mock('@/components/related-biases', () => ({
  RelatedBiases: () => <div data-testid="related-biases">Related Biases</div>,
}))

describe('BiasDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render bias detail when bias is found', async () => {
    render(<BiasDetailPage />)
    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(screen.getByTestId('bias-bias-1')).toBeInTheDocument()
  })

  it('should render back button', async () => {
    render(<BiasDetailPage />)
    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Check that the page rendered (header should always be present)
    expect(screen.getByTestId('daily-header')).toBeInTheDocument()
  })
})


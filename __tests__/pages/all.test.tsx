import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import AllBiasesPage from '@/app/all/page'
import type { Bias, FavoriteItem, BiasProgress } from '@/lib/types'

// Mock the app context with proper types
const mockAppContext: {
  allBiases: Bias[]
  biasesLoading: boolean
  favorites: FavoriteItem[]
  toggleFavorite: Mock
  isFavorite: Mock
  settings: {
    theme: 'light' | 'dark' | 'system'
    backgroundStyle: 'gradient' | 'glass' | 'minimal'
  }
  toggleMastered: Mock
  isMastered: Mock
  progressList: BiasProgress[]
  progressLoading: boolean
} = {
  allBiases: [],
  biasesLoading: false,
  favorites: [],
  toggleFavorite: vi.fn(),
  isFavorite: vi.fn().mockResolvedValue(false),
  settings: {
    theme: 'light',
    backgroundStyle: 'gradient',
  },
  toggleMastered: vi.fn(),
  isMastered: vi.fn().mockResolvedValue(false),
  progressList: [],
  progressLoading: false,
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
  DynamicBiasCard: ({ bias }: { bias: Bias }) => <div data-testid={`bias-${bias.id}`}>{bias.title}</div>,
}))

vi.mock('@/components/empty-state', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}))

describe('AllBiasesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input', () => {
    render(<AllBiasesPage />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should render filter button', () => {
    render(<AllBiasesPage />)
    const filterButton = screen.getByText(/filter/i)
    expect(filterButton).toBeInTheDocument()
  })

  it('should render empty state when no biases', () => {
    render(<AllBiasesPage />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should render biases when available', () => {
    mockAppContext.allBiases = [
      {
        id: 'bias-1',
        title: 'Test Bias',
        category: 'decision',
        summary: 'Test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core',
      },
    ]

    render(<AllBiasesPage />)
    expect(screen.getByTestId('bias-bias-1')).toBeInTheDocument()
  })
})


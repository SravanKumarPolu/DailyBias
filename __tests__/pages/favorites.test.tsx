import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import FavoritesPage from '@/app/favorites/page'
import type { Bias, FavoriteItem } from '@/lib/types'

// Mock the app context with proper types
const mockAppContext: {
  allBiases: Bias[]
  biasesLoading: boolean
  favorites: FavoriteItem[]
  toggleFavorite: Mock
  favoritesLoading: boolean
  settings: {
    theme: 'light' | 'dark' | 'system'
    backgroundStyle: 'gradient' | 'glass' | 'minimal'
  }
  toggleMastered: Mock
  isMastered: Mock
} = {
  allBiases: [],
  biasesLoading: false,
  favorites: [],
  toggleFavorite: vi.fn(),
  favoritesLoading: false,
  settings: {
    theme: 'light',
    backgroundStyle: 'gradient',
  },
  toggleMastered: vi.fn(),
  isMastered: vi.fn().mockResolvedValue(false),
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

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no favorites', () => {
    render(<FavoritesPage />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should render favorites when available', () => {
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
    mockAppContext.favorites = [
      {
        biasId: 'bias-1',
        addedAt: Date.now(),
      },
    ]

    render(<FavoritesPage />)
    // The component should render the bias card
    expect(screen.queryByTestId('bias-bias-1')).toBeInTheDocument()
  })
})


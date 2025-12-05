import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AnalyticsPage from '@/app/analytics/page'
import type { Bias, BiasProgress } from '@/lib/types'

// Mock the app context with proper types
const mockAppContext: {
  allBiases: Bias[]
  biasesLoading: boolean
  progressList: BiasProgress[]
  progressLoading: boolean
  settings: {
    theme: 'light' | 'dark' | 'system'
    backgroundStyle: 'gradient' | 'glass' | 'minimal'
  }
} = {
  allBiases: [],
  biasesLoading: false,
  progressList: [],
  progressLoading: false,
  settings: {
    theme: 'light',
    backgroundStyle: 'gradient',
  },
}

vi.mock('@/contexts/app-context', () => ({
  useApp: () => mockAppContext,
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

vi.mock('@/components/content-quality-dashboard', () => ({
  ContentQualityDashboard: () => <div data-testid="quality-dashboard">Quality Dashboard</div>,
}))

vi.mock('@/components/learning-progress-dashboard', () => ({
  LearningProgressDashboard: () => <div data-testid="progress-dashboard">Progress Dashboard</div>,
}))

vi.mock('@/lib/content-versioning', () => ({
  contentVersionManager: {
    getAllQualityMetrics: vi.fn().mockResolvedValue([]),
    getContentNeedingReview: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('@/lib/analytics-utils', () => ({
  calculateAnalyticsMetrics: vi.fn().mockResolvedValue({
    totalBiases: 0,
    viewedBiases: 0,
    masteredBiases: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageQualityScore: 0,
    expertReviewsCount: 0,
    userFeedbackCount: 0,
  }),
  getRecentActivity: vi.fn().mockResolvedValue([]),
  formatRelativeTime: vi.fn((_time: number) => 'recent'),
}))

vi.mock('@/lib/db', () => ({
  getAllFeedback: vi.fn().mockResolvedValue([]),
}))

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock context to defaults
    mockAppContext.allBiases = []
    mockAppContext.biasesLoading = false
    mockAppContext.progressList = []
    mockAppContext.progressLoading = false
  })

  it('should render analytics page with header', () => {
    render(<AnalyticsPage />)
    expect(screen.getByTestId('daily-header')).toBeInTheDocument()
    expect(screen.getByTestId('background-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
  })

  it('should render page heading', async () => {
    render(<AnalyticsPage />)

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /content analytics/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render all tabs', async () => {
    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /learning progress/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /content quality/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reviews/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show loading state when data is loading', async () => {
    mockAppContext.biasesLoading = true

    render(<AnalyticsPage />)

    // When loading, the page should still render but analytics data won't load
    // The useEffect checks for !biasesLoading && !progressLoading && allBiases.length > 0
    // So with biasesLoading = true, loadAnalyticsData won't be called
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /content analytics/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 3000 })

    // Page should still render tabs even when loading
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
  })

  it('should render content when data is loaded', async () => {
    mockAppContext.allBiases = [
      {
        id: 'bias-1',
        title: 'Test Bias',
        summary: 'Test summary',
        category: 'decision',
      },
    ] as Bias[]

    render(<AnalyticsPage />)

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /content analytics/i })
      expect(heading).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render back button', () => {
    render(<AnalyticsPage />)
    const backButton = screen.getByRole('button', { name: /go back to previous page/i })
    expect(backButton).toBeInTheDocument()
  })
})


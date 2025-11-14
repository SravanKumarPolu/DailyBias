import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from '@/app/analytics/page'

// Mock the app context
const mockAppContext = {
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
  },
}))

vi.mock('@/lib/analytics-utils', () => ({
  calculateAnalyticsMetrics: vi.fn().mockReturnValue({
    totalBiases: 0,
    viewedBiases: 0,
    masteredBiases: 0,
    currentStreak: 0,
  }),
  getRecentActivity: vi.fn().mockReturnValue([]),
  formatRelativeTime: vi.fn((time: number) => 'recent'),
}))

vi.mock('@/lib/db', () => ({
  getAllFeedback: vi.fn().mockResolvedValue([]),
}))

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render analytics page', () => {
    render(<AnalyticsPage />)
    expect(screen.getByTestId('daily-header')).toBeInTheDocument()
  })

  it('should render tabs', async () => {
    render(<AnalyticsPage />)
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(screen.getByText(/overview/i) || screen.getByText(/progress/i)).toBeDefined()
  })
})


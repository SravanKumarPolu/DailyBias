import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'true'), // onboarding completed
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

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
  progressList: [],
  progressLoading: false,
  markAsViewed: vi.fn(),
  toggleMastered: vi.fn(),
  isMastered: vi.fn().mockResolvedValue(false),
  settingsLoading: false,
  stats: {
    totalBiasesRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastViewedDate: null,
    masteredCount: 0,
  },
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

vi.mock('@/components/daily-progress-widget', () => ({
  DailyProgressWidget: () => <div data-testid="progress-widget">Progress Widget</div>,
}))

vi.mock('@/components/bias-progress-indicator', () => ({
  BiasProgressIndicator: () => <div data-testid="progress-indicator">Progress Indicator</div>,
}))

vi.mock('@/components/content-transparency', () => ({
  ContentTransparency: () => <div data-testid="content-transparency">Content Transparency</div>,
}))

vi.mock('@/components/pull-to-refresh', () => ({
  PullToRefresh: () => <div data-testid="pull-to-refresh">Pull to Refresh</div>,
}))

vi.mock('@/components/tilt-card', () => ({
  TiltCard: ({ children }: any) => <div data-testid="tilt-card">{children}</div>,
}))

vi.mock('@/hooks/use-voice-commands', () => ({
  useVoiceCommands: () => ({
    isListening: false,
    isSupported: true,
    toggleListening: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-speech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

vi.mock('@/lib/daily-selector', () => ({
  getPersonalizedDailyBias: vi.fn((biases) => biases[0]),
  getTodayDateString: vi.fn(() => '2024-01-15'),
}))

vi.mock('@/lib/storage', () => ({
  getCachedDailyBias: vi.fn(() => null),
  cacheDailyBias: vi.fn(),
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('true')
  })

  it('should render daily header', () => {
    render(<HomePage />)
    expect(screen.getByTestId('daily-header')).toBeInTheDocument()
  })

  it('should render navigation', () => {
    render(<HomePage />)
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
  })

  it('should render loading state initially', () => {
    mockAppContext.biasesLoading = true
    render(<HomePage />)
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
  })
})


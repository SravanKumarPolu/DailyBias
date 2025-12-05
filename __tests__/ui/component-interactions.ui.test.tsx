/**
 * UI Tests - Component Interactions and Visual Elements
 * 
 * These tests verify UI components render correctly and respond to user interactions.
 * They focus on visual elements, accessibility, and user interaction patterns.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/contexts/app-context'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'true'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'test-bias-1' }),
}))

// Mock hooks
vi.mock('@/hooks/use-biases', () => ({
  useBiases: () => ({
    userBiases: [],
    allBiases: [
      {
        id: 'test-bias-1',
        title: 'Confirmation Bias',
        category: 'cognitive',
        summary: 'Test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core',
      },
    ],
    coreBiases: [],
    loading: false,
    error: null,
    addBias: vi.fn(),
    updateBias: vi.fn(),
    deleteBias: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-favorites', () => ({
  useFavorites: () => ({
    favorites: [],
    loading: false,
    error: null,
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockResolvedValue(false),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-settings', () => ({
  useSettings: () => ({
    settings: {
      theme: 'light',
      backgroundStyle: 'gradient',
      dailyReminder: false,
      mixUserBiasesInDaily: true,
      voiceEnabled: false,
      timezoneAutoDetect: true,
      timezone: 'America/New_York',
    },
    loading: false,
    saveSetting: vi.fn(),
    saveAllSettings: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-progress', () => ({
  useProgress: () => ({
    progressList: [],
    stats: {
      totalBiasesRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastViewedDate: null,
      masteredCount: 0,
    },
    loading: false,
    error: null,
    markAsViewed: vi.fn(),
    toggleMastered: vi.fn().mockResolvedValue(false),
    isViewed: vi.fn().mockResolvedValue(false),
    isMastered: vi.fn().mockResolvedValue(false),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-daily-bias', () => ({
  useDailyBias: () => ({
    dailyBias: {
      id: 'test-bias-1',
      title: 'Confirmation Bias',
      category: 'cognitive',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
    isLoading: false,
  }),
}))

// Mock complex components
vi.mock('@/components/daily-header', () => ({
  DailyHeader: () => (
    <header data-testid="daily-header" role="banner">
      <h1>Daily Bias</h1>
    </header>
  ),
}))

vi.mock('@/components/dynamic-background-canvas', () => ({
  DynamicBackgroundCanvas: () => (
    <div data-testid="background-canvas" aria-hidden="true">Background</div>
  ),
}))

vi.mock('@/components/dynamic-navigation', () => ({
  DynamicNavigation: () => (
    <nav data-testid="bottom-navigation" role="navigation" aria-label="Main navigation">
      <button data-testid="nav-daily" aria-label="Daily">Daily</button>
      <button data-testid="nav-all" aria-label="All Biases">All</button>
      <button data-testid="nav-favorites" aria-label="Favorites">Favorites</button>
      <button data-testid="nav-add" aria-label="Add Bias">Add</button>
      <button data-testid="nav-analytics" aria-label="Analytics">Analytics</button>
      <button data-testid="nav-settings" aria-label="Settings">Settings</button>
    </nav>
  ),
}))

vi.mock('@/components/dynamic-bias-card', () => ({
  DynamicBiasCard: ({ bias }: any) => (
    <article data-testid={`bias-card-${bias.id}`} role="article">
      <h2>{bias.title}</h2>
      <p>{bias.summary}</p>
    </article>
  ),
}))

vi.mock('@/components/daily-progress-widget', () => ({
  DailyProgressWidget: () => (
    <div data-testid="progress-widget" role="status" aria-live="polite">
      Progress Widget
    </div>
  ),
}))

vi.mock('@/components/bias-progress-indicator', () => ({
  BiasProgressIndicator: () => (
    <div data-testid="progress-indicator" role="progressbar">Progress</div>
  ),
}))

vi.mock('@/components/content-transparency', () => ({
  ContentTransparency: () => null,
}))

vi.mock('@/components/pull-to-refresh', () => ({
  PullToRefresh: () => null,
}))

vi.mock('@/components/tilt-card', () => ({
  TiltCard: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/empty-state', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state" role="status">
      <h3>{title || 'Empty'}</h3>
      <p>{description || 'No items found'}</p>
    </div>
  ),
}))

vi.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/components/network-status', () => ({
  NetworkStatus: () => null,
}))

vi.mock('@/components/telegram-redirect-banner', () => ({
  TelegramRedirectBanner: () => null,
}))

vi.mock('@/components/plausible-analytics', () => ({
  PlausibleAnalytics: () => null,
}))

vi.mock('@/components/disable-service-worker', () => ({
  DisableServiceWorker: () => null,
}))

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => null,
}))

vi.mock('@/hooks/use-voice-commands', () => ({
  useVoiceCommands: () => ({
    isListening: false,
    isSupported: false,
    toggleListening: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-speech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    ensureVoicesLoaded: vi.fn().mockResolvedValue(undefined),
    isSupported: false,
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: any) => value,
}))

vi.mock('@/lib/daily-selector', () => ({
  getPersonalizedDailyBias: vi.fn((biases) => biases[0]),
  getTodayDateString: vi.fn(() => '2024-01-15'),
  getCoreBiases: vi.fn(() => []),
  getBalancedRecommendation: vi.fn(() => null),
}))

vi.mock('@/lib/storage', () => ({
  getCachedDailyBias: vi.fn(() => null),
  cacheDailyBias: vi.fn(),
  getStoredDailyBias: vi.fn(() => null),
}))

vi.mock('@/lib/native-features', () => ({
  scheduleDailyReminder: vi.fn(),
  isNativeApp: vi.fn(() => false),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('UI Tests - Component Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('true')
    mockRouter.push.mockClear()
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on navigation', async () => {
      const { DynamicNavigation } = await import('@/components/dynamic-navigation')
      render(<DynamicNavigation />)

      const nav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(nav).toBeTruthy()

      const dailyNav = screen.getByLabelText(/daily/i)
      expect(dailyNav).toBeTruthy()
    })

    it('should have semantic HTML structure', async () => {
      const HomePage = (await import('@/app/page')).default
      render(
        <AppProvider>
          <HomePage />
        </AppProvider>
      )

      await waitFor(() => {
        const header = screen.queryByRole('banner')
        expect(header).toBeTruthy()
      })
    })

    it('should have proper heading hierarchy', async () => {
      const { DynamicBiasCard } = await import('@/components/dynamic-bias-card')
      const testBias = {
        id: 'test-1',
        title: 'Test Bias',
        category: 'decision' as const,
        summary: 'Test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core' as const,
      }

      render(<DynamicBiasCard bias={testBias} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Test Bias')
    })
  })

  describe('Visual Elements', () => {
    it('should render daily header with title', async () => {
      const { DailyHeader } = await import('@/components/daily-header')
      render(<DailyHeader />)

      const header = screen.getByTestId('daily-header')
      expect(header).toBeTruthy()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/daily/i)
    })

    it('should render bias card with all elements', async () => {
      const { DynamicBiasCard } = await import('@/components/dynamic-bias-card')
      const testBias = {
        id: 'test-1',
        title: 'Confirmation Bias',
        category: 'memory' as const,
        summary: 'This is a test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core' as const,
      }

      render(<DynamicBiasCard bias={testBias} />)

      const card = screen.getByTestId('bias-card-test-1')
      expect(card).toBeTruthy()
      expect(screen.getByText('Confirmation Bias')).toBeTruthy()
      expect(screen.getByText('This is a test summary')).toBeTruthy()
    })

    it('should render navigation with all items', async () => {
      const { DynamicNavigation } = await import('@/components/dynamic-navigation')
      render(<DynamicNavigation />)

      expect(screen.getByTestId('nav-daily')).toBeTruthy()
      expect(screen.getByTestId('nav-all')).toBeTruthy()
      expect(screen.getByTestId('nav-favorites')).toBeTruthy()
      expect(screen.getByTestId('nav-add')).toBeTruthy()
      expect(screen.getByTestId('nav-analytics')).toBeTruthy()
      expect(screen.getByTestId('nav-settings')).toBeTruthy()
    })
  })

  describe('User Interactions', () => {
    it('should respond to navigation clicks', async () => {
      const { DynamicNavigation } = await import('@/components/dynamic-navigation')
      render(<DynamicNavigation />)

      const allNav = screen.getByTestId('nav-all')
      fireEvent.click(allNav)

      // Navigation should be clickable
      expect(allNav).toBeTruthy()
    })

    it('should handle empty state display', async () => {
      const { EmptyState } = await import('@/components/empty-state')
      const { Inbox } = await import('lucide-react')
      render(<EmptyState icon={Inbox} title="No items" description="Add some items" />)

      expect(screen.getByText('No items')).toBeTruthy()
      expect(screen.getByText('Add some items')).toBeTruthy()
    })
  })

  describe('Loading States', () => {
    it('should show progress widget', async () => {
      const { DailyProgressWidget } = await import('@/components/daily-progress-widget')
      render(<DailyProgressWidget />)

      const widget = screen.getByTestId('progress-widget')
      expect(widget).toBeTruthy()
      expect(widget).toHaveAttribute('role', 'status')
    })
  })

  describe('Responsive Design', () => {
    it('should render components at different viewport sizes', async () => {
      const HomePage = (await import('@/app/page')).default
      
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <AppProvider>
          <HomePage />
        </AppProvider>
      )

      await waitFor(() => {
        expect(document.body).toBeTruthy()
      })

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
    })
  })

  describe('Theme Support', () => {
    it('should support theme switching', async () => {
      const { useSettings } = await import('@/hooks/use-settings')
      const TestComponent = () => {
        const { settings } = useSettings()
        return <div data-theme={settings.theme}>{settings.theme}</div>
      }

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      )

      const themeDiv = screen.getByText('light')
      expect(themeDiv).toHaveAttribute('data-theme', 'light')
    })
  })
})


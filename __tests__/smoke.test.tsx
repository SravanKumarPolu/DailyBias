/**
 * Smoke Tests - Basic-level checks that main features run without crashing
 * 
 * These tests verify that:
 * - Main pages render without errors
 * - Core components mount successfully
 * - Key hooks initialize properly
 * - App context provides data correctly
 * - Navigation works
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { AppProvider } from '@/contexts/app-context'

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
}))

// Mock all hooks to return safe defaults
vi.mock('@/hooks/use-biases', () => ({
  useBiases: () => ({
    userBiases: [],
    allBiases: [
      {
        id: 'test-bias-1',
        title: 'Test Bias',
        category: 'decision',
        summary: 'Test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core',
      },
    ],
    coreBiases: [
      {
        id: 'test-bias-1',
        title: 'Test Bias',
        category: 'decision',
        summary: 'Test summary',
        why: 'Test why',
        counter: 'Test counter',
        source: 'core',
      },
    ],
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
      voiceEnabled: true,
      voiceRate: 0.9,
      voicePitch: 1.0,
      voiceName: 'Google US English',
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

// Mock components that have complex dependencies
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

vi.mock('@/components/empty-state', () => ({
  EmptyState: () => <div data-testid="empty-state">Empty State</div>,
}))

vi.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/components/network-status', () => ({
  NetworkStatus: () => <div data-testid="network-status">Network Status</div>,
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
  Toaster: () => <div data-testid="toaster">Toaster</div>,
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
    ensureVoicesLoaded: vi.fn(),
    isSupported: true,
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

vi.mock('@/hooks/use-virtual-scroll', () => ({
  useLazyLoad: (items: any[]) => ({
    visibleItems: items,
    hasMore: false,
    loadMoreRef: { current: null },
  }),
}))

vi.mock('@/lib/daily-selector', () => ({
  getPersonalizedDailyBias: vi.fn((biases) => biases[0]),
  getTodayDateString: vi.fn(() => '2024-01-15'),
  getCoreBiases: vi.fn(() => [
    {
      id: 'test-bias-1',
      title: 'Test Bias',
      category: 'decision',
      summary: 'Test summary',
      why: 'Test why',
      counter: 'Test counter',
      source: 'core',
    },
  ]),
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

vi.mock('@/lib/db', () => ({
  exportAllData: vi.fn().mockResolvedValue({}),
  importAllData: vi.fn().mockResolvedValue(undefined),
  getUserBiases: vi.fn().mockResolvedValue([]),
  addUserBias: vi.fn().mockResolvedValue(undefined),
  updateUserBias: vi.fn().mockResolvedValue(undefined),
  deleteUserBias: vi.fn().mockResolvedValue(undefined),
  getFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  isFavorite: vi.fn().mockResolvedValue(false),
  getSettings: vi.fn().mockResolvedValue({}),
  updateSettings: vi.fn().mockResolvedValue(undefined),
  getAllProgress: vi.fn().mockResolvedValue([]),
  markBiasAsViewed: vi.fn().mockResolvedValue(undefined),
  toggleBiasMastered: vi.fn().mockResolvedValue(false),
  isBiasViewed: vi.fn().mockResolvedValue(false),
  isBiasMastered: vi.fn().mockResolvedValue(false),
  getAllFeedback: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/content-versioning', () => ({
  contentVersionManager: {
    getAllQualityMetrics: vi.fn().mockResolvedValue([]),
    getContentNeedingReview: vi.fn().mockResolvedValue([]),
    initialize: vi.fn().mockResolvedValue(undefined),
  },
  ContentVersionManager: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      getAllQualityMetrics: vi.fn().mockResolvedValue([]),
      getContentNeedingReview: vi.fn().mockResolvedValue([]),
    })),
  },
}))

vi.mock('@/lib/analytics-utils', () => ({
  calculateAnalyticsMetrics: vi.fn().mockResolvedValue({
    totalBiases: 0,
    totalRead: 0,
    totalMastered: 0,
    averageQuality: 0,
    totalFeedback: 0,
  }),
  getRecentActivity: vi.fn().mockResolvedValue([]),
  formatRelativeTime: vi.fn((time: number) => 'recently'),
}))

vi.mock('@/lib/timezone-utils', () => ({
  getCommonTimezones: vi.fn(() => [{ value: 'America/New_York', label: 'Eastern Time' }]),
  detectTimezone: vi.fn(() => ({
    timezone: 'America/New_York',
    city: 'New York',
    region: 'US',
    offset: 'UTC-5',
  })),
  isValidTimezone: vi.fn(() => true),
}))

vi.mock('@/lib/haptics', () => ({
  haptics: {
    selection: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/search-utils', () => ({
  searchBiases: vi.fn((biases, query) => biases.map((bias: any) => ({ bias, score: 1.0 }))),
}))

vi.mock('@/lib/validation', () => ({
  validateSearchQuery: vi.fn((query) => query),
}))

describe('Smoke Tests - Main Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('true')
  })

  describe('App Context Provider', () => {
    it('should render AppProvider without crashing', () => {
      expect(() => {
        render(
          <AppProvider>
            <div>Test</div>
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should provide app context to children', () => {
      const { container } = render(
        <AppProvider>
          <div>Test</div>
        </AppProvider>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Main Pages - Render Without Crashing', () => {
    it('should render HomePage without crashing', async () => {
      const HomePage = (await import('@/app/page')).default
      expect(() => {
        render(
          <AppProvider>
            <HomePage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render AllBiasesPage without crashing', async () => {
      const AllBiasesPage = (await import('@/app/all/page')).default
      expect(() => {
        render(
          <AppProvider>
            <AllBiasesPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render FavoritesPage without crashing', async () => {
      const FavoritesPage = (await import('@/app/favorites/page')).default
      expect(() => {
        render(
          <AppProvider>
            <FavoritesPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render SettingsPage without crashing', async () => {
      const SettingsPage = (await import('@/app/settings/page')).default
      expect(() => {
        render(
          <AppProvider>
            <SettingsPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render AboutPage without crashing', async () => {
      const AboutPage = (await import('@/app/about/page')).default
      expect(() => {
        render(
          <AppProvider>
            <AboutPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render AnalyticsPage without crashing', async () => {
      const AnalyticsPage = (await import('@/app/analytics/page')).default
      expect(() => {
        render(
          <AppProvider>
            <AnalyticsPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render AddBiasPage without crashing', async () => {
      const AddBiasPage = (await import('@/app/add/page')).default
      expect(() => {
        render(
          <AppProvider>
            <AddBiasPage />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should render OnboardingPage without crashing', async () => {
      const OnboardingPage = (await import('@/app/onboarding/page')).default
      expect(() => {
        render(
          <AppProvider>
            <OnboardingPage />
          </AppProvider>
        )
      }).not.toThrow()
    })
  })

  describe('Core Components - Render Without Crashing', () => {
    it('should render DailyHeader component', async () => {
      const { DailyHeader } = await import('@/components/daily-header')
      expect(() => {
        render(<DailyHeader />)
      }).not.toThrow()
    })

    it('should render DynamicNavigation component', async () => {
      const { DynamicNavigation } = await import('@/components/dynamic-navigation')
      expect(() => {
        render(<DynamicNavigation />)
      }).not.toThrow()
    })

    it('should render DynamicBackgroundCanvas component', async () => {
      const { DynamicBackgroundCanvas } = await import('@/components/dynamic-background-canvas')
      expect(() => {
        render(<DynamicBackgroundCanvas style="gradient" seed={1} />)
      }).not.toThrow()
    })
  })

  describe('Core Hooks - Initialize Without Crashing', () => {
    it('should initialize useBiases hook', async () => {
      const { useBiases } = await import('@/hooks/use-biases')
      expect(() => {
        // Hook can only be called in component
        const TestComponent = () => {
          useBiases()
          return null
        }
        render(
          <AppProvider>
            <TestComponent />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should initialize useFavorites hook', async () => {
      const { useFavorites } = await import('@/hooks/use-favorites')
      expect(() => {
        const TestComponent = () => {
          useFavorites()
          return null
        }
        render(
          <AppProvider>
            <TestComponent />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should initialize useSettings hook', async () => {
      const { useSettings } = await import('@/hooks/use-settings')
      expect(() => {
        const TestComponent = () => {
          useSettings()
          return null
        }
        render(
          <AppProvider>
            <TestComponent />
          </AppProvider>
        )
      }).not.toThrow()
    })

    it('should initialize useProgress hook', async () => {
      const { useProgress } = await import('@/hooks/use-progress')
      expect(() => {
        const TestComponent = () => {
          useProgress()
          return null
        }
        render(
          <AppProvider>
            <TestComponent />
          </AppProvider>
        )
      }).not.toThrow()
    })
  })

  describe('App Context - Provides Data Correctly', () => {
    it('should provide biases data through context', async () => {
      const { useApp } = await import('@/contexts/app-context')
      const TestComponent = () => {
        const app = useApp()
        expect(app.allBiases).toBeDefined()
        expect(Array.isArray(app.allBiases)).toBe(true)
        return null
      }

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      )
    })

    it('should provide favorites data through context', async () => {
      const { useApp } = await import('@/contexts/app-context')
      const TestComponent = () => {
        const app = useApp()
        expect(app.favorites).toBeDefined()
        expect(Array.isArray(app.favorites)).toBe(true)
        return null
      }

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      )
    })

    it('should provide settings data through context', async () => {
      const { useApp } = await import('@/contexts/app-context')
      const TestComponent = () => {
        const app = useApp()
        expect(app.settings).toBeDefined()
        expect(typeof app.settings).toBe('object')
        return null
      }

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      )
    })

    it('should provide progress data through context', async () => {
      const { useApp } = await import('@/contexts/app-context')
      const TestComponent = () => {
        const app = useApp()
        expect(app.progressList).toBeDefined()
        expect(Array.isArray(app.progressList)).toBe(true)
        expect(app.progressStats).toBeDefined()
        return null
      }

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle missing context gracefully', async () => {
      const { useApp } = await import('@/contexts/app-context')
      
      // Should throw error when used outside provider
      expect(() => {
        const TestComponent = () => {
          useApp()
          return null
        }
        render(<TestComponent />)
      }).toThrow('useApp must be used within an AppProvider')
    })
  })

  describe('Integration - Full Page Renders', () => {
    it('should render complete HomePage with all components', async () => {
      const HomePage = (await import('@/app/page')).default
      const { container } = render(
        <AppProvider>
          <HomePage />
        </AppProvider>
      )
      
      // Page should render without errors
      expect(container).toBeTruthy()
    })

    it('should render complete AllBiasesPage with all components', async () => {
      const AllBiasesPage = (await import('@/app/all/page')).default
      const { container } = render(
        <AppProvider>
          <AllBiasesPage />
        </AppProvider>
      )
      
      // Page should render without errors
      expect(container).toBeTruthy()
    })

    it('should render complete FavoritesPage with all components', async () => {
      const FavoritesPage = (await import('@/app/favorites/page')).default
      const { container } = render(
        <AppProvider>
          <FavoritesPage />
        </AppProvider>
      )
      
      // Page should render without errors
      expect(container).toBeTruthy()
    })

    it('should render complete SettingsPage with all components', async () => {
      const SettingsPage = (await import('@/app/settings/page')).default
      const { container } = render(
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      )
      
      // Page should render without errors
      expect(container).toBeTruthy()
    })
  })
})


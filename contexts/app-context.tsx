"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { Bias, FavoriteItem, Settings, BiasProgress, ProgressStats } from "@/lib/types"
import { useBiases } from "@/hooks/use-biases"
import { useFavorites } from "@/hooks/use-favorites"
import { useSettings } from "@/hooks/use-settings"
import { useProgress } from "@/hooks/use-progress"

interface AppContextType {
  // Biases
  userBiases: Bias[]
  allBiases: Bias[]
  coreBiases: Bias[]
  biasesLoading: boolean
  biasesError: string | null
  addBias: (bias: Bias) => Promise<void>
  updateBias: (bias: Bias) => Promise<void>
  deleteBias: (id: string) => Promise<void>
  refreshBiases: () => Promise<void>

  // Favorites
  favorites: FavoriteItem[]
  favoritesLoading: boolean
  favoritesError: string | null
  toggleFavorite: (biasId: string) => Promise<void>
  isFavorite: (biasId: string) => Promise<boolean>
  refreshFavorites: () => Promise<void>

  // Settings
  settings: Settings
  settingsLoading: boolean
  settingsError: string | null
  saveSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>
  refreshSettings: () => Promise<void>

  progressList: BiasProgress[]
  progressStats: ProgressStats
  progressLoading: boolean
  progressError: string | null
  markAsViewed: (biasId: string) => Promise<void>
  toggleMastered: (biasId: string) => Promise<boolean>
  isViewed: (biasId: string) => Promise<boolean>
  isMastered: (biasId: string) => Promise<boolean>
  refreshProgress: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const biasesHook = useBiases()
  const favoritesHook = useFavorites()
  const settingsHook = useSettings()
  const progressHook = useProgress()

  // Create stable hash of favorites to prevent unnecessary context re-renders
  // This prevents flickering when favorites array reference changes but content is similar
  const favoritesHash = useMemo(() => {
    if (favoritesHook.favorites.length === 0) return '0'
    // Create stable hash from sorted bias IDs
    const sortedIds = favoritesHook.favorites.map(f => f.biasId).sort().join(',')
    return `${favoritesHook.favorites.length}-${sortedIds}`
  }, [favoritesHook.favorites])

  // Create stable hash of progressList to prevent unnecessary context re-renders
  // This prevents flickering when progressList reference changes but content is similar
  // Only re-render when meaningful progress changes (new views, mastered status)
  // FIX: Don't include viewedAt timestamp in hash - only include whether bias is viewed or not
  // This prevents hash from changing every time markAsViewed updates the timestamp
  const progressListHash = useMemo(() => {
    if (progressHook.progressList.length === 0) return '0'
    // Create stable hash from progress data that matters (biasId, mastered, viewed status)
    // Don't include exact viewedAt timestamp - only whether it's viewed or not
    const sorted = [...progressHook.progressList].sort((a, b) => a.biasId.localeCompare(b.biasId))
    const hash = sorted.map(p => `${p.biasId}:${p.mastered ? '1' : '0'}:${p.viewedAt > 0 ? '1' : '0'}`).join(',')
    return `${progressHook.progressList.length}-${progressHook.progressList.filter(p => p.mastered).length}-${hash}`
  }, [progressHook.progressList])

  // Memoize context value to prevent unnecessary re-renders
  // This is critical for preventing flickering on Android where re-renders are more noticeable
  const value: AppContextType = useMemo(() => ({
    // Biases
    userBiases: biasesHook.userBiases,
    allBiases: biasesHook.allBiases,
    coreBiases: biasesHook.coreBiases,
    biasesLoading: biasesHook.loading,
    biasesError: biasesHook.error,
    addBias: biasesHook.addBias,
    updateBias: biasesHook.updateBias,
    deleteBias: biasesHook.deleteBias,
    refreshBiases: biasesHook.refresh,

    // Favorites
    favorites: favoritesHook.favorites,
    favoritesLoading: favoritesHook.loading,
    favoritesError: favoritesHook.error,
    toggleFavorite: favoritesHook.toggleFavorite,
    isFavorite: favoritesHook.isFavorite,
    refreshFavorites: favoritesHook.refresh,

    // Settings
    settings: settingsHook.settings,
    settingsLoading: settingsHook.loading,
    settingsError: null, // Settings hook doesn't have error state
    saveSetting: settingsHook.saveSetting,
    refreshSettings: settingsHook.refresh,

    progressList: progressHook.progressList,
    progressStats: progressHook.stats,
    progressLoading: progressHook.loading,
    progressError: progressHook.error,
    markAsViewed: progressHook.markAsViewed,
    toggleMastered: progressHook.toggleMastered,
    isViewed: progressHook.isViewed,
    isMastered: progressHook.isMastered,
    refreshProgress: progressHook.refresh,
  }), [
    // Only include data values that should trigger re-renders when they change
    // Functions from hooks are stable (wrapped in useCallback), so they don't need to be in deps
    // Use length for arrays to prevent re-renders when array reference changes but content is same
    biasesHook.userBiases.length,
    biasesHook.allBiases.length,
    biasesHook.coreBiases.length,
    biasesHook.loading,
    biasesHook.error,
    // FIX: Use stable hash instead of favorites.length to prevent re-renders when array reference changes
    // This prevents flickering when favorites toggle optimistically updates the array
    favoritesHash,
    favoritesHook.loading,
    favoritesHook.error,
    // For settings object, use a stable key - only re-render when theme or other critical settings change
    settingsHook.settings.theme,
    settingsHook.settings.backgroundStyle,
    settingsHook.loading,
    // FIX: Use stable hash instead of progressList.length to prevent re-renders when array reference changes
    // This prevents flickering when markAsViewed updates progressList optimistically
    progressListHash,
    // For stats, use individual values instead of object
    progressHook.stats.totalBiasesRead,
    progressHook.stats.currentStreak,
    progressHook.stats.longestStreak,
    progressHook.stats.masteredCount,
    progressHook.loading,
    progressHook.error,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

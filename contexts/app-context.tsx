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

  // Create stable comparison key to detect favorites changes
  // Include length to ensure we detect when favorites array becomes empty
  const favoritesKey = useMemo(() => {
    const ids = favoritesHook.favorites.map(f => f.biasId).sort().join(',')
    return `${favoritesHook.favorites.length}:${ids}`
  }, [favoritesHook.favorites])

  const progressKey = useMemo(() => {
    return progressHook.progressList
      .map(p => `${p.biasId}:${p.mastered ? '1' : '0'}`)
      .sort()
      .join(',')
  }, [progressHook.progressList])

  // Memoize context value to prevent unnecessary re-renders
  // Only re-render when actual data changes, not when object references change
  // IMPORTANT: Include favorites array directly in dependencies to ensure updates propagate immediately
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

    // Favorites - use the array directly to ensure immediate updates
    favorites: favoritesHook.favorites,
    favoritesLoading: favoritesHook.loading,
    favoritesError: favoritesHook.error,
    toggleFavorite: favoritesHook.toggleFavorite,
    isFavorite: favoritesHook.isFavorite,
    refreshFavorites: favoritesHook.refresh,

    // Settings
    settings: settingsHook.settings,
    settingsLoading: settingsHook.loading,
    settingsError: null,
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
    // Biases - use length to prevent re-renders when array reference changes but content is same
    biasesHook.userBiases.length,
    biasesHook.allBiases.length,
    biasesHook.coreBiases.length,
    biasesHook.loading,
    biasesHook.error,
    // Favorites - include both the key AND the actual array to ensure immediate updates
    // The key helps with memoization, but we need the array reference to change for React to detect updates
    favoritesKey,
    favoritesHook.favorites, // Include the actual array to ensure context updates immediately when favorites change
    favoritesHook.loading,
    favoritesHook.error,
    // Settings - use theme and backgroundStyle as keys
    settingsHook.settings.theme,
    settingsHook.settings.backgroundStyle,
    settingsHook.loading,
    // Progress - use stable key and stats values
    progressKey,
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

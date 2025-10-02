"use client"

import { createContext, useContext, type ReactNode } from "react"
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

  const value: AppContextType = {
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
    settingsError: settingsHook.error,
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
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

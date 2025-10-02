"use client"

import { useEffect, useState, useMemo } from "react"
import { BiasCard } from "@/components/bias-card"
import { BiasOfTheDay } from "@/components/bias-of-the-day"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { useApp } from "@/contexts/app-context"
import { getPersonalizedDailyBias, getTodayDateString } from "@/lib/daily-selector"
import type { Bias } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const {
    allBiases,
    biasesLoading,
    toggleFavorite,
    isFavorite,
    settings,
    settingsLoading,
    progressStats,
    progressList,
    progressLoading,
    markAsViewed,
    toggleMastered,
    isMastered,
  } = useApp()
  const [dailyBias, setDailyBias] = useState<Bias | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)

  const selectedDailyBias = useMemo(() => {
    if (allBiases.length > 0 && !progressLoading) {
      return getPersonalizedDailyBias(allBiases, progressList, getTodayDateString())
    }
    return null
  }, [allBiases, progressList, progressLoading])

  useEffect(() => {
    if (selectedDailyBias && !dailyBias) {
      setDailyBias(selectedDailyBias)
    }
  }, [selectedDailyBias, dailyBias])

  useEffect(() => {
    if (dailyBias) {
      // Check if favorite and mastered
      isFavorite(dailyBias.id).then(setIsFav)
      isMastered(dailyBias.id).then(setIsMast)

      // Mark as viewed
      markAsViewed(dailyBias.id)
    }
  }, [dailyBias])

  const handleToggleFavorite = async () => {
    if (!dailyBias) return
    await toggleFavorite(dailyBias.id)
    setIsFav(!isFav)
  }

  const handleToggleMastered = async () => {
    if (!dailyBias) return
    const newState = await toggleMastered(dailyBias.id)
    setIsMast(newState)
  }

  const loading = biasesLoading || settingsLoading || progressLoading

  // Generate seed from today's date for consistent background
  const seed = getTodayDateString()
    .split("-")
    .reduce((acc, val) => acc + Number.parseInt(val), 0)

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={seed} />
      <DailyHeader />

      <main className="w-full max-w-2xl mx-auto px-4 py-8" aria-label="Daily cognitive bias">
        {loading || !dailyBias ? (
          <div className="space-y-6" role="status" aria-label="Loading daily bias">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>

            <div className="glass rounded-3xl p-6 border-2 border-primary/20">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="glass rounded-2xl p-8 space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <span className="sr-only">Loading today's cognitive bias...</span>
          </div>
        ) : (
          <>
            <BiasOfTheDay bias={dailyBias} />

            <BiasCard
              bias={dailyBias}
              variant="detailed"
              isFavorite={isFav}
              onToggleFavorite={handleToggleFavorite}
              isMastered={isMast}
              onToggleMastered={handleToggleMastered}
            />
          </>
        )}
      </main>

      <Navigation />
    </div>
  )
}

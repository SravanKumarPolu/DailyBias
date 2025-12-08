"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { EmptyState } from "@/components/empty-state"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Bias } from "@/lib/types"

export default function FavoritesPage() {
  const {
    allBiases,
    biasesLoading,
    favorites,
    toggleFavorite,
    favoritesLoading,
    settings,
    toggleMastered,
    isMastered
  } = useApp()
  const [favoriteBiases, setFavoriteBiases] = useState<Bias[]>([])
  const [masteredStates, setMasteredStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    console.log("[FavoritesPage] Updating favorite biases")
    console.log("[FavoritesPage] All biases:", allBiases.length)
    console.log("[FavoritesPage] Favorites:", favorites.length)

    if (allBiases.length > 0 && favorites.length > 0) {
      const favoriteIds = new Set(favorites.map((f) => f.biasId))
      console.log("[FavoritesPage] Favorite IDs:", Array.from(favoriteIds))

      const biases = allBiases.filter((bias) => favoriteIds.has(bias.id))
      console.log("[FavoritesPage] Filtered biases:", biases.length)

      // Sort by when they were added to favorites
      biases.sort((a, b) => {
        const aFav = favorites.find((f) => f.biasId === a.id)
        const bFav = favorites.find((f) => f.biasId === b.id)
        return (bFav?.addedAt || 0) - (aFav?.addedAt || 0)
      })

      console.log("[FavoritesPage] Sorted favorite biases:", biases.map(b => b.title))
      setFavoriteBiases(biases)
    } else {
      console.log("[FavoritesPage] No favorites or biases available")
      setFavoriteBiases([])
    }
  }, [allBiases, favorites])

  // Load mastered states for favorite biases
  useEffect(() => {
    const loadMasteredStates = async () => {
      if (favoriteBiases.length > 0) {
        console.log("[FavoritesPage] Loading mastered states for", favoriteBiases.length, "favorite biases")
        const mastered: Record<string, boolean> = {}

        try {
          await Promise.all(
            favoriteBiases.map(async (bias) => {
              mastered[bias.id] = await isMastered(bias.id)
            })
          )
          setMasteredStates(mastered)
          console.log("[FavoritesPage] Loaded mastered states:", Object.keys(mastered).length)
        } catch (error) {
          console.error("[FavoritesPage] Error loading mastered states:", error)
        }
      }
    }

    loadMasteredStates()
  }, [favoriteBiases, isMastered])

  const handleToggleFavorite = async (biasId: string) => {
    console.log("[FavoritesPage] Toggling favorite for bias:", biasId)
    try {
      await toggleFavorite(biasId)
      console.log("[FavoritesPage] Successfully toggled favorite")
    } catch (error) {
      console.error("[FavoritesPage] Error toggling favorite:", error)
    }
  }

  const handleToggleMastered = async (biasId: string) => {
    console.log("[FavoritesPage] Toggling mastered for bias:", biasId)
    try {
      const newState = await toggleMastered(biasId)
      setMasteredStates(prev => ({ ...prev, [biasId]: newState }))
      console.log("[FavoritesPage] Successfully toggled mastered:", newState)
    } catch (error) {
      console.error("[FavoritesPage] Error toggling mastered:", error)
    }
  }

  const loading = biasesLoading || favoritesLoading

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={123} />
      <DailyHeader />

      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Favorites</h1>
            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">Your saved biases for quick reference</p>
          </div>

          {/* Favorites count */}
          {!loading && favoriteBiases.length > 0 && (
            <div className="text-foreground/70 flex items-center gap-2 text-base sm:text-lg">
              <Heart className="h-5 w-5 text-destructive" aria-hidden="true" />
              <span>
                {favoriteBiases.length} {favoriteBiases.length === 1 ? "favorite" : "favorites"}
              </span>
            </div>
          )}

          {/* Favorites list */}
          {loading ? (
            <div className="glass animate-pulse rounded-xl p-8 text-center sm:rounded-2xl sm:p-12" role="status" aria-live="polite" aria-busy="true" aria-label="Loading favorites">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted/50"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Loading favorites...</p>
              <span className="sr-only">Loading your saved biases...</span>
            </div>
          ) : favoriteBiases.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Start adding biases to your favorites to build your personal collection for quick reference"
              action={
                <Link href="/all">
                  <Button className="touch-target hover-lift button-press cursor-pointer transition-all duration-200">
                    Browse All Biases
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              {favoriteBiases.map((bias, index) => (
                <Link
                  key={bias.id}
                  href={`/bias/${bias.id}`}
                  className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <div className="animate-fade-in-up transition-all duration-200 group-hover:scale-[1.01] group-focus:scale-[1.01]" style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>
                    <DynamicBiasCard
                      bias={bias}
                      variant="compact"
                      isFavorite={true}
                      onToggleFavorite={() => handleToggleFavorite(bias.id)}
                      isMastered={masteredStates[bias.id]}
                      onToggleMastered={() => handleToggleMastered(bias.id)}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

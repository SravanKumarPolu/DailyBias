"use client"

import { useState, useEffect } from "react"
import { Heart, Download } from "lucide-react"
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

  const handleExport = () => {
    console.log("[FavoritesPage] Exporting favorites:", favoriteBiases.length)
    
    try {
      const data = favoriteBiases.map((bias) => ({
        title: bias.title,
        category: bias.category,
        summary: bias.summary,
        why: bias.why,
        counter: bias.counter,
        source: bias.source,
        addedAt: favorites.find(f => f.biasId === bias.id)?.addedAt || Date.now()
      }))

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bias-daily-favorites-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      console.log("[FavoritesPage] Export completed successfully")
    } catch (error) {
      console.error("[FavoritesPage] Export failed:", error)
    }
  }

  const loading = biasesLoading || favoritesLoading

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={123} />
      <DailyHeader />

      <main id="main-content" className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl md:text-4xl">Favorites</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Your saved biases for quick reference</p>
            </div>
            {favoriteBiases.length > 0 && (
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="glass border-border/50 touch-target hover-lift button-press shrink-0 cursor-pointer bg-transparent transition-all duration-200 sm:size-default"
                aria-label="Export favorites as JSON"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>

          {/* Favorites count */}
          {!loading && favoriteBiases.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
              <Heart className="h-4 w-4 text-destructive" aria-hidden="true" />
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
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {favoriteBiases.map((bias, index) => (
                <Link 
                  key={bias.id} 
                  href={`/bias/${bias.id}`} 
                  className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <div className="animate-fade-in-up transition-all duration-200 group-hover:scale-[1.01] group-focus:scale-[1.01]">
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

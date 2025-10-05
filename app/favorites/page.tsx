"use client"

import { useState, useEffect } from "react"
import { Heart, Download } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Bias } from "@/lib/types"

export default function FavoritesPage() {
  const { allBiases, biasesLoading, favorites, toggleFavorite, favoritesLoading, settings } = useApp()
  const [favoriteBiases, setFavoriteBiases] = useState<Bias[]>([])

  useEffect(() => {
    if (allBiases.length > 0 && favorites.length > 0) {
      const favoriteIds = new Set(favorites.map((f) => f.biasId))
      const biases = allBiases.filter((bias) => favoriteIds.has(bias.id))
      // Sort by when they were added to favorites
      biases.sort((a, b) => {
        const aFav = favorites.find((f) => f.biasId === a.id)
        const bFav = favorites.find((f) => f.biasId === b.id)
        return (bFav?.addedAt || 0) - (aFav?.addedAt || 0)
      })
      setFavoriteBiases(biases)
    } else {
      setFavoriteBiases([])
    }
  }, [allBiases, favorites])

  const handleToggleFavorite = async (biasId: string) => {
    await toggleFavorite(biasId)
  }

  const handleExport = () => {
    const data = favoriteBiases.map((bias) => ({
      title: bias.title,
      category: bias.category,
      summary: bias.summary,
      why: bias.why,
      counter: bias.counter,
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bias-daily-favorites-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loading = biasesLoading || favoritesLoading

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={123} />
      <DailyHeader />

      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Favorites</h1>
              <p className="text-muted-foreground">Your saved biases for quick reference</p>
            </div>
            {favoriteBiases.length > 0 && (
              <Button onClick={handleExport} variant="outline" className="glass border-border/50 bg-transparent cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Favorites count */}
          {!loading && <div className="text-sm text-muted-foreground">{favoriteBiases.length} saved biases</div>}

          {/* Favorites list */}
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">Loading favorites...</p>
            </div>
          ) : favoriteBiases.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center space-y-4">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium mb-2">No favorites yet</p>
                <p className="text-muted-foreground mb-4">
                  Start adding biases to your favorites to build your personal collection
                </p>
                <Link href="/all" className="cursor-pointer">
                  <Button className="cursor-pointer">Browse All Biases</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteBiases.map((bias) => (
                <Link key={bias.id} href={`/bias/${bias.id}`} className="cursor-pointer">
                  <DynamicBiasCard
                    bias={bias}
                    variant="compact"
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(bias.id)}
                  />
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

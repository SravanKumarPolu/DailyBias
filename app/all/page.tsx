"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Filter, Sparkles, X } from "lucide-react"
import { BiasCard } from "@/components/bias-card"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { RecommendationCard } from "@/components/recommendation-card"
import { useApp } from "@/contexts/app-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BiasCategory } from "@/lib/types"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { validateSearchQuery } from "@/lib/validation"
import { searchBiases } from "@/lib/search-utils"
import { getBalancedRecommendation } from "@/lib/daily-selector"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"

const categories: BiasCategory[] = ["decision", "memory", "social", "perception", "misc"]

export default function AllBiasesPage() {
  const {
    allBiases,
    biasesLoading,
    favorites,
    toggleFavorite,
    isFavorite,
    settings,
    toggleMastered,
    isMastered,
    progressList,
    progressLoading,
  } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedCategories, setSelectedCategories] = useState<BiasCategory[]>([])
  const [favStates, setFavStates] = useState<Record<string, boolean>>({})
  const [masteredStates, setMasteredStates] = useState<Record<string, boolean>>({})

  // Load favorite and mastered states
  useEffect(() => {
    const loadStates = async () => {
      const favs: Record<string, boolean> = {}
      const masts: Record<string, boolean> = {}
      await Promise.all(
        allBiases.map(async (bias) => {
          favs[bias.id] = await isFavorite(bias.id)
          masts[bias.id] = await isMastered(bias.id)
        }),
      )
      setFavStates(favs)
      setMasteredStates(masts)
    }
    if (allBiases.length > 0) {
      loadStates()
    }
  }, [allBiases, favorites, isFavorite, isMastered])

  const recommendation = useMemo(() => {
    if (progressLoading || allBiases.length === 0) return null
    return getBalancedRecommendation(allBiases, progressList)
  }, [allBiases, progressList, progressLoading])

  const searchResults = useMemo(() => {
    const sanitizedQuery = validateSearchQuery(debouncedSearchQuery)

    // Use enhanced search function
    const results = searchBiases(allBiases, sanitizedQuery)

    // Filter by category
    return results.filter((result) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(result.bias.category)
      return matchesCategory
    })
  }, [allBiases, debouncedSearchQuery, selectedCategories])

  const toggleCategory = useCallback((category: BiasCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }, [])

  const handleToggleFavorite = useCallback(
    async (biasId: string) => {
      await toggleFavorite(biasId)
      setFavStates((prev) => ({ ...prev, [biasId]: !prev[biasId] }))
    },
    [toggleFavorite],
  )

  const handleToggleMastered = useCallback(
    async (biasId: string) => {
      const newState = await toggleMastered(biasId)
      setMasteredStates((prev) => ({ ...prev, [biasId]: newState }))
    },
    [toggleMastered],
  )

  const hasActiveSearch = searchQuery.trim().length > 0
  const avgScore = hasActiveSearch
    ? searchResults.reduce((sum, r) => sum + r.score, 0) / Math.max(searchResults.length, 1)
    : 1

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={42} />
      <DailyHeader />

      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2 font-serif">All Biases</h1>
            <p className="text-muted-foreground">Browse all {allBiases.length} cognitive biases from the collection</p>
          </div>

          {!hasActiveSearch && recommendation && (
            <RecommendationCard bias={recommendation} reason="Continue your learning journey" />
          )}

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search titles, descriptions, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 glass border-border/50"
                maxLength={200}
                aria-label="Search biases"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass border-border/50 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results count and search quality */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing {searchResults.length} of {allBiases.length} biases
            </p>
            {hasActiveSearch && avgScore > 0.7 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                High relevance
              </Badge>
            )}
          </div>

          {/* Biases grid */}
          {biasesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 space-y-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground mb-2">No biases found matching your criteria.</p>
              {hasActiveSearch && (
                <p className="text-sm text-muted-foreground">Try adjusting your search terms or filters.</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map(({ bias, score, matchedFields }) => (
                <Link key={bias.id} href={`/bias/${bias.id}`}>
                  <div className="relative">
                    <BiasCard
                      bias={bias}
                      variant="compact"
                      isFavorite={favStates[bias.id]}
                      onToggleFavorite={() => handleToggleFavorite(bias.id)}
                      isMastered={masteredStates[bias.id]}
                      onToggleMastered={() => handleToggleMastered(bias.id)}
                    />
                    {hasActiveSearch && score > 0.8 && (
                      <div className="absolute top-2 right-2 pointer-events-none">
                        <Badge variant="secondary" className="text-xs">
                          Best match
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Navigation />
    </div>
  )
}

"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Search, Filter, Sparkles, X, SearchX, Loader2 } from "lucide-react"
import { useLazyLoad } from "@/hooks/use-virtual-scroll"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { DynamicRecommendationCard } from "@/components/dynamic-recommendation-card"
import { EmptyState } from "@/components/empty-state"
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
import { logger } from "@/lib/logger"

const categories: BiasCategory[] = ["decision", "memory", "social", "perception", "misc"]

export default function AllBiasesPage() {
  const {
    allBiases,
    biasesLoading,
    favorites,
    toggleFavorite,
    settings,
    toggleMastered,
    isMastered,
    progressList,
    progressLoading,
  } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedCategories, setSelectedCategories] = useState<BiasCategory[]>([])

  // Optimize: Use favorites from context instead of loading individually
  // Only load states for biases not in favorites list (for mastered state)
  const favStates = useMemo(() => {
    const favMap: Record<string, boolean> = {}
    favorites.forEach((fav) => {
      favMap[fav.biasId] = true
    })
    return favMap
  }, [favorites])

  // Load mastered states only (favorites are already in context)
  // Use a ref to track loaded bias IDs to avoid redundant calls
  const [masteredStates, setMasteredStates] = useState<Record<string, boolean>>({})
  const loadedBiasIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const loadMasteredStates = async () => {
      // Only load states for biases we haven't loaded yet
      const biasesToLoad = allBiases.filter((bias) => !loadedBiasIdsRef.current.has(bias.id))

      if (biasesToLoad.length === 0) return

      logger.debug("[AllPage] Loading mastered states for", biasesToLoad.length, "new biases")

      try {
        // Batch load mastered states
        const masts: Record<string, boolean> = {}
        await Promise.all(
          biasesToLoad.map(async (bias) => {
            masts[bias.id] = await isMastered(bias.id)
            loadedBiasIdsRef.current.add(bias.id)
          })
        )
        setMasteredStates((prev) => ({ ...prev, ...masts }))
        logger.debug("[AllPage] Loaded mastered states for", biasesToLoad.length, "biases")
      } catch (error) {
        logger.error("[AllPage] Error loading mastered states:", error)
      }
    }

    if (allBiases.length > 0) {
      loadMasteredStates()
    }
  }, [allBiases.length, isMastered]) // Only depend on length, not array reference

  const recommendation = useMemo(() => {
    if (progressLoading || allBiases.length === 0) return null
    return getBalancedRecommendation(allBiases, progressList)
  }, [allBiases, progressList, progressLoading])

  const searchResults = useMemo(() => {
    logger.debug("[AllPage] Calculating search results")
    logger.debug("[AllPage] Query:", debouncedSearchQuery)
    logger.debug("[AllPage] Selected categories:", selectedCategories)
    logger.debug("[AllPage] Available biases:", allBiases.length)

    const sanitizedQuery = validateSearchQuery(debouncedSearchQuery)
    logger.debug("[AllPage] Sanitized query:", sanitizedQuery)

    // Use enhanced search function
    const results = searchBiases(allBiases, sanitizedQuery)
    logger.debug("[AllPage] Search results before category filter:", results.length)

    // Filter by category
    const filteredResults = results.filter((result) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(result.bias.category)
      return matchesCategory
    })

    logger.debug("[AllPage] Final filtered results:", filteredResults.length)
    return filteredResults
  }, [allBiases, debouncedSearchQuery, selectedCategories])

  const toggleCategory = useCallback((category: BiasCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }, [])

  const handleToggleFavorite = useCallback(
    async (biasId: string) => {
      await toggleFavorite(biasId)
      // State will update automatically from context favorites
    },
    [toggleFavorite]
  )

  const handleToggleMastered = useCallback(
    async (biasId: string) => {
      const newState = await toggleMastered(biasId)
      setMasteredStates((prev) => ({ ...prev, [biasId]: newState }))
    },
    [toggleMastered]
  )

  const hasActiveSearch = searchQuery.trim().length > 0
  const avgScore = useMemo(() => {
    if (!hasActiveSearch) return 1
    return searchResults.reduce((sum, r) => sum + r.score, 0) / Math.max(searchResults.length, 1)
  }, [hasActiveSearch, searchResults])

  // Use lazy loading for better performance
  const { visibleItems: visibleResults, hasMore, loadMoreRef } = useLazyLoad(
    searchResults,
    20, // Initial count
    10  // Increment
  )

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={42} />
      <DailyHeader />

      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16" aria-label="All biases">
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl">All Biases</h1>
            <p className="text-foreground/80 text-base sm:text-lg lg:text-xl xl:text-xl 2xl:text-xl leading-relaxed text-pretty">
              Browse all {allBiases.length} cognitive biases from the collection
            </p>
          </div>

          {!hasActiveSearch && recommendation && (
            <DynamicRecommendationCard
              bias={recommendation}
              reason="Continue your learning journey"
            />
          )}

          {/* Search and Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search titles, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass border-border/50 pr-9 pl-9 text-sm sm:text-base"
                maxLength={200}
                aria-label="Search biases"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="glass border-border/50 w-full bg-transparent text-sm sm:w-auto sm:text-base"
                  aria-label={`Filter biases by category${selectedCategories.length > 0 ? ` (${selectedCategories.length} selected)` : ''}`}
                >
                  <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
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
                    <span className="capitalize">{category}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results count and search quality */}
          <div className="flex items-center justify-between gap-2 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
            <p className="text-foreground/80">
              Showing {searchResults.length} of {allBiases.length}
            </p>
            {hasActiveSearch && avgScore > 0.7 && (
              <Badge variant="secondary" className="gap-1 text-xs sm:text-sm lg:text-base xl:text-base 2xl:text-lg">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="xs:inline hidden">High relevance</span>
                <span className="xs:hidden">Relevant</span>
              </Badge>
            )}
          </div>

          {/* Biases grid */}
          {biasesLoading ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2" role="status" aria-live="polite" aria-busy="true" aria-label="Loading biases">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass space-y-3 rounded-xl p-4 sm:rounded-2xl sm:p-6">
                  <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
                  <Skeleton className="h-6 w-full sm:h-8" />
                  <Skeleton className="h-12 w-full sm:h-16" />
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No results found"
              description={hasActiveSearch
                ? `No biases match "${searchQuery}". Try adjusting your search terms or filters.`
                : "No biases match your current filters. Try selecting different categories."
              }
              action={
                (hasActiveSearch || selectedCategories.length > 0) && (
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategories([])
                    }}
                    variant="outline"
                    className="cursor-pointer"
                    aria-label="Clear all search filters"
                  >
                    Clear Filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              {/* FIX: Use responsive grid that works on all screen sizes */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {visibleResults.map(({ bias, score }, index) => (
                <Link
                  key={bias.id}
                  href={`/bias/${bias.id}`}
                  className="group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <div className="relative transition-all duration-200 group-hover:scale-[1.01] group-focus:scale-[1.01]">
                    <DynamicBiasCard
                      bias={bias}
                      variant="compact"
                      isFavorite={favStates[bias.id]}
                      onToggleFavorite={() => handleToggleFavorite(bias.id)}
                      isMastered={masteredStates[bias.id]}
                      onToggleMastered={() => handleToggleMastered(bias.id)}
                    />
                    {hasActiveSearch && score > 0.8 && (
                      <div className="animate-fade-in pointer-events-none absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs shadow-sm">
                          Best match
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more indicator */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-8"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more biases...</span>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

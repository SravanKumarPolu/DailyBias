"use client"

import { useState, useEffect, useRef } from "react"
import type { FavoriteItem } from "@/lib/types"
import { getFavorites, addFavorite, removeFavorite, isFavorite } from "@/lib/db"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    try {
      logger.debug("[FavoritesHook] Loading favorites...")
      setError(null)
      const favs = await getFavorites()
      logger.debug("[FavoritesHook] Loaded favorites:", favs.length, favs.map(f => f.biasId))
      setFavorites(favs)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load favorites"
      logger.error("[FavoritesHook] Error loading favorites:", error)
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Track reload timeout to debounce
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  async function toggleFavorite(biasId: string) {
    try {
      logger.debug("[FavoritesHook] Toggling favorite for bias:", biasId)
      const isFav = await isFavorite(biasId)
      logger.debug("[FavoritesHook] Current favorite status:", isFav)
      
      // Optimistically update local state to prevent flickering
      setFavorites((prev) => {
        if (isFav) {
          // Remove favorite
          return prev.filter((f) => f.biasId !== biasId)
        } else {
          // Add favorite
          return [...prev, { biasId, addedAt: Date.now() }]
        }
      })
      
      if (isFav) {
        logger.debug("[FavoritesHook] Removing favorite")
        await removeFavorite(biasId)
      } else {
        logger.debug("[FavoritesHook] Adding favorite")
        await addFavorite(biasId)
      }
      
      // Reload in background to sync with database (non-blocking, debounced)
      // This prevents flickering from immediate full reload
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current)
      }
      reloadTimeoutRef.current = setTimeout(() => {
        loadFavorites().catch((error) => {
          logger.error("[FavoritesHook] Background favorites reload failed:", error)
        })
        reloadTimeoutRef.current = null
      }, 500) // Debounce reloads by 500ms
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle favorite"
      logger.error("[FavoritesHook] Error toggling favorite:", error)
      // Revert optimistic update on error
      setFavorites((prev) => {
        const isFav = prev.some((f) => f.biasId === biasId)
        if (isFav) {
          return prev.filter((f) => f.biasId !== biasId)
        } else {
          return [...prev, { biasId, addedAt: Date.now() }]
        }
      })
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  async function checkIsFavorite(biasId: string): Promise<boolean> {
    try {
      return await isFavorite(biasId)
    } catch (error) {
      logger.error("[DailyBias] Failed to check favorite status:", error)
      return false
    }
  }

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorite: checkIsFavorite,
    refresh: loadFavorites,
  }
}

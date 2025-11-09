"use client"

import { useState, useEffect } from "react"
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

  async function toggleFavorite(biasId: string) {
    try {
      logger.debug("[FavoritesHook] Toggling favorite for bias:", biasId)
      const isFav = await isFavorite(biasId)
      logger.debug("[FavoritesHook] Current favorite status:", isFav)
      
      if (isFav) {
        logger.debug("[FavoritesHook] Removing favorite")
        await removeFavorite(biasId)
      } else {
        logger.debug("[FavoritesHook] Adding favorite")
        await addFavorite(biasId)
      }
      
      logger.debug("[FavoritesHook] Reloading favorites after toggle")
      await loadFavorites()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle favorite"
      logger.error("[FavoritesHook] Error toggling favorite:", error)
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

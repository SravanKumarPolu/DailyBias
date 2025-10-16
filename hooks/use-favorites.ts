"use client"

import { useState, useEffect } from "react"
import type { FavoriteItem } from "@/lib/types"
import { getFavorites, addFavorite, removeFavorite, isFavorite } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    try {
      console.log("[FavoritesHook] Loading favorites...")
      setError(null)
      const favs = await getFavorites()
      console.log("[FavoritesHook] Loaded favorites:", favs.length, favs.map(f => f.biasId))
      setFavorites(favs)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load favorites"
      console.error("[FavoritesHook] Error loading favorites:", error)
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
      console.log("[FavoritesHook] Toggling favorite for bias:", biasId)
      const isFav = await isFavorite(biasId)
      console.log("[FavoritesHook] Current favorite status:", isFav)
      
      if (isFav) {
        console.log("[FavoritesHook] Removing favorite")
        await removeFavorite(biasId)
      } else {
        console.log("[FavoritesHook] Adding favorite")
        await addFavorite(biasId)
      }
      
      console.log("[FavoritesHook] Reloading favorites after toggle")
      await loadFavorites()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle favorite"
      console.error("[FavoritesHook] Error toggling favorite:", error)
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
      console.error("[DailyBias] Failed to check favorite status:", error)
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

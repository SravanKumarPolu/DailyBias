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
      setError(null)
      const favs = await getFavorites()
      setFavorites(favs)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load favorites"
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
      const isFav = await isFavorite(biasId)
      if (isFav) {
        await removeFavorite(biasId)
      } else {
        await addFavorite(biasId)
      }
      await loadFavorites()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle favorite"
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

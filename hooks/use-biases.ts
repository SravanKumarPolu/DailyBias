"use client"

import { useState, useEffect, useCallback } from "react"
import type { Bias } from "@/lib/types"
import { getUserBiases, addUserBias, updateUserBias, deleteUserBias } from "@/lib/db"
import { getCoreBiases, getAllBiases } from "@/lib/daily-selector"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useBiases() {
  // Initialize with core biases immediately so app can render
  const coreBiases = getCoreBiases()
  logger.debug("[BiasesHook] Initializing - core biases count:", coreBiases.length)
  
  const [userBiases, setUserBiases] = useState<Bias[]>([])
  const [allBiases, setAllBiases] = useState<Bias[]>(coreBiases) // Start with core biases
  // Only show loading if we have NO biases at all (neither core nor user)
  const [loading, setLoading] = useState(coreBiases.length === 0)
  const [error, setError] = useState<string | null>(null)
  
  // Log initial state and ensure core biases are always set
  // Only run once on mount to prevent re-renders
  useEffect(() => {
    logger.debug("[BiasesHook] Initial state - allBiases:", allBiases.length, "loading:", loading, "coreBiases:", coreBiases.length)
    // Always ensure core biases are set, even if something went wrong
    if (coreBiases.length > 0) {
      if (allBiases.length === 0) {
        logger.warn("[BiasesHook] Fixing empty allBiases - setting to core biases")
        setAllBiases(coreBiases)
      }
      // If we have core biases, we're not loading
      if (loading && coreBiases.length > 0) {
        setLoading(false)
      }
    } else {
      logger.error("[BiasesHook] CRITICAL: No core biases available!")
    }
    // Empty deps - only run once on mount to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBiases = useCallback(async () => {
    try {
      logger.debug("[BiasesHook] Loading user biases...")
      setError(null)
      
      // Always ensure core biases are available, even if IndexedDB fails
      const coreBiases = getCoreBiases()
      logger.debug("[BiasesHook] Core biases available:", coreBiases.length)
      
      // Try to load user biases from IndexedDB
      let userBiasesData: Bias[] = []
      try {
        userBiasesData = await getUserBiases()
        logger.debug("[BiasesHook] Loaded user biases:", userBiasesData.length, userBiasesData.map(b => b.title))
      } catch (dbError) {
        logger.warn("[BiasesHook] IndexedDB failed, using core biases only:", dbError)
        // Continue with empty user biases - core biases will still work
      }
      
      setUserBiases(userBiasesData)
      const allBiasesData = getAllBiases(userBiasesData)
      logger.debug("[BiasesHook] Total biases (core + user):", allBiasesData.length)
      
      if (allBiasesData.length === 0) {
        logger.error("[BiasesHook] No biases available at all - this should not happen!")
        throw new Error("No biases data available. Please refresh the app.")
      }
      
      setAllBiases(allBiasesData)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load biases"
      logger.error("[BiasesHook] Error loading biases:", error)
      setError(message)
      
      // Even on error, try to set core biases as fallback
      const coreBiases = getCoreBiases()
      if (coreBiases.length > 0) {
        logger.debug("[BiasesHook] Using core biases as fallback")
        setAllBiases(coreBiases)
        setUserBiases([])
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBiases()
  }, [loadBiases])

  const addBias = useCallback(
    async (bias: Bias) => {
      try {
        logger.debug("[BiasesHook] Adding bias:", bias.title)
        await addUserBias(bias)
        logger.debug("[BiasesHook] Successfully added bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias added successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add bias"
        logger.error("[BiasesHook] Error adding bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  const updateBias = useCallback(
    async (bias: Bias) => {
      try {
        logger.debug("[BiasesHook] Updating bias:", bias.title)
        await updateUserBias(bias)
        logger.debug("[BiasesHook] Successfully updated bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias updated successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update bias"
        logger.error("[BiasesHook] Error updating bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  const deleteBias = useCallback(
    async (id: string) => {
      try {
        logger.debug("[BiasesHook] Deleting bias:", id)
        await deleteUserBias(id)
        logger.debug("[BiasesHook] Successfully deleted bias, reloading...")
        await loadBiases()
        toast({
          title: "Success",
          description: "Bias deleted successfully",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete bias"
        logger.error("[BiasesHook] Error deleting bias:", error)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadBiases]
  )

  return {
    userBiases,
    allBiases,
    coreBiases: getCoreBiases(),
    loading,
    error,
    addBias,
    updateBias,
    deleteBias,
    refresh: loadBiases,
  }
}

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Bias, BiasProgress } from "@/lib/types"
import { getPersonalizedDailyBias, getTodayDateString, getCoreBiases } from "@/lib/daily-selector"
import { getCachedDailyBias, cacheDailyBias, getStoredDailyBias, getCachedDailyBiasAsync, cacheDailyBiasAsync } from "@/lib/storage"
import { logger } from "@/lib/logger"

interface UseDailyBiasOptions {
  allBiases: Bias[]
  progressList: BiasProgress[]
}

interface UseDailyBiasReturn {
  dailyBias: Bias | null
  isLoading: boolean
  refresh: () => void
}

/**
 * Custom hook for managing daily bias selection
 * Handles caching, date changes, and bias selection logic
 */
export function useDailyBias({ allBiases, progressList }: UseDailyBiasOptions): UseDailyBiasReturn {
  const [dailyBias, setDailyBias] = useState<Bias | null>(() => {
    // Initialize from storage on mount
    if (typeof window === "undefined") return null
    
    const stored = getStoredDailyBias()
    const today = getTodayDateString()
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    if (stored && stored.date === today && availableBiases.length > 0) {
      const cached = availableBiases.find((b) => b.id === stored.biasId)
      if (cached) {
        logger.debug("[useDailyBias] Initialized from storage:", cached.title)
        return cached
      }
    }
    
    // Fallback to cached or first bias
    if (availableBiases.length > 0) {
      const cachedBiasId = getCachedDailyBias(today)
      if (cachedBiasId) {
        const cached = availableBiases.find((b) => b.id === cachedBiasId)
        if (cached) return cached
      }
      return availableBiases[0]
    }
    
    return null
  })

  const [isLoading, setIsLoading] = useState(false)
  const lastDateRef = useRef<string | null>(null)
  const calculatedBiasIdRef = useRef<string | null>(null)

  // Calculate daily bias for current date (async to check IndexedDB)
  const calculateDailyBias = useCallback(async (date: string): Promise<Bias | null> => {
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    if (availableBiases.length === 0) {
      logger.warn("[useDailyBias] No biases available for calculation")
      return null
    }

    // Check cache first (try async IndexedDB, fallback to sync localStorage)
    const cachedBiasId = await getCachedDailyBiasAsync(date) || getCachedDailyBias(date)
    if (cachedBiasId) {
      const cached = availableBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        calculatedBiasIdRef.current = cached.id
        return cached
      }
    }

    // Calculate new bias
    try {
      const newBias = getPersonalizedDailyBias(availableBiases, progressList, date)
      await cacheDailyBiasAsync(date, newBias.id)
      cacheDailyBias(date, newBias.id) // Also cache synchronously for immediate access
      calculatedBiasIdRef.current = newBias.id
      logger.debug("[useDailyBias] Calculated new bias:", newBias.title)
      return newBias
    } catch (error) {
      logger.error("[useDailyBias] Error calculating bias:", error)
      // Fallback to first bias
      return availableBiases[0] || null
    }
  }, [allBiases, progressList])

  // Update daily bias when date or biases change
  useEffect(() => {
    const today = getTodayDateString()
    
    // Skip if already calculated for today
    if (lastDateRef.current === today && calculatedBiasIdRef.current) {
      return
    }

    // Date changed or first load
    if (lastDateRef.current !== today) {
      setIsLoading(true)
      
      calculateDailyBias(today).then((newBias) => {
        if (newBias) {
          setDailyBias(newBias)
          lastDateRef.current = today
        }
        setIsLoading(false)
      }).catch((error) => {
        logger.error("[useDailyBias] Error in effect:", error)
        setIsLoading(false)
      })
    }
  }, [calculateDailyBias, allBiases.length])

  // Ensure we always have a bias if biases are available
  useEffect(() => {
    if (!dailyBias && allBiases.length > 0) {
      const today = getTodayDateString()
      calculateDailyBias(today).then((newBias) => {
        if (newBias) {
          setDailyBias(newBias)
          lastDateRef.current = today
        }
      }).catch((error) => {
        logger.error("[useDailyBias] Error ensuring bias:", error)
      })
    }
  }, [dailyBias, allBiases.length, calculateDailyBias])

  const refresh = useCallback(() => {
    const today = getTodayDateString()
    lastDateRef.current = null // Force recalculation
    calculatedBiasIdRef.current = null
    setIsLoading(true)
    calculateDailyBias(today).then((newBias) => {
      if (newBias) {
        setDailyBias(newBias)
        lastDateRef.current = today
      }
      setIsLoading(false)
    }).catch((error) => {
      logger.error("[useDailyBias] Error refreshing:", error)
      setIsLoading(false)
    })
  }, [calculateDailyBias])

  return {
    dailyBias,
    isLoading,
    refresh,
  }
}


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
  // Always start with null to ensure server and client match
  // This prevents hydration mismatches
  const [dailyBias, setDailyBias] = useState<Bias | null>(null)

  // Start with loading true on server, will be set to false after first calculation on client
  // BUT: If we have biases available immediately, start with loading false
  const availableBiasesOnMount = allBiases.length > 0 ? allBiases : getCoreBiases()
  const [isLoading, setIsLoading] = useState(availableBiasesOnMount.length === 0)
  const lastDateRef = useRef<string | null>(null)
  const calculatedBiasIdRef = useRef<string | null>(null)

  // Calculate daily bias for current date (async to check IndexedDB)
  const calculateDailyBias = useCallback(async (date: string): Promise<Bias | null> => {
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    if (availableBiases.length === 0) {
      logger.warn("[useDailyBias] No biases available for calculation")
      return null
    }

    // Check cache first (try async IndexedDB with timeout, fallback to sync localStorage)
    let cachedBiasId: string | null = null
    try {
      // Add timeout to IndexedDB call to prevent hanging
      const cachePromise = getCachedDailyBiasAsync(date)
      const timeoutPromise = new Promise<string | null>((resolve) => {
        setTimeout(() => resolve(null), 1000) // 1 second timeout for IndexedDB
      })
      cachedBiasId = await Promise.race([cachePromise, timeoutPromise]) || getCachedDailyBias(date)
    } catch (error) {
      // If IndexedDB fails, use sync localStorage
      logger.debug("[useDailyBias] IndexedDB cache check failed, using localStorage:", error)
      cachedBiasId = getCachedDailyBias(date)
    }
    
    if (cachedBiasId) {
      const cached = availableBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        calculatedBiasIdRef.current = cached.id
        logger.debug("[useDailyBias] Using cached bias:", cached.title)
        return cached
      }
    }

    // Calculate new bias (synchronous, should be fast)
    try {
      const newBias = getPersonalizedDailyBias(availableBiases, progressList, date)
      // Cache asynchronously but don't wait for it
      cacheDailyBiasAsync(date, newBias.id).catch((err) => {
        logger.debug("[useDailyBias] Failed to cache in IndexedDB, using localStorage only:", err)
      })
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
  // Only run on client to prevent hydration mismatches
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Ensure we have biases available (use core biases as fallback)
    // IMPORTANT: Use current allBiases from the hook parameter, not from closure
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    if (availableBiases.length === 0) {
      logger.warn("[useDailyBias] No biases available, cannot calculate daily bias")
      setIsLoading(false)
      return
    }
    
    const today = getTodayDateString()
    logger.debug("[useDailyBias] Effect running - date:", today, "allBiases:", allBiases.length, "availableBiases:", availableBiases.length, "dailyBias:", dailyBias?.title || "null")
    
    // Skip if already calculated for today AND we have a bias AND date hasn't changed
    if (lastDateRef.current === today && calculatedBiasIdRef.current && dailyBias) {
      logger.debug("[useDailyBias] Already calculated for today, skipping")
      setIsLoading(false)
      return
    }

    // Date changed or first load or no bias
    // IMPORTANT: Calculate bias if date changed OR we don't have a bias for today
    if (lastDateRef.current !== today || !dailyBias) {
      logger.debug("[useDailyBias] Date changed or first load or no bias, calculating bias")
      
      // IMMEDIATE FALLBACK: Set first bias immediately to prevent loading state
      // This ensures the page never stays in loading state indefinitely
      if (!dailyBias && availableBiases.length > 0) {
        const tempBias = availableBiases[0]
        logger.debug("[useDailyBias] Setting immediate fallback bias:", tempBias.title)
        setDailyBias(tempBias)
        setIsLoading(false)
        lastDateRef.current = today
        calculatedBiasIdRef.current = tempBias.id
      }
      
      // Now calculate the proper bias asynchronously
      setIsLoading(true)
      
      // Try to load from storage first for faster initial render
      const stored = getStoredDailyBias()
      
      if (stored && stored.date === today) {
        const cached = availableBiases.find((b) => b.id === stored.biasId)
        if (cached) {
          logger.debug("[useDailyBias] Loaded from storage:", cached.title)
          setDailyBias(cached)
          lastDateRef.current = today
          calculatedBiasIdRef.current = cached.id
          setIsLoading(false)
          return
        }
      }
      
      // Fallback to cached or calculate new
      const cachedBiasId = getCachedDailyBias(today)
      if (cachedBiasId) {
        const cached = availableBiases.find((b) => b.id === cachedBiasId)
        if (cached) {
          logger.debug("[useDailyBias] Loaded from cache:", cached.title)
          setDailyBias(cached)
          lastDateRef.current = today
          calculatedBiasIdRef.current = cached.id
          setIsLoading(false)
          return
        }
      }
      
      // Calculate new bias with timeout fallback
      const calculationStartTime = Date.now()
      const calculationPromise = calculateDailyBias(today)
      const timeoutPromise = new Promise<Bias | null>((resolve) => {
        setTimeout(() => {
          const elapsed = Date.now() - calculationStartTime
          logger.warn(`[useDailyBias] Calculation timeout after ${elapsed}ms, using first bias`)
          resolve(availableBiases[0] || null)
        }, 2000)
      })
      
      Promise.race([calculationPromise, timeoutPromise]).then((newBias) => {
        logger.debug("[useDailyBias] Got bias:", newBias?.title || "null")
        if (newBias) {
          setDailyBias(newBias)
          lastDateRef.current = today
          calculatedBiasIdRef.current = newBias.id
        } else if (availableBiases.length > 0) {
          // Ultimate fallback: use first bias
          logger.warn("[useDailyBias] No bias from calculation, using first bias")
          setDailyBias(availableBiases[0])
          lastDateRef.current = today
          calculatedBiasIdRef.current = availableBiases[0].id
        }
        setIsLoading(false)
      }).catch((error) => {
        logger.error("[useDailyBias] Error in effect:", error)
        // Fallback to first bias if calculation fails
        if (availableBiases.length > 0) {
          logger.warn("[useDailyBias] Using fallback bias due to error:", availableBiases[0].title)
          setDailyBias(availableBiases[0])
          lastDateRef.current = today
          calculatedBiasIdRef.current = availableBiases[0].id
        }
        setIsLoading(false)
      })
    } else {
      // Date hasn't changed and we have a bias, ensure loading is false
        setIsLoading(false)
    }
  }, [calculateDailyBias, allBiases, dailyBias, progressList])

  // Ensure we always have a bias if biases are available
  // Only run on client to prevent hydration mismatches
  // This is a safety net in case the main effect doesn't run or fails
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    // If we have biases but no daily bias after a delay, force calculation
    // This handles cases where the main effect doesn't trigger or takes too long
    if (!dailyBias && availableBiases.length > 0) {
      logger.debug("[useDailyBias] Safety net: No bias but biases available, will calculate after delay")
      const today = getTodayDateString()
      
      // Use a delay to let the main effect try first, but ensure we always get a bias
      const timeoutId = setTimeout(() => {
        // Double-check we still don't have a bias
        // Use a ref check to avoid stale closure
        if (availableBiases.length > 0) {
          logger.warn("[useDailyBias] Safety net triggered: No bias after delay, forcing calculation")
          setIsLoading(true)
          calculateDailyBias(today).then((newBias) => {
            if (newBias) {
              logger.debug("[useDailyBias] Safety net calculated bias:", newBias.title)
              setDailyBias(newBias)
              lastDateRef.current = today
              calculatedBiasIdRef.current = newBias.id
            } else {
              // Ultimate fallback: use first bias
              logger.warn("[useDailyBias] Using first bias as ultimate fallback")
              setDailyBias(availableBiases[0])
              lastDateRef.current = today
              calculatedBiasIdRef.current = availableBiases[0].id
            }
            setIsLoading(false)
          }).catch((error) => {
            logger.error("[useDailyBias] Error ensuring bias:", error)
            // Fallback to first bias
            if (availableBiases.length > 0) {
              logger.warn("[useDailyBias] Using first bias due to error")
              setDailyBias(availableBiases[0])
              lastDateRef.current = today
              calculatedBiasIdRef.current = availableBiases[0].id
            }
            setIsLoading(false)
          })
        }
      }, 3000) // Wait 3 seconds before safety net kicks in
      
      return () => clearTimeout(timeoutId)
    }
    // Explicitly return undefined if condition is not met
    return undefined;
  }, [dailyBias, allBiases, calculateDailyBias])

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


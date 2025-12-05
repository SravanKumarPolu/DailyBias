import { logger } from "./logger"
import { getCachedDaily, setCachedDaily } from "./db"

// LocalStorage helpers for simple flags (keep for non-critical flags)
export function getLocalFlag(key: string, defaultValue = false): boolean {
  if (typeof window === "undefined") return defaultValue
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : defaultValue
}

export function setLocalFlag(key: string, value: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getLocalString(key: string, defaultValue = ""): string {
  if (typeof window === "undefined") return defaultValue
  return localStorage.getItem(key) || defaultValue
}

export function setLocalString(key: string, value: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, value)
}

// Daily bias storage - now uses IndexedDB for consistency
// Synchronous fallback for initial render (migrates from localStorage if needed)
let localStorageCache: { date: string; biasId: string } | null = null

// Migrate from localStorage to IndexedDB on first access
async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return
  
  try {
    const cached = localStorage.getItem("daily-bias-cache")
    if (cached) {
      const data = JSON.parse(cached)
      if (data.date && data.biasId) {
        await setCachedDaily(data.date, data.biasId)
        localStorage.removeItem("daily-bias-cache")
        logger.debug("[Storage] Migrated daily bias cache from localStorage to IndexedDB")
      }
    }
  } catch (error) {
    logger.error("[Storage] Error migrating from localStorage:", error)
  }
}

// Initialize migration on module load
if (typeof window !== "undefined") {
  migrateFromLocalStorage().catch(err => {
    logger.error("[Storage] Migration failed:", err)
  })
  
  // Read from localStorage for synchronous access during initial render
  try {
    const cached = localStorage.getItem("daily-bias-cache")
    if (cached) {
      localStorageCache = JSON.parse(cached)
    }
  } catch (error) {
    // Ignore errors during initial read
  }
}

/**
 * Get cached daily bias for a date (async, uses IndexedDB)
 */
export async function getCachedDailyBiasAsync(date: string): Promise<string | null> {
  try {
    return await getCachedDaily(date)
  } catch (error) {
    logger.error("[Storage] Error reading cached daily bias:", error)
    return null
  }
}

/**
 * Get cached daily bias synchronously (for initial render, falls back to localStorage cache)
 */
export function getCachedDailyBias(date: string): string | null {
  // Try IndexedDB cache first (if available synchronously via localStorage fallback)
  if (localStorageCache && localStorageCache.date === date) {
    return localStorageCache.biasId
  }
  
  // Fallback to localStorage during migration
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("daily-bias-cache")
      if (cached) {
        const data = JSON.parse(cached)
        if (data.date === date) {
          return data.biasId
        }
      }
    } catch (error) {
      logger.error("[Storage] Error reading from localStorage fallback:", error)
    }
  }
  
  return null
}

/**
 * Cache daily bias (async, uses IndexedDB)
 */
export async function cacheDailyBiasAsync(date: string, biasId: string): Promise<void> {
  try {
    await setCachedDaily(date, biasId)
    // Update localStorage cache for synchronous access
    if (typeof window !== "undefined") {
      localStorageCache = { date, biasId }
    }
  } catch (error) {
    logger.error("[Storage] Error caching daily bias:", error)
  }
}

/**
 * Cache daily bias (synchronous wrapper, uses localStorage as fallback)
 */
export function cacheDailyBias(date: string, biasId: string): void {
  // Update localStorage cache immediately for synchronous access
  if (typeof window !== "undefined") {
    try {
      localStorageCache = { date, biasId }
      localStorage.setItem("daily-bias-cache", JSON.stringify({ date, biasId }))
    } catch (error) {
      logger.error("[Storage] Error caching to localStorage:", error)
    }
  }
  
  // Save to IndexedDB asynchronously
  setCachedDaily(date, biasId).catch(err => {
    logger.error("[Storage] Error saving to IndexedDB:", err)
  })
}

/**
 * Get stored daily bias (for app start, synchronous)
 */
export function getStoredDailyBias(): { date: string; biasId: string } | null {
  // Use localStorage cache if available
  if (localStorageCache) {
    return localStorageCache
  }
  
  // Fallback to localStorage during migration
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("daily-bias-cache")
      if (cached) {
        const data = JSON.parse(cached)
        if (data.date && data.biasId) {
          return { date: data.date, biasId: data.biasId }
        }
      }
    } catch (error) {
      logger.error("[Storage] Error reading stored daily bias:", error)
    }
  }
  
  return null
}

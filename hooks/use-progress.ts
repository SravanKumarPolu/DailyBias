"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { BiasProgress, ProgressStats } from "@/lib/types"
import { getAllProgress, markBiasAsViewed, toggleBiasMastered, getProgress } from "@/lib/db"
import { toast } from "@/hooks/use-toast"
import { getLocalDateString, getDaysAgoDateString } from "@/lib/timezone-utils"
import { logger } from "@/lib/logger"

function calculateStreak(progressList: BiasProgress[]): { current: number; longest: number } {
  if (progressList.length === 0) return { current: 0, longest: 0 }

  // Sort by viewed date descending
  const sorted = [...progressList].sort((a, b) => b.viewedAt - a.viewedAt)

  // Get unique dates (YYYY-MM-DD format) using local timezone
  const uniqueDates = Array.from(
    new Set(
      sorted.map((p) => {
        const date = new Date(p.viewedAt)
        return getLocalDateString(date)
      })
    )
  )

  // Calculate current streak using local timezone
  let currentStreak = 0
  const todayStr = getLocalDateString()

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = getDaysAgoDateString(i)

    if (uniqueDates[i] === expectedStr) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1])
    const currDate = new Date(uniqueDates[i])
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { current: currentStreak, longest: longestStreak }
}

export function useProgress() {
  const [progressList, setProgressList] = useState<BiasProgress[]>([])
  const [stats, setStats] = useState<ProgressStats>({
    totalBiasesRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastViewedDate: null,
    masteredCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Track pending reloads to debounce them and prevent flickering
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadProgress = useCallback(async () => {
    try {
      setError(null)
      const progress = await getAllProgress()
      setProgressList(progress)

      // Calculate stats
      const streaks = calculateStreak(progress)
      const masteredCount = progress.filter((p) => p.mastered).length
      const lastViewed = progress.length > 0 ? Math.max(...progress.map((p) => p.viewedAt)) : null

      setStats({
        totalBiasesRead: progress.length,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        lastViewedDate: lastViewed ? new Date(lastViewed).toISOString() : null,
        masteredCount,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load progress"
      setError(message)
      logger.error("[DailyBias] Failed to load progress:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load progress only once on mount - don't reload when loadProgress reference changes
  // This prevents infinite loops and flickering
  useEffect(() => {
    loadProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  // Use ref to track progressList without causing re-renders
  const progressListRef = useRef<BiasProgress[]>(progressList)
  useEffect(() => {
    progressListRef.current = progressList
  }, [progressList])

  const markAsViewed = useCallback(
    async (biasId: string) => {
      try {
        // Check if already viewed recently to prevent duplicate updates
        const now = Date.now()
        const existing = progressListRef.current.find((p) => p.biasId === biasId)
        // FIX: Increase window to 30 seconds to prevent constant updates
        const recentlyViewed = existing && existing.viewedAt > 0 && (now - existing.viewedAt) < 30000 // Within 30 seconds
        
        if (recentlyViewed) {
          // Already marked as viewed very recently, skip to prevent flickering
          logger.debug("[DailyBias] Bias already marked as viewed recently, skipping")
          // Return early without updating state or calling database
          return Promise.resolve()
        }

        // FIX: Only update state if the value actually changed to prevent unnecessary re-renders
        // Check if we need to update before calling setState
        // Don't update if already viewed recently (within 10 seconds) to prevent flickering
        const needsUpdate = !existing || (existing.viewedAt > 0 && (now - existing.viewedAt) > 10000)
        
        if (needsUpdate && (!existing || existing.viewedAt === 0)) {
          // Only update if bias hasn't been viewed yet, or if it's been more than 10 seconds
          // This prevents constant updates that cause flickering
          // Optimistically update local state to prevent flickering from full reload
          // This is especially important on Android where full reloads cause visible flicker
          // Use functional update to avoid depending on progressList
          setProgressList((prev) => {
            const existing = prev.find((p) => p.biasId === biasId)
            if (existing) {
              // Only update if not already viewed (viewedAt === 0) or if it's been a long time
              // This prevents constant timestamp updates that cause hash changes
              if (existing.viewedAt > 0 && (now - existing.viewedAt) < 10000) {
                return prev // Already viewed recently, return same array reference
              }
              // Update existing progress
              return prev.map((p) =>
                p.biasId === biasId
                  ? { ...p, viewedAt: now, viewCount: p.viewCount + 1 }
                  : p
              )
            } else {
              // Add new progress entry
              return [
                ...prev,
                {
                  biasId,
                  viewedAt: now,
                  viewCount: 1,
                  mastered: false,
                },
              ]
            }
          })
        } else {
          // Already viewed recently, skip state update to prevent flickering
          logger.debug("[DailyBias] Bias already viewed recently, skipping state update")
        }

        // Save to database (non-blocking)
        markBiasAsViewed(biasId).catch((error) => {
          logger.error("[DailyBias] Failed to save mark as viewed to database:", error)
        })

        // Reload in background to sync with database (non-blocking, debounced)
        // This ensures data consistency without causing UI flicker
        // Clear any pending reload and schedule a new one
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current)
        }
        reloadTimeoutRef.current = setTimeout(() => {
          loadProgress().catch((error) => {
            logger.error("[DailyBias] Background progress reload failed:", error)
          })
          reloadTimeoutRef.current = null
        }, 10000) // Increased debounce to 10 seconds to prevent flickering
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to mark as viewed"
        logger.error("[DailyBias] Failed to mark as viewed:", error)
        throw error
      }
    },
    [loadProgress] // Removed progressList from deps - using ref instead to prevent re-renders
  )

  const toggleMastered = useCallback(
    async (biasId: string) => {
      try {
        const newState = await toggleBiasMastered(biasId)
        
        // Optimistically update local state to prevent flickering from full reload
        setProgressList((prev) => {
          return prev.map((p) =>
            p.biasId === biasId ? { ...p, mastered: newState } : p
          )
        })
        
        // Update stats optimistically
        setStats((prev) => ({
          ...prev,
          masteredCount: newState
            ? prev.masteredCount + 1
            : Math.max(0, prev.masteredCount - 1),
        }))
        
        toast({
          title: newState ? "Marked as mastered" : "Unmarked as mastered",
          description: newState ? "Great job learning this bias!" : "Keep practicing!",
        })
        
        // Reload in background to sync with database (non-blocking, debounced)
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current)
        }
        reloadTimeoutRef.current = setTimeout(() => {
          loadProgress().catch((error) => {
            logger.error("[DailyBias] Background progress reload failed:", error)
          })
          reloadTimeoutRef.current = null
        }, 1000) // Debounce reloads by 1 second
        
        return newState
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to toggle mastered"
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [loadProgress]
  )

  const isViewed = useCallback(async (biasId: string): Promise<boolean> => {
    const progress = await getProgress(biasId)
    return !!progress
  }, [])

  const isMastered = useCallback(async (biasId: string): Promise<boolean> => {
    const progress = await getProgress(biasId)
    return progress?.mastered || false
  }, [])

  return {
    progressList,
    stats,
    loading,
    error,
    markAsViewed,
    toggleMastered,
    isViewed,
    isMastered,
    refresh: loadProgress,
  }
}

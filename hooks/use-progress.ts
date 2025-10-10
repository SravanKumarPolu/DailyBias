"use client"

import { useState, useEffect, useCallback } from "react"
import type { BiasProgress, ProgressStats } from "@/lib/types"
import { getAllProgress, markBiasAsViewed, toggleBiasMastered, getProgress } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

function calculateStreak(progressList: BiasProgress[]): { current: number; longest: number } {
  if (progressList.length === 0) return { current: 0, longest: 0 }

  // Sort by viewed date descending
  const sorted = [...progressList].sort((a, b) => b.viewedAt - a.viewedAt)

  // Get unique dates (YYYY-MM-DD format)
  const uniqueDates = Array.from(
    new Set(
      sorted.map((p) => {
        const date = new Date(p.viewedAt)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      })
    )
  )

  // Calculate current streak
  let currentStreak = 0
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`

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
      console.error("[DailyBias] Failed to load progress:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  const markAsViewed = useCallback(
    async (biasId: string) => {
      try {
        await markBiasAsViewed(biasId)
        await loadProgress()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to mark as viewed"
        console.error("[DailyBias] Failed to mark as viewed:", error)
        throw error
      }
    },
    [loadProgress]
  )

  const toggleMastered = useCallback(
    async (biasId: string) => {
      try {
        const newState = await toggleBiasMastered(biasId)
        await loadProgress()
        toast({
          title: newState ? "Marked as mastered" : "Unmarked as mastered",
          description: newState ? "Great job learning this bias!" : "Keep practicing!",
        })
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

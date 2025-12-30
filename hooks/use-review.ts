"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Bias, BiasProgress, ReviewQuality } from "@/lib/types"
import { getAllProgress, updateProgressWithReview } from "@/lib/db"
import {
  processReview,
  initializeReviewProgress,
  getBiasesDueForReview,
  getUpcomingReviews,
  calculateReviewStats,
  getReviewDueText,
  getIntervalLevel,
  getIntervalLevelName,
  type ReviewStats,
} from "@/lib/spaced-repetition"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export interface ReviewableBias {
  bias: Bias
  progress: BiasProgress
  dueText: string
  intervalLevel: number
  intervalLevelName: string
}

export function useReview(allBiases: Bias[]) {
  const [progressList, setProgressList] = useState<BiasProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  // Load progress data
  const loadProgress = useCallback(async () => {
    try {
      setError(null)
      const progress = await getAllProgress()
      setProgressList(progress)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load review data"
      setError(message)
      logger.error("[useReview] Failed to load progress:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Calculate review statistics
  const stats: ReviewStats = useMemo(() => {
    return calculateReviewStats(progressList)
  }, [progressList])

  // Get biases due for review with full data
  const dueForReview: ReviewableBias[] = useMemo(() => {
    const dueProgress = getBiasesDueForReview(progressList)
    
    return dueProgress
      .map((progress) => {
        const bias = allBiases.find((b) => b.id === progress.biasId)
        if (!bias) return null

        return {
          bias,
          progress,
          dueText: getReviewDueText(progress),
          intervalLevel: getIntervalLevel(progress.interval),
          intervalLevelName: getIntervalLevelName(getIntervalLevel(progress.interval)),
        }
      })
      .filter((item): item is ReviewableBias => item !== null)
  }, [progressList, allBiases])

  // Get upcoming reviews
  const upcoming: ReviewableBias[] = useMemo(() => {
    const upcomingProgress = getUpcomingReviews(progressList, 5)
    
    return upcomingProgress
      .map((progress) => {
        const bias = allBiases.find((b) => b.id === progress.biasId)
        if (!bias) return null

        return {
          bias,
          progress,
          dueText: getReviewDueText(progress),
          intervalLevel: getIntervalLevel(progress.interval),
          intervalLevelName: getIntervalLevelName(getIntervalLevel(progress.interval)),
        }
      })
      .filter((item): item is ReviewableBias => item !== null)
  }, [progressList, allBiases])

  // Get current bias to review
  const currentReview: ReviewableBias | null = useMemo(() => {
    return dueForReview[currentReviewIndex] || null
  }, [dueForReview, currentReviewIndex])

  // Submit a review
  const submitReview = useCallback(
    async (biasId: string, quality: ReviewQuality) => {
      try {
        const progress = progressList.find((p) => p.biasId === biasId)
        if (!progress) {
          throw new Error("Progress not found for bias")
        }

        // Initialize if needed, then process the review
        const initialized = initializeReviewProgress(progress)
        const updated = processReview(initialized, quality)

        // Save to database
        await updateProgressWithReview(updated)

        // Update local state
        setProgressList((prev) =>
          prev.map((p) => (p.biasId === biasId ? updated : p))
        )

        // Move to next review or show completion
        const remaining = dueForReview.length - 1
        if (currentReviewIndex >= remaining) {
          setCurrentReviewIndex(Math.max(0, remaining - 1))
        }

        // Show feedback based on quality
        const messages = {
          high: ["Great recall!", "Perfect!", "Excellent memory!"],
          medium: ["Good job!", "Keep it up!", "Getting there!"],
          low: ["Keep practicing!", "You'll get it!", "Review again soon!"],
        }

        const category = quality >= 4 ? "high" : quality >= 3 ? "medium" : "low"
        const message = messages[category][Math.floor(Math.random() * messages[category].length)]

        toast({
          title: message,
          description: `Next review in ${updated.interval} ${updated.interval === 1 ? "day" : "days"}`,
        })

        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit review"
        logger.error("[useReview] Failed to submit review:", err)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [progressList, dueForReview.length, currentReviewIndex]
  )

  // Skip current review (move to next without scoring)
  const skipReview = useCallback(() => {
    if (currentReviewIndex < dueForReview.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1)
    }
  }, [currentReviewIndex, dueForReview.length])

  // Go to previous review
  const previousReview = useCallback(() => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex((prev) => prev - 1)
    }
  }, [currentReviewIndex])

  // Reset to first review
  const resetReviews = useCallback(() => {
    setCurrentReviewIndex(0)
  }, [])

  return {
    // Data
    dueForReview,
    upcoming,
    currentReview,
    stats,
    progressList,
    
    // State
    loading,
    error,
    currentReviewIndex,
    totalDue: dueForReview.length,
    
    // Actions
    submitReview,
    skipReview,
    previousReview,
    resetReviews,
    refresh: loadProgress,
  }
}


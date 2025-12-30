/**
 * Spaced Repetition System (SRS) for DebiasDaily
 * 
 * Implements a simplified SM-2 algorithm for optimal learning intervals.
 * Review intervals: 1 → 3 → 7 → 14 → 30 days
 * 
 * The algorithm tracks:
 * - When bias was last reviewed
 * - When next review is due
 * - User's performance (ease factor)
 * - Consecutive correct reviews
 */

import type { BiasProgress, ReviewQuality } from "./types"
import { logger } from "./logger"

// Standard intervals in days (following spaced repetition research)
export const INTERVALS = [1, 3, 7, 14, 30] as const

// Default ease factor (from SM-2 algorithm)
const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
const MAX_EASE_FACTOR = 2.5

// Milliseconds per day
const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Calculate the next review interval based on SM-2 algorithm
 */
export function calculateNextInterval(
  _currentInterval: number,
  quality: ReviewQuality,
  easeFactor: number,
  consecutiveCorrect: number
): { newInterval: number; newEaseFactor: number; newConsecutiveCorrect: number } {
  // If quality is less than 3, reset to beginning
  if (quality < 3) {
    return {
      newInterval: INTERVALS[0],
      newEaseFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2),
      newConsecutiveCorrect: 0,
    }
  }

  // Calculate new ease factor (SM-2 formula)
  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    Math.min(
      MAX_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
  )

  // Progress through intervals based on consecutive correct reviews
  const newConsecutiveCorrect = consecutiveCorrect + 1
  
  // Find the next interval
  let newInterval: number
  
  if (newConsecutiveCorrect === 1) {
    newInterval = INTERVALS[0] // 1 day
  } else if (newConsecutiveCorrect === 2) {
    newInterval = INTERVALS[1] // 3 days
  } else {
    // After 2 correct reviews, use ease factor to calculate
    const intervalIndex = Math.min(newConsecutiveCorrect - 1, INTERVALS.length - 1)
    const baseInterval = INTERVALS[intervalIndex]
    newInterval = Math.round(baseInterval * newEaseFactor)
    
    // Cap at maximum interval (30 days)
    newInterval = Math.min(newInterval, INTERVALS[INTERVALS.length - 1])
  }

  return { newInterval, newEaseFactor, newConsecutiveCorrect }
}

/**
 * Get the next review date from now
 */
export function getNextReviewDate(intervalDays: number): number {
  return Date.now() + intervalDays * MS_PER_DAY
}

/**
 * Check if a bias is due for review
 */
export function isDueForReview(progress: BiasProgress): boolean {
  // If never reviewed in spaced repetition, it's due
  if (!progress.nextReviewAt) {
    // Only due if it has been viewed at least once
    return progress.viewedAt > 0
  }

  return Date.now() >= progress.nextReviewAt
}

/**
 * Get days until next review (negative if overdue)
 */
export function getDaysUntilReview(progress: BiasProgress): number | null {
  if (!progress.nextReviewAt) return null
  
  const diff = progress.nextReviewAt - Date.now()
  return Math.ceil(diff / MS_PER_DAY)
}

/**
 * Get human-readable time until review
 */
export function getReviewDueText(progress: BiasProgress): string {
  const days = getDaysUntilReview(progress)
  
  if (days === null) {
    return progress.viewedAt > 0 ? "Ready for first review" : "Not yet viewed"
  }
  
  if (days <= 0) {
    if (days === 0) return "Due today"
    if (days === -1) return "Overdue by 1 day"
    return `Overdue by ${Math.abs(days)} days`
  }
  
  if (days === 1) return "Due tomorrow"
  if (days < 7) return `Due in ${days} days`
  if (days < 14) return "Due next week"
  if (days < 30) return `Due in ${Math.ceil(days / 7)} weeks`
  return "Due in a month"
}

/**
 * Get current interval level (0-4)
 */
export function getIntervalLevel(interval: number | undefined): number {
  if (!interval) return 0
  
  for (let i = INTERVALS.length - 1; i >= 0; i--) {
    if (interval >= INTERVALS[i]) return i
  }
  return 0
}

/**
 * Get interval level name
 */
export function getIntervalLevelName(level: number): string {
  const names = ["Learning", "Short-term", "Medium-term", "Long-term", "Mastered"]
  return names[Math.min(level, names.length - 1)]
}

/**
 * Calculate review statistics
 */
export interface ReviewStats {
  totalReviewed: number        // Total biases that have been reviewed at least once
  dueNow: number               // Biases due for review right now
  dueToday: number             // Biases due today (including past due)
  dueThisWeek: number          // Biases due this week
  averageInterval: number      // Average interval across all reviewed biases
  masteryProgress: number      // Percentage of biases at 30-day interval
}

export function calculateReviewStats(progressList: BiasProgress[]): ReviewStats {
  const now = Date.now()
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  const endOfWeek = new Date()
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  let totalReviewed = 0
  let dueNow = 0
  let dueToday = 0
  let dueThisWeek = 0
  let totalInterval = 0
  let atMaxInterval = 0

  for (const progress of progressList) {
    // Only count biases that have been viewed
    if (progress.viewedAt <= 0) continue

    // Count as reviewed if it has a review history
    if (progress.reviewCount && progress.reviewCount > 0) {
      totalReviewed++
      totalInterval += progress.interval || INTERVALS[0]
      
      if ((progress.interval || 0) >= INTERVALS[INTERVALS.length - 1]) {
        atMaxInterval++
      }
    }

    // Check if due
    const nextReview = progress.nextReviewAt || progress.viewedAt + MS_PER_DAY
    
    if (nextReview <= now) {
      dueNow++
      dueToday++
      dueThisWeek++
    } else if (nextReview <= endOfToday.getTime()) {
      dueToday++
      dueThisWeek++
    } else if (nextReview <= endOfWeek.getTime()) {
      dueThisWeek++
    }
  }

  return {
    totalReviewed,
    dueNow,
    dueToday,
    dueThisWeek,
    averageInterval: totalReviewed > 0 ? Math.round(totalInterval / totalReviewed) : 0,
    masteryProgress: totalReviewed > 0 ? Math.round((atMaxInterval / totalReviewed) * 100) : 0,
  }
}

/**
 * Get biases due for review, sorted by priority (most overdue first)
 */
export function getBiasesDueForReview(progressList: BiasProgress[]): BiasProgress[] {
  const now = Date.now()
  
  return progressList
    .filter((p) => {
      // Must have been viewed at least once
      if (p.viewedAt <= 0) return false
      
      // Check if due for review
      const nextReview = p.nextReviewAt || p.viewedAt + MS_PER_DAY
      return nextReview <= now
    })
    .sort((a, b) => {
      // Sort by how overdue they are (most overdue first)
      const aNext = a.nextReviewAt || a.viewedAt + MS_PER_DAY
      const bNext = b.nextReviewAt || b.viewedAt + MS_PER_DAY
      return aNext - bNext
    })
}

/**
 * Get upcoming reviews (not yet due)
 */
export function getUpcomingReviews(progressList: BiasProgress[], limit = 10): BiasProgress[] {
  const now = Date.now()
  
  return progressList
    .filter((p) => {
      if (p.viewedAt <= 0) return false
      const nextReview = p.nextReviewAt || p.viewedAt + MS_PER_DAY
      return nextReview > now
    })
    .sort((a, b) => {
      const aNext = a.nextReviewAt || a.viewedAt + MS_PER_DAY
      const bNext = b.nextReviewAt || b.viewedAt + MS_PER_DAY
      return aNext - bNext
    })
    .slice(0, limit)
}

/**
 * Process a review and update progress
 */
export function processReview(
  progress: BiasProgress,
  quality: ReviewQuality
): BiasProgress {
  const currentInterval = progress.interval || INTERVALS[0]
  const currentEaseFactor = progress.easeFactor || DEFAULT_EASE_FACTOR
  const currentConsecutive = progress.consecutiveCorrect || 0

  const { newInterval, newEaseFactor, newConsecutiveCorrect } = calculateNextInterval(
    currentInterval,
    quality,
    currentEaseFactor,
    currentConsecutive
  )

  const updated: BiasProgress = {
    ...progress,
    lastReviewedAt: Date.now(),
    nextReviewAt: getNextReviewDate(newInterval),
    interval: newInterval,
    easeFactor: newEaseFactor,
    reviewCount: (progress.reviewCount || 0) + 1,
    consecutiveCorrect: newConsecutiveCorrect,
  }

  logger.debug("[SpacedRepetition] Processed review:", {
    biasId: progress.biasId,
    quality,
    oldInterval: currentInterval,
    newInterval,
    newEaseFactor,
    nextReviewAt: new Date(updated.nextReviewAt!).toLocaleDateString(),
  })

  return updated
}

/**
 * Initialize spaced repetition for a newly viewed bias
 */
export function initializeReviewProgress(progress: BiasProgress): BiasProgress {
  // If already has spaced repetition data, don't overwrite
  if (progress.nextReviewAt) return progress

  return {
    ...progress,
    nextReviewAt: getNextReviewDate(INTERVALS[0]), // Due in 1 day
    interval: INTERVALS[0],
    easeFactor: DEFAULT_EASE_FACTOR,
    reviewCount: 0,
    consecutiveCorrect: 0,
  }
}


/**
 * Analytics Utilities
 * Functions to calculate analytics metrics from real app data
 */

import type { Bias, BiasProgress } from "./types"
import type { ContentQualityMetrics } from "./content-versioning"
import type { FeedbackData } from "./db"

export interface AnalyticsMetrics {
  totalBiases: number
  knownBiases: number
  coveragePercent: number
  averageQualityScore: number
  expertReviewsCount: number
  userFeedbackCount: number
  reviewedBiasesCount: number
  approvedCount: number
  pendingCount: number
  needsRevisionCount: number
  averageAccuracy: number
  averageClarity: number
  averageCompleteness: number
}

export interface RecentActivity {
  type: "expert_review" | "user_feedback" | "quality_improvement"
  biasId: string
  biasTitle: string
  timestamp: number
  description: string
}

/**
 * Calculate analytics metrics from real app data
 */
export async function calculateAnalyticsMetrics(
  allBiases: Bias[],
  progressList: BiasProgress[],
  qualityMetrics: ContentQualityMetrics[],
  feedbackList: FeedbackData[] = []
): Promise<AnalyticsMetrics> {
  const totalBiases = allBiases.length
  const knownBiases = totalBiases // For now, known biases = total biases
  const viewedBiases = new Set(progressList.map(p => p.biasId)).size
  const coveragePercent = knownBiases > 0 ? (viewedBiases / knownBiases) * 100 : 0

  // Calculate average quality score from quality metrics
  let averageQualityScore = 0
  let averageAccuracy = 0
  let averageClarity = 0
  let averageCompleteness = 0
  
  if (qualityMetrics.length > 0) {
    const totalHealth = qualityMetrics.reduce((sum, metric) => {
      return sum + (
        metric.accuracyScore * 0.3 +
        metric.clarityScore * 0.25 +
        metric.completenessScore * 0.25 +
        metric.userRating * 0.2
      )
    }, 0)
    averageQualityScore = (totalHealth / qualityMetrics.length) * 100

    averageAccuracy = qualityMetrics.reduce((sum, m) => sum + m.accuracyScore, 0) / qualityMetrics.length * 10
    averageClarity = qualityMetrics.reduce((sum, m) => sum + m.clarityScore, 0) / qualityMetrics.length * 10
    averageCompleteness = qualityMetrics.reduce((sum, m) => sum + m.completenessScore, 0) / qualityMetrics.length * 10
  }

  // Count expert reviews (biases with expertReviewScore)
  const expertReviewsCount = qualityMetrics.filter(m => m.expertReviewScore !== undefined).length

  // Count user feedback - use actual feedback submissions if available, otherwise fall back to view counts
  const userFeedbackCount = feedbackList.length > 0 
    ? new Set(feedbackList.map(f => f.biasId)).size 
    : progressList.filter(p => p.viewCount > 0).length

  // Count reviewed biases
  const reviewedBiasesCount = qualityMetrics.length

  // Review statistics based on quality scores
  const approvedCount = qualityMetrics.filter(m => {
    const healthScore = (
      m.accuracyScore * 0.3 +
      m.clarityScore * 0.25 +
      m.completenessScore * 0.25 +
      m.userRating * 0.2
    )
    return healthScore >= 0.8
  }).length

  const needsRevisionCount = qualityMetrics.filter(m => {
    const healthScore = (
      m.accuracyScore * 0.3 +
      m.clarityScore * 0.25 +
      m.completenessScore * 0.25 +
      m.userRating * 0.2
    )
    return healthScore < 0.6
  }).length

  const pendingCount = qualityMetrics.length - approvedCount - needsRevisionCount

  return {
    totalBiases,
    knownBiases,
    coveragePercent,
    averageQualityScore,
    expertReviewsCount,
    userFeedbackCount,
    reviewedBiasesCount,
    approvedCount,
    pendingCount,
    needsRevisionCount,
    averageAccuracy,
    averageClarity,
    averageCompleteness,
  }
}

/**
 * Generate recent activity from quality metrics, progress data, and feedback
 */
export async function getRecentActivity(
  allBiases: Bias[],
  progressList: BiasProgress[],
  qualityMetrics: ContentQualityMetrics[],
  feedbackList: FeedbackData[] = []
): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = []
  const biasMap = new Map(allBiases.map(b => [b.id, b]))

  // Get recent expert reviews (biases with expertReviewScore updated recently)
  const recentExpertReviews = qualityMetrics
    .filter(m => m.expertReviewScore !== undefined)
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 5)

  recentExpertReviews.forEach(metric => {
    const bias = biasMap.get(metric.biasId)
    if (bias) {
      activities.push({
        type: "expert_review",
        biasId: metric.biasId,
        biasTitle: bias.title,
        timestamp: metric.lastUpdated,
        description: `Expert review completed for "${bias.title}"`
      })
    }
  })

  // Get recent user feedback - use actual feedback submissions if available
  if (feedbackList.length > 0) {
    const recentFeedback = feedbackList
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)

    recentFeedback.forEach(feedback => {
      const bias = biasMap.get(feedback.biasId)
      if (bias) {
        const feedbackTypeLabels = {
          accuracy: "Accuracy",
          clarity: "Clarity",
          completeness: "Completeness",
          other: "General"
        }
        const ratingLabel = feedback.rating === "positive" ? "Good" : "Needs Improvement"
        activities.push({
          type: "user_feedback",
          biasId: feedback.biasId,
          biasTitle: bias.title,
          timestamp: feedback.timestamp,
          description: `${feedbackTypeLabels[feedback.type]} feedback (${ratingLabel}) for "${bias.title}"`
        })
      }
    })
  } else {
    // Fallback to view counts if no feedback available
    const recentViews = progressList
      .filter(p => p.viewCount > 0)
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 5)

    recentViews.forEach(progress => {
      const bias = biasMap.get(progress.biasId)
      if (bias) {
        activities.push({
          type: "user_feedback",
          biasId: progress.biasId,
          biasTitle: bias.title,
          timestamp: progress.viewedAt,
          description: `User feedback received for "${bias.title}"`
        })
      }
    })
  }

  // Get quality improvements (metrics updated recently with improved scores)
  const recentQualityUpdates = qualityMetrics
    .filter(m => {
      const healthScore = (
        m.accuracyScore * 0.3 +
        m.clarityScore * 0.25 +
        m.completenessScore * 0.25 +
        m.userRating * 0.2
      )
      return healthScore >= 0.7
    })
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 5)

  recentQualityUpdates.forEach(metric => {
    const bias = biasMap.get(metric.biasId)
    if (bias) {
      activities.push({
        type: "quality_improvement",
        biasId: metric.biasId,
        biasTitle: bias.title,
        timestamp: metric.lastUpdated,
        description: `Content quality improved for "${bias.title}"`
      })
    }
  })

  // Sort by timestamp descending and return top 3
  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
}

/**
 * Format timestamp to relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else {
    return "just now"
  }
}


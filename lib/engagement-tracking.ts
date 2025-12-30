/**
 * Engagement Tracking Utilities
 * Tracks user engagement metrics locally for analytics
 */

import { logger } from "./logger"

export interface EngagementMetrics {
  totalSessions: number
  totalSessionTime: number // in milliseconds
  averageSessionTime: number // in milliseconds
  lastSessionStart: number
  lastSessionEnd: number
  sessionsThisWeek: number
  sessionsThisMonth: number
  totalDaysActive: number
  firstVisitDate: string
  lastVisitDate: string
  biasesViewedPerSession: number
}

const STORAGE_KEY = "engagement-metrics"

/**
 * Initialize engagement tracking
 * Returns a cleanup function to call on unmount
 */
export function initEngagementTracking(): (() => void) | void {
  if (typeof window === "undefined") return

  try {
    const metrics = getEngagementMetrics()
    
    // Start new session
    const now = Date.now()
    const today = new Date().toISOString().split("T")[0]
    
    // Update session count
    metrics.totalSessions += 1
    
    // Track weekly/monthly sessions
    const lastSessionDate = metrics.lastSessionStart ? new Date(metrics.lastSessionStart).toISOString().split("T")[0] : null
    if (lastSessionDate !== today) {
      // New day
      const lastDate = lastSessionDate ? new Date(lastSessionDate) : null
      const nowDate = new Date()
      
      // Reset weekly/monthly counts if needed
      if (!lastDate || nowDate.getTime() - lastDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
        metrics.sessionsThisWeek = 0
      }
      if (!lastDate || nowDate.getMonth() !== lastDate.getMonth() || nowDate.getFullYear() !== lastDate.getFullYear()) {
        metrics.sessionsThisMonth = 0
      }
      
      metrics.sessionsThisWeek += 1
      metrics.sessionsThisMonth += 1
    }
    
    // Track first visit
    if (!metrics.firstVisitDate) {
      metrics.firstVisitDate = today
      metrics.totalDaysActive = 1
    } else if (metrics.lastVisitDate !== today) {
      // New day visit
      metrics.totalDaysActive += 1
    }
    
    metrics.lastVisitDate = today
    metrics.lastSessionStart = now
    
    saveEngagementMetrics(metrics)
    
    // Track session end on page unload
    const handleUnload = () => {
      endSession()
    }
    window.addEventListener("beforeunload", handleUnload)
    
    // Return cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
      endSession()
    }
  } catch (error) {
    logger.error("[EngagementTracking] Error initializing:", error)
  }
}

/**
 * End current session and update metrics
 */
export function endSession(): void {
  if (typeof window === "undefined") return

  try {
    const metrics = getEngagementMetrics()
    const now = Date.now()
    
    if (metrics.lastSessionStart > 0) {
      const sessionDuration = now - metrics.lastSessionStart
      metrics.totalSessionTime += sessionDuration
      metrics.lastSessionEnd = now
      
      // Update average session time
      if (metrics.totalSessions > 0) {
        metrics.averageSessionTime = metrics.totalSessionTime / metrics.totalSessions
      }
      
      saveEngagementMetrics(metrics)
    }
  } catch (error) {
    logger.error("[EngagementTracking] Error ending session:", error)
  }
}

/**
 * Track bias view for engagement calculation
 */
export function trackBiasView(): void {
  if (typeof window === "undefined") return

  try {
    const metrics = getEngagementMetrics()
    
    // Increment views for current session (stored in sessionStorage)
    const sessionViews = sessionStorage.getItem("session-bias-views")
    const views = sessionViews ? parseInt(sessionViews, 10) + 1 : 1
    sessionStorage.setItem("session-bias-views", views.toString())
    
    // Update average biases viewed per session
    if (metrics.totalSessions > 0) {
      // This is approximate - actual calculation happens on session end
      metrics.biasesViewedPerSession = Math.round(views)
    }
  } catch (error) {
    logger.error("[EngagementTracking] Error tracking bias view:", error)
  }
}

/**
 * Get engagement metrics
 */
export function getEngagementMetrics(): EngagementMetrics {
  if (typeof window === "undefined") {
    return getDefaultMetrics()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const metrics = JSON.parse(stored)
      // Ensure all fields exist
      return {
        ...getDefaultMetrics(),
        ...metrics,
      }
    }
  } catch (error) {
    logger.error("[EngagementTracking] Error loading metrics:", error)
  }

  return getDefaultMetrics()
}

/**
 * Get default metrics object
 */
function getDefaultMetrics(): EngagementMetrics {
  return {
    totalSessions: 0,
    totalSessionTime: 0,
    averageSessionTime: 0,
    lastSessionStart: 0,
    lastSessionEnd: 0,
    sessionsThisWeek: 0,
    sessionsThisMonth: 0,
    totalDaysActive: 0,
    firstVisitDate: "",
    lastVisitDate: "",
    biasesViewedPerSession: 0,
  }
}

/**
 * Save engagement metrics
 */
function saveEngagementMetrics(metrics: EngagementMetrics): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
  } catch (error) {
    logger.error("[EngagementTracking] Error saving metrics:", error)
  }
}

/**
 * Calculate retention metrics from engagement data
 */
export function calculateRetentionMetrics(metrics: EngagementMetrics): {
  weeklyActiveDays: number
  monthlyActiveDays: number
  averageSessionsPerWeek: number
  averageSessionsPerMonth: number
  retentionRate: number // percentage
} {
  const now = new Date()
  const firstVisit = metrics.firstVisitDate ? new Date(metrics.firstVisitDate) : now
  const daysSinceFirstVisit = Math.max(1, Math.floor((now.getTime() - firstVisit.getTime()) / (24 * 60 * 60 * 1000)))
  
  return {
    weeklyActiveDays: metrics.sessionsThisWeek,
    monthlyActiveDays: metrics.totalDaysActive,
    averageSessionsPerWeek: daysSinceFirstVisit > 0 ? metrics.totalSessions / Math.max(1, daysSinceFirstVisit / 7) : 0,
    averageSessionsPerMonth: daysSinceFirstVisit > 0 ? metrics.totalSessions / Math.max(1, daysSinceFirstVisit / 30) : 0,
    retentionRate: daysSinceFirstVisit > 0 ? (metrics.totalDaysActive / daysSinceFirstVisit) * 100 : 0,
  }
}

/**
 * Format session time for display
 */
export function formatSessionTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}


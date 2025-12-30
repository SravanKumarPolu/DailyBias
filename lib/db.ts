import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Bias, UserSettings, FavoriteItem, BiasProgress, StreakData, QuizSession, UserAchievement } from "./types"
import type { ContentVersion, ContentQualityMetrics } from "./content-versioning"
import { getYesterdayDateString } from "./timezone-utils"
import { logger } from "./logger"

export interface FeedbackData {
  biasId: string
  type: "accuracy" | "clarity" | "completeness" | "other"
  rating: "positive" | "negative"
  comment?: string
  timestamp: number
}

interface BiasDB extends DBSchema {
  userBiases: {
    key: string
    value: Bias
    indexes: { "by-category": string }
  }
  favorites: {
    key: string
    value: FavoriteItem
  }
  settings: {
    key: string
    value: UserSettings
  }
  cache: {
    key: string
    value: { date: string; biasId: string }
  }
  progress: {
    key: string
    value: BiasProgress
    indexes: { "by-viewed": number }
  }
  streak: {
    key: string
    value: StreakData
  }
  contentVersions: {
    key: string
    value: ContentVersion
    indexes: { "byBiasId": string; "byTimestamp": number }
  }
  qualityMetrics: {
    key: string
    value: ContentQualityMetrics
    indexes: { "byScore": number }
  }
  feedback: {
    key: number
    value: FeedbackData
    indexes: { "by-biasId": string; "by-timestamp": number }
  }
  quizSessions: {
    key: string
    value: QuizSession
    indexes: { "by-completedAt": number }
  }
  achievements: {
    key: string
    value: UserAchievement
    indexes: { "by-unlockedAt": number; "by-seen": number }
  }
}

let dbInstance: IDBPDatabase<BiasDB> | null = null

async function withErrorHandling<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logger.error(`[DailyBias] ${errorMessage}:`, error)
    throw new Error(errorMessage)
  }
}

export async function getDB() {
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB<BiasDB>("bias-daily-db", 6, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const userBiasStore = db.createObjectStore("userBiases", { keyPath: "id" })
          userBiasStore.createIndex("by-category", "category")

          db.createObjectStore("favorites", { keyPath: "biasId" })

          db.createObjectStore("settings")

          db.createObjectStore("cache")
        }

        if (oldVersion < 2) {
          const progressStore = db.createObjectStore("progress", { keyPath: "biasId" })
          progressStore.createIndex("by-viewed", "viewedAt")

          db.createObjectStore("streak")
        }

        if (oldVersion < 3) {
          // Create content versions store if it doesn't exist
          if (!db.objectStoreNames.contains("contentVersions")) {
            const versionStore = db.createObjectStore("contentVersions", { keyPath: "id" })
            versionStore.createIndex("byBiasId", "biasId")
            versionStore.createIndex("byTimestamp", "timestamp")
          }
          
          // Create quality metrics store if it doesn't exist
          if (!db.objectStoreNames.contains("qualityMetrics")) {
            const metricsStore = db.createObjectStore("qualityMetrics", { keyPath: "biasId" })
            metricsStore.createIndex("byScore", "userRating")
          }
        }

        if (oldVersion < 4) {
          // Create feedback store if it doesn't exist
          if (!db.objectStoreNames.contains("feedback")) {
            const feedbackStore = db.createObjectStore("feedback", { autoIncrement: true })
            feedbackStore.createIndex("by-biasId", "biasId")
            feedbackStore.createIndex("by-timestamp", "timestamp")
          }
        }

        if (oldVersion < 5) {
          // Create quiz sessions store for tracking quiz history
          if (!db.objectStoreNames.contains("quizSessions")) {
            const quizStore = db.createObjectStore("quizSessions", { keyPath: "id" })
            quizStore.createIndex("by-completedAt", "completedAt")
          }
        }

        if (oldVersion < 6) {
          // Create achievements store for tracking unlocked achievements
          if (!db.objectStoreNames.contains("achievements")) {
            const achievementStore = db.createObjectStore("achievements", { keyPath: "achievementId" })
            achievementStore.createIndex("by-unlockedAt", "unlockedAt")
            achievementStore.createIndex("by-seen", "seen")
          }
        }
      },
    })

    return dbInstance
  } catch (error) {
    logger.error("[DailyBias] Failed to initialize database:", error)
    throw new Error("Failed to initialize database. Please check if IndexedDB is available.")
  }
}

export async function getUserBiases(): Promise<Bias[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("userBiases")
  }, "Failed to load user biases")
}

export async function addUserBias(bias: Bias): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("userBiases", bias)
  }, "Failed to add bias")
}

export async function updateUserBias(bias: Bias): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("userBiases", bias)
  }, "Failed to update bias")
}

export async function deleteUserBias(id: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.delete("userBiases", id)
  }, "Failed to delete bias")
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("favorites")
  }, "Failed to load favorites")
}

export async function addFavorite(biasId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("favorites", { biasId, addedAt: Date.now() })
  }, "Failed to add favorite")
}

export async function removeFavorite(biasId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.delete("favorites", biasId)
  }, "Failed to remove favorite")
}

export async function isFavorite(biasId: string): Promise<boolean> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const fav = await db.get("favorites", biasId)
    return !!fav
  }, "Failed to check favorite status")
}

export async function getSettings(): Promise<UserSettings> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const settings = await db.get("settings", "user-settings")

    // Default settings
    const defaults: UserSettings = {
      theme: "system",
      backgroundStyle: "gradient",
      dailyReminder: false,
      mixUserBiasesInDaily: true,
      voiceEnabled: true,
      voiceRate: 0.9, // Default to 0.9x for better comprehension
      voicePitch: 1.0,
      voiceName: "Google US English", // Default to Google US English voice
    // Ensure timezone-related fields always exist in production too
    timezoneAutoDetect: true, // Auto-detect timezone enabled by default
    timezone: "UTC",
    }

    // Merge with defaults to handle migration of new fields
    if (settings) {
      // Migration: For existing users who have the old default (false), migrate to new default (true)
      // This is a one-time migration to apply the new default behavior
      if (settings.timezoneAutoDetect === false && (!settings.timezone || settings.timezone === 'UTC')) {
        logger.debug('[Settings] Migrating existing user to auto-detect (new default)')
        settings.timezoneAutoDetect = true
        // Don't auto-save the migration - let the user choose
      }
      // Only apply default timezoneAutoDetect for truly new users (no timezoneAutoDetect set at all)
      else if (settings.timezoneAutoDetect === undefined) {
        logger.debug('[Settings] New user - applying auto-detect default')
        settings.timezoneAutoDetect = true
      }
      return { ...defaults, ...settings }
    }
    return defaults
  }, "Failed to load settings")
}

export async function updateSettings(settings: UserSettings): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("settings", settings, "user-settings")
  }, "Failed to update settings")
}

export async function getCachedDaily(date: string): Promise<string | null> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const cached = await db.get("cache", date)
    return cached?.biasId || null
  }, "Failed to load cached daily bias")
}

export async function setCachedDaily(date: string, biasId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("cache", { date, biasId }, date)
  }, "Failed to cache daily bias")
}

export async function getProgress(biasId: string): Promise<BiasProgress | null> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const progress = await db.get("progress", biasId)
    return progress || null
  }, "Failed to load progress")
}

export async function getAllProgress(): Promise<BiasProgress[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("progress")
  }, "Failed to load all progress")
}

export async function markBiasAsViewed(biasId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const existing = await db.get("progress", biasId)
    const now = Date.now()
    const MS_PER_DAY = 24 * 60 * 60 * 1000

    if (existing) {
      await db.put("progress", {
        ...existing,
        viewedAt: now,
        viewCount: existing.viewCount + 1,
      })
    } else {
      // Initialize with spaced repetition fields
      await db.put("progress", {
        biasId,
        viewedAt: now,
        viewCount: 1,
        mastered: false,
        // Spaced repetition initialization
        nextReviewAt: now + MS_PER_DAY, // Due in 1 day
        interval: 1,
        easeFactor: 2.5,
        reviewCount: 0,
        consecutiveCorrect: 0,
      })
    }
  }, "Failed to mark bias as viewed")
}

export async function toggleBiasMastered(biasId: string): Promise<boolean> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const existing = await db.get("progress", biasId)

    const newMasteredState = !existing?.mastered

    if (existing) {
      await db.put("progress", {
        ...existing,
        mastered: newMasteredState,
      })
    } else {
      await db.put("progress", {
        biasId,
        viewedAt: Date.now(),
        viewCount: 1,
        mastered: newMasteredState,
      })
    }

    return newMasteredState
  }, "Failed to toggle mastered status")
}

/**
 * Update progress with spaced repetition data after a review
 */
export async function updateProgressWithReview(progress: BiasProgress): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("progress", progress)
  }, "Failed to update progress with review")
}

/**
 * Get all biases that are due for review
 */
export async function getBiasesDueForReviewFromDB(): Promise<BiasProgress[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const allProgress = await db.getAll("progress")
    const now = Date.now()
    
    return allProgress.filter((p) => {
      // Must have been viewed at least once
      if (p.viewedAt <= 0) return false
      
      // Check if due for review
      const nextReview = p.nextReviewAt || p.viewedAt + (24 * 60 * 60 * 1000) // Default: 1 day after viewing
      return nextReview <= now
    })
  }, "Failed to get biases due for review")
}

export async function getStreak(): Promise<StreakData> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const streak = await db.get("streak", "user-streak")
    return (
      streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastVisitDate: "",
        totalDaysVisited: 0,
      }
    )
  }, "Failed to load streak")
}

export async function updateStreak(todayDate: string): Promise<StreakData> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const existing = await getStreak()

    if (existing.lastVisitDate === todayDate) {
      return existing
    }

    // Use local timezone for yesterday calculation
    const yesterdayStr = getYesterdayDateString()

    let newStreak: StreakData

    if (existing.lastVisitDate === yesterdayStr) {
      newStreak = {
        currentStreak: existing.currentStreak + 1,
        longestStreak: Math.max(existing.longestStreak, existing.currentStreak + 1),
        lastVisitDate: todayDate,
        totalDaysVisited: existing.totalDaysVisited + 1,
      }
    } else if (existing.lastVisitDate === "") {
      newStreak = {
        currentStreak: 1,
        longestStreak: 1,
        lastVisitDate: todayDate,
        totalDaysVisited: 1,
      }
    } else {
      newStreak = {
        currentStreak: 1,
        longestStreak: existing.longestStreak,
        lastVisitDate: todayDate,
        totalDaysVisited: existing.totalDaysVisited + 1,
      }
    }

    await db.put("streak", newStreak, "user-streak")
    return newStreak
  }, "Failed to update streak")
}

export async function exportAllData() {
  return withErrorHandling(async () => {
    const db = await getDB()
    const userBiases = await db.getAll("userBiases")
    const favorites = await db.getAll("favorites")
    const settings = await db.get("settings", "user-settings")
    const progress = await db.getAll("progress")
    const streak = await db.get("streak", "user-streak")
    const feedback = await db.getAll("feedback")

    return {
      userBiases,
      favorites,
      settings,
      progress,
      streak,
      feedback,
      exportedAt: Date.now(),
    }
  }, "Failed to export data")
}

export async function addFeedback(feedback: FeedbackData): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    // Auto-increment key will be generated automatically
    await db.add("feedback", feedback)
  }, "Failed to add feedback")
}

export async function getAllFeedback(): Promise<FeedbackData[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("feedback")
  }, "Failed to load feedback")
}

export async function getFeedbackByBiasId(biasId: string): Promise<FeedbackData[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const index = db.transaction("feedback").store.index("by-biasId")
    return index.getAll(biasId)
  }, "Failed to load feedback by bias ID")
}

export async function importAllData(data: {
  userBiases?: Bias[]
  favorites?: FavoriteItem[]
  settings?: UserSettings
  progress?: BiasProgress[]
  streak?: StreakData
  feedback?: FeedbackData[]
}) {
  return withErrorHandling(async () => {
    const db = await getDB()

    if (data.userBiases) {
      for (const bias of data.userBiases) {
        await db.put("userBiases", bias)
      }
    }

    if (data.favorites) {
      for (const fav of data.favorites) {
        await db.put("favorites", fav)
      }
    }

    if (data.settings) {
      await db.put("settings", data.settings, "user-settings")
    }

    if (data.progress) {
      for (const prog of data.progress) {
        await db.put("progress", prog)
      }
    }

    if (data.streak) {
      await db.put("streak", data.streak, "user-streak")
    }

    if (data.feedback) {
      for (const feedback of data.feedback) {
        await db.add("feedback", feedback)
      }
    }
  }, "Failed to import data")
}

// Quiz Session Functions

/**
 * Save a quiz session
 */
export async function saveQuizSession(session: QuizSession): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.put("quizSessions", session)
  }, "Failed to save quiz session")
}

/**
 * Get all quiz sessions
 */
export async function getAllQuizSessions(): Promise<QuizSession[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("quizSessions")
  }, "Failed to load quiz sessions")
}

/**
 * Get completed quiz sessions only
 */
export async function getCompletedQuizSessions(): Promise<QuizSession[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const all = await db.getAll("quizSessions")
    return all.filter(s => s.completedAt !== null)
  }, "Failed to load completed quiz sessions")
}

/**
 * Get a single quiz session by ID
 */
export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const session = await db.get("quizSessions", sessionId)
    return session || null
  }, "Failed to load quiz session")
}

/**
 * Delete a quiz session
 */
export async function deleteQuizSession(sessionId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    await db.delete("quizSessions", sessionId)
  }, "Failed to delete quiz session")
}

// ==================== Achievement Functions ====================

/**
 * Get all unlocked achievements
 */
export async function getUnlockedAchievements(): Promise<UserAchievement[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    return db.getAll("achievements")
  }, "Failed to load achievements")
}

/**
 * Get a specific achievement
 */
export async function getAchievement(achievementId: string): Promise<UserAchievement | null> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const achievement = await db.get("achievements", achievementId)
    return achievement || null
  }, "Failed to load achievement")
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(achievementId: string, progress: number): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const existing = await db.get("achievements", achievementId)
    
    // Only unlock if not already unlocked
    if (!existing) {
      await db.put("achievements", {
        achievementId: achievementId as UserAchievement["achievementId"],
        unlockedAt: Date.now(),
        progress,
        seen: false
      })
    }
  }, "Failed to unlock achievement")
}

/**
 * Mark achievement as seen
 */
export async function markAchievementAsSeen(achievementId: string): Promise<void> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const achievement = await db.get("achievements", achievementId)
    
    if (achievement) {
      await db.put("achievements", {
        ...achievement,
        seen: true
      })
    }
  }, "Failed to mark achievement as seen")
}

/**
 * Get unseen achievements
 */
export async function getUnseenAchievements(): Promise<UserAchievement[]> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const all = await db.getAll("achievements")
    return all.filter(a => !a.seen)
  }, "Failed to load unseen achievements")
}

/**
 * Check if achievement is unlocked
 */
export async function isAchievementUnlocked(achievementId: string): Promise<boolean> {
  return withErrorHandling(async () => {
    const db = await getDB()
    const achievement = await db.get("achievements", achievementId)
    return !!achievement
  }, "Failed to check achievement status")
}

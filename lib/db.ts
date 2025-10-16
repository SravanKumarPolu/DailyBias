import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Bias, UserSettings, FavoriteItem, BiasProgress, StreakData } from "./types"
import { getYesterdayDateString } from "./timezone-utils"

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
}

let dbInstance: IDBPDatabase<BiasDB> | null = null

async function withErrorHandling<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`[DailyBias] ${errorMessage}:`, error)
    throw new Error(errorMessage)
  }
}

export async function getDB() {
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB<BiasDB>("bias-daily-db", 2, {
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
      },
    })

    return dbInstance
  } catch (error) {
    console.error("[DailyBias] Failed to initialize database:", error)
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
    timezoneAutoDetect: false,
    timezone: "UTC",
    }

    // Merge with defaults to handle migration of new fields
    return settings ? { ...defaults, ...settings } : defaults
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

    if (existing) {
      await db.put("progress", {
        ...existing,
        viewedAt: Date.now(),
        viewCount: existing.viewCount + 1,
      })
    } else {
      await db.put("progress", {
        biasId,
        viewedAt: Date.now(),
        viewCount: 1,
        mastered: false,
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

    return {
      userBiases,
      favorites,
      settings,
      progress,
      streak,
      exportedAt: Date.now(),
    }
  }, "Failed to export data")
}

export async function importAllData(data: {
  userBiases?: Bias[]
  favorites?: FavoriteItem[]
  settings?: UserSettings
  progress?: BiasProgress[]
  streak?: StreakData
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
  }, "Failed to import data")
}

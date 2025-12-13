export type BiasCategory = "decision" | "memory" | "social" | "perception" | "misc"

export type BiasSource = "core" | "user"

export interface Bias {
  id: string
  title: string
  category: BiasCategory
  summary: string
  why: string
  counter: string
  source: BiasSource
  references?: BiasReference[]
  researchLevel?: "established" | "emerging" | "contested"
  attribution?: BiasAttribution
  createdAt?: number
  updatedAt?: number
}

export interface BiasAttribution {
  termCoinedBy: { name: string; year: number } | null
  keyContributors: string[]
  researchConfidence: "high" | "medium" | "emerging"
  notes: string
}

export interface BiasReference {
  title: string
  authors: string
  year: number
  journal?: string
  url?: string
  type: "study" | "review" | "book" | "article"
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  backgroundStyle: "gradient" | "glass" | "minimal"
  dailyReminder: boolean
  mixUserBiasesInDaily: boolean
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  voiceName?: string
  timezone?: string // User's preferred timezone (auto-detected if not set)
  timezoneAutoDetect?: boolean // Whether to auto-detect timezone on app load
}

export interface FavoriteItem {
  biasId: string
  addedAt: number
}

export interface BiasProgress {
  biasId: string
  viewedAt: number
  viewCount: number
  mastered: boolean
}

export interface ProgressStats {
  totalBiasesRead: number
  currentStreak: number
  longestStreak: number
  lastViewedDate: string | null
  masteredCount: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastVisitDate: string
  totalDaysVisited: number
}

export type Settings = UserSettings

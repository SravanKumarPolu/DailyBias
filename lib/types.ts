export type BiasCategory = "decision" | "memory" | "social" | "perception" | "misc"

export type BiasSource = "core" | "user"

export interface BiasExample {
  title: string           // Brief title of the example
  description: string     // Detailed scenario showing bias in action
  source?: string        // Source (e.g., "Wells Fargo scandal", "NASA Challenger")
  year?: number          // Year of the event/study
  category: "business" | "politics" | "personal" | "historical" | "news"
}

export interface Bias {
  id: string
  title: string
  category: BiasCategory
  summary: string
  why: string
  counter: string
  source: BiasSource
  examples?: BiasExample[]  // Real-world examples showing bias in action
  tips?: string[]           // Quick actionable tips to counter the bias
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
  readBiasAloud?: boolean // Whether to automatically read bias content aloud
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
  // Spaced repetition fields
  lastReviewedAt?: number      // Timestamp of last review
  nextReviewAt?: number        // Timestamp when next review is due
  interval?: number            // Current interval in days (1, 3, 7, 14, 30)
  easeFactor?: number          // SM-2 ease factor (default 2.5)
  reviewCount?: number         // Total number of reviews completed
  consecutiveCorrect?: number  // Consecutive correct reviews (for interval progression)
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5
// 0 = Complete blackout (forgot everything)
// 1 = Incorrect, but recognized after seeing answer
// 2 = Incorrect, but easy to recall after seeing answer  
// 3 = Correct with serious difficulty
// 4 = Correct with some hesitation
// 5 = Perfect recall

export interface ReviewSession {
  biasId: string
  reviewedAt: number
  quality: ReviewQuality
  previousInterval: number
  newInterval: number
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

// Quiz Types
export interface QuizQuestion {
  id: string
  type: "identify" | "scenario" | "counter"  // What type of question
  biasId: string                              // The correct answer bias
  scenario: string                            // The scenario/question text
  options: QuizOption[]                       // Multiple choice options (4 options)
  difficulty: "easy" | "medium" | "hard"      // Based on user's familiarity
}

export interface QuizOption {
  biasId: string
  title: string
  isCorrect: boolean
}

export interface QuizAttempt {
  questionId: string
  biasId: string
  selectedBiasId: string
  isCorrect: boolean
  timeSpent: number  // milliseconds
  attemptedAt: number
}

export interface QuizSession {
  id: string
  startedAt: number
  completedAt: number | null
  questions: QuizQuestion[]
  attempts: QuizAttempt[]
  score: number       // Correct answers
  totalQuestions: number
}

export interface QuizStats {
  totalQuizzesTaken: number
  totalQuestionsAnswered: number
  totalCorrect: number
  averageScore: number        // Percentage
  bestScore: number           // Highest percentage in a session
  biasAccuracy: Record<string, { correct: number; total: number }>  // Per-bias accuracy
  lastQuizDate: string | null
  currentQuizStreak: number   // Days in a row with quiz
}

// Achievement/Badge System Types
export type AchievementCategory = "streak" | "mastery" | "quiz" | "exploration" | "engagement"

export type AchievementId =
  | "first-bias"           // View first bias
  | "first-week-streak"    // Maintain 7-day streak
  | "two-week-streak"      // Maintain 14-day streak
  | "month-streak"         // Maintain 30-day streak
  | "ten-biases"           // View 10 biases
  | "twenty-five-biases"   // View 25 biases
  | "all-core-biases"      // View all 50 core biases
  | "first-mastered"       // Master first bias
  | "five-mastered"        // Master 5 biases
  | "ten-mastered"         // Master 10 biases
  | "all-social-biases"    // Master all social biases
  | "all-decision-biases"  // Master all decision biases
  | "all-memory-biases"    // Master all memory biases
  | "all-perception-biases"// Master all perception biases
  | "quiz-novice"          // Complete first quiz
  | "quiz-master"          // Complete 10 quizzes
  | "perfect-quiz"         // Get 100% on a quiz
  | "favorite-collector"   // Add 5 favorites
  | "custom-creator"       // Create first custom bias
  | "feedback-provider"    // Submit first feedback

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  category: AchievementCategory
  icon: string              // Emoji or icon name
  rarity: "common" | "rare" | "epic" | "legendary"
  requirement: number       // The target number (e.g., 7 for 7-day streak)
  hidden?: boolean          // If true, don't show until unlocked
}

export interface UserAchievement {
  achievementId: AchievementId
  unlockedAt: number        // Timestamp when unlocked
  progress: number          // Current progress towards achievement
  seen: boolean             // Whether user has seen the unlock notification
}

export interface AchievementProgress {
  achievementId: AchievementId
  current: number           // Current value
  target: number            // Target value
  percentage: number        // Progress percentage (0-100)
}

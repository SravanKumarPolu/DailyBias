import type { Achievement, AchievementId, AchievementProgress, BiasProgress, Bias, QuizSession } from "./types"
import { unlockAchievement, isAchievementUnlocked } from "./db"
import { logger } from "./logger"

/**
 * All available achievements in the app
 */
export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  // First Steps
  "first-bias": {
    id: "first-bias",
    title: "First Step",
    description: "View your first cognitive bias",
    category: "exploration",
    icon: "👀",
    rarity: "common",
    requirement: 1
  },
  
  // Streak Achievements
  "first-week-streak": {
    id: "first-week-streak",
    title: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    category: "streak",
    icon: "🔥",
    rarity: "rare",
    requirement: 7
  },
  "two-week-streak": {
    id: "two-week-streak",
    title: "Fortnight Fighter",
    description: "Maintain a 14-day learning streak",
    category: "streak",
    icon: "⚡",
    rarity: "epic",
    requirement: 14
  },
  "month-streak": {
    id: "month-streak",
    title: "Monthly Master",
    description: "Maintain a 30-day learning streak",
    category: "streak",
    icon: "🌟",
    rarity: "legendary",
    requirement: 30
  },
  
  // Exploration Achievements
  "ten-biases": {
    id: "ten-biases",
    title: "Explorer",
    description: "View 10 different cognitive biases",
    category: "exploration",
    icon: "🗺️",
    rarity: "common",
    requirement: 10
  },
  "twenty-five-biases": {
    id: "twenty-five-biases",
    title: "Knowledge Seeker",
    description: "View 25 different cognitive biases",
    category: "exploration",
    icon: "📚",
    rarity: "rare",
    requirement: 25
  },
  "all-core-biases": {
    id: "all-core-biases",
    title: "Completionist",
    description: "View all 50 core cognitive biases",
    category: "exploration",
    icon: "🏆",
    rarity: "epic",
    requirement: 50
  },
  
  // Mastery Achievements
  "first-mastered": {
    id: "first-mastered",
    title: "First Mastery",
    description: "Master your first cognitive bias",
    category: "mastery",
    icon: "⭐",
    rarity: "common",
    requirement: 1
  },
  "five-mastered": {
    id: "five-mastered",
    title: "Bias Expert",
    description: "Master 5 cognitive biases",
    category: "mastery",
    icon: "🌟",
    rarity: "rare",
    requirement: 5
  },
  "ten-mastered": {
    id: "ten-mastered",
    title: "Cognitive Master",
    description: "Master 10 cognitive biases",
    category: "mastery",
    icon: "💎",
    rarity: "epic",
    requirement: 10
  },
  
  // Category Mastery Achievements
  "all-social-biases": {
    id: "all-social-biases",
    title: "Social Psychologist",
    description: "Master all social cognitive biases",
    category: "mastery",
    icon: "👥",
    rarity: "epic",
    requirement: 1 // Will be calculated dynamically
  },
  "all-decision-biases": {
    id: "all-decision-biases",
    title: "Decision Expert",
    description: "Master all decision-making biases",
    category: "mastery",
    icon: "🎯",
    rarity: "epic",
    requirement: 1 // Will be calculated dynamically
  },
  "all-memory-biases": {
    id: "all-memory-biases",
    title: "Memory Master",
    description: "Master all memory-related biases",
    category: "mastery",
    icon: "🧠",
    rarity: "epic",
    requirement: 1 // Will be calculated dynamically
  },
  "all-perception-biases": {
    id: "all-perception-biases",
    title: "Perception Pro",
    description: "Master all perception biases",
    category: "mastery",
    icon: "👁️",
    rarity: "epic",
    requirement: 1 // Will be calculated dynamically
  },
  
  // Quiz Achievements
  "quiz-novice": {
    id: "quiz-novice",
    title: "Quiz Novice",
    description: "Complete your first quiz",
    category: "quiz",
    icon: "📝",
    rarity: "common",
    requirement: 1
  },
  "quiz-master": {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    category: "quiz",
    icon: "🎓",
    rarity: "rare",
    requirement: 10
  },
  "perfect-quiz": {
    id: "perfect-quiz",
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    category: "quiz",
    icon: "💯",
    rarity: "epic",
    requirement: 1
  },
  
  // Engagement Achievements
  "favorite-collector": {
    id: "favorite-collector",
    title: "Favorite Collector",
    description: "Add 5 biases to favorites",
    category: "engagement",
    icon: "❤️",
    rarity: "common",
    requirement: 5
  },
  "custom-creator": {
    id: "custom-creator",
    title: "Content Creator",
    description: "Create your first custom bias",
    category: "engagement",
    icon: "✍️",
    rarity: "rare",
    requirement: 1
  },
  "feedback-provider": {
    id: "feedback-provider",
    title: "Feedback Hero",
    description: "Submit your first feedback",
    category: "engagement",
    icon: "💬",
    rarity: "common",
    requirement: 1
  }
}

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: AchievementId): Achievement {
  return ACHIEVEMENTS[id]
}

/**
 * Get all achievement definitions
 */
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category)
}

/**
 * Calculate progress for all achievements based on current stats
 */
export async function calculateAchievementProgress(
  progressList: BiasProgress[],
  allBiases: Bias[],
  quizSessions: QuizSession[],
  favoritesCount: number,
  userBiasesCount: number,
  feedbackCount: number,
  currentStreak: number
): Promise<AchievementProgress[]> {
  const progress: AchievementProgress[] = []
  
  // Calculate stats
  const viewedCount = progressList.length
  const masteredCount = progressList.filter(p => p.mastered).length
  const completedQuizzes = quizSessions.filter(s => s.completedAt !== null).length
  const perfectQuizzes = quizSessions.filter(s => 
    s.completedAt !== null && s.score === s.totalQuestions
  ).length
  
  // Category mastery counts
  const coreBiases = allBiases.filter(b => b.source === "core")
  const socialBiases = coreBiases.filter(b => b.category === "social")
  const decisionBiases = coreBiases.filter(b => b.category === "decision")
  const memoryBiases = coreBiases.filter(b => b.category === "memory")
  const perceptionBiases = coreBiases.filter(b => b.category === "perception")
  
  const masteredSocial = progressList.filter(p => {
    const bias = allBiases.find(b => b.id === p.biasId)
    return p.mastered && bias?.category === "social" && bias?.source === "core"
  }).length
  
  const masteredDecision = progressList.filter(p => {
    const bias = allBiases.find(b => b.id === p.biasId)
    return p.mastered && bias?.category === "decision" && bias?.source === "core"
  }).length
  
  const masteredMemory = progressList.filter(p => {
    const bias = allBiases.find(b => b.id === p.biasId)
    return p.mastered && bias?.category === "memory" && bias?.source === "core"
  }).length
  
  const masteredPerception = progressList.filter(p => {
    const bias = allBiases.find(b => b.id === p.biasId)
    return p.mastered && bias?.category === "perception" && bias?.source === "core"
  }).length
  
  // Check each achievement
  const achievements = getAllAchievements()
  
  for (const achievement of achievements) {
    let current = 0
    let target = achievement.requirement
    
    switch (achievement.id) {
      // Exploration
      case "first-bias":
      case "ten-biases":
      case "twenty-five-biases":
      case "all-core-biases":
        current = viewedCount
        break
      
      // Streaks
      case "first-week-streak":
      case "two-week-streak":
      case "month-streak":
        current = currentStreak
        break
      
      // Mastery
      case "first-mastered":
      case "five-mastered":
      case "ten-mastered":
        current = masteredCount
        break
      
      // Category Mastery
      case "all-social-biases":
        current = masteredSocial
        target = socialBiases.length
        break
      case "all-decision-biases":
        current = masteredDecision
        target = decisionBiases.length
        break
      case "all-memory-biases":
        current = masteredMemory
        target = memoryBiases.length
        break
      case "all-perception-biases":
        current = masteredPerception
        target = perceptionBiases.length
        break
      
      // Quiz
      case "quiz-novice":
      case "quiz-master":
        current = completedQuizzes
        break
      case "perfect-quiz":
        current = perfectQuizzes
        break
      
      // Engagement
      case "favorite-collector":
        current = favoritesCount
        break
      case "custom-creator":
        current = userBiasesCount
        break
      case "feedback-provider":
        current = feedbackCount
        break
    }
    
    const percentage = Math.min(100, Math.round((current / target) * 100))
    
    progress.push({
      achievementId: achievement.id,
      current,
      target,
      percentage
    })
  }
  
  return progress
}

/**
 * Check and unlock achievements based on current progress
 * Returns newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  progressData: AchievementProgress[]
): Promise<Achievement[]> {
  const newlyUnlocked: Achievement[] = []
  
  try {
    for (const progress of progressData) {
      // Check if achievement is complete
      if (progress.current >= progress.target) {
        const isUnlocked = await isAchievementUnlocked(progress.achievementId)
        
        // Unlock if not already unlocked
        if (!isUnlocked) {
          await unlockAchievement(progress.achievementId, progress.current)
          const achievement = getAchievementDefinition(progress.achievementId)
          newlyUnlocked.push(achievement)
          logger.info(`[Achievements] Unlocked: ${achievement.title}`)
        }
      }
    }
  } catch (error) {
    logger.error("[Achievements] Error checking achievements:", error)
  }
  
  return newlyUnlocked
}

/**
 * Get rarity color for badges
 */
export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "bg-gray-500"
    case "rare":
      return "bg-blue-500"
    case "epic":
      return "bg-purple-500"
    case "legendary":
      return "bg-amber-500"
    default:
      return "bg-gray-500"
  }
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: Achievement["rarity"]): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}


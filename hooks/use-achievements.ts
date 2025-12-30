"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserAchievement, AchievementProgress } from "@/lib/types"
import { 
  getUnlockedAchievements, 
  getUnseenAchievements,
  markAchievementAsSeen 
} from "@/lib/db"
import { 
  calculateAchievementProgress, 
  checkAndUnlockAchievements,
  getAchievementDefinition,
  getAllAchievements
} from "@/lib/achievements"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useAchievements(
  progressList: any[],
  allBiases: any[],
  quizSessions: any[],
  favoritesCount: number,
  userBiasesCount: number,
  feedbackCount: number,
  currentStreak: number
) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([])
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load unlocked achievements
  const loadAchievements = useCallback(async () => {
    try {
      setError(null)
      const unlocked = await getUnlockedAchievements()
      setUnlockedAchievements(unlocked)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load achievements"
      setError(errorMessage)
      logger.error("[Achievements] Failed to load:", error)
    }
  }, [])

  // Calculate progress and check for new achievements
  const checkAchievements = useCallback(async () => {
    try {
      // Calculate progress for all achievements
      const progress = await calculateAchievementProgress(
        progressList,
        allBiases,
        quizSessions,
        favoritesCount,
        userBiasesCount,
        feedbackCount,
        currentStreak
      )
      setAchievementProgress(progress)

      // Check and unlock new achievements
      const newlyUnlocked = await checkAndUnlockAchievements(progress)
      
      // Show toast for newly unlocked achievements
      for (const achievement of newlyUnlocked) {
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
          duration: 5000,
        })
      }

      // Reload unlocked achievements if any new ones
      if (newlyUnlocked.length > 0) {
        await loadAchievements()
      }
    } catch (error) {
      logger.error("[Achievements] Failed to check achievements:", error)
    }
  }, [
    progressList,
    allBiases,
    quizSessions,
    favoritesCount,
    userBiasesCount,
    feedbackCount,
    currentStreak,
    loadAchievements
  ])

  // Load achievements on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      await loadAchievements()
      await checkAchievements()
      setLoading(false)
    }
    
    initialize()
  }, [loadAchievements, checkAchievements])

  // Mark achievement as seen
  const markAsSeen = useCallback(async (achievementId: string) => {
    try {
      await markAchievementAsSeen(achievementId)
      await loadAchievements()
    } catch (error) {
      logger.error("[Achievements] Failed to mark as seen:", error)
    }
  }, [loadAchievements])

  // Get unseen achievements
  const getUnseen = useCallback(async () => {
    try {
      return await getUnseenAchievements()
    } catch (error) {
      logger.error("[Achievements] Failed to get unseen:", error)
      return []
    }
  }, [])

  // Check if achievement is unlocked
  const isUnlocked = useCallback((achievementId: string) => {
    return unlockedAchievements.some(a => a.achievementId === achievementId)
  }, [unlockedAchievements])

  // Get achievement with unlock status
  const getAchievementWithStatus = useCallback((achievementId: string) => {
    const definition = getAchievementDefinition(achievementId as any)
    const unlocked = unlockedAchievements.find(a => a.achievementId === achievementId)
    const progress = achievementProgress.find(p => p.achievementId === achievementId)
    
    return {
      ...definition,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt,
      progress: progress || { achievementId: achievementId as any, current: 0, target: definition.requirement, percentage: 0 }
    }
  }, [unlockedAchievements, achievementProgress])

  // Get all achievements with status
  const getAllWithStatus = useCallback(() => {
    const all = getAllAchievements()
    return all.map(achievement => getAchievementWithStatus(achievement.id))
  }, [getAchievementWithStatus])

  // Get statistics
  const stats = {
    total: getAllAchievements().length,
    unlocked: unlockedAchievements.length,
    percentage: Math.round((unlockedAchievements.length / getAllAchievements().length) * 100)
  }

  return {
    unlockedAchievements,
    achievementProgress,
    loading,
    error,
    stats,
    isUnlocked,
    getAchievementWithStatus,
    getAllWithStatus,
    markAsSeen,
    getUnseen,
    refresh: checkAchievements
  }
}


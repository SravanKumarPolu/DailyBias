import { describe, it, expect, beforeEach } from "vitest"
import {
  ACHIEVEMENTS,
  getAchievementDefinition,
  getAllAchievements,
  getAchievementsByCategory,
  calculateAchievementProgress,
  getRarityColor,
  getRarityLabel
} from "@/lib/achievements"
import type { BiasProgress, Bias, QuizSession } from "@/lib/types"

describe("Achievements", () => {
  describe("Achievement Definitions", () => {
    it("should have all required achievements", () => {
      const requiredAchievements = [
        "first-bias",
        "first-week-streak",
        "quiz-master",
        "all-social-biases",
        "perfect-quiz"
      ]

      requiredAchievements.forEach(id => {
        expect(ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS]).toBeDefined()
      })
    })

    it("should have valid achievement structure", () => {
      Object.values(ACHIEVEMENTS).forEach(achievement => {
        expect(achievement).toHaveProperty("id")
        expect(achievement).toHaveProperty("title")
        expect(achievement).toHaveProperty("description")
        expect(achievement).toHaveProperty("category")
        expect(achievement).toHaveProperty("icon")
        expect(achievement).toHaveProperty("rarity")
        expect(achievement).toHaveProperty("requirement")
      })
    })

    it("should get achievement definition by ID", () => {
      const achievement = getAchievementDefinition("first-week-streak")
      expect(achievement.title).toBe("Week Warrior")
      expect(achievement.requirement).toBe(7)
    })

    it("should get all achievements", () => {
      const all = getAllAchievements()
      expect(all.length).toBeGreaterThan(0)
      expect(all.length).toBe(Object.keys(ACHIEVEMENTS).length)
    })

    it("should filter achievements by category", () => {
      const streakAchievements = getAchievementsByCategory("streak")
      expect(streakAchievements.length).toBeGreaterThan(0)
      streakAchievements.forEach(achievement => {
        expect(achievement.category).toBe("streak")
      })
    })
  })

  describe("Achievement Progress Calculation", () => {
    let mockProgressList: BiasProgress[]
    let mockBiases: Bias[]
    let mockQuizSessions: QuizSession[]

    beforeEach(() => {
      // Mock progress list
      mockProgressList = [
        {
          biasId: "bias-1",
          viewedAt: Date.now(),
          viewCount: 1,
          mastered: true
        },
        {
          biasId: "bias-2",
          viewedAt: Date.now(),
          viewCount: 1,
          mastered: false
        }
      ]

      // Mock biases
      mockBiases = [
        {
          id: "bias-1",
          title: "Confirmation Bias",
          category: "decision",
          summary: "Test",
          why: "Test",
          counter: "Test",
          source: "core"
        },
        {
          id: "bias-2",
          title: "Anchoring Bias",
          category: "social",
          summary: "Test",
          why: "Test",
          counter: "Test",
          source: "core"
        }
      ]

      // Mock quiz sessions
      mockQuizSessions = [
        {
          id: "quiz-1",
          startedAt: Date.now(),
          completedAt: Date.now(),
          questions: [],
          attempts: [],
          score: 5,
          totalQuestions: 5
        }
      ]
    })

    it("should calculate exploration achievements", async () => {
      const progress = await calculateAchievementProgress(
        mockProgressList,
        mockBiases,
        mockQuizSessions,
        0,
        0,
        0,
        0
      )

      const firstBias = progress.find(p => p.achievementId === "first-bias")
      expect(firstBias).toBeDefined()
      expect(firstBias?.current).toBe(2) // 2 biases viewed
      expect(firstBias?.target).toBe(1)
      expect(firstBias?.percentage).toBe(100)
    })

    it("should calculate mastery achievements", async () => {
      const progress = await calculateAchievementProgress(
        mockProgressList,
        mockBiases,
        mockQuizSessions,
        0,
        0,
        0,
        0
      )

      const firstMastered = progress.find(p => p.achievementId === "first-mastered")
      expect(firstMastered).toBeDefined()
      expect(firstMastered?.current).toBe(1) // 1 bias mastered
      expect(firstMastered?.target).toBe(1)
      expect(firstMastered?.percentage).toBe(100)
    })

    it("should calculate streak achievements", async () => {
      const progress = await calculateAchievementProgress(
        mockProgressList,
        mockBiases,
        mockQuizSessions,
        0,
        0,
        0,
        7 // 7-day streak
      )

      const weekStreak = progress.find(p => p.achievementId === "first-week-streak")
      expect(weekStreak).toBeDefined()
      expect(weekStreak?.current).toBe(7)
      expect(weekStreak?.target).toBe(7)
      expect(weekStreak?.percentage).toBe(100)
    })

    it("should calculate quiz achievements", async () => {
      const progress = await calculateAchievementProgress(
        mockProgressList,
        mockBiases,
        mockQuizSessions,
        0,
        0,
        0,
        0
      )

      const quizNovice = progress.find(p => p.achievementId === "quiz-novice")
      expect(quizNovice).toBeDefined()
      expect(quizNovice?.current).toBe(1) // 1 quiz completed
      expect(quizNovice?.target).toBe(1)

      const perfectQuiz = progress.find(p => p.achievementId === "perfect-quiz")
      expect(perfectQuiz).toBeDefined()
      expect(perfectQuiz?.current).toBe(1) // 1 perfect quiz
    })

    it("should calculate engagement achievements", async () => {
      const progress = await calculateAchievementProgress(
        mockProgressList,
        mockBiases,
        mockQuizSessions,
        5, // 5 favorites
        1, // 1 custom bias
        1, // 1 feedback
        0
      )

      const favoriteCollector = progress.find(p => p.achievementId === "favorite-collector")
      expect(favoriteCollector).toBeDefined()
      expect(favoriteCollector?.current).toBe(5)
      expect(favoriteCollector?.target).toBe(5)

      const customCreator = progress.find(p => p.achievementId === "custom-creator")
      expect(customCreator).toBeDefined()
      expect(customCreator?.current).toBe(1)

      const feedbackProvider = progress.find(p => p.achievementId === "feedback-provider")
      expect(feedbackProvider).toBeDefined()
      expect(feedbackProvider?.current).toBe(1)
    })

    it("should calculate category mastery achievements", async () => {
      // Add more biases to test category mastery
      const socialBias: BiasProgress = {
        biasId: "bias-2",
        viewedAt: Date.now(),
        viewCount: 1,
        mastered: true
      }

      const progressWithMastery = [...mockProgressList.slice(0, 1), socialBias]

      const progress = await calculateAchievementProgress(
        progressWithMastery,
        mockBiases,
        mockQuizSessions,
        0,
        0,
        0,
        0
      )

      const allSocial = progress.find(p => p.achievementId === "all-social-biases")
      expect(allSocial).toBeDefined()
      expect(allSocial?.current).toBe(1) // 1 social bias mastered
    })
  })

  describe("Rarity Helpers", () => {
    it("should return correct rarity colors", () => {
      expect(getRarityColor("common")).toBe("bg-gray-500")
      expect(getRarityColor("rare")).toBe("bg-blue-500")
      expect(getRarityColor("epic")).toBe("bg-purple-500")
      expect(getRarityColor("legendary")).toBe("bg-amber-500")
    })

    it("should return correct rarity labels", () => {
      expect(getRarityLabel("common")).toBe("Common")
      expect(getRarityLabel("rare")).toBe("Rare")
      expect(getRarityLabel("epic")).toBe("Epic")
      expect(getRarityLabel("legendary")).toBe("Legendary")
    })
  })
})


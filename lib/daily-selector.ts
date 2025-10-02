import coreBiases from "@/data/biases.json"
import type { Bias, BiasProgress } from "./types"

// Simple hash function for deterministic selection
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getDailyBias(allBiases: Bias[], dateString: string = getTodayDateString()): Bias {
  const hash = hashString(dateString)
  const index = hash % allBiases.length
  return allBiases[index]
}

export function getPersonalizedDailyBias(
  allBiases: Bias[],
  progressList: BiasProgress[],
  dateString: string = getTodayDateString(),
): Bias {
  if (allBiases.length === 0) {
    throw new Error("No biases available")
  }

  // Create a map of bias progress for quick lookup
  const progressMap = new Map<string, BiasProgress>()
  for (const progress of progressList) {
    progressMap.set(progress.biasId, progress)
  }

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const oneWeekMs = 7 * oneDayMs

  // Score each bias based on multiple factors
  const scoredBiases = allBiases.map((bias) => {
    const progress = progressMap.get(bias.id)
    let score = 100 // Base score

    if (!progress) {
      // Never viewed - highest priority
      score += 500
    } else {
      // Already viewed
      const daysSinceView = (now - progress.viewedAt) / oneDayMs

      if (progress.mastered) {
        // Mastered biases get lower priority
        score -= 200

        // But show them occasionally for review (every 2+ weeks)
        if (daysSinceView > 14) {
          score += 50
        }
      } else {
        // Not mastered - should review
        score += 100

        // Boost score based on time since last view
        if (daysSinceView > 7) {
          score += 150
        } else if (daysSinceView > 3) {
          score += 75
        } else if (daysSinceView < 1) {
          // Viewed very recently - reduce priority
          score -= 300
        }
      }

      // Reduce score for frequently viewed biases
      if (progress.viewCount > 5) {
        score -= progress.viewCount * 10
      }
    }

    // Add some randomness based on the date to ensure variety
    const dateHash = hashString(dateString + bias.id)
    const randomBonus = (dateHash % 100) - 50 // -50 to +50

    score += randomBonus

    return { bias, score }
  })

  // Sort by score descending
  scoredBiases.sort((a, b) => b.score - a.score)

  // Select from top candidates with weighted randomness
  const topCandidates = scoredBiases.slice(0, Math.min(5, scoredBiases.length))

  // Use date-based hash to deterministically select from top candidates
  const dateHash = hashString(dateString)
  const selectedIndex = dateHash % topCandidates.length

  return topCandidates[selectedIndex].bias
}

export function getCategoryDistribution(progressList: BiasProgress[], allBiases: Bias[]): Record<string, number> {
  const distribution: Record<string, number> = {
    decision: 0,
    memory: 0,
    social: 0,
    perception: 0,
    misc: 0,
  }

  const progressMap = new Map(progressList.map((p) => [p.biasId, p]))

  for (const bias of allBiases) {
    if (progressMap.has(bias.id)) {
      distribution[bias.category]++
    }
  }

  return distribution
}

export function getBalancedRecommendation(allBiases: Bias[], progressList: BiasProgress[]): Bias | null {
  const distribution = getCategoryDistribution(progressList, allBiases)
  const progressMap = new Map(progressList.map((p) => [p.biasId, p]))

  // Find the least explored category
  const categories = Object.entries(distribution).sort((a, b) => a[1] - b[1])
  const leastExploredCategory = categories[0][0]

  // Find unviewed biases in that category
  const unviewedInCategory = allBiases.filter(
    (bias) => bias.category === leastExploredCategory && !progressMap.has(bias.id),
  )

  if (unviewedInCategory.length > 0) {
    return unviewedInCategory[0]
  }

  // If all viewed, find any unviewed bias
  const unviewed = allBiases.filter((bias) => !progressMap.has(bias.id))
  return unviewed.length > 0 ? unviewed[0] : null
}

export function getCoreBiases(): Bias[] {
  return coreBiases as Bias[]
}

export function getAllBiases(userBiases: Bias[]): Bias[] {
  return [...getCoreBiases(), ...userBiases]
}

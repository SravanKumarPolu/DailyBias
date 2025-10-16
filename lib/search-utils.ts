import type { Bias } from "./types"

/**
 * Calculate similarity score between two strings using a simple fuzzy matching algorithm
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Exact match
  if (s1 === s2) return 1

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8
  }

  // Calculate Levenshtein distance for fuzzy matching
  const matrix: number[][] = []

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)

  return 1 - distance / maxLength
}

/**
 * Search for query terms in a text field and return a relevance score
 */
function searchInField(field: string, query: string): number {
  const fieldLower = field.toLowerCase()
  const queryLower = query.toLowerCase()

  // Exact match in field
  if (fieldLower.includes(queryLower)) {
    return 1.0
  }

  // Split query into words and check each
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)
  if (queryWords.length === 0) return 0

  let totalScore = 0
  let matchCount = 0

  for (const word of queryWords) {
    // Check if word is in field
    if (fieldLower.includes(word)) {
      totalScore += 0.8
      matchCount++
      continue
    }

    // Fuzzy match each word against field words
    const fieldWords = fieldLower.split(/\s+/)
    let bestScore = 0

    for (const fieldWord of fieldWords) {
      if (fieldWord.length < 3) continue
      const similarity = calculateSimilarity(fieldWord, word)
      if (similarity > bestScore) {
        bestScore = similarity
      }
    }

    if (bestScore > 0.7) {
      totalScore += bestScore
      matchCount++
    }
  }

  return matchCount > 0 ? totalScore / queryWords.length : 0
}

export interface SearchResult {
  bias: Bias
  score: number
  matchedFields: string[]
}

/**
 * Search biases with fuzzy matching and relevance scoring
 * Searches across title, summary, why, and counter fields
 */
export function searchBiases(biases: Bias[], query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return biases.map((bias) => ({ bias, score: 1, matchedFields: [] }))
  }

  const results: SearchResult[] = []

  for (const bias of biases) {
    const matchedFields: string[] = []
    let totalScore = 0

    // Search in title (highest weight)
    const titleScore = searchInField(bias.title, query)
    if (titleScore > 0) {
      totalScore += titleScore * 3
      matchedFields.push("title")
    }

    // Search in summary (high weight)
    const summaryScore = searchInField(bias.summary, query)
    if (summaryScore > 0) {
      totalScore += summaryScore * 2
      matchedFields.push("summary")
    }

    // Search in why (medium weight)
    const whyScore = searchInField(bias.why, query)
    if (whyScore > 0) {
      totalScore += whyScore * 1.5
      matchedFields.push("why")
    }

    // Search in counter (medium weight)
    const counterScore = searchInField(bias.counter, query)
    if (counterScore > 0) {
      totalScore += counterScore * 1.5
      matchedFields.push("counter")
    }

    // Only include results with some match
    if (matchedFields.length > 0) {
      // Normalize score
      const normalizedScore = totalScore / (3 + 2 + 1.5 + 1.5)
      results.push({ bias, score: normalizedScore, matchedFields })
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Highlight matching text in a string
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || query.trim().length === 0) return text

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Find exact matches
  const index = textLower.indexOf(queryLower)
  if (index !== -1) {
    return (
      text.substring(0, index) +
      "<mark>" +
      text.substring(index, index + query.length) +
      "</mark>" +
      text.substring(index + query.length)
    )
  }

  // Find word matches
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)
  let result = text

  for (const word of queryWords) {
    const regex = new RegExp(`\\b(${word})\\b`, "gi")
    result = result.replace(regex, "<mark>$1</mark>")
  }

  return result
}

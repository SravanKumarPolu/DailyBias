/**
 * Quiz System for DebiasDaily
 * 
 * Generates "Which bias is this?" questions from scenarios
 * Uses the bias summaries as scenarios and tests user's ability to identify them
 */

import type { Bias, BiasProgress, QuizQuestion, QuizOption, QuizSession, QuizAttempt, QuizStats } from "./types"
import { logger } from "./logger"

const QUESTIONS_PER_QUIZ = 5
const OPTIONS_PER_QUESTION = 4

/**
 * Scenario templates that transform bias summaries into quiz questions
 */
const SCENARIO_TEMPLATES = [
  "Someone exhibits this behavior: {summary} Which cognitive bias is this?",
  "A friend describes this pattern: {summary} What bias are they describing?",
  "You notice this in yourself: {summary} Which bias explains this?",
  "In a meeting, you observe: {summary} What cognitive bias is at play?",
  "A study shows people tend to: {summary} What's this bias called?",
]

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Determine difficulty based on user's progress with a bias
 */
function getDifficulty(progress: BiasProgress | undefined): "easy" | "medium" | "hard" {
  if (!progress) return "easy"
  
  const viewCount = progress.viewCount || 0
  const reviewCount = progress.reviewCount || 0
  
  if (reviewCount >= 3 || progress.mastered) return "hard"
  if (viewCount >= 2 || reviewCount >= 1) return "medium"
  return "easy"
}

/**
 * Create a scenario from a bias summary
 */
function createScenario(bias: Bias): string {
  const template = getRandomItem(SCENARIO_TEMPLATES)
  // Use a shortened version of the summary for the scenario
  const shortSummary = bias.summary.split(".")[0] + "."
  return template.replace("{summary}", `"${shortSummary}"`)
}

/**
 * Generate wrong options (distractors) for a question
 * Tries to pick biases from the same category for harder questions
 */
function generateDistractors(
  correctBias: Bias,
  allBiases: Bias[],
  count: number,
  difficulty: "easy" | "medium" | "hard"
): Bias[] {
  const otherBiases = allBiases.filter(b => b.id !== correctBias.id)
  
  let candidates: Bias[]
  
  if (difficulty === "hard") {
    // For hard questions, prefer same category biases
    const sameCategory = otherBiases.filter(b => b.category === correctBias.category)
    if (sameCategory.length >= count) {
      candidates = shuffleArray(sameCategory)
    } else {
      // Mix same category with others
      const others = otherBiases.filter(b => b.category !== correctBias.category)
      candidates = shuffleArray([...sameCategory, ...shuffleArray(others)])
    }
  } else if (difficulty === "medium") {
    // For medium, mix categories
    candidates = shuffleArray(otherBiases)
  } else {
    // For easy, prefer different categories (more obviously wrong)
    const differentCategory = otherBiases.filter(b => b.category !== correctBias.category)
    if (differentCategory.length >= count) {
      candidates = shuffleArray(differentCategory)
    } else {
      candidates = shuffleArray(otherBiases)
    }
  }
  
  return candidates.slice(0, count)
}

/**
 * Generate a single quiz question
 */
export function generateQuestion(
  correctBias: Bias,
  allBiases: Bias[],
  progress?: BiasProgress
): QuizQuestion {
  const difficulty = getDifficulty(progress)
  const distractors = generateDistractors(correctBias, allBiases, OPTIONS_PER_QUESTION - 1, difficulty)
  
  const options: QuizOption[] = [
    { biasId: correctBias.id, title: correctBias.title, isCorrect: true },
    ...distractors.map(b => ({ biasId: b.id, title: b.title, isCorrect: false }))
  ]
  
  // Shuffle options so correct answer isn't always first
  const shuffledOptions = shuffleArray(options)
  
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "identify",
    biasId: correctBias.id,
    scenario: createScenario(correctBias),
    options: shuffledOptions,
    difficulty,
  }
}

/**
 * Generate a complete quiz session
 */
export function generateQuizSession(
  allBiases: Bias[],
  progressList: BiasProgress[],
  questionCount: number = QUESTIONS_PER_QUIZ
): QuizSession {
  // Prefer biases the user has viewed (for meaningful testing)
  const viewedBiasIds = new Set(progressList.filter(p => p.viewedAt > 0).map(p => p.biasId))
  const viewedBiases = allBiases.filter(b => viewedBiasIds.has(b.id))
  
  // If user hasn't viewed enough biases, include some core ones
  let candidateBiases: Bias[]
  if (viewedBiases.length >= questionCount) {
    candidateBiases = shuffleArray(viewedBiases)
  } else {
    // Mix viewed biases with random core biases
    const unviewedCore = allBiases.filter(b => !viewedBiasIds.has(b.id) && b.source === "core")
    candidateBiases = shuffleArray([...viewedBiases, ...shuffleArray(unviewedCore)])
  }
  
  // Generate questions
  const selectedBiases = candidateBiases.slice(0, questionCount)
  const questions = selectedBiases.map(bias => {
    const progress = progressList.find(p => p.biasId === bias.id)
    return generateQuestion(bias, allBiases, progress)
  })
  
  return {
    id: generateSessionId(),
    startedAt: Date.now(),
    completedAt: null,
    questions,
    attempts: [],
    score: 0,
    totalQuestions: questions.length,
  }
}

/**
 * Process an answer and return updated session
 */
export function processAnswer(
  session: QuizSession,
  questionIndex: number,
  selectedBiasId: string,
  timeSpent: number
): { session: QuizSession; isCorrect: boolean } {
  const question = session.questions[questionIndex]
  if (!question) {
    logger.error("[Quiz] Invalid question index:", questionIndex)
    return { session, isCorrect: false }
  }
  
  const isCorrect = selectedBiasId === question.biasId
  
  const attempt: QuizAttempt = {
    questionId: question.id,
    biasId: question.biasId,
    selectedBiasId,
    isCorrect,
    timeSpent,
    attemptedAt: Date.now(),
  }
  
  const updatedSession: QuizSession = {
    ...session,
    attempts: [...session.attempts, attempt],
    score: isCorrect ? session.score + 1 : session.score,
  }
  
  return { session: updatedSession, isCorrect }
}

/**
 * Complete a quiz session
 */
export function completeSession(session: QuizSession): QuizSession {
  return {
    ...session,
    completedAt: Date.now(),
  }
}

/**
 * Calculate quiz statistics from sessions
 */
export function calculateQuizStats(sessions: QuizSession[]): QuizStats {
  const completedSessions = sessions.filter(s => s.completedAt !== null)
  
  if (completedSessions.length === 0) {
    return {
      totalQuizzesTaken: 0,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      averageScore: 0,
      bestScore: 0,
      biasAccuracy: {},
      lastQuizDate: null,
      currentQuizStreak: 0,
    }
  }
  
  let totalQuestionsAnswered = 0
  let totalCorrect = 0
  let bestScorePercentage = 0
  const biasAccuracy: Record<string, { correct: number; total: number }> = {}
  
  completedSessions.forEach(session => {
    totalQuestionsAnswered += session.attempts.length
    totalCorrect += session.score
    
    const sessionPercentage = session.totalQuestions > 0 
      ? (session.score / session.totalQuestions) * 100 
      : 0
    bestScorePercentage = Math.max(bestScorePercentage, sessionPercentage)
    
    // Track per-bias accuracy
    session.attempts.forEach(attempt => {
      if (!biasAccuracy[attempt.biasId]) {
        biasAccuracy[attempt.biasId] = { correct: 0, total: 0 }
      }
      biasAccuracy[attempt.biasId].total++
      if (attempt.isCorrect) {
        biasAccuracy[attempt.biasId].correct++
      }
    })
  })
  
  // Calculate streak (consecutive days with quiz)
  const sortedSessions = [...completedSessions].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
  let streak = 0
  const today = new Date()
  const todayStr = today.toDateString()
  
  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i]
    const sessionDate = new Date(session.completedAt || 0).toDateString()
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - streak)
    const checkDateStr = checkDate.toDateString()
    
    if (sessionDate === checkDateStr || sessionDate === todayStr) {
      streak++
    } else {
      break
    }
  }
  
  const lastSession = sortedSessions[0]
  const lastQuizDate = lastSession?.completedAt 
    ? new Date(lastSession.completedAt).toISOString().split('T')[0]
    : null
  
  return {
    totalQuizzesTaken: completedSessions.length,
    totalQuestionsAnswered,
    totalCorrect,
    averageScore: totalQuestionsAnswered > 0 
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : 0,
    bestScore: Math.round(bestScorePercentage),
    biasAccuracy,
    lastQuizDate,
    currentQuizStreak: streak,
  }
}

/**
 * Get feedback message based on score
 */
export function getScoreFeedback(score: number, total: number): { title: string; message: string; emoji: string } {
  const percentage = total > 0 ? (score / total) * 100 : 0
  
  if (percentage === 100) {
    return { title: "Perfect!", message: "You got every question right!", emoji: "🏆" }
  } else if (percentage >= 80) {
    return { title: "Excellent!", message: "You really know your biases!", emoji: "🌟" }
  } else if (percentage >= 60) {
    return { title: "Good job!", message: "You're building solid knowledge.", emoji: "👍" }
  } else if (percentage >= 40) {
    return { title: "Keep learning!", message: "Review the biases you missed.", emoji: "📚" }
  } else {
    return { title: "Practice more!", message: "Try viewing more biases first.", emoji: "💪" }
  }
}

/**
 * Get the correct answer details for a question
 */
export function getCorrectAnswer(question: QuizQuestion, allBiases: Bias[]): Bias | undefined {
  return allBiases.find(b => b.id === question.biasId)
}


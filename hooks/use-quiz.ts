"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Bias, QuizSession, QuizStats } from "@/lib/types"
import { getAllProgress } from "@/lib/db"
import { saveQuizSession, getCompletedQuizSessions } from "@/lib/db"
import {
  generateQuizSession,
  processAnswer,
  completeSession,
  calculateQuizStats,
  getScoreFeedback,
  getCorrectAnswer,
} from "@/lib/quiz"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export type QuizState = "idle" | "active" | "answering" | "feedback" | "completed"

export function useQuiz(allBiases: Bias[]) {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Load stats on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const sessions = await getCompletedQuizSessions()
        setStats(calculateQuizStats(sessions))
      } catch (error) {
        logger.error("[useQuiz] Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Current question
  const currentQuestion = useMemo(() => {
    if (!session || currentQuestionIndex >= session.questions.length) return null
    return session.questions[currentQuestionIndex]
  }, [session, currentQuestionIndex])

  // Correct bias for current question
  const correctBias = useMemo(() => {
    if (!currentQuestion) return null
    return getCorrectAnswer(currentQuestion, allBiases)
  }, [currentQuestion, allBiases])

  // Start a new quiz
  const startQuiz = useCallback(async (questionCount: number = 5) => {
    try {
      // Get current progress to generate relevant questions
      const progress = await getAllProgress()
      const newSession = generateQuizSession(allBiases, progress, questionCount)
      setSession(newSession)
      setCurrentQuestionIndex(0)
      setQuizState("active")
      setSelectedAnswer(null)
      setQuestionStartTime(Date.now())
      
      logger.debug("[useQuiz] Started new quiz with", questionCount, "questions")
    } catch (error) {
      logger.error("[useQuiz] Failed to start quiz:", error)
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive",
      })
    }
  }, [allBiases])

  // Submit an answer
  const submitAnswer = useCallback(async (biasId: string) => {
    if (!session || !currentQuestion || quizState !== "active") return

    setSelectedAnswer(biasId)
    setQuizState("answering")

    const timeSpent = Date.now() - questionStartTime
    const { session: updatedSession, isCorrect } = processAnswer(
      session,
      currentQuestionIndex,
      biasId,
      timeSpent
    )

    setSession(updatedSession)
    setQuizState("feedback")

    // Show brief feedback
    if (isCorrect) {
      toast({
        title: "Correct! ✓",
        description: `That's ${correctBias?.title}`,
      })
    } else {
      toast({
        title: "Not quite",
        description: `The answer was ${correctBias?.title}`,
        variant: "destructive",
      })
    }
  }, [session, currentQuestion, quizState, questionStartTime, currentQuestionIndex, correctBias])

  // Move to next question
  const nextQuestion = useCallback(async () => {
    if (!session) return

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= session.questions.length) {
      // Quiz completed
      const completedSession = completeSession(session)
      setSession(completedSession)
      setQuizState("completed")

      // Save to database
      try {
        await saveQuizSession(completedSession)
        
        // Refresh stats
        const sessions = await getCompletedQuizSessions()
        setStats(calculateQuizStats(sessions))
        
        const feedback = getScoreFeedback(completedSession.score, completedSession.totalQuestions)
        toast({
          title: `${feedback.emoji} ${feedback.title}`,
          description: `Score: ${completedSession.score}/${completedSession.totalQuestions} - ${feedback.message}`,
        })
      } catch (error) {
        logger.error("[useQuiz] Failed to save quiz session:", error)
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex(nextIndex)
      setSelectedAnswer(null)
      setQuizState("active")
      setQuestionStartTime(Date.now())
    }
  }, [session, currentQuestionIndex])

  // Reset quiz (go back to idle)
  const resetQuiz = useCallback(() => {
    setSession(null)
    setCurrentQuestionIndex(0)
    setQuizState("idle")
    setSelectedAnswer(null)
  }, [])

  // Get progress for current session
  const sessionProgress = useMemo(() => {
    if (!session) return { current: 0, total: 0, percentage: 0 }
    return {
      current: currentQuestionIndex + 1,
      total: session.totalQuestions,
      percentage: Math.round(((currentQuestionIndex + 1) / session.totalQuestions) * 100),
    }
  }, [session, currentQuestionIndex])

  // Is the selected answer correct?
  const isSelectedCorrect = useMemo(() => {
    if (!selectedAnswer || !currentQuestion) return false
    return selectedAnswer === currentQuestion.biasId
  }, [selectedAnswer, currentQuestion])

  return {
    // State
    session,
    currentQuestion,
    currentQuestionIndex,
    quizState,
    selectedAnswer,
    isSelectedCorrect,
    correctBias,
    stats,
    loading,
    sessionProgress,

    // Actions
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  }
}


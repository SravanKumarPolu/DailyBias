"use client"

import { useState } from "react"
import { 
  Brain, 
  Target, 
  Zap, 
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"
import { useQuiz } from "@/hooks/use-quiz"
import { getScoreFeedback } from "@/lib/quiz"
import Link from "next/link"

export default function QuizPage() {
  const { allBiases, settings } = useApp()
  const {
    session,
    currentQuestion,
    quizState,
    selectedAnswer,
    isSelectedCorrect,
    correctBias,
    stats,
    loading,
    sessionProgress,
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuiz(allBiases)

  const [questionCount, setQuestionCount] = useState(5)

  // Render idle state (quiz not started)
  const renderIdleState = () => (
    <div className="space-y-8">
      {/* Stats Overview */}
      {stats && stats.totalQuizzesTaken > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{stats.totalQuizzesTaken}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">Quizzes Taken</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 sm:text-3xl">{stats.averageScore}%</div>
              <div className="text-xs text-muted-foreground sm:text-sm">Average Score</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-500 sm:text-3xl">{stats.bestScore}%</div>
              <div className="text-xs text-muted-foreground sm:text-sm">Best Score</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 sm:text-3xl">{stats.totalCorrect}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">Correct Answers</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Start Quiz Card */}
      <Card className="glass overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Test Your Knowledge</CardTitle>
          <CardDescription className="text-base">
            Can you identify cognitive biases from real-world scenarios?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Question count selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-center block">Number of Questions</label>
            <div className="flex justify-center gap-2">
              {[3, 5, 10].map((count) => (
                <Button
                  key={count}
                  variant={questionCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(count)}
                  className="min-w-[60px]"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <Button
            onClick={() => startQuiz(questionCount)}
            className="w-full h-14 text-lg"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30">
            <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <p>
                You'll see a scenario describing a cognitive bias. 
                Choose the correct bias from 4 options. 
                Questions are based on biases you've learned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/review" className="flex-1">
          <Button variant="outline" className="w-full touch-target">
            <RotateCcw className="mr-2 h-4 w-4" />
            Review Biases
          </Button>
        </Link>
        <Link href="/all" className="flex-1">
          <Button variant="outline" className="w-full touch-target">
            <Brain className="mr-2 h-4 w-4" />
            Learn More Biases
          </Button>
        </Link>
      </div>
    </div>
  )

  // Render active quiz state
  const renderActiveState = () => {
    if (!currentQuestion) return null

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {sessionProgress.current} of {sessionProgress.total}
              </span>
              <span className="text-sm font-medium">{sessionProgress.percentage}%</span>
            </div>
            <Progress value={sessionProgress.percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="glass overflow-hidden">
          <CardHeader className="border-b bg-accent/20">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.type === "identify" ? "Identify the Bias" : currentQuestion.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Scenario */}
            <div className="text-center py-4">
              <p className="text-lg leading-relaxed text-foreground">
                {currentQuestion.scenario}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option.biasId
                const showResult = quizState === "feedback"
                const isCorrectOption = option.isCorrect
                
                let buttonClass = "w-full h-auto py-4 px-4 justify-start text-left transition-all"
                
                if (showResult) {
                  if (isCorrectOption) {
                    buttonClass += " bg-green-500/20 border-green-500 text-green-700 dark:text-green-300"
                  } else if (isSelected && !isCorrectOption) {
                    buttonClass += " bg-red-500/20 border-red-500 text-red-700 dark:text-red-300"
                  }
                } else if (isSelected) {
                  buttonClass += " bg-primary/20 border-primary"
                }

                return (
                  <Button
                    key={option.biasId}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => !showResult && submitAnswer(option.biasId)}
                    disabled={quizState !== "active"}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 font-medium">{option.title}</span>
                      {showResult && isCorrectOption && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                    </span>
                  </Button>
                )
              })}
            </div>

            {/* Feedback section */}
            {quizState === "feedback" && correctBias && (
              <div className={`p-4 rounded-lg ${isSelectedCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-orange-500/10 border border-orange-500/30"}`}>
                <div className="flex items-start gap-3">
                  {isSelectedCorrect ? (
                    <Sparkles className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Brain className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <p className={`font-medium ${isSelectedCorrect ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"}`}>
                      {isSelectedCorrect ? "Correct!" : `The answer is ${correctBias.title}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {correctBias.summary.split(".")[0]}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next button */}
            {quizState === "feedback" && (
              <Button onClick={nextQuestion} className="w-full h-12" size="lg">
                {sessionProgress.current === sessionProgress.total ? "See Results" : "Next Question"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render completed state
  const renderCompletedState = () => {
    if (!session) return null

    const feedback = getScoreFeedback(session.score, session.totalQuestions)
    const percentage = Math.round((session.score / session.totalQuestions) * 100)

    return (
      <div className="space-y-6">
        {/* Results Card */}
        <Card className="glass overflow-hidden">
          <CardHeader className="text-center border-b bg-accent/20 py-8">
            <div className="text-6xl mb-4">{feedback.emoji}</div>
            <CardTitle className="text-3xl">{feedback.title}</CardTitle>
            <CardDescription className="text-lg">{feedback.message}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Score display */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {session.score}/{session.totalQuestions}
              </div>
              <div className="text-lg text-muted-foreground">{percentage}% Correct</div>
            </div>

            {/* Progress bar */}
            <Progress value={percentage} className="h-3" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent/30">
                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">{session.score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/30">
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-500">{session.totalQuestions - session.score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => startQuiz(questionCount)} className="w-full h-12" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Take Another Quiz
              </Button>
              <Button onClick={resetQuiz} variant="outline" className="w-full">
                Back to Quiz Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review missed biases */}
        {session.attempts.filter(a => !a.isCorrect).length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Review These Biases
              </CardTitle>
              <CardDescription>
                Focus on the ones you missed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.attempts
                  .filter(a => !a.isCorrect)
                  .map(attempt => {
                    const bias = allBiases.find(b => b.id === attempt.biasId)
                    if (!bias) return null
                    return (
                      <Link
                        key={attempt.questionId}
                        href={`/bias/${bias.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      >
                        <span className="font-medium">{bias.title}</span>
                        <Badge variant="outline">{bias.category}</Badge>
                      </Link>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={789} />
      <DailyHeader />

      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
                Quiz
              </h1>
              {stats && stats.totalQuizzesTaken > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                  <Award className="mr-1 h-3 w-3" />
                  {stats.bestScore}% best
                </Badge>
              )}
            </div>
            <p className="text-foreground/80 text-base sm:text-lg lg:text-xl leading-relaxed text-pretty">
              Test your knowledge with scenario-based questions
            </p>
          </div>

          {/* Main Content */}
          {loading ? (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading quiz...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {quizState === "idle" && renderIdleState()}
              {(quizState === "active" || quizState === "answering" || quizState === "feedback") && renderActiveState()}
              {quizState === "completed" && renderCompletedState()}
            </>
          )}
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}


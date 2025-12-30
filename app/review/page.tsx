"use client"

import { useState, useCallback } from "react"
import { 
  RotateCcw, 
  Brain, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  Sparkles,
  Trophy,
  Calendar,
  TrendingUp,
  BookOpen,
  Target
} from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"
import { useReview } from "@/hooks/use-review"
import type { ReviewQuality } from "@/lib/types"
import Link from "next/link"

// Review quality buttons configuration
const QUALITY_OPTIONS: { value: ReviewQuality; label: string; description: string; color: string; icon: typeof Check }[] = [
  { value: 0, label: "Forgot", description: "Complete blackout", color: "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30", icon: X },
  { value: 2, label: "Hard", description: "Struggled to recall", color: "bg-orange-500/20 text-orange-500 border-orange-500/30 hover:bg-orange-500/30", icon: Brain },
  { value: 3, label: "Good", description: "Recalled with effort", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30", icon: Zap },
  { value: 4, label: "Easy", description: "Recalled smoothly", color: "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30", icon: Check },
  { value: 5, label: "Perfect", description: "Instant recall", color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30", icon: Sparkles },
]

export default function ReviewPage() {
  const { allBiases, settings } = useApp()
  const {
    upcoming,
    currentReview,
    stats,
    loading,
    currentReviewIndex,
    totalDue,
    submitReview,
    skipReview,
    previousReview,
    refresh,
  } = useReview(allBiases)

  const [showAnswer, setShowAnswer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = useCallback(async (quality: ReviewQuality) => {
    if (!currentReview || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await submitReview(currentReview.bias.id, quality)
      setShowAnswer(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentReview, isSubmitting, submitReview])

  const handleSkip = useCallback(() => {
    skipReview()
    setShowAnswer(false)
  }, [skipReview])

  const handlePrevious = useCallback(() => {
    previousReview()
    setShowAnswer(false)
  }, [previousReview])

  // Progress percentage for current session
  const sessionProgress = totalDue > 0 
    ? Math.round(((currentReviewIndex) / totalDue) * 100) 
    : 0

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={456} />
      <DailyHeader />

      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
                  Review
                </h1>
                {stats.dueNow > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {stats.dueNow} due
                  </Badge>
                )}
              </div>
              <Link href="/quiz">
                <Button variant="outline" size="sm" className="gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Take Quiz</span>
                </Button>
              </Link>
            </div>
            <p className="text-foreground/80 text-base sm:text-lg lg:text-xl leading-relaxed text-pretty">
              Strengthen your memory with spaced repetition
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{stats.dueNow}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Due Now</div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500 sm:text-3xl">{stats.dueThisWeek}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">This Week</div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500 sm:text-3xl">{stats.totalReviewed}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Reviewed</div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500 sm:text-3xl">{stats.masteryProgress}%</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Mastery</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {loading ? (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading reviews...</p>
              </CardContent>
            </Card>
          ) : totalDue === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon={Trophy}
                title="All caught up!"
                description="You've completed all your reviews. Great job keeping up with your learning!"
                action={
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/all">
                      <Button variant="outline" className="touch-target">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Learn New Biases
                      </Button>
                    </Link>
                    <Button onClick={refresh} variant="ghost" className="touch-target">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Check Again
                    </Button>
                  </div>
                }
              />

              {/* Upcoming Reviews */}
              {upcoming.length > 0 && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Reviews
                    </CardTitle>
                    <CardDescription>
                      These biases will be due soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcoming.map((item) => (
                        <Link
                          key={item.bias.id}
                          href={`/bias/${item.bias.id}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.bias.title}</div>
                            <div className="text-sm text-muted-foreground">{item.dueText}</div>
                          </div>
                          <Badge variant="outline" className="ml-2 shrink-0">
                            {item.intervalLevelName}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session Progress */}
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Review {currentReviewIndex + 1} of {totalDue}
                    </span>
                    <span className="text-sm font-medium">{sessionProgress}%</span>
                  </div>
                  <Progress value={sessionProgress} className="h-2" />
                </CardContent>
              </Card>

              {/* Review Card */}
              {currentReview && (
                <Card className="glass overflow-hidden">
                  <CardHeader className="border-b bg-accent/20">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline" className="mb-2">
                          {currentReview.bias.category}
                        </Badge>
                        <CardTitle className="text-xl sm:text-2xl">
                          {currentReview.bias.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary">
                          {currentReview.intervalLevelName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {currentReview.dueText}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Question: Can you recall this bias? */}
                    <div className="text-center py-4">
                      <p className="text-lg text-muted-foreground mb-2">
                        Can you recall what this bias means?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Think about the definition and counter-strategies before revealing
                      </p>
                    </div>

                    {/* Show/Hide Answer */}
                    {!showAnswer ? (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        className="w-full touch-target h-14 text-lg"
                        size="lg"
                      >
                        <Brain className="mr-2 h-5 w-5" />
                        Show Answer
                      </Button>
                    ) : (
                      <div className="space-y-6 animate-fade-in">
                        {/* Answer Content */}
                        <div className="space-y-4 p-4 rounded-lg bg-accent/30">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                              Definition
                            </h4>
                            <p className="text-foreground leading-relaxed">
                              {currentReview.bias.summary}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                              Why it happens
                            </h4>
                            <p className="text-foreground/90 text-sm leading-relaxed">
                              {currentReview.bias.why}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                              Counter-strategy
                            </h4>
                            <p className="text-foreground/90 text-sm leading-relaxed">
                              {currentReview.bias.counter}
                            </p>
                          </div>
                        </div>

                        {/* Quality Rating */}
                        <div className="space-y-3">
                          <p className="text-center text-sm text-muted-foreground">
                            How well did you recall this?
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {QUALITY_OPTIONS.map((option) => {
                              const Icon = option.icon
                              return (
                                <Button
                                  key={option.value}
                                  onClick={() => handleSubmitReview(option.value)}
                                  disabled={isSubmitting}
                                  variant="outline"
                                  className={`flex flex-col items-center gap-1 h-auto py-3 px-2 ${option.color} transition-all`}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span className="text-xs font-medium">{option.label}</span>
                                </Button>
                              )
                            })}
                          </div>
                          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                            <span>← Harder</span>
                            <span>Easier →</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentReviewIndex === 0}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>
                      
                      <Link href={`/bias/${currentReview.bias.id}`}>
                        <Button variant="link" size="sm">
                          View Full Details
                        </Button>
                      </Link>

                      <Button
                        onClick={handleSkip}
                        disabled={currentReviewIndex >= totalDue - 1}
                        variant="ghost"
                        size="sm"
                      >
                        Skip
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">How spaced repetition works</p>
                      <p>
                        Each time you review, the interval increases: 1 → 3 → 7 → 14 → 30 days.
                        If you forget, the interval resets. This optimizes long-term retention.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}


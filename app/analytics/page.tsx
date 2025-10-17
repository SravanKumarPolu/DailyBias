"use client"

import type React from "react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { ProgressChart } from "@/components/progress-chart"
import { CategoryChart } from "@/components/category-chart"
import { StatCard } from "@/components/stat-card"
import { useSettings } from "@/hooks/use-settings"
import { useApp } from "@/contexts/app-context"
import { Flame, Trophy, Eye, Star, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const { settings } = useSettings()
  const { progressStats, progressList, allBiases, progressLoading, biasesLoading } = useApp()

  // Calculate safe percentages to avoid division by zero
  const completionPercentage = allBiases.length > 0 
    ? Math.round((progressStats.totalBiasesRead / allBiases.length) * 100) 
    : 0
  
  const masteryPercentage = progressStats.totalBiasesRead > 0 
    ? Math.round((progressStats.masteredCount / progressStats.totalBiasesRead) * 100) 
    : 0

  // Show loading state if data is still loading
  if (progressLoading || biasesLoading) {
    return (
      <div className="min-h-screen pb-20 sm:pb-24">
        <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={789} />
        <DailyHeader />
        <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold sm:mb-2 sm:text-3xl">
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
                Analytics
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Loading your progress data...
              </p>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <DynamicNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={789} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div>
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold sm:mb-2 sm:text-3xl">
              <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
              Analytics
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track your learning progress and insights
            </p>
          </div>

          {/* Progress Stats Section */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="mb-1 text-lg font-semibold sm:text-xl">Your Progress</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Track your learning journey
              </p>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <StatCard
                icon={Flame}
                label="Current Streak"
                value={progressStats.currentStreak}
                suffix={progressStats.currentStreak === 1 ? "day" : "days"}
                color="text-orange-500"
                bgColor="bg-orange-500/10"
                delay={0}
              />
              <StatCard
                icon={Trophy}
                label="Longest Streak"
                value={progressStats.longestStreak}
                suffix={progressStats.longestStreak === 1 ? "day" : "days"}
                color="text-yellow-500"
                bgColor="bg-yellow-500/10"
                delay={0.1}
              />
              <StatCard
                icon={Eye}
                label="Biases Read"
                value={progressStats.totalBiasesRead}
                max={allBiases.length}
                color="text-primary"
                bgColor="bg-primary/10"
                delay={0.2}
              />
              <StatCard
                icon={Star}
                label="Mastered"
                value={progressStats.masteredCount}
                max={allBiases.length}
                color="text-purple-500"
                bgColor="bg-purple-500/10"
                delay={0.3}
              />
            </div>

            {/* Activity Chart */}
            <ProgressChart progressList={progressList} />

            {/* Category Breakdown */}
            <CategoryChart allBiases={allBiases} progressList={progressList} />
          </div>

          {/* Additional Analytics Section */}
          <div className="glass space-y-4 rounded-xl p-4 sm:space-y-6 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 text-lg font-semibold sm:text-xl">Learning Insights</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Discover patterns in your learning behavior
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                  Learning Rate
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You've read {progressStats.totalBiasesRead} out of {allBiases.length} biases 
                  ({completionPercentage}% complete)
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="mb-2 font-medium text-green-900 dark:text-green-100">
                  Consistency
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {progressStats.currentStreak > 0 
                    ? `Great job! You're on a ${progressStats.currentStreak}-day streak.`
                    : "Start a new learning streak today!"
                  }
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <h3 className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                  Mastery Progress
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  You've mastered {progressStats.masteredCount} biases. 
                  {progressStats.masteredCount > 0 
                    ? ` That's ${masteryPercentage}% of what you've read!`
                    : " Keep reading to start mastering biases!"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

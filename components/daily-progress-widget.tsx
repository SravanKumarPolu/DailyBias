"use client"

import { useMemo, memo } from "react"
// Removed framer-motion import - using static rendering to prevent flickering
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import {
  TrendingUp,
  Award,
  Flame,
  Trophy,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface DailyProgressWidgetProps {
  className?: string
}

// FIX: Memoize component to prevent unnecessary re-renders during scrolling
export const DailyProgressWidget = memo(function DailyProgressWidget({ className }: DailyProgressWidgetProps) {
  const { allBiases, progressList, progressStats } = useApp()
  // Removed all animation state - using static rendering to prevent flickering
  // Create stable hash of progressList to prevent unnecessary recalculations
  // This prevents flickering when progressList reference changes but content is similar
  const progressListHash = useMemo(() => {
    return progressList.length + progressList.filter(p => p.mastered).length +
           (progressList.length > 0 ? Math.max(...progressList.map(p => p.viewedAt || 0)) : 0)
  }, [progressList])

  // Today's progress - use stable date calculation
  // Calculate today's start/end once per day to prevent unnecessary recalculations
  const todayProgress = useMemo(() => {
    const now = Date.now()
    const today = new Date(now)
    // Use fixed date boundaries for today to ensure stable calculations
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1

    const todayViews = progressList.filter(p =>
      p.viewedAt && p.viewedAt >= todayStart && p.viewedAt <= todayEnd
    ).length
    const todayMastered = progressList.filter(p =>
      p.mastered && p.viewedAt && p.viewedAt >= todayStart && p.viewedAt <= todayEnd
    ).length

    return {
      viewed: todayViews,
      mastered: todayMastered,
      goal: 1, // Daily goal of 1 bias
      completionRate: Math.min((todayViews / 1) * 100, 100)
    }
    // Use hash instead of full array to prevent recalculation when array reference changes
    // but meaningful content is the same (prevents flickering on Android)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressListHash])

  // Weekly progress - use stable date calculation
  const weeklyProgress = useMemo(() => {
    const now = Date.now()
    const today = new Date(now)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setHours(23, 59, 59, 999)

    const weekViews = progressList.filter(p => {
      if (!p.viewedAt) return false
      const viewDate = new Date(p.viewedAt)
      return viewDate >= weekStart && viewDate <= weekEnd
    }).length

    return {
      viewed: weekViews,
      goal: 7, // Weekly goal of 7 biases
      completionRate: Math.min((weekViews / 7) * 100, 100)
    }
    // Use hash instead of full array to prevent recalculation when array reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressListHash])

  // Category progress for today - use stable date calculation
  const categoryProgress = useMemo(() => {
    const now = Date.now()
    const today = new Date(now)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1

    const todayBiases = progressList.filter(p =>
      p.viewedAt && p.viewedAt >= todayStart && p.viewedAt <= todayEnd
    )

    const categoryCounts: { [key: string]: number } = {}
    todayBiases.forEach(progress => {
      const bias = allBiases.find(b => b.id === progress.biasId)
      if (bias) {
        categoryCounts[bias.category] = (categoryCounts[bias.category] || 0) + 1
      }
    })

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: (count / todayProgress.viewed) * 100
    }))
    // Use hash instead of full array to prevent recalculation when array reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressListHash, allBiases.length, todayProgress.viewed])

  // Use static div instead of motion.div to completely prevent flickering
  // No animations - just render once and stay static
  return (
    <div className={className}>
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 dark:text-blue-100">Today's Progress</span>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-200 hover:text-blue-700 dark:hover:text-blue-100">
                View Details
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Daily Goal Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Daily Goal
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-200 font-medium">
                {todayProgress.viewed}/{todayProgress.goal}
              </span>
            </div>
            <Progress value={todayProgress.completionRate} className="h-2" />
            {todayProgress.completionRate >= 100 && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-200 font-medium">
                <Award className="h-3 w-3" />
                Goal achieved! 🎉
              </div>
            )}
          </div>

          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Weekly Progress
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-200 font-medium">
                {weeklyProgress.viewed}/7
              </span>
            </div>
            <Progress value={weeklyProgress.completionRate} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {todayProgress.viewed}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-200 font-medium">Today</div>
            </div>
            <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                {todayProgress.mastered}
              </div>
              <div className="text-xs text-green-700 dark:text-green-200 font-medium">Mastered</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryProgress.length > 0 && (
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                Today's Categories
              </div>
              <div className="flex flex-wrap gap-1">
                {categoryProgress.map(({ category, count }) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="text-xs bg-info text-info-foreground border-info/50 dark:bg-info dark:text-info-foreground dark:border-info/60 font-semibold"
                  >
                    {category} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Streak Info */}
          <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-200 font-medium">
                <Flame className="h-3 w-3" />
                <span>Current Streak: {progressStats.currentStreak} days</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-200 font-medium">
                <Trophy className="h-3 w-3" />
                <span>Best: {progressStats.longestStreak} days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

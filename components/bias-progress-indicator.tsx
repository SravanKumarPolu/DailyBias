"use client"

import { useMemo } from "react"
import { BookOpen, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"

export function BiasProgressIndicator() {
  const { allBiases, progressList } = useApp()

  // Create stable hash of progressList to prevent unnecessary recalculations
  // This prevents flickering when progressList reference changes but content is similar
  const progressListHash = useMemo(() => {
    return progressList.length + progressList.filter(p => p.mastered).length
  }, [progressList])

  const progressStats = useMemo(() => {
    const totalBiases = allBiases.length
    const viewedBiases = progressList.length
    const masteredBiases = progressList.filter(p => p.mastered).length
    const completionPercentage = totalBiases > 0 ? (viewedBiases / totalBiases) * 100 : 0
    const masteryPercentage = viewedBiases > 0 ? (masteredBiases / viewedBiases) * 100 : 0

    return {
      totalBiases,
      viewedBiases,
      masteredBiases,
      completionPercentage,
      masteryPercentage
    }
    // Use hash instead of full array to prevent recalculation when array reference changes
    // but meaningful content is the same (prevents flickering on Android)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressListHash, allBiases.length])

  if (allBiases.length === 0) return null

  return (
    <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
          <BookOpen className="h-5 w-5" />
          Your Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Bias Coverage
            </span>
            <span className="text-sm text-green-700 dark:text-green-200 font-medium">
              {progressStats.viewedBiases} / {progressStats.totalBiases}
            </span>
          </div>
          <Progress value={progressStats.completionPercentage} className="h-2" />
          <div className="text-xs text-green-600 dark:text-green-200 font-medium">
            {progressStats.completionPercentage.toFixed(1)}% of all biases viewed
          </div>
        </div>

        {/* Mastery Progress */}
        {progressStats.viewedBiases > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Mastery Rate
              </span>
              <span className="text-sm text-green-700 dark:text-green-200 font-medium">
                {progressStats.masteredBiases} / {progressStats.viewedBiases}
              </span>
            </div>
            <Progress value={progressStats.masteryPercentage} className="h-2" />
            <div className="text-xs text-green-600 dark:text-green-200 font-medium">
              {progressStats.masteryPercentage.toFixed(1)}% of viewed biases mastered
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {progressStats.viewedBiases}
            </div>
            <div className="text-xs text-green-700 dark:text-green-200 font-medium">Viewed</div>
          </div>
          <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {progressStats.masteredBiases}
            </div>
            <div className="text-xs text-green-700 dark:text-green-200 font-medium">Mastered</div>
          </div>
        </div>

        {/* Frequency Info */}
        <div className="pt-2 border-t border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-200 font-medium">
            <Calendar className="h-3 w-3" />
            <span>
              With {progressStats.totalBiases} biases, you'll see each one approximately every {Math.ceil(progressStats.totalBiases / 30)} month{Math.ceil(progressStats.totalBiases / 30) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

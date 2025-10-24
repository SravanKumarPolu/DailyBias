"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"
import { getCategoryLabel, getCategoryColor } from "@/lib/category-utils"
import type { BiasCategory } from "@/lib/types"
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  BookOpen, 
  Star,
  Flame,
  Trophy,
  BarChart3
} from "lucide-react"

interface LearningProgressDashboardProps {
  className?: string
}

export function LearningProgressDashboard({ className }: LearningProgressDashboardProps) {
  const { allBiases, progressList, progressStats } = useApp()

  // Daily activity data for the last 30 days
  const dailyActivityData = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 29)

    const dailyActivity: { [key: string]: { date: string; biases: number; mastered: number; streak: number } } = {}

    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dailyActivity[dateString] = { date: displayDate, biases: 0, mastered: 0, streak: 0 }
    }

    // Count daily activity
    progressList.forEach((progress) => {
      if (progress.viewedAt) {
        const viewDate = new Date(progress.viewedAt)
        const dateString = viewDate.toISOString().split('T')[0]
        if (dailyActivity[dateString]) {
          dailyActivity[dateString].biases++
          if (progress.mastered) {
            dailyActivity[dateString].mastered++
          }
        }
      }
    })

    // Calculate daily streaks
    let currentStreak = 0
    const sortedDates = Object.keys(dailyActivity).sort().reverse()
    for (const dateStr of sortedDates) {
      if (dailyActivity[dateStr].biases > 0) {
        currentStreak++
        dailyActivity[dateStr].streak = currentStreak
      } else {
        break
      }
    }

    return Object.values(dailyActivity).reverse()
  }, [progressList])

  // Category distribution data
  const categoryData = useMemo(() => {
    const categoryCounts: { [key: string]: { viewed: number; mastered: number; total: number } } = {}
    
    // Initialize categories
    allBiases.forEach(bias => {
      if (!categoryCounts[bias.category]) {
        categoryCounts[bias.category] = { viewed: 0, mastered: 0, total: 0 }
      }
      categoryCounts[bias.category].total++
    })

    // Count progress by category
    progressList.forEach(progress => {
      const bias = allBiases.find(b => b.id === progress.biasId)
      if (bias && categoryCounts[bias.category]) {
        categoryCounts[bias.category].viewed++
        if (progress.mastered) {
          categoryCounts[bias.category].mastered++
        }
      }
    })

    return Object.entries(categoryCounts).map(([category, counts]) => ({
      category: getCategoryLabel(category as BiasCategory),
      viewed: counts.viewed,
      mastered: counts.mastered,
      total: counts.total,
      completionRate: counts.total > 0 ? (counts.viewed / counts.total) * 100 : 0,
      masteryRate: counts.viewed > 0 ? (counts.mastered / counts.viewed) * 100 : 0
    }))
  }, [allBiases, progressList])

  // Weekly progress data
  const weeklyData = useMemo(() => {
    const weeks: { [key: string]: { week: string; biases: number; mastered: number } } = {}
    
    progressList.forEach(progress => {
      if (progress.viewedAt) {
        const date = new Date(progress.viewedAt)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        const weekLabel = `Week ${Math.ceil((new Date().getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))}`
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = { week: weekLabel, biases: 0, mastered: 0 }
        }
        weeks[weekKey].biases++
        if (progress.mastered) {
          weeks[weekKey].mastered++
        }
      }
    })

    return Object.values(weeks).slice(-8) // Last 8 weeks
  }, [progressList])

  // Mastery progress over time
  const masteryData = useMemo(() => {
    const masteryTimeline: { [key: string]: number } = {}
    let cumulativeMastered = 0

    progressList
      .filter(p => p.mastered)
      .sort((a, b) => a.viewedAt - b.viewedAt)
      .forEach(progress => {
        const date = new Date(progress.viewedAt)
        const dateKey = date.toISOString().split('T')[0]
        cumulativeMastered++
        masteryTimeline[dateKey] = cumulativeMastered
      })

    return Object.entries(masteryTimeline).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mastered: count
    }))
  }, [progressList])


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {progressStats.totalBiasesRead}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Biases Read</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {progressStats.masteredCount}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {progressStats.currentStreak}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {progressStats.longestStreak}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Daily Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActivityData}>
                  <defs>
                    <linearGradient id="colorBiases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="biases"
                    stackId="1"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorBiases)"
                    name="Viewed"
                  />
                  <Area
                    type="monotone"
                    dataKey="mastered"
                    stackId="1"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorMastered)"
                    name="Mastered"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Category Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(category.category.toLowerCase() as BiasCategory)}>
                        {category.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {category.viewed}/{category.total}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {category.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={category.completionRate} className="h-2" />
                  {category.viewed > 0 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Mastery: {category.masteryRate.toFixed(1)}%</span>
                      <span>{category.mastered} mastered</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="biases" fill="#3b82f6" name="Viewed" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="mastered" fill="#10b981" name="Mastered" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mastery Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              Mastery Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={masteryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mastered"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    name="Cumulative Mastered"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

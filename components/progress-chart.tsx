"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { BiasProgress } from "@/lib/types"

interface ProgressChartProps {
  progressList: BiasProgress[]
  className?: string
}

export function ProgressChart({ progressList, className }: ProgressChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 days of activity
    const today = new Date()
    const fourteenDaysAgo = new Date(today)
    fourteenDaysAgo.setDate(today.getDate() - 13) // 14 days including today

    const dailyActivity: { [key: string]: number } = {}

    // Initialize all days with 0
    for (let i = 0; i < 14; i++) {
      const date = new Date(fourteenDaysAgo)
      date.setDate(fourteenDaysAgo.getDate() + i)
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dailyActivity[dateString] = 0
    }

    // Count views per day
    progressList.forEach((progress) => {
      if (progress.viewedAt) {
        const viewDate = new Date(progress.viewedAt)
        if (viewDate >= fourteenDaysAgo && viewDate <= today) {
          const dateString = viewDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          if (dailyActivity[dateString] !== undefined) {
            dailyActivity[dateString]++
          }
        }
      }
    })

    return Object.entries(dailyActivity).map(([date, count]) => ({
      date,
      biases: count,
    }))
  }, [progressList])

  const maxValue = Math.max(...chartData.map((d) => d.biases), 1)
  const totalBiases = chartData.reduce((sum, d) => sum + d.biases, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <div className="relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-depth-1 sm:rounded-2xl sm:p-6">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

        {/* Header */}
        <div className="relative mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold sm:text-xl">Learning Activity</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Last 14 days • {totalBiases} biases viewed
          </p>
        </div>

        {/* Chart */}
        <div className="relative h-48 w-full sm:h-64">
          {totalBiases === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Start viewing biases to see your activity chart
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBiases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  allowDecimals={false}
                  domain={[0, maxValue + 1]}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  cursor={{
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  formatter={(value: number) => [`${value} biases`, "Viewed"]}
                />
                <Area
                  type="monotone"
                  dataKey="biases"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBiases)"
                  animationDuration={1000}
                  animationBegin={200}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  )
}


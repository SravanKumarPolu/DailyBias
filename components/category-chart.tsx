"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { Bias, BiasProgress, BiasCategory } from "@/lib/types"
import { getCategoryLabel } from "@/lib/category-utils"

interface CategoryChartProps {
  allBiases: Bias[]
  progressList: BiasProgress[]
  className?: string
}

const CATEGORY_COLORS: { [key in BiasCategory]: string } = {
  decision: "hsl(264, 50%, 55%)", // Primary purple
  memory: "hsl(200, 50%, 70%)", // Teal
  social: "hsl(145, 50%, 60%)", // Green
  perception: "hsl(85, 50%, 65%)", // Yellow-green
  misc: "hsl(340, 50%, 60%)", // Pink
}

export function CategoryChart({ allBiases, progressList, className }: CategoryChartProps) {
  const chartData = useMemo(() => {
    // Count biases by category
    const categoryCounts: { [key in BiasCategory]: { total: number; viewed: number } } = {
      decision: { total: 0, viewed: 0 },
      memory: { total: 0, viewed: 0 },
      social: { total: 0, viewed: 0 },
      perception: { total: 0, viewed: 0 },
      misc: { total: 0, viewed: 0 },
    }

    // Count total biases per category
    allBiases.forEach((bias) => {
      categoryCounts[bias.category].total++
    })

    // Count viewed biases per category
    const viewedBiasIds = new Set(
      progressList.filter((p) => p.viewedAt).map((p) => p.biasId)
    )

    allBiases.forEach((bias) => {
      if (viewedBiasIds.has(bias.id)) {
        categoryCounts[bias.category].viewed++
      }
    })

    return Object.entries(categoryCounts).map(([category, counts]) => ({
      category: getCategoryLabel(category as BiasCategory),
      categoryKey: category as BiasCategory,
      viewed: counts.viewed,
      total: counts.total,
      percentage: counts.total > 0 ? Math.round((counts.viewed / counts.total) * 100) : 0,
    }))
  }, [allBiases, progressList])

  const totalViewed = chartData.reduce((sum, d) => sum + d.viewed, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={className}
    >
      <div className="relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-depth-1 sm:rounded-2xl sm:p-6">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-50" />

        {/* Header */}
        <div className="relative mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold sm:text-xl">Category Breakdown</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Progress by bias type • {totalViewed} viewed
          </p>
        </div>

        {/* Chart */}
        <div className="relative h-64 w-full">
          {totalViewed === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Start viewing biases to see category breakdown
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  formatter={(value: number) => [`${value} viewed`, ""]}
                  labelFormatter={(label: string) => `Category: ${label}`}
                />
                <Bar
                  dataKey="viewed"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={300}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.categoryKey}
                      fill={CATEGORY_COLORS[entry.categoryKey]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {totalViewed > 0 && (
          <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs sm:mt-6 sm:grid-cols-3 sm:gap-3">
            {chartData.map((item, index) => (
              <motion.div
                key={item.categoryKey}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: CATEGORY_COLORS[item.categoryKey] }}
                />
                <span className="text-muted-foreground text-xs">
                  {item.category}: {item.percentage}%
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}


"use client"

import { Flame, Trophy, Eye, Star } from "lucide-react"
import type { ProgressStats } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface ProgressStatsProps {
  stats: ProgressStats
}

export function ProgressStatsComponent({ stats }: ProgressStatsProps) {
  const statItems = [
    {
      icon: Flame,
      label: "Current Streak",
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? "day" : "days",
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Longest Streak",
      value: stats.longestStreak,
      suffix: stats.longestStreak === 1 ? "day" : "days",
      color: "text-yellow-500",
    },
    {
      icon: Eye,
      label: "Biases Read",
      value: stats.totalBiasesRead,
      suffix: "",
      color: "text-blue-500",
    },
    {
      icon: Star,
      label: "Mastered",
      value: stats.masteredCount,
      suffix: "",
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item, index) => (
        <div key={item.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Card className="glass p-4">
            <div className="flex items-center gap-3">
              <div className={`${item.color}`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className="text-lg font-bold font-serif">
                  {item.value} {item.suffix && <span className="text-sm font-normal">{item.suffix}</span>}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

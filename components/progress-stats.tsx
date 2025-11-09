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
      bgColor: "bg-orange-500/10",
      ariaLabel: `Current learning streak: ${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`,
    },
    {
      icon: Trophy,
      label: "Longest Streak",
      value: stats.longestStreak,
      suffix: stats.longestStreak === 1 ? "day" : "days",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      ariaLabel: `Longest learning streak: ${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}`,
    },
    {
      icon: Eye,
      label: "Biases Read",
      value: stats.totalBiasesRead,
      suffix: "",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      ariaLabel: `Total biases read: ${stats.totalBiasesRead}`,
    },
    {
      icon: Star,
      label: "Mastered",
      value: stats.masteredCount,
      suffix: "",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      ariaLabel: `Biases mastered: ${stats.masteredCount}`,
    },
  ]

  return (
    <div 
      className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4"
      role="group"
      aria-label="Learning progress statistics"
    >
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <Card className="glass hover-lift shadow-soft group overflow-hidden p-3 transition-all duration-200 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className={`${item.bgColor} flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10 md:h-11 md:w-11`}
                aria-hidden="true"
              >
                <item.icon className={`${item.color} h-4 w-4 sm:h-5 sm:w-5`} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground truncate text-[10px] sm:text-xs" aria-hidden="true">
                  {item.label}
                </p>
                <p 
                  className="text-base font-bold leading-tight sm:text-lg md:text-xl"
                  aria-label={item.ariaLabel}
                >
                  <span>{item.value}</span>
                  {item.suffix && (
                    <span className="text-muted-foreground ml-1 text-[10px] font-normal sm:text-xs">
                      {item.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getRarityColor, getRarityLabel } from "@/lib/achievements"
import type { Achievement, AchievementProgress } from "@/lib/types"

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: number
  progress?: AchievementProgress
  showProgress?: boolean
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  progress,
  showProgress = true,
  size = "md",
  onClick
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  }

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  }

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const descriptionSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          unlocked
            ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10"
            : "border-muted bg-muted/20 opacity-60",
          onClick && "cursor-pointer hover:shadow-md",
          sizeClasses[size]
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Rarity Badge */}
          <div className="mb-3 flex items-center justify-between">
            <Badge
              variant={unlocked ? "default" : "outline"}
              className={cn(
                "text-xs",
                unlocked && getRarityColor(achievement.rarity),
                unlocked && "text-white"
              )}
            >
              {getRarityLabel(achievement.rarity)}
            </Badge>
            {!unlocked && achievement.hidden && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>

          {/* Icon */}
          <div className="mb-3 flex items-center justify-center">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                unlocked
                  ? "bg-primary/10"
                  : "bg-muted",
                iconSizes[size]
              )}
            >
              {unlocked || !achievement.hidden ? (
                <span className={cn(unlocked ? "grayscale-0" : "grayscale")}>
                  {achievement.icon}
                </span>
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "mb-1 text-center font-semibold",
              titleSizes[size],
              unlocked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {unlocked || !achievement.hidden ? achievement.title : "???"}
          </h3>

          {/* Description */}
          <p
            className={cn(
              "mb-3 text-center",
              descriptionSizes[size],
              unlocked ? "text-muted-foreground" : "text-muted-foreground/60"
            )}
          >
            {unlocked || !achievement.hidden ? achievement.description : "Complete requirements to unlock"}
          </p>

          {/* Progress Bar */}
          {showProgress && progress && !unlocked && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {progress.current} / {progress.target}
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {/* Unlocked Date */}
          {unlocked && unlockedAt && (
            <div className="mt-3 text-center text-xs text-muted-foreground">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface AchievementGridProps {
  achievements: Array<{
    achievement: Achievement
    unlocked: boolean
    unlockedAt?: number
    progress?: AchievementProgress
  }>
  showProgress?: boolean
  size?: "sm" | "md" | "lg"
  onAchievementClick?: (achievement: Achievement) => void
}

export function AchievementGrid({
  achievements,
  showProgress = true,
  size = "md",
  onAchievementClick
}: AchievementGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map(({ achievement, unlocked, unlockedAt, progress }) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          unlocked={unlocked}
          unlockedAt={unlockedAt}
          progress={progress}
          showProgress={showProgress}
          size={size}
          onClick={onAchievementClick ? () => onAchievementClick(achievement) : undefined}
        />
      ))}
    </div>
  )
}


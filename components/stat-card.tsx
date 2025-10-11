"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  max?: number
  suffix?: string
  color?: string
  bgColor?: string
  delay?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  max,
  suffix = "",
  color = "text-primary",
  bgColor = "bg-primary/10",
  delay = 0,
}: StatCardProps) {
  const percentage = max ? Math.min((value / max) * 100, 100) : undefined
  const circumference = 2 * Math.PI * 36 // radius = 36
  const strokeDashoffset = percentage
    ? circumference - (percentage / 100) * circumference
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-depth-1 transition-all duration-300 hover:border-primary/30 hover:shadow-depth-3 sm:rounded-2xl sm:p-5"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-4">
        {/* Circular progress or icon */}
        <div className="relative shrink-0">
          {percentage !== undefined ? (
            <>
              {/* Background circle */}
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  className="stroke-muted/30"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  className={cn("transition-all duration-500", color.replace("text-", "stroke-"))}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              {/* Icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", bgColor)}>
                  <Icon className={cn("h-6 w-6", color)} />
                </div>
              </div>
            </>
          ) : (
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20", bgColor)}>
              <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", color)} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider sm:text-sm">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.4 }}
              className="font-serif text-3xl font-bold sm:text-4xl"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.5 }}
              >
                {value}
              </motion.span>
            </motion.p>
            {max && (
              <span className="text-muted-foreground text-sm sm:text-base">
                / {max}
              </span>
            )}
            {suffix && (
              <span className="text-muted-foreground text-xs sm:text-sm">
                {suffix}
              </span>
            )}
          </div>
          {percentage !== undefined && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6, duration: 0.4 }}
              className="text-muted-foreground mt-1 text-xs sm:text-sm"
            >
              {Math.round(percentage)}% complete
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}


"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 sm:py-16 sm:px-6",
        className
      )}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Glowing background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-50" />
        
        {/* Icon container */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 sm:h-24 sm:w-24">
          <Icon className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="space-y-3 text-center max-w-md"
      >
        <h3 className="font-serif text-xl font-semibold sm:text-2xl">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      </motion.div>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}


"use client"

import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Clock, Target, BookOpen, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Modern stats section with enhanced animations
export function ModernStatsSection() {
  const stats = [
    { icon: BookOpen, label: "Biases Learned", value: "12", trend: "+3 this week" },
    { icon: Target, label: "Accuracy", value: "87%", trend: "Improving" },
    { icon: Clock, label: "Streak", value: "5 days", trend: "Keep going!" },
    { icon: TrendingUp, label: "Progress", value: "24%", trend: "On track" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-6 grid grid-cols-2 gap-3 sm:gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.1, 
            duration: 0.5, 
            ease: "easeOut" 
          }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 modern-card"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-accent" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              {stat.trend && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Enhanced bias card with modern styling
interface Bias {
  id: string
  title: string
  category: string
  summary: string
  why: string
  counter: string
}

export function EnhancedBiasCard({ 
  bias, 
  isFavorite, 
  isMastered, 
  onToggleFavorite, 
  onToggleMastered 
}: {
  bias: Bias
  isFavorite: boolean
  isMastered: boolean
  onToggleFavorite: () => void
  onToggleMastered: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 p-6 shadow-depth-2 transition-all duration-300 hover:border-primary/40 hover:shadow-depth-4 sm:rounded-3xl sm:p-8 md:p-10 modern-card"
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Top highlight with animation */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Side glow effects */}
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative space-y-6">
        {/* Header with enhanced styling */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Badge className="mb-3 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 hover:from-primary/30 hover:to-accent/30 transition-all duration-300">
              {bias.category}
            </Badge>
            <h1 className="text-2xl font-bold text-balance gradient-text sm:text-3xl md:text-4xl">
              {bias.title}
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFavorite}
              className="touch-target hover-grow h-10 w-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800/30"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className={`text-lg ${isFavorite ? "text-red-500" : "text-muted-foreground"}`}>
                {isFavorite ? "❤️" : "🤍"}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleMastered}
              className="touch-target hover-grow h-10 w-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200 hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-950/20 dark:hover:border-yellow-800/30"
              aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
            >
              <span className={`text-lg ${isMastered ? "text-yellow-500" : "text-muted-foreground"}`}>
                {isMastered ? "⭐" : "☆"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Content sections with enhanced typography */}
        <div className="space-y-6 modern-text">
          <p className="text-base leading-relaxed text-pretty sm:text-lg">
            {bias.summary}
          </p>

          <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary">
              <Lightbulb className="h-4 w-4" />
              Why it happens
            </h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {bias.why}
            </p>
          </div>

          <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary">
              <Target className="h-4 w-4" />
              How to counter it
            </h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {bias.counter}
            </p>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="modern-button flex-1 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:from-primary/90 hover:to-accent/90"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🎧</span>
              Listen
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="modern-button flex-1 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 px-6 py-3 font-medium transition-all duration-300 hover:bg-card/80 hover:border-primary/30"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📤</span>
              Share
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="modern-button flex-1 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 px-6 py-3 font-medium transition-all duration-300 hover:bg-card/80 hover:border-primary/30"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📋</span>
              Copy
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Modern loading state with enhanced shimmer
export function ModernLoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-sm"
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" 
                 style={{ animationDelay: `${i * 100}ms` }} />
            <div className="relative space-y-2">
              <div className="h-4 w-12 rounded bg-muted/50" />
              <div className="h-8 w-16 rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="group relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 p-6 sm:rounded-3xl sm:p-8">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/8 to-transparent" 
             style={{ animationDuration: '2s' }} />
        <div className="relative space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-6 w-24 rounded bg-muted/50" />
              <div className="h-10 w-full rounded bg-muted/50" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-lg bg-muted/50" />
              <div className="h-10 w-10 rounded-lg bg-muted/50" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-20 w-full rounded bg-muted/50" />
            <div className="h-16 w-full rounded bg-muted/50" />
            <div className="h-16 w-full rounded bg-muted/50" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 flex-1 rounded-xl bg-muted/50" />
            <div className="h-12 flex-1 rounded-xl bg-muted/50" />
            <div className="h-12 flex-1 rounded-xl bg-muted/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Floating action button for quick actions
export function ModernFloatingAction() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-24 right-4 z-40"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent p-4 shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Quick actions"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Sparkles className="relative h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
      </motion.button>
    </motion.div>
  )
}

// Scroll progress indicator
export function ModernScrollIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

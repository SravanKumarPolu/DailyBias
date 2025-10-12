"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingUp } from "lucide-react"

// Floating action button for quick actions
export function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-24 right-4 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
            aria-label="Quick actions"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Sparkles className="relative h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Modern progress indicator
export function ModernProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="relative">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary via-accent to-primary"
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>Progress</span>
        <span>{progress}%</span>
      </motion.div>
    </div>
  )
}

// Enhanced loading skeleton with modern shimmer
export function ModernLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-muted/50" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted/50" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4"
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" 
                 style={{ animationDelay: `${i * 100}ms` }} />
            <div className="relative space-y-2">
              <div className="h-4 w-12 rounded bg-muted/50" />
              <div className="h-8 w-16 rounded bg-muted/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="group relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 p-6"
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/8 to-transparent" 
             style={{ animationDuration: '2s' }} />
        <div className="relative space-y-4">
          <div className="h-6 w-24 rounded bg-muted/50" />
          <div className="h-8 w-full rounded bg-muted/50" />
          <div className="h-20 w-full rounded bg-muted/50" />
          <div className="h-16 w-full rounded bg-muted/50" />
          <div className="h-16 w-full rounded bg-muted/50" />
        </div>
      </motion.div>
    </div>
  )
}

// Modern stats cards with enhanced animations
interface IconComponent {
  className?: string
}

export function ModernStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  delay = 0 
}: { 
  title: string
  value: string | number
  icon: React.ComponentType<IconComponent>
  trend?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-accent" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">{value}</span>
          {trend && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced page transitions
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}

// Modern scroll indicator
export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary"
        style={{ width: `${scrollProgress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// Enhanced focus states for accessibility
export function EnhancedFocusProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return <>{children}</>
}

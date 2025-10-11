"use client"

import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, ChevronDown } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  enabled?: boolean
}

export function PullToRefresh({ onRefresh, enabled = true }: PullToRefreshProps) {
  const { isPulling, isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    enabled,
  })

  const shouldShow = isPulling || isRefreshing
  const isReady = pullProgress >= 1

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center"
          style={{
            transform: `translateY(${Math.min(pullDistance, 100)}px)`,
          }}
        >
          <div className="mt-4 flex items-center gap-3 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 px-6 py-3 shadow-depth-3">
            {/* Icon */}
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : isReady ? 180 : 0,
                scale: isReady ? 1.1 : 1,
              }}
              transition={{
                rotate: {
                  duration: isRefreshing ? 1 : 0.3,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: "linear",
                },
                scale: { duration: 0.2 },
              }}
            >
              {isRefreshing ? (
                <RefreshCw className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className={`h-5 w-5 ${isReady ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </motion.div>

            {/* Text */}
            <span className={`text-sm font-medium ${isReady || isRefreshing ? "text-primary" : "text-muted-foreground"}`}>
              {isRefreshing ? "Refreshing..." : isReady ? "Release to refresh" : "Pull to refresh"}
            </span>

            {/* Progress indicator */}
            {!isRefreshing && (
              <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${pullProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


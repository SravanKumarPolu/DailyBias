"use client"

import { useState, useEffect } from "react"
import { RefreshCw, ChevronDown } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"

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

  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  const shouldShow = isPulling || isRefreshing
  const isReady = pullProgress >= 1

  // Handle visibility transitions with CSS instead of Framer Motion
  useEffect(() => {
    if (shouldShow) {
      setMounted(true)
      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
      return undefined
    } else {
      setIsVisible(false)
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  if (!mounted) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        transform: `translateY(${Math.min(pullDistance, 100)}px)`,
        touchAction: 'none',
      }}
    >
      <div className="mt-4 flex items-center gap-3 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 px-6 py-3 shadow-depth-3">
        {/* Icon */}
        <div
          className={cn(
            "transition-all duration-300",
            isRefreshing && "animate-spin",
            isReady && !isRefreshing && "rotate-180 scale-110"
          )}
          style={{
            transform: isRefreshing
              ? undefined
              : isReady
                ? "rotate(180deg) scale(1.1)"
                : "rotate(0deg) scale(1)",
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className={cn(
              "h-5 w-5 transition-colors duration-200",
              isReady ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        {/* Text */}
        <span className={cn(
          "text-sm font-medium transition-colors duration-200",
          isReady || isRefreshing ? "text-primary" : "text-muted-foreground"
        )}>
          {isRefreshing ? "Refreshing..." : isReady ? "Release to refresh" : "Pull to refresh"}
        </span>

        {/* Progress indicator */}
        {!isRefreshing && (
          <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${pullProgress * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}


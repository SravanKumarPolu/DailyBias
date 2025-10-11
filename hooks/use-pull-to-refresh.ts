import { useState, useEffect, useRef, useCallback } from "react"

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
  enabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const currentY = useRef(0)
  const scrollY = useRef(0)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing) return
      
      // Only activate if at the top of the page
      scrollY.current = window.scrollY
      if (scrollY.current === 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    },
    [enabled, isRefreshing]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing || !isPulling || scrollY.current > 0) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)
      
      // Apply resistance to make pulling harder the further you go
      const resistedDistance = distance / resistance
      setPullDistance(Math.min(resistedDistance, threshold * 1.5))

      // Prevent default scrolling when pulling down
      if (distance > 10) {
        e.preventDefault()
      }
    },
    [enabled, isRefreshing, isPulling, resistance, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing) {
      setIsPulling(false)
      setPullDistance(0)
      return
    }

    setIsPulling(false)

    // If pulled beyond threshold, trigger refresh
    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error("Pull to refresh failed:", error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      // Animate back to 0
      setPullDistance(0)
    }
  }, [enabled, isRefreshing, pullDistance, threshold, onRefresh])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  }
}


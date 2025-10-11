import { useEffect, useRef, useState, useMemo } from "react"

interface VirtualScrollOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualScrollOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      offsetTop: (visibleRange.startIndex + index) * itemHeight,
    }))
  }, [items, visibleRange, itemHeight])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  }
}

// Hook for lazy loading items as they come into view
export function useLazyLoad<T>(
  items: T[],
  initialCount: number = 20,
  incrementCount: number = 20
) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount((prev) => Math.min(prev + incrementCount, items.length))
        }
      },
      {
        rootMargin: "200px", // Load more when user is 200px from the trigger
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [visibleCount, items.length, incrementCount])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return {
    visibleItems,
    hasMore,
    loadMoreRef,
    visibleCount,
  }
}


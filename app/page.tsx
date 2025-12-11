"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { TiltCard } from "@/components/tilt-card"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { BiasProgressIndicator } from "@/components/bias-progress-indicator"
import { DailyProgressWidget } from "@/components/daily-progress-widget"
import { useApp } from "@/contexts/app-context"
import { useDailyBias } from "@/hooks/use-daily-bias"
import { getTodayDateString } from "@/lib/daily-selector"
import { scheduleDailyReminder, cancelDailyReminder } from "@/lib/native-features"
import { logger } from "@/lib/logger"

export default function HomePage() {
  const router = useRouter()
  const {
    allBiases,
    biasesLoading,
    toggleFavorite,
    isFavorite,
    settings,
    progressList,
    markAsViewed,
    toggleMastered,
    isMastered,
  } = useApp()

  // Use the new daily bias hook to simplify state management
  const { dailyBias, isLoading: dailyBiasLoading } = useDailyBias({
    allBiases,
    progressList,
  })

  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)
  const lastProcessedBiasIdRef = useRef<string | null>(null)

  // Initialize notifications on app start - respect user's dailyReminder setting
  // Works for both native and web platforms
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (settings.dailyReminder) {
        scheduleDailyReminder(9, 0).catch((error) => {
          logger.error("[HomePage] Error scheduling notification:", error)
        })
      } else {
        // Cancel any existing notifications if user has disabled reminders
        cancelDailyReminder().catch((error) => {
          logger.error("[HomePage] Error cancelling notification:", error)
        })
      }
    }
  }, [settings.dailyReminder])

  // Check if user needs onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const hasSeenOnboarding = localStorage.getItem("onboarding-completed")
        if (!hasSeenOnboarding) {
          logger.debug("[HomePage] Redirecting to onboarding - new user detected")
          router.replace("/onboarding")
        }
      } catch (error) {
        logger.error("[HomePage] Error checking onboarding status:", error)
      }
    }
  }, [router])

  // Get bias to display - only use dailyBias from hook to prevent hydration mismatches
  // During SSR, dailyBias will be null, so biasToShow will be null and loading state will show
  // The bias will be calculated on the client after hydration
  const biasToShow = dailyBias

  // Load favorite and mastered states when bias changes
  // Use biasToShow instead of dailyBias to work with fallback biases
  useEffect(() => {
    if (!biasToShow) return

    const loadBiasState = async () => {
      if (biasToShow.id === lastProcessedBiasIdRef.current) return
      lastProcessedBiasIdRef.current = biasToShow.id

      try {
        const [fav, mast] = await Promise.all([
          isFavorite(biasToShow.id).catch(() => false),
          isMastered(biasToShow.id).catch(() => false),
        ])
        setIsFav(fav)
        setIsMast(mast)
      } catch (error) {
        logger.error("[HomePage] Error loading bias state:", error)
      }
    }

    loadBiasState()
  }, [biasToShow?.id, isFavorite, isMastered])

  // Mark bias as viewed when it changes
  // Use biasToShow instead of dailyBias to work with fallback biases
  useEffect(() => {
    if (!biasToShow) return

    const markAsViewedTimer = setTimeout(() => {
      if (lastProcessedBiasIdRef.current === biasToShow.id) {
        markAsViewed(biasToShow.id).catch((err) => {
          if (!err.message?.includes("recently")) {
            logger.error("[HomePage] Failed to mark as viewed:", err)
          }
        })
      }
    }, 2000)

    return () => clearTimeout(markAsViewedTimer)
  }, [biasToShow?.id, markAsViewed])

  const handleRefresh = useCallback(async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        window.location.reload()
        resolve()
      }, 500)
    })
  }, [])

  // Generate seed from today's date for consistent background (memoized)
  const seed = useMemo(() => {
    return getTodayDateString()
      .split("-")
      .reduce((acc, val) => acc + Number.parseInt(val), 0)
  }, [])

  // Handlers should use biasToShow instead of dailyBias to work with fallback biases
  const handleToggleFavorite = useCallback(async () => {
    if (!biasToShow) return
    try {
      await toggleFavorite(biasToShow.id)
      setIsFav((prev) => !prev)
    } catch (error) {
      logger.error("[HomePage] Failed to toggle favorite:", error)
      setIsFav((prev) => !prev) // Revert on error
    }
  }, [biasToShow, toggleFavorite])

  const handleToggleMastered = useCallback(async () => {
    if (!biasToShow) return
    try {
      const newState = await toggleMastered(biasToShow.id)
      setIsMast(newState)
    } catch (error) {
      logger.error("[HomePage] Failed to toggle mastered:", error)
    }
  }, [biasToShow, toggleMastered])

  return (
    <div className="min-h-screen pb-20 sm:pb-24" style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <PullToRefresh onRefresh={handleRefresh} enabled={!biasesLoading && !dailyBiasLoading} />
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={seed} />
      <DailyHeader />

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16 xl:max-w-3xl 2xl:max-w-3xl"
        aria-label="Daily cognitive bias"
      >
        {/* ARIA live region for dynamic content updates */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          suppressHydrationWarning
        >
          {biasesLoading || dailyBiasLoading
            ? "Loading daily bias..."
            : biasToShow
              ? `Today's bias: ${biasToShow.title}`
              : "No bias available"}
        </div>

        {biasesLoading || dailyBiasLoading ? (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="space-y-8 sm:space-y-10"
          >
            <div className="glass rounded-xl p-6 sm:rounded-2xl sm:p-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-muted/50 rounded" />
                <div className="h-4 w-full bg-muted/50 rounded" />
                <div className="h-4 w-5/6 bg-muted/50 rounded" />
              </div>
            </div>
          </div>
        ) : biasToShow ? (
          <div className="space-y-8 sm:space-y-10 md:space-y-12" suppressHydrationWarning>
            <TiltCard className="mb-0" tiltStrength={8} glareEnabled>
              <DynamicBiasCard
                bias={biasToShow}
                variant="detailed"
                isFavorite={isFav}
                onToggleFavorite={handleToggleFavorite}
                isMastered={isMast}
                onToggleMastered={handleToggleMastered}
              />
            </TiltCard>

            <DailyProgressWidget />

            <BiasProgressIndicator />
          </div>
        ) : (
          <div
            role="alert"
            aria-live="assertive"
            className="text-center py-12 text-muted-foreground"
          >
            <p>Unable to load daily bias. Please refresh the page.</p>
          </div>
        )}
      </main>

      <DynamicNavigation />
    </div>
  )
}

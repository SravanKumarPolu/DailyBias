"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { TiltCard } from "@/components/tilt-card"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { ContentTransparency } from "@/components/content-transparency"
import { BiasProgressIndicator } from "@/components/bias-progress-indicator"
import { DailyProgressWidget } from "@/components/daily-progress-widget"
import { useApp } from "@/contexts/app-context"
import { getPersonalizedDailyBias, getTodayDateString } from "@/lib/daily-selector"
import type { Bias } from "@/lib/types"
import { getCachedDailyBias, cacheDailyBias } from "@/lib/storage"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { useSpeech } from "@/hooks/use-speech"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export default function HomePage() {
  const {
    allBiases,
    biasesLoading,
    toggleFavorite,
    isFavorite,
    settings,
    // Removed progressList from destructuring - not used directly, causes unnecessary re-renders
    // progressList is only used in selectedDailyBias calculation, which we've optimized
    // progressLoading removed - not used in this component
    markAsViewed,
    toggleMastered,
    isMastered,
  } = useApp()
  const [dailyBias, setDailyBias] = useState<Bias | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)
  const { toast } = useToast()
  const { speak: speakBias, stop: stopSpeaking } = useSpeech()
  // Track last processed bias ID to prevent unnecessary re-runs that cause flickering
  const lastProcessedBiasIdRef = useRef<string | null>(null)
  // Track if we've shown content once to prevent skeleton from reappearing (prevents flickering)
  const hasShownContentRef = useRef(false)

  // Check if user needs onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenOnboarding = localStorage.getItem("onboarding-completed")
      if (!hasSeenOnboarding) {
        window.location.href = "/onboarding"
      }
    }
  }, [])

  // Voice commands handlers
  const handleReadCommand = () => {
    const bias = effectiveDailyBias || dailyBias
    if (!bias) {
      toast({
        title: "No bias available",
        description: "Wait for the bias to load first.",
      })
      return
    }
    const text = `${bias.title}. ${bias.summary}. Why it happens: ${bias.why}. How to counter it: ${bias.counter}.`
    speakBias(text)
    toast({
      title: "🎤 Voice Command Received",
      description: "Reading the bias aloud...",
    })
  }

  const handleStopCommand = () => {
    stopSpeaking()
    toast({
      title: "🛑 Voice Command Received",
      description: "Stopped reading.",
    })
  }

  // Voice commands
  const {
    isListening,
    isSupported: voiceCommandsSupported,
    toggleListening,
  } = useVoiceCommands({
    onReadCommand: handleReadCommand,
    onStopCommand: handleStopCommand,
    enabled: true,
  })

  // Track if we've calculated the daily bias for today to prevent recalculation
  const dailyBiasCalculatedRef = useRef<string | null>(null)
  const todayDateRef = useRef<string | null>(null)
  
  // Calculate daily bias only once per day using cache
  const selectedDailyBias = useMemo(() => {
    const today = getTodayDateString()
    
    // If we've already calculated for today, return cached result (prevents recalculation)
    if (todayDateRef.current === today && dailyBiasCalculatedRef.current) {
      const cached = allBiases.find((b) => b.id === dailyBiasCalculatedRef.current)
      if (cached) {
        logger.debug("[DailyBias] Using previously calculated bias for today:", cached.title)
        return cached
      }
    }
    
    // Reset if it's a new day
    if (todayDateRef.current !== today) {
      todayDateRef.current = today
      dailyBiasCalculatedRef.current = null
    }
    
    // Don't wait for progress if we have biases - we can calculate without progress
    if (allBiases.length === 0) {
      logger.debug("[DailyBias] No biases available yet - waiting for core biases to load")
      return null
    }
    
    const cachedBiasId = getCachedDailyBias(today)
    logger.debug("[DailyBias] Cached bias ID:", cachedBiasId)

    // If we have a cached bias for today, use it (don't recalculate even if progressList changes)
    // This prevents flickering on Android when markAsViewed updates progressList
    if (cachedBiasId) {
      const cached = allBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        logger.debug("[DailyBias] Using cached bias:", cached.title)
        dailyBiasCalculatedRef.current = cached.id
        return cached
      } else {
        logger.debug("[DailyBias] Cached bias not found in available biases, recalculating")
      }
    }

    // Otherwise, calculate a new daily bias only once
    // This should only run once when the cache is empty
    try {
      // Use empty progress list for initial calculation to prevent recalculation when progressList changes
      // This prevents flickering - the bias selection doesn't need progress for the initial daily selection
      // Progress is only used for personalization, which can happen later
      const newDailyBias = getPersonalizedDailyBias(allBiases, [], today)
      cacheDailyBias(today, newDailyBias.id)
      dailyBiasCalculatedRef.current = newDailyBias.id
      logger.debug("[DailyBias] Calculated and cached new bias:", newDailyBias.title)
      return newDailyBias
    } catch (error) {
      logger.error("[DailyBias] Error calculating daily bias:", error)
      return null
    }
    // Only depend on allBiases.length and today's date - NOT progressList
    // This prevents recalculation when progressList changes (which causes flickering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBiases.length])

  // Use selectedDailyBias or fallback to first bias if available (for immediate render on Android)
  // This must be after selectedDailyBias is declared
  // Use ref to track and prevent unnecessary recalculations
  const effectiveDailyBiasRef = useRef<Bias | null>(null)
  const effectiveDailyBias = useMemo(() => {
    // If we have a selectedDailyBias, use it and cache it
    if (selectedDailyBias) {
      if (effectiveDailyBiasRef.current?.id !== selectedDailyBias.id) {
        effectiveDailyBiasRef.current = selectedDailyBias
      }
      return selectedDailyBias
    }
    // Fallback to first bias if available
    if (allBiases.length > 0) {
      const fallback = allBiases[0]
      if (effectiveDailyBiasRef.current?.id !== fallback.id) {
        effectiveDailyBiasRef.current = fallback
      }
      return fallback
    }
    // Return cached value if available, otherwise null
    return effectiveDailyBiasRef.current
    // Only depend on selectedDailyBias ID - not the full object or array
    // This prevents recalculation when object references change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDailyBias?.id])

  // Track if we've synced to prevent unnecessary updates
  const syncedBiasIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    // Always sync with effectiveDailyBias to ensure we have a bias to display
    // This is especially important on Android where there might be timing issues
    // Only update if the bias ID actually changed to prevent unnecessary re-renders
    if (effectiveDailyBias && effectiveDailyBias.id !== dailyBias?.id && effectiveDailyBias.id !== syncedBiasIdRef.current) {
      logger.debug("[DailyBias] Setting daily bias:", effectiveDailyBias.title)
      syncedBiasIdRef.current = effectiveDailyBias.id
      // Use requestAnimationFrame to batch state update and prevent flickering
      requestAnimationFrame(() => {
        setDailyBias(effectiveDailyBias)
      })
    }
    // Only depend on effectiveDailyBias.id to prevent re-renders when object reference changes
    // but content is the same (which causes flickering on Android)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDailyBias?.id])

  useEffect(() => {
    if (dailyBias && dailyBias.id !== lastProcessedBiasIdRef.current) {
      // Only process if this is a new bias to prevent unnecessary re-runs that cause flickering
      lastProcessedBiasIdRef.current = dailyBias.id
      
      // Check if favorite and mastered - use async to prevent blocking
      Promise.all([
        isFavorite(dailyBias.id).then(setIsFav).catch(err => {
          logger.error("[DailyBias] Failed to check favorite:", err)
          setIsFav(false)
        }),
        isMastered(dailyBias.id).then(setIsMast).catch(err => {
          logger.error("[DailyBias] Failed to check mastered:", err)
          setIsMast(false)
        })
      ]).catch(err => logger.error("[DailyBias] Error loading bias state:", err))

      // Mark as viewed (only once per bias change to prevent flickering)
      // FIX: Use longer debounce and check if already marked to prevent duplicate calls
      // This prevents flickering from repeated markAsViewed calls
      // FIX: Only mark as viewed if not already viewed recently (prevents constant updates)
      const markAsViewedTimer = setTimeout(() => {
        // Double-check we haven't already marked this bias as viewed
        // This prevents duplicate calls that cause flickering
        if (lastProcessedBiasIdRef.current === dailyBias.id) {
          // Check if already viewed recently before calling markAsViewed
          // This prevents unnecessary updates that cause flickering
          markAsViewed(dailyBias.id).catch(err => {
            // Silently fail - don't log errors for duplicate views
            if (!err.message?.includes('recently')) {
              logger.error("[DailyBias] Failed to mark as viewed:", err)
            }
          })
        }
      }, 2000) // Increased debounce to 2000ms to prevent flickering
      
      return () => clearTimeout(markAsViewedTimer)
    }
    // Functions are stable (useCallback), but we only want to run when bias ID changes
    // This prevents flickering from unnecessary effect re-runs on Android
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyBias?.id])

  // Memoize handlers to prevent recreation on every render (fixes button functionality)
  // FIX: Use refs to get current bias values without depending on them in deps
  // This prevents handler recreation when bias object reference changes
  const currentBiasRef = useRef<Bias | null>(null)
  useEffect(() => {
    currentBiasRef.current = effectiveDailyBias || dailyBias
  }, [effectiveDailyBias?.id, dailyBias?.id])

  const handleToggleFavorite = useCallback(async () => {
    const bias = currentBiasRef.current
    if (!bias) {
      logger.warn("[DailyBias] No bias available for favorite toggle")
      return
    }
    try {
      logger.debug("[DailyBias] Toggling favorite for:", bias.id)
      await toggleFavorite(bias.id)
      // Update local state optimistically to prevent flickering
      setIsFav(prev => !prev)
    } catch (error) {
      logger.error("[DailyBias] Failed to toggle favorite:", error)
      // Revert on error
      setIsFav(prev => !prev)
    }
  }, [toggleFavorite]) // Only depend on toggleFavorite function

  const handleToggleMastered = useCallback(async () => {
    const bias = currentBiasRef.current
    if (!bias) {
      logger.warn("[DailyBias] No bias available for mastered toggle")
      return
    }
    try {
      logger.debug("[DailyBias] Toggling mastered for:", bias.id)
      const newState = await toggleMastered(bias.id)
      setIsMast(newState)
    } catch (error) {
      logger.error("[DailyBias] Failed to toggle mastered:", error)
    }
  }, [toggleMastered]) // Only depend on toggleMastered function

  // Only show loading if we truly have no data - don't wait for progress or settings
  // Core biases should be available immediately, so we can show content even if progress is loading
  // Memoize loading state to prevent flickering from condition toggling
  const loading = useMemo(() => {
    return biasesLoading && allBiases.length === 0
  }, [biasesLoading, allBiases.length])
  
  // Stabilize the show skeleton condition to prevent flickering
  // Only show skeleton when we truly have no data, not when data is just updating
  // Once we've shown content, don't show skeleton again (prevents flickering on Android)
  const showSkeleton = useMemo(() => {
    // FIX: More aggressive check - once content is shown, never show skeleton again
    // This prevents flickering when context re-renders or progressList updates
    if (hasShownContentRef.current) {
      return false // Never show skeleton again once content has been shown
    }
    
    const shouldShow = loading || (allBiases.length === 0) || !effectiveDailyBias
    if (!shouldShow && effectiveDailyBias) {
      hasShownContentRef.current = true
      return false
    }
    return shouldShow
    // Only depend on effectiveDailyBias?.id to prevent recalculation when object reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allBiases.length, effectiveDailyBias?.id])

  // Generate seed from today's date for consistent background
  const seed = getTodayDateString()
    .split("-")
    .reduce((acc, val) => acc + Number.parseInt(val), 0)

  const handleToggleVoiceCommands = () => {
    toggleListening()
    if (!isListening) {
      toast({
        title: "🎤 Voice Commands Active",
        description: "Say 'read' to hear the bias aloud, or 'stop' to pause.",
        duration: 4000,
      })
    } else {
      toast({
        title: "🎤 Voice Commands Off",
        description: "Click the button to enable voice commands again.",
      })
    }
  }

  const handleRefresh = async () => {
    // Refresh the page to get new content
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        window.location.reload()
        resolve()
      }, 500)
    })
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-24" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* FIX: PullToRefresh should not block touch events on buttons */}
      <PullToRefresh onRefresh={handleRefresh} enabled={!loading} />
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={seed} />
      <DailyHeader
        isVoiceListening={isListening}
        onToggleVoiceCommands={handleToggleVoiceCommands}
        voiceCommandsSupported={voiceCommandsSupported}
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:py-10"
        aria-label="Daily cognitive bias"
      >
        {showSkeleton ? (
          <div className="space-y-6 sm:space-y-8" role="status" aria-live="polite" aria-busy="true" aria-label="Loading daily bias">
            {/* Stats grid skeleton */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:mb-10 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-sm sm:rounded-2xl"
                >
                  {/* Removed shimmer animation to prevent flickering on Android */}
                  <div className="relative">
                    <div className="h-12 w-full rounded bg-muted/50 sm:h-16" />
                  </div>
                </div>
              ))}
            </div>

            {/* Featured card skeleton */}
            <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 shadow-md sm:rounded-2xl sm:p-8">
              {/* Removed shimmer and pulse animations to prevent flickering on Android */}
              
              <div className="relative space-y-4">
                <div className="h-5 w-32 rounded bg-muted/50 sm:h-6 sm:w-40" />
                <div className="h-7 w-40 rounded bg-muted/50 sm:h-8 sm:w-48" />
                <div className="h-16 w-full rounded bg-muted/50 sm:h-20" />
              </div>
            </div>

            {/* Main card skeleton */}
            <div className="group relative overflow-hidden rounded-xl bg-card/60 backdrop-blur-md border border-border/60 p-6 shadow-md sm:rounded-2xl sm:p-8 md:p-10">
              {/* Removed shimmer and pulse animations to prevent flickering on Android */}
              
              <div className="relative space-y-6">
                <div className="h-6 w-24 rounded bg-muted/50 sm:h-8 sm:w-32" />
                <div className="h-10 w-full rounded bg-muted/50 sm:h-12" />
                <div className="h-20 w-full rounded bg-muted/50 sm:h-24" />
                <div className="h-24 w-full rounded bg-muted/50 sm:h-32" />
                <div className="h-24 w-full rounded bg-muted/50 sm:h-32" />
                
                {/* Action buttons skeleton */}
                <div className="flex gap-3 pt-2">
                  <div className="h-10 flex-1 rounded bg-muted/50" />
                  <div className="h-10 flex-1 rounded bg-muted/50" />
                  <div className="h-10 flex-1 rounded bg-muted/50" />
                </div>
              </div>
            </div>
            <span className="sr-only">Loading today's cognitive bias...</span>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <TiltCard className="mb-0" tiltStrength={8} glareEnabled>
              <DynamicBiasCard
                bias={effectiveDailyBias!}
                variant="detailed"
                isFavorite={isFav}
                onToggleFavorite={handleToggleFavorite}
                isMastered={isMast}
                onToggleMastered={handleToggleMastered}
              />
            </TiltCard>

            {/* Content Transparency */}
            <ContentTransparency showDetails={false} />

            {/* Daily Progress Widget */}
            <DailyProgressWidget />

            {/* Progress Indicator */}
            <BiasProgressIndicator />
          </div>
        )}
      </main>

      <DynamicNavigation />
    </div>
  )
}

"use client"

import { useEffect, useState, useMemo } from "react"
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
    settingsLoading,
    progressList,
    progressLoading,
    markAsViewed,
    toggleMastered,
    isMastered,
  } = useApp()
  const [dailyBias, setDailyBias] = useState<Bias | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)
  const { toast } = useToast()
  const { speak: speakBias, stop: stopSpeaking } = useSpeech()

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
    if (!dailyBias) {
      toast({
        title: "No bias available",
        description: "Wait for the bias to load first.",
      })
      return
    }
    const text = `${dailyBias.title}. ${dailyBias.summary}. Why it happens: ${dailyBias.why}. How to counter it: ${dailyBias.counter}.`
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

  // Calculate daily bias only once per day using cache
  const selectedDailyBias = useMemo(() => {
    logger.debug("[DailyBias] Calculating daily bias - biases:", allBiases.length, "progress:", progressList.length, "loading:", progressLoading)
    
    if (allBiases.length === 0 || progressLoading) {
      logger.debug("[DailyBias] Skipping daily bias calculation - insufficient data")
      return null
    }

    const today = getTodayDateString()
    logger.debug("[DailyBias] Today's date:", today)
    
    const cachedBiasId = getCachedDailyBias(today)
    logger.debug("[DailyBias] Cached bias ID:", cachedBiasId)

    // If we have a cached bias for today, use it
    if (cachedBiasId) {
      const cached = allBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        logger.debug("[DailyBias] Using cached bias:", cached.title)
        return cached
      } else {
        logger.debug("[DailyBias] Cached bias not found in available biases, recalculating")
      }
    }

    // Otherwise, calculate a new daily bias only once
    // This should only run once when the cache is empty
    try {
      const newDailyBias = getPersonalizedDailyBias(allBiases, progressList, today)
      cacheDailyBias(today, newDailyBias.id)
      logger.debug("[DailyBias] Calculated and cached new bias:", newDailyBias.title)
      return newDailyBias
    } catch (error) {
      logger.error("[DailyBias] Error calculating daily bias:", error)
      return null
    }
  }, [allBiases, progressList, progressLoading])

  useEffect(() => {
    if (selectedDailyBias) {
      setDailyBias(selectedDailyBias)
    }
  }, [selectedDailyBias])

  useEffect(() => {
    if (dailyBias) {
      // Check if favorite and mastered
      isFavorite(dailyBias.id).then(setIsFav)
      isMastered(dailyBias.id).then(setIsMast)

      // Mark as viewed
      markAsViewed(dailyBias.id)
    }
  }, [dailyBias, isFavorite, isMastered, markAsViewed])

  const handleToggleFavorite = async () => {
    if (!dailyBias) return
    await toggleFavorite(dailyBias.id)
    setIsFav(!isFav)
  }

  const handleToggleMastered = async () => {
    if (!dailyBias) return
    const newState = await toggleMastered(dailyBias.id)
    setIsMast(newState)
  }

  const loading = biasesLoading || settingsLoading || progressLoading

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
    <div className="min-h-screen pb-20 sm:pb-24">
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
        {loading || !dailyBias ? (
          <div className="space-y-6 sm:space-y-8" role="status" aria-live="polite" aria-busy="true" aria-label="Loading daily bias">
            {/* Stats grid skeleton */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:mb-10 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-sm sm:rounded-2xl"
                >
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent" 
                       style={{ animationDelay: `${i * 100}ms` }} />
                  <div className="relative">
                    <div className="h-12 w-full rounded bg-muted/50 sm:h-16" />
                  </div>
                </div>
              ))}
            </div>

            {/* Featured card skeleton */}
            <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 shadow-md sm:rounded-2xl sm:p-8">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" 
                   style={{ animationDuration: '2s' }} />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" />
              
              <div className="relative space-y-4">
                <div className="h-5 w-32 rounded bg-muted/50 sm:h-6 sm:w-40" />
                <div className="h-7 w-40 rounded bg-muted/50 sm:h-8 sm:w-48" />
                <div className="h-16 w-full rounded bg-muted/50 sm:h-20" />
              </div>
            </div>

            {/* Main card skeleton */}
            <div className="group relative overflow-hidden rounded-xl bg-card/60 backdrop-blur-md border border-border/60 p-6 shadow-md sm:rounded-2xl sm:p-8 md:p-10">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/8 to-transparent" 
                   style={{ animationDuration: '2s' }} />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
              
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
                bias={dailyBias}
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

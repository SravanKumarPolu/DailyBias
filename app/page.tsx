"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { getPersonalizedDailyBias, getTodayDateString, getCoreBiases } from "@/lib/daily-selector"
import type { Bias } from "@/lib/types"
import { getCachedDailyBias, cacheDailyBias, getStoredDailyBias } from "@/lib/storage"
import { scheduleDailyReminder, isNativeApp } from "@/lib/native-features"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { useSpeech } from "@/hooks/use-speech"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export default function HomePage() {
  const router = useRouter()
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
  // CRITICAL FIX: Initialize dailyBias from storage on app start
  // This prevents flicker by reading stored bias immediately
  // Pattern: On app start, read todayKey and biasId from local storage
  // If missing, compute once and store. Render immediately from stored value.
  const [dailyBias, setDailyBias] = useState<Bias | null>(() => {
    if (typeof window === "undefined") return null
    
    // Read stored daily bias immediately
    const stored = getStoredDailyBias()
    const today = getTodayDateString()
    
    // If we have stored bias for today, try to use it
    if (stored && stored.date === today) {
      const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
      const cached = availableBiases.find((b) => b.id === stored.biasId)
      if (cached) {
        logger.debug("[DailyBias] Initialized from storage:", cached.title)
        return cached
      }
    }
    
    // Fallback: use core biases if allBiases is empty
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    if (availableBiases.length > 0) {
      const cachedBiasId = getCachedDailyBias(today)
      if (cachedBiasId) {
        const cached = availableBiases.find((b) => b.id === cachedBiasId)
        if (cached) return cached
      }
      // Fallback to first bias if no cache
      return availableBiases[0]
    }
    return null
  })
  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)
  const { toast } = useToast()
  const { speak: speakBias, stop: stopSpeaking } = useSpeech()
  // Track last processed bias ID to prevent unnecessary re-runs that cause flickering
  const lastProcessedBiasIdRef = useRef<string | null>(null)
  // Track if we've shown content once to prevent skeleton from reappearing (prevents flickering)
  const hasShownContentRef = useRef(false)

  // Initialize native features on app start
  useEffect(() => {
    if (typeof window !== "undefined" && isNativeApp()) {
      // Schedule daily reminder notification (9 AM default)
      scheduleDailyReminder(9, 0).catch((error) => {
        logger.error("[HomePage] Error scheduling notification:", error)
      })
    }
  }, [])

  // Check if user needs onboarding - do this in useEffect to avoid blocking render
  // The redirect will happen but the page structure will be consistent, minimizing flash
  // Check if user needs onboarding - use Next.js router for reliable redirects
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const hasSeenOnboarding = localStorage.getItem("onboarding-completed")
        if (!hasSeenOnboarding) {
          // Use Next.js router for reliable navigation
          logger.debug("[HomePage] Redirecting to onboarding - new user detected")
          router.replace("/onboarding")
        }
      } catch (error) {
        logger.error("[HomePage] Error checking onboarding status:", error)
      }
    }
  }, [router])

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
  // FIX: Track the initial SSR date to preserve SSR bias during hydration
  // This prevents Dec 4 → skeleton → Dec 5 flicker
  const initialDateRef = useRef<string | null>(null)
  const initialBiasRef = useRef<Bias | null>(null)
  // FIX: Track if we're on client to detect hydration
  const isClientRef = useRef(false)
  
  // Calculate daily bias only once per day using cache
  // CRITICAL FIX: Preserve SSR bias until new date's bias is ready to prevent content→skeleton swap
  const selectedDailyBias = useMemo(() => {
    const today = getTodayDateString()
    const isClient = typeof window !== "undefined"
    
    // On first client render (hydration), preserve existing dailyBias state if date changed
    // This prevents SSR Dec 4 → client Dec 5 skeleton flash
    if (isClient && !isClientRef.current && dailyBias) {
      isClientRef.current = true
      const ssrDate = getCachedDailyBias(today) ? today : (todayDateRef.current || today)
      // If date changed from SSR to client, preserve the existing bias
      if (dailyBias && !initialBiasRef.current) {
        initialBiasRef.current = dailyBias
        initialDateRef.current = ssrDate
        logger.debug("[DailyBias] Preserving SSR bias during hydration:", dailyBias.title)
        // If today's date is different, we'll handle it below, but keep showing old bias for now
      }
    }
    
    // Initialize SSR date and bias on first render (preserves SSR content during hydration)
    if (initialDateRef.current === null && allBiases.length > 0) {
      initialDateRef.current = today
      // Try to get initial bias from cache or calculate it
      const cachedBiasId = getCachedDailyBias(today)
      if (cachedBiasId) {
        const cached = allBiases.find((b) => b.id === cachedBiasId)
        if (cached) {
          if (!initialBiasRef.current) {
            initialBiasRef.current = cached
          }
          dailyBiasCalculatedRef.current = cached.id
          todayDateRef.current = today
          logger.debug("[DailyBias] Initialized with cached bias:", cached.title)
          return cached
        }
      }
      // If no cache, calculate initial bias
      try {
        const initialBias = getPersonalizedDailyBias(allBiases, [], today)
        if (!initialBiasRef.current) {
          initialBiasRef.current = initialBias
        }
        dailyBiasCalculatedRef.current = initialBias.id
        todayDateRef.current = today
        cacheDailyBias(today, initialBias.id)
        logger.debug("[DailyBias] Initialized with calculated bias:", initialBias.title)
        return initialBias
      } catch (error) {
        logger.error("[DailyBias] Error calculating initial bias:", error)
      }
    }
    
    // If we've already calculated for today, return cached result (prevents recalculation)
    if (todayDateRef.current === today && dailyBiasCalculatedRef.current) {
      const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
      const cached = availableBiases.find((b) => b.id === dailyBiasCalculatedRef.current)
      if (cached) {
        logger.debug("[DailyBias] Using previously calculated bias for today:", cached.title)
        return cached
      }
    }
    
    // FIX: Handle date change (e.g., SSR Dec 4 → client Dec 5)
    // Preserve the previous bias until new date's bias is ready
    if (todayDateRef.current !== null && todayDateRef.current !== today) {
      logger.debug("[DailyBias] Date changed from", todayDateRef.current, "to", today)
      
      // If we have an initial bias from SSR and date changed, keep showing it until new bias is ready
      // This prevents content→skeleton→content flicker
      if (initialBiasRef.current && initialDateRef.current !== today) {
        // Calculate new bias for new date
        const cachedBiasId = getCachedDailyBias(today)
        if (cachedBiasId) {
          const cached = allBiases.find((b) => b.id === cachedBiasId)
          if (cached) {
            // New date's bias is ready - switch to it
            todayDateRef.current = today
            dailyBiasCalculatedRef.current = cached.id
            initialBiasRef.current = cached
            initialDateRef.current = today
            logger.debug("[DailyBias] Switched to new date's cached bias:", cached.title)
            return cached
          }
        }
        
        // Calculate new bias for new date
        // CRITICAL FIX: Use core biases if allBiases is empty
        const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
        if (availableBiases.length > 0) {
          try {
            const newDailyBias = getPersonalizedDailyBias(availableBiases, [], today)
            cacheDailyBias(today, newDailyBias.id)
            todayDateRef.current = today
            dailyBiasCalculatedRef.current = newDailyBias.id
            initialBiasRef.current = newDailyBias
            initialDateRef.current = today
            logger.debug("[DailyBias] Calculated new date's bias:", newDailyBias.title)
            return newDailyBias
          } catch (error) {
            logger.error("[DailyBias] Error calculating new date's bias:", error)
            // Fallback: keep showing initial bias instead of returning null
            if (initialBiasRef.current) {
              logger.debug("[DailyBias] Keeping initial bias due to error:", initialBiasRef.current.title)
              return initialBiasRef.current
            }
          }
        }
        
        // If calculation failed but we have initial bias, keep showing it
        // This prevents skeleton from showing during date transition
        if (initialBiasRef.current) {
          logger.debug("[DailyBias] Preserving initial bias during date transition:", initialBiasRef.current.title)
          return initialBiasRef.current
        }
      }
      
      // Reset for new day
      todayDateRef.current = today
      dailyBiasCalculatedRef.current = null
    }
    
    // Don't wait for progress if we have biases - we can calculate without progress
    // CRITICAL FIX: Use core biases directly if allBiases is empty (first render)
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    if (availableBiases.length === 0) {
      logger.debug("[DailyBias] No biases available yet - waiting for core biases to load")
      // CRITICAL: Always return a bias if available, never null
      if (initialBiasRef.current) {
        return initialBiasRef.current
      }
      if (effectiveDailyBiasRef.current) {
        return effectiveDailyBiasRef.current
      }
      return null
    }
    
    const cachedBiasId = getCachedDailyBias(today)
    logger.debug("[DailyBias] Cached bias ID:", cachedBiasId)

    // If we have a cached bias for today, use it (don't recalculate even if progressList changes)
    // This prevents flickering when markAsViewed updates progressList
    if (cachedBiasId) {
      const cached = availableBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        logger.debug("[DailyBias] Using cached bias:", cached.title)
        dailyBiasCalculatedRef.current = cached.id
        todayDateRef.current = today
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
      const newDailyBias = getPersonalizedDailyBias(availableBiases, [], today)
      cacheDailyBias(today, newDailyBias.id)
      dailyBiasCalculatedRef.current = newDailyBias.id
      todayDateRef.current = today
      logger.debug("[DailyBias] Calculated and cached new bias:", newDailyBias.title)
      return newDailyBias
    } catch (error) {
      logger.error("[DailyBias] Error calculating daily bias:", error)
      // CRITICAL FIX: Always return a bias if available, never null
      // This prevents skeleton from showing during errors
      if (initialBiasRef.current) {
        return initialBiasRef.current
      }
      if (effectiveDailyBiasRef.current) {
        return effectiveDailyBiasRef.current
      }
      // Last resort: return first bias if we have any
      if (availableBiases.length > 0) {
        return availableBiases[0]
      }
      return null
    }
    // Only depend on allBiases.length - date changes are handled internally
    // This prevents recalculation when progressList changes (which causes flickering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBiases.length])

  // Use selectedDailyBias or fallback to first bias if available (for immediate render)
  // This must be after selectedDailyBias is declared
  // Use ref to track and prevent unnecessary recalculations
  // CRITICAL FIX: ALWAYS return a bias - use core biases directly if allBiases is empty
  const effectiveDailyBiasRef = useRef<Bias | null>(null)
  const effectiveDailyBias = useMemo(() => {
    // If we have a selectedDailyBias, use it and cache it
    if (selectedDailyBias) {
      if (effectiveDailyBiasRef.current?.id !== selectedDailyBias.id) {
        effectiveDailyBiasRef.current = selectedDailyBias
      }
      return selectedDailyBias
    }
    
    // CRITICAL FIX: Use core biases directly if allBiases is empty (first render)
    // This prevents skeleton on initial render before hook initializes
    const availableBiases = allBiases.length > 0 ? allBiases : getCoreBiases()
    
    // CRITICAL: If we have biases (from allBiases or core), ALWAYS return a bias (never null)
    // This prevents skeleton from showing during date transitions or initial render
    if (availableBiases.length > 0) {
      // Prefer preserved initial bias if available (from SSR)
      if (initialBiasRef.current) {
        if (effectiveDailyBiasRef.current?.id !== initialBiasRef.current.id) {
          effectiveDailyBiasRef.current = initialBiasRef.current
        }
        return initialBiasRef.current
      }
      
      // Fallback to cached ref value if available
      if (effectiveDailyBiasRef.current) {
        return effectiveDailyBiasRef.current
      }
      
      // Last resort: use first bias from available biases
      const fallback = availableBiases[0]
      effectiveDailyBiasRef.current = fallback
      return fallback
    }
    
    // Only return null if we truly have no biases (should never happen)
    return null
    // Only depend on selectedDailyBias ID - not the full object or array
    // This prevents recalculation when object references change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDailyBias?.id, allBiases.length])

  // Track if we've synced to prevent unnecessary updates
  const syncedBiasIdRef = useRef<string | null>(null)
  
  // FIX: Sync dailyBias with effectiveDailyBias immediately, not in useEffect
  // This ensures dailyBias is set before first render, preventing skeleton flash
  // Only update if bias ID changed to prevent unnecessary re-renders
  useEffect(() => {
    // Always sync with effectiveDailyBias to ensure we have a bias to display
    // This is especially important where there might be timing issues
    // Only update if the bias ID actually changed to prevent unnecessary re-renders
    if (effectiveDailyBias && effectiveDailyBias.id !== dailyBias?.id && effectiveDailyBias.id !== syncedBiasIdRef.current) {
      logger.debug("[DailyBias] Setting daily bias:", effectiveDailyBias.title)
      syncedBiasIdRef.current = effectiveDailyBias.id
      // FIX: Set state immediately, not in requestAnimationFrame, to prevent skeleton flash
      // The RAF was causing a delay that allowed skeleton to show briefly
        setDailyBias(effectiveDailyBias)
    }
    // Only depend on effectiveDailyBias.id to prevent re-renders when object reference changes
    // but content is the same (which causes flickering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDailyBias?.id])

  useEffect(() => {
    const currentBias = dailyBias || effectiveDailyBias
    if (currentBias && currentBias.id !== lastProcessedBiasIdRef.current) {
      // Only process if this is a new bias to prevent unnecessary re-runs that cause flickering
      lastProcessedBiasIdRef.current = currentBias.id
      
      // Check if favorite and mastered - use async to prevent blocking
      Promise.all([
        isFavorite(currentBias.id).then(setIsFav).catch(err => {
          logger.error("[DailyBias] Failed to check favorite:", err)
          setIsFav(false)
        }),
        isMastered(currentBias.id).then(setIsMast).catch(err => {
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
        if (lastProcessedBiasIdRef.current === currentBias.id) {
          // Check if already viewed recently before calling markAsViewed
          // This prevents unnecessary updates that cause flickering
          markAsViewed(currentBias.id).catch(err => {
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
    // This prevents flickering from unnecessary effect re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyBias?.id, effectiveDailyBias?.id])

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

  // FIX: Never show skeleton if we have core biases available
  // Core biases are always available synchronously, so we should never show skeleton
  // This prevents the flash where SSR might render differently
  // CRITICAL: If allBiases.length > 0, we ALWAYS have data, so never show skeleton
  // This ensures no content→skeleton swap on hydration or date transitions
  useMemo(() => {
    // CRITICAL FIX: If we have any biases available, NEVER show skeleton
    // Core biases are always available immediately from useBiases hook
    if (allBiases.length > 0) {
      hasShownContentRef.current = true
    }
    
    // CRITICAL: Never show skeleton if we've shown content before (prevents date transition flicker)
    if (hasShownContentRef.current) {
      return // Once we've shown content, never go back to skeleton
    }
    
    // CRITICAL: If we have effectiveDailyBias or dailyBias, never show skeleton
    if (effectiveDailyBias || dailyBias) {
      hasShownContentRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBiases.length, effectiveDailyBias?.id, dailyBias?.id])

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
      <PullToRefresh onRefresh={handleRefresh} enabled={!biasesLoading} />
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
        {/* CRITICAL FIX: Always show content if we have biases, never show skeleton */}
        {/* effectiveDailyBias is guaranteed to be non-null if we have core biases */}
        {(() => {
          // Get fallback bias from core biases if needed
          const coreBiases = getCoreBiases()
          const fallbackBias = coreBiases.length > 0 ? coreBiases[0] : null
          const biasToShow = effectiveDailyBias || fallbackBias
          
          if (!biasToShow) return null
          
          return (
            <div className="space-y-6 sm:space-y-8">
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

              {/* Content Transparency */}
              <ContentTransparency showDetails={false} />

              {/* Daily Progress Widget */}
              <DailyProgressWidget />

              {/* Progress Indicator */}
              <BiasProgressIndicator />
            </div>
          )
        })()}
      </main>

      <DynamicNavigation />
    </div>
  )
}

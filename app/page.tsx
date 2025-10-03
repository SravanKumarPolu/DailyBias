"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { BiasCard } from "@/components/bias-card"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { useApp } from "@/contexts/app-context"
import { getPersonalizedDailyBias, getTodayDateString } from "@/lib/daily-selector"
import type { Bias } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedDailyBias, cacheDailyBias } from "@/lib/storage"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { useSpeech } from "@/hooks/use-speech"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const {
    allBiases,
    biasesLoading,
    toggleFavorite,
    isFavorite,
    settings,
    settingsLoading,
    progressStats,
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
  const { isListening, isSupported: voiceCommandsSupported, toggleListening, transcript } = useVoiceCommands({
    onReadCommand: handleReadCommand,
    onStopCommand: handleStopCommand,
    enabled: true,
  })

  // Calculate daily bias only once per day using cache
  const selectedDailyBias = useMemo(() => {
    if (allBiases.length === 0 || progressLoading) {
      return null
    }

    const today = getTodayDateString()
    const cachedBiasId = getCachedDailyBias(today)

    // If we have a cached bias for today, use it
    if (cachedBiasId) {
      const cached = allBiases.find((b) => b.id === cachedBiasId)
      if (cached) {
        return cached
      }
    }

    // Otherwise, calculate a new daily bias only once
    // This should only run once when the cache is empty
    const newDailyBias = getPersonalizedDailyBias(allBiases, progressList, today)
    cacheDailyBias(today, newDailyBias.id)
    return newDailyBias
  }, [allBiases, progressLoading])

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
  }, [dailyBias])

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

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={seed} />
      <DailyHeader 
        isVoiceListening={isListening}
        onToggleVoiceCommands={handleToggleVoiceCommands}
        voiceCommandsSupported={voiceCommandsSupported}
      />

      <main className="w-full max-w-2xl mx-auto px-4 py-8" aria-label="Daily cognitive bias">
        {loading || !dailyBias ? (
          <div className="space-y-6" role="status" aria-label="Loading daily bias">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>

            <div className="glass rounded-3xl p-6 border-2 border-primary/20">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="glass rounded-2xl p-8 space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <span className="sr-only">Loading today's cognitive bias...</span>
          </div>
        ) : (
          <BiasCard
            bias={dailyBias}
            variant="detailed"
            isFavorite={isFav}
            onToggleFavorite={handleToggleFavorite}
            isMastered={isMast}
            onToggleMastered={handleToggleMastered}
          />
        )}
      </main>

      <Navigation />
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSettings } from "./use-settings"

// Maximum character length per utterance (speech synthesis can fail on very long text)
const MAX_CHUNK_LENGTH = 300

// Safe development mode check (works in both server and client contexts)
const isDevelopment =
  typeof process !== "undefined"
    ? process.env.NODE_ENV === "development"
    : typeof window !== "undefined" && window.location.hostname === "localhost"

// Module-level singleton state for global TTS controller
type TTSStatus = "idle" | "playing" | "paused"
type TTSState = {
  status: TTSStatus
  activeSectionId: string | null
  activeBiasId: string | null
}

// Global state
let globalState: TTSState = {
  status: "idle",
  activeSectionId: null,
  activeBiasId: null,
}

// Listeners for state changes
type StateListener = (state: TTSState) => void
const listeners = new Set<StateListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener(globalState))
}

function setGlobalState(newState: Partial<TTSState>) {
  globalState = { ...globalState, ...newState }
  notifyListeners()
}

// Speech synthesis state
let utteranceQueue: SpeechSynthesisUtterance[] = []
let currentChunkIndex = 0
let isIntentionallyStopping = false
let lastSpokenText: string | null = null
let lastSpokenSectionId: string | null = null
let storedChunks: string[] = []

export function useTTSController() {
  const { settings } = useSettings()
  const [state, setState] = useState<TTSState>(globalState)
  const [isSupported, setIsSupported] = useState(false)
  const stateRef = useRef<TTSState>(globalState)

  // Subscribe to global state changes
  useEffect(() => {
    const listener: StateListener = (newState) => {
      stateRef.current = newState
      setState(newState)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
    }
  }, [])

  // Cleanup on unmount
  // Note: Only cancel speech, but preserve state (lastSpokenText, storedChunks, currentChunkIndex)
  // so resume can work if component remounts quickly (e.g., layout changes)
  useEffect(() => {
    return () => {
      if (globalState.status === "playing" || globalState.status === "paused") {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          // Cancel any active speech
          window.speechSynthesis.cancel()
        }
        // Only clear global state, but keep saved text/chunks for potential resume
        // This allows resume to work even if component remounts (mobile layout changes)
        setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
        // Don't clear lastSpokenText, storedChunks, or currentChunkIndex here
        // They will be cleared on explicit Stop/Reset or when starting new playback
      }
    }
  }, [])

  const getVoices = useCallback((): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis
      let voices = synth.getVoices()

      if (voices.length > 0) {
        resolve(voices)
        return
      }

      const maxWaitMs = 5000
      const start = Date.now()

      const tryResolve = () => {
        voices = synth.getVoices()
        if (voices.length > 0 || Date.now() - start >= maxWaitMs) {
          clearInterval(poller)
          resolve(voices)
        }
      }

      const onVoicesChanged = () => {
        tryResolve()
      }

      const poller = setInterval(tryResolve, 120)
      synth.addEventListener("voiceschanged", onVoicesChanged, { once: true })
      setTimeout(tryResolve, maxWaitMs)

      // Warmup for mobile
      try {
        if (synth.speaking || synth.pending) synth.cancel()
        const warmup = new SpeechSynthesisUtterance("")
        warmup.volume = 0
        warmup.lang = "en-US"
        synth.speak(warmup)
        setTimeout(() => {
          try {
            synth.cancel()
          } catch {}
        }, 50)
      } catch (error) {
        // Ignore warmup errors
      }
    })
  }, [])

  const selectBestVoice = useCallback(
    (voices: SpeechSynthesisVoice[], overrideVoiceName?: string) => {
      let selectedVoice: SpeechSynthesisVoice | undefined

      const targetVoiceName = overrideVoiceName || settings.voiceName
      if (targetVoiceName) {
        selectedVoice = voices.find((voice) => voice.name === targetVoiceName)
        if (!selectedVoice) {
          selectedVoice = voices.find(
            (voice) => voice.name.toLowerCase() === targetVoiceName.toLowerCase()
          )
        }
        if (selectedVoice) {
          return selectedVoice
        }
      }

      if (!settings.voiceName) {
        const voicePriority = [
          "Google US English",
          "Samantha",
          "Alex",
          "Victoria",
          "Karen",
          "Daniel",
          "Tessa",
          "Tom",
        ]

        for (const priorityVoice of voicePriority) {
          selectedVoice = voices.find((voice) =>
            voice.name.toLowerCase().includes(priorityVoice.toLowerCase())
          )
          if (selectedVoice) {
            return selectedVoice
          }
        }
      }

      selectedVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          voice.localService === true &&
          !voice.name.toLowerCase().match(/novelty|bells|bad news|albert|zarvox/)
      )

      if (selectedVoice) {
        return selectedVoice
      }

      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))
      return selectedVoice
    },
    [settings.voiceName]
  )

  const splitTextIntoChunks = useCallback((text: string): string[] => {
    if (text.length <= MAX_CHUNK_LENGTH) {
      return [text]
    }

    const chunks: string[] = []
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    let currentChunk = ""

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= MAX_CHUNK_LENGTH) {
        currentChunk += sentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks.length > 0 ? chunks : [text]
  }, [])

  const speakChunks = useCallback(
    (
      chunks: string[],
      voices: SpeechSynthesisVoice[],
      sectionId: string,
      overrideVoiceName?: string,
      resumeFromIndex?: number
    ) => {
      if (chunks.length === 0) {
        setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
        return
      }

      // Store chunks for potential resume
      storedChunks = chunks

      // Only reset chunk index if starting fresh (not resuming)
      if (resumeFromIndex !== undefined) {
        currentChunkIndex = resumeFromIndex
      } else if (globalState.status === "idle" || globalState.activeSectionId !== sectionId) {
        currentChunkIndex = 0
      }
      utteranceQueue = []

      const rate =
        typeof settings.voiceRate === "number" && isFinite(settings.voiceRate)
          ? settings.voiceRate
          : 1.0
      const pitch =
        typeof settings.voicePitch === "number" && isFinite(settings.voicePitch)
          ? settings.voicePitch
          : 1.0
      const selectedVoice = selectBestVoice(voices, overrideVoiceName)

      const speakNextChunk = () => {
        // Check if section changed or stopped
        if (globalState.activeSectionId !== sectionId || globalState.status === "idle") {
          return
        }

        if (currentChunkIndex >= chunks.length) {
          setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
          utteranceQueue = []
          storedChunks = []
          lastSpokenText = null
          lastSpokenSectionId = null
          currentChunkIndex = 0
          return
        }

        const chunk = chunks[currentChunkIndex]
        const utterance = new SpeechSynthesisUtterance(chunk)

        utterance.rate = rate
        utterance.pitch = pitch
        if (selectedVoice) {
          utterance.lang = selectedVoice.lang
          utterance.voice = selectedVoice
        } else {
          utterance.lang = "en-US"
        }

        utterance.onstart = () => {
          setGlobalState({ status: "playing", activeSectionId: sectionId })
        }

        utterance.onend = () => {
          currentChunkIndex++
          setTimeout(() => {
            // Only continue to next chunk if still active, not idle, and not paused
            if (globalState.activeSectionId === sectionId && globalState.status === "playing") {
              speakNextChunk()
            } else if (globalState.status === "paused") {
              // If paused, don't continue - wait for resume
              // The currentChunkIndex is already incremented, so resume will continue from next chunk
            }
          }, 50)
        }

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          const errorType = event.error || "unknown"
          if (
            errorType === "interrupted" ||
            errorType === "canceled" ||
            (errorType as string) === "cancelled"
          ) {
            if (!isIntentionallyStopping) {
              setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
            }
            utteranceQueue = []
            return
          }

          if (errorType === "not-allowed") {
            setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
            utteranceQueue = []
            return
          }

          if (errorType === "network" || errorType === "synthesis-failed") {
            currentChunkIndex++
            setTimeout(() => {
              // Only continue to next chunk if still active and playing (not paused)
              if (globalState.activeSectionId === sectionId && globalState.status === "playing") {
                speakNextChunk()
              }
            }, 100)
            return
          }

          setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
          utteranceQueue = []
        }

        utteranceQueue.push(utterance)

        try {
          // Don't cancel when continuing to next chunk in same section
          // The browser's speechSynthesis will queue utterances naturally
          // Only cancel if we detect we're switching sections (shouldn't happen here)
          const synth = window.speechSynthesis
          // If there's pending speech from a different section, it should have been
          // canceled in speakSection before calling speakChunks
          synth.speak(utterance)
        } catch (error) {
          console.error("[TTS Controller] Exception while speaking:", error)
          setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
          utteranceQueue = []
        }
      }

      speakNextChunk()
    },
    [settings.voiceRate, settings.voicePitch, selectBestVoice]
  )

  const speakSection = useCallback(
    async (text: string, sectionId: string, overrideVoiceName?: string, resumeFromIndex?: number) => {
      if (!isSupported) {
        console.error("[TTS Controller] Speech synthesis not supported")
        return
      }

      if (!settings.voiceEnabled) {
        console.log("[TTS Controller] Voice is disabled in settings")
        return
      }

      try {
        // Only cancel if not resuming from pause
        if (resumeFromIndex === undefined) {
          // Always cancel any ongoing speech first (global single-player)
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel()
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        // Reset state only if starting fresh
        if (resumeFromIndex === undefined) {
          utteranceQueue = []
          currentChunkIndex = 0
          isIntentionallyStopping = false
        }

        const voices = await getVoices()

        if (voices.length === 0) {
          console.warn("[TTS Controller] No voices available")
          return
        }

        const chunks = splitTextIntoChunks(text)
        lastSpokenText = text
        lastSpokenSectionId = sectionId
        setGlobalState({ status: "playing", activeSectionId: sectionId })
        speakChunks(chunks, voices, sectionId, overrideVoiceName, resumeFromIndex)
      } catch (error) {
        console.error("[TTS Controller] Failed to speak:", error)
        setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      }
    },
    [isSupported, settings.voiceEnabled, getVoices, splitTextIntoChunks, speakChunks]
  )

  const pause = useCallback(() => {
    if (!isSupported) return
    if (globalState.status !== "playing") return

    try {
      const synth = window.speechSynthesis
      
      // Only pause if actually speaking or pending
      if (synth.speaking || synth.pending || synth.paused) {
        synth.pause()
        // Update state to paused - this preserves activeSectionId and activeBiasId
        setGlobalState({ status: "paused" })
        
        // Preserve current chunk index and stored chunks for resume
        // These are already stored in module-level variables, so they persist
      } else {
        // Not actually speaking - set to idle instead
        setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      }
    } catch (error) {
      console.error("[TTS Controller] Error pausing:", error)
      // On error, try to set state to idle
      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
    }
  }, [isSupported])

  // Helper to restart from current chunk (used by resume fallback)
  const restartFromChunk = useCallback(async () => {
    if (!lastSpokenText || !lastSpokenSectionId || storedChunks.length === 0 || currentChunkIndex >= storedChunks.length) {
      if (isDevelopment) {
        console.warn('[TTS Resume] Cannot resume - no saved state', {
          hasText: !!lastSpokenText,
          hasSectionId: !!lastSpokenSectionId,
          chunksLength: storedChunks.length,
          chunkIndex: currentChunkIndex
        })
      }
      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      return
    }

    if (isDevelopment) {
      console.log('[TTS Resume] Restarting from chunk', currentChunkIndex, 'of', storedChunks.length)
    }

    const currentBiasId = globalState.activeBiasId
    await speakSection(lastSpokenText, lastSpokenSectionId, undefined, currentChunkIndex)
    
    if (currentBiasId) {
      setGlobalState({ activeBiasId: currentBiasId })
    }
  }, [speakSection])

  const resume = useCallback(async () => {
    if (!isSupported) return
    if (globalState.status !== "paused") return

    const synth = window.speechSynthesis
    
    // Debug logging (dev only)
    if (isDevelopment) {
      console.log('[TTS Resume] State:', {
        status: globalState.status,
        activeSectionId: globalState.activeSectionId,
        activeBiasId: globalState.activeBiasId,
        currentChunkIndex,
        chunksLength: storedChunks.length,
        speaking: synth.speaking,
        pending: synth.pending,
        paused: synth.paused,
        hasLastText: !!lastSpokenText,
        hasLastSectionId: !!lastSpokenSectionId
      })
    }

    try {
      const hasActiveUtterance = synth.speaking || synth.pending || synth.paused
      
      if (hasActiveUtterance) {
        // Use native resume which continues from exact position within the current utterance
        synth.resume()
        setGlobalState({ status: "playing" })
        
        if (isDevelopment) {
          console.log('[TTS Resume] Native resume successful - continuing from exact position')
        }
        
        // Verify resume actually worked (mobile browsers sometimes fail silently)
        setTimeout(() => {
          if (!synth.speaking && !synth.pending && globalState.status === "playing") {
            if (isDevelopment) {
              console.warn('[TTS Resume] Native resume appeared to fail, falling back to chunk restart')
            }
            restartFromChunk().catch((err) => {
              console.error("[TTS Controller] Fallback resume failed:", err)
              setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
            })
          }
        }, 200)
      } else {
        // No active utterance - fallback to restarting from current chunk
        // Note: This will restart from the beginning of the current chunk, not the exact pause position
        // This is a limitation of the Web Speech API - we can't track character position within a chunk
        await restartFromChunk()
      }
    } catch (error) {
      console.error("[TTS Controller] Error resuming:", error)
      await restartFromChunk()
    }
  }, [isSupported, restartFromChunk])

  const speakBias = useCallback(
    async (text: string, biasId: string, overrideVoiceName?: string) => {
      if (!isSupported) {
        console.error("[TTS Controller] Speech synthesis not supported")
        return
      }

      if (!settings.voiceEnabled) {
        console.log("[TTS Controller] Voice is disabled in settings")
        return
      }

      const synth = window.speechSynthesis

      // If this bias is already paused, resume it
      if (globalState.activeBiasId === biasId && globalState.status === "paused") {
        await resume()
        return
      }

      // If switching to a different bias, stop previous and reset cleanly
      if (globalState.activeBiasId && globalState.activeBiasId !== biasId) {
        // Cancel any ongoing speech (playing or paused)
        if (synth.speaking || synth.pending || synth.paused) {
          synth.cancel()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        // Clear previous bias state completely
        storedChunks = []
        currentChunkIndex = 0
        lastSpokenText = null
        lastSpokenSectionId = null
        utteranceQueue = []
      } else if (!globalState.activeBiasId) {
        // Starting fresh - stop any ongoing speech (could be from section playback)
        if (synth.speaking || synth.pending || synth.paused) {
          synth.cancel()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      // Store bias ID in global state and start playing
      setGlobalState({ activeBiasId: biasId })

      // Use section-based speak but with biasId as the sectionId
      // This allows us to track bias-level playback separately from section-level
      await speakSection(text, biasId, overrideVoiceName)
    },
    [isSupported, settings.voiceEnabled, speakSection, resume]
  )

  const stop = useCallback(() => {
    if (!isSupported) return

    try {
      isIntentionallyStopping = true
      utteranceQueue = []
      currentChunkIndex = 0

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }

      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      lastSpokenText = null
      lastSpokenSectionId = null
      storedChunks = []

      setTimeout(() => {
        isIntentionallyStopping = false
      }, 100)
    } catch (error) {
      console.error("[TTS Controller] Error stopping:", error)
      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      isIntentionallyStopping = false
    }
  }, [isSupported])

  const reset = useCallback(async () => {
    if (!isSupported) return

    try {
      isIntentionallyStopping = true

      const synth = window.speechSynthesis

      // Cancel current playback (works for both playing and paused states)
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel()
      }

      // Wait for cancel to complete
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Clear all state so next Listen starts fresh from the beginning
      utteranceQueue = []
      currentChunkIndex = 0
      storedChunks = []
      lastSpokenText = null
      lastSpokenSectionId = null

      // Clear global state - this ensures next Listen starts fresh
      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })

      setTimeout(() => {
        isIntentionallyStopping = false
      }, 100)
    } catch (error) {
      console.error("[TTS Controller] Error resetting:", error)
      // Ensure state is cleared even on error
      const synth = window.speechSynthesis
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel()
      }
      setGlobalState({ status: "idle", activeSectionId: null, activeBiasId: null })
      utteranceQueue = []
      currentChunkIndex = 0
      storedChunks = []
      lastSpokenText = null
      lastSpokenSectionId = null
      isIntentionallyStopping = false
    }
  }, [isSupported])

  const togglePause = useCallback(() => {
    if (globalState.status === "playing") {
      pause()
    } else if (globalState.status === "paused") {
      resume()
    }
  }, [pause, resume])

  return {
    speakSection,
    speakBias,
    pause,
    resume,
    stop,
    reset,
    togglePause,
    status: state.status,
    activeSectionId: state.activeSectionId,
    activeBiasId: state.activeBiasId,
    isSupported,
    isEnabled: settings.voiceEnabled,
  }
}


"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSettings } from "./use-settings"

// Maximum character length per utterance (speech synthesis can fail on very long text)
const MAX_CHUNK_LENGTH = 300

type TTSState = "idle" | "playing" | "paused"

interface TTSControllerState {
  state: TTSState
  activeBiasId: string | null
  activeSectionId: string | null
  textChunks: string[]
  currentChunkIndex: number
}

export function useTTSController() {
  const { settings } = useSettings()
  const [state, setState] = useState<TTSState>("idle")
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  // Refs to track playback state
  const activeBiasIdRef = useRef<string | null>(null)
  const activeSectionIdRef = useRef<string | null>(null)
  const textChunksRef = useRef<string[]>([])
  const currentChunkIndexRef = useRef(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isIntentionallyStoppingRef = useRef(false)
  // Track pause state for state-driven pause/resume (mobile-compatible)
  const pausedChunkIndexRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)
  // Track if we're resuming (to set playing state correctly)
  const isResumingRef = useRef(false)
  // Track if we're using native pause/resume (desktop) or chunk-based (mobile)
  const useNativePauseResumeRef = useRef(true)
  // Guard to prevent concurrent speak() calls
  const isSpeakingRef = useRef(false)

  // Check support and settings
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
    }
  }, [])

  useEffect(() => {
    setIsEnabled(settings.voiceEnabled ?? false)
  }, [settings.voiceEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Split text into manageable chunks
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

  // Get voices with mobile-specific handling
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

      // Warmup for mobile browsers
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

  // Select best voice
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
        if (!selectedVoice) {
          const targetLower = targetVoiceName.toLowerCase()
          selectedVoice = voices.find(
            (voice) =>
              voice.name.toLowerCase().includes(targetLower) ||
              targetLower.includes(voice.name.toLowerCase())
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
          "Tom"
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

  // Speak chunks sequentially
  const speakChunks = useCallback(
    (chunks: string[], biasId: string, voices: SpeechSynthesisVoice[], overrideVoiceName?: string) => {
      if (chunks.length === 0) {
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        return
      }

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
        // Check if we should continue (not stopped or reset)
        if (activeBiasIdRef.current !== biasId) {
          setState("idle")
          return
        }

        if (currentChunkIndexRef.current >= chunks.length) {
          console.log("[TTS Controller] All chunks completed")
          setState("idle")
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
          isResumingRef.current = false
          useNativePauseResumeRef.current = true
          isSpeakingRef.current = false
          return
        }

        const chunk = chunks[currentChunkIndexRef.current]
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
          try {
            // Set playing state on first chunk start (index 0) or when resuming from pause
            // When resuming, isResumingRef is set to true, or we're starting from a non-zero index
            const isStarting = currentChunkIndexRef.current === 0
            const isResuming = isResumingRef.current || (currentChunkIndexRef.current > 0 && pausedChunkIndexRef.current !== null)
            
            if (isStarting || isResuming) {
              console.log("[TTS Controller] Speech started at chunk", currentChunkIndexRef.current, isResuming ? "(resuming)" : "(starting)")
              setState("playing")
              isPausedRef.current = false
              pausedChunkIndexRef.current = null
              isResumingRef.current = false
            }
          } catch (error) {
            console.error("[TTS Controller] Error in onstart:", error)
          }
        }

        utterance.onend = () => {
          try {
            currentChunkIndexRef.current++
            console.log(
              `[TTS Controller] Chunk ${currentChunkIndexRef.current}/${chunks.length} completed`
            )

            setTimeout(() => {
              try {
                speakNextChunk()
              } catch (error) {
                console.error("[TTS Controller] Error in onend speakNextChunk:", error)
                setState("idle")
                activeBiasIdRef.current = null
                activeSectionIdRef.current = null
                textChunksRef.current = []
                currentChunkIndexRef.current = 0
                pausedChunkIndexRef.current = null
                isPausedRef.current = false
                isResumingRef.current = false
              }
            }, 50)
          } catch (error) {
            console.error("[TTS Controller] Error in onend:", error)
            setState("idle")
            activeBiasIdRef.current = null
            activeSectionIdRef.current = null
            textChunksRef.current = []
            currentChunkIndexRef.current = 0
            pausedChunkIndexRef.current = null
            isPausedRef.current = false
            isResumingRef.current = false
          }
        }

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          try {
            const errorType = event.error || "unknown"

            if (
              errorType === "interrupted" ||
              errorType === "canceled" ||
              (errorType as string) === "cancelled"
            ) {
              // If we're intentionally pausing, don't clear state - preserve it for resume
              if (isPausedRef.current && pausedChunkIndexRef.current !== null) {
                // Pause was intentional, state is already set - just return
                if (!isIntentionallyStoppingRef.current) {
                  console.log(`[TTS Controller] Speech ${errorType} (paused, preserving state)`)
                }
                return
              }

              // Otherwise, this is a cancellation - clear state
              if (!isIntentionallyStoppingRef.current) {
                console.log(`[TTS Controller] Speech ${errorType}`)
              }
              setState("idle")
              activeBiasIdRef.current = null
              activeSectionIdRef.current = null
              textChunksRef.current = []
              currentChunkIndexRef.current = 0
              pausedChunkIndexRef.current = null
              isPausedRef.current = false
              isResumingRef.current = false
              return
            }

            if (errorType === "not-allowed") {
              console.warn("[TTS Controller] Not allowed - user interaction required")
              setState("idle")
              activeBiasIdRef.current = null
              activeSectionIdRef.current = null
              textChunksRef.current = []
              currentChunkIndexRef.current = 0
              pausedChunkIndexRef.current = null
              isPausedRef.current = false
              isResumingRef.current = false
              return
            }

            if (errorType === "network" || errorType === "synthesis-failed") {
              console.warn(`[TTS Controller] ${errorType} - attempting next chunk`)
              currentChunkIndexRef.current++
              setTimeout(() => {
                try {
                  speakNextChunk()
                } catch (error) {
                  console.error("[TTS Controller] Error in onerror speakNextChunk:", error)
                  setState("idle")
                  activeBiasIdRef.current = null
                  activeSectionIdRef.current = null
                  textChunksRef.current = []
                  currentChunkIndexRef.current = 0
                  pausedChunkIndexRef.current = null
                  isPausedRef.current = false
                  isResumingRef.current = false
                }
              }, 100)
              return
            }

            console.error(`[TTS Controller] Unexpected error: ${errorType}`)
            setState("idle")
            activeBiasIdRef.current = null
            activeSectionIdRef.current = null
            textChunksRef.current = []
            currentChunkIndexRef.current = 0
            pausedChunkIndexRef.current = null
            isPausedRef.current = false
            isResumingRef.current = false
          } catch (error) {
            console.error("[TTS Controller] Error in onerror handler:", error)
            setState("idle")
            activeBiasIdRef.current = null
            activeSectionIdRef.current = null
            textChunksRef.current = []
            currentChunkIndexRef.current = 0
            pausedChunkIndexRef.current = null
            isPausedRef.current = false
            isResumingRef.current = false
          }
        }

        utteranceRef.current = utterance

        try {
          // Cancel any ongoing speech and wait briefly for it to complete
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel()
            // Small delay to ensure cancel completes before speaking new utterance
            setTimeout(() => {
              try {
                window.speechSynthesis.speak(utterance)
              } catch (error) {
                console.error("[TTS Controller] Exception while speaking:", error)
                setState("idle")
                activeBiasIdRef.current = null
                activeSectionIdRef.current = null
                textChunksRef.current = []
                currentChunkIndexRef.current = 0
                pausedChunkIndexRef.current = null
                isPausedRef.current = false
                isSpeakingRef.current = false
              }
            }, 50)
          } else {
            window.speechSynthesis.speak(utterance)
          }
        } catch (error) {
          console.error("[TTS Controller] Exception while speaking:", error)
          setState("idle")
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
          isSpeakingRef.current = false
        }
      }

      console.log(`[TTS Controller] Speaking ${chunks.length} chunk(s)`)
      speakNextChunk()
    },
    [settings.voiceRate, settings.voicePitch, selectBestVoice]
  )

  // Resume speech (hybrid approach: try native resume first, fallback to chunk-based)
  const resume = useCallback(async () => {
    if (!isSupported) return

    try {
      // Check if we have a paused state to resume from
      if (
        !isPausedRef.current ||
        activeBiasIdRef.current === null ||
        textChunksRef.current.length === 0 ||
        pausedChunkIndexRef.current === null
      ) {
        console.warn("[TTS Controller] Cannot resume: no paused state")
        setState("idle")
        return
      }

      const biasId = activeBiasIdRef.current
      const chunks = textChunksRef.current
      const resumeIndex = pausedChunkIndexRef.current

      // Try native resume first (if we used native pause)
      if (useNativePauseResumeRef.current && window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume()
          isPausedRef.current = false
          pausedChunkIndexRef.current = null
          isResumingRef.current = false
          setState("playing")
          console.log(`[TTS Controller] Resumed using native resume() from chunk ${resumeIndex}`)
          return
        } catch (nativeError) {
          // Native resume failed, fall back to chunk-based approach
          console.log("[TTS Controller] Native resume failed, using chunk-based approach")
          useNativePauseResumeRef.current = false
          // Cancel any pending speech
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel()
          }
        }
      }

      // Fallback: chunk-based resume (for mobile or when native resume fails)
      console.log(
        `[TTS Controller] Resuming from chunk ${resumeIndex}/${chunks.length} (chunk-based)`
      )

      // Cancel any pending speech (important for mobile)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Get voices and continue from saved position
      const voices = await getVoices()
      if (voices.length === 0) {
        console.warn("[TTS Controller] No voices available for resume")
        setState("idle")
        return
      }

      // Restart from paused chunk index
      currentChunkIndexRef.current = resumeIndex
      isPausedRef.current = false
      isResumingRef.current = true // Mark that we're resuming

      // Continue speaking from the paused position
      speakChunks(chunks, biasId, voices)
      
      // Clear resume flag after a short delay (in case onstart doesn't fire)
      setTimeout(() => {
        isResumingRef.current = false
      }, 1000)
    } catch (error) {
      console.error("[TTS Controller] Error resuming:", error)
      setState("idle")
      isPausedRef.current = false
      pausedChunkIndexRef.current = null
      isResumingRef.current = false
    }
  }, [isSupported, getVoices, speakChunks])

  // Start speaking text for a bias/section
  const speak = useCallback(
    async (text: string, biasId: string, sectionId?: string, overrideVoiceName?: string) => {
      if (!isSupported) {
        console.error("[TTS Controller] Speech synthesis not supported")
        return
      }

      if (!isEnabled) {
        console.log("[TTS Controller] Voice is disabled")
        return
      }

      // Prevent concurrent speak() calls for different targets while one is initializing
      if (isSpeakingRef.current) {
        const sameTarget =
          activeBiasIdRef.current === biasId &&
          activeSectionIdRef.current === (sectionId || "full")
        if (!sameTarget) {
          console.log("[TTS Controller] Already speaking a different target, ignoring duplicate call")
          return
        }
      }

      try {
        isSpeakingRef.current = true
        // If switching to a different bias or section, stop current speech
        if (
          (activeBiasIdRef.current !== null && activeBiasIdRef.current !== biasId) ||
          (activeSectionIdRef.current !== null && activeSectionIdRef.current !== (sectionId || "full"))
        ) {
          // Cancel any ongoing speech (including paused speech)
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel()
          }
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
          isResumingRef.current = false
          useNativePauseResumeRef.current = true
          setState("idle")
        }

        // If already playing this target, do nothing (or pause if needed)
        if (
          activeBiasIdRef.current === biasId &&
          activeSectionIdRef.current === (sectionId || "full") &&
          state === "playing"
        ) {
          return
        }

        // If paused for this target, resume instead
        if (
          activeBiasIdRef.current === biasId &&
          activeSectionIdRef.current === (sectionId || "full") &&
          (state === "paused" || isPausedRef.current)
        ) {
          await resume()
          return
        }

        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Set up for new speech
        activeBiasIdRef.current = biasId
        activeSectionIdRef.current = sectionId || "full"
        const chunks = splitTextIntoChunks(text)
        textChunksRef.current = chunks
        currentChunkIndexRef.current = 0
        // Clear any paused state when starting fresh
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
        isResumingRef.current = false
        // Reset native pause/resume flag for new speech session
        useNativePauseResumeRef.current = true

        // Get voices
        const voices = await getVoices()
        if (voices.length === 0) {
          console.warn("[TTS Controller] No voices available")
          try {
            const warmup = new SpeechSynthesisUtterance("")
            window.speechSynthesis.speak(warmup)
            window.speechSynthesis.cancel()
          } catch (e) {
            // Ignore warmup errors
          }
          return
        }

        // Start speaking
        speakChunks(chunks, biasId, voices, overrideVoiceName)
      } catch (error) {
        console.error("[TTS Controller] Failed to speak:", error)
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        textChunksRef.current = []
        currentChunkIndexRef.current = 0
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
        isResumingRef.current = false
        isSpeakingRef.current = false
      } finally {
        // Reset speaking flag after a short delay to allow speech to start
        setTimeout(() => {
          isSpeakingRef.current = false
        }, 200)
      }
    },
    [isSupported, isEnabled, state, splitTextIntoChunks, getVoices, speakChunks, resume]
  )

  // Pause speech (hybrid approach: try native pause first, fallback to chunk-based)
  const pause = useCallback(() => {
    if (!isSupported) return

    try {
      // Only pause if currently playing
      if (state !== "playing" || activeBiasIdRef.current === null) {
        console.log("[TTS Controller] Cannot pause: not playing")
        return
      }

      // Save current position
      const pausedIndex = currentChunkIndexRef.current
      pausedChunkIndexRef.current = pausedIndex
      isPausedRef.current = true

      // Try native pause/resume first (works on desktop browsers)
      if (useNativePauseResumeRef.current && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.pause()
          setState("paused")
          console.log(`[TTS Controller] Paused using native pause() at chunk ${pausedIndex}`)
          return
        } catch (nativeError) {
          // Native pause failed, fall back to chunk-based approach
          console.log("[TTS Controller] Native pause failed, using chunk-based approach")
          useNativePauseResumeRef.current = false
        }
      }

      // Fallback: chunk-based approach (for mobile or when native pause fails)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }

      setState("paused")
      console.log(`[TTS Controller] Paused at chunk ${pausedIndex} (chunk-based)`)
    } catch (error) {
      console.error("[TTS Controller] Error pausing:", error)
      setState("idle")
      isPausedRef.current = false
      pausedChunkIndexRef.current = null
    }
  }, [isSupported, state])

  // Reset speech (stop and clear state)
  const reset = useCallback(() => {
    if (!isSupported) return

    try {
      isIntentionallyStoppingRef.current = true

      // Cancel any ongoing speech (including paused speech)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel()
      }

      // Clear all state
      setState("idle")
      activeBiasIdRef.current = null
      activeSectionIdRef.current = null
      textChunksRef.current = []
      currentChunkIndexRef.current = 0
      pausedChunkIndexRef.current = null
      isPausedRef.current = false
      isResumingRef.current = false
      useNativePauseResumeRef.current = true

      console.log("[TTS Controller] Reset - all state cleared")

      setTimeout(() => {
        isIntentionallyStoppingRef.current = false
      }, 100)
    } catch (error) {
      console.error("[TTS Controller] Error resetting:", error)
      setState("idle")
      activeBiasIdRef.current = null
      textChunksRef.current = []
      currentChunkIndexRef.current = 0
      pausedChunkIndexRef.current = null
      isPausedRef.current = false
      isResumingRef.current = false
      isIntentionallyStoppingRef.current = false
      useNativePauseResumeRef.current = true
    }
  }, [isSupported])

  // Stop speech (alias for reset, but keep for backward compatibility)
  const stop = useCallback(() => {
    reset()
  }, [reset])

  // Get current state info
  const getState = useCallback((): TTSControllerState => {
    return {
      state,
      activeBiasId: activeBiasIdRef.current,
      activeSectionId: activeSectionIdRef.current,
      textChunks: textChunksRef.current,
      currentChunkIndex: currentChunkIndexRef.current,
    }
  }, [state])

  return {
    speak,
    pause,
    resume,
    reset,
    stop,
    state,
    isSupported,
    isEnabled,
    getState,
    activeBiasId: activeBiasIdRef.current,
    activeSectionId: activeSectionIdRef.current,
  }
}


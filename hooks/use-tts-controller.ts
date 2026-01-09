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
  const activeTextRef = useRef<string>("") // Track current text to detect changes
  const textChunksRef = useRef<string[]>([])
  const currentChunkIndexRef = useRef(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isIntentionallyStoppingRef = useRef(false)
  // Track pause state for state-driven pause/resume (mobile-compatible)
  const pausedChunkIndexRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)
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
    // If voice is disabled, stop any ongoing speech
    if (!(settings.voiceEnabled ?? false) && state !== "idle") {
      // Cancel directly when voice is disabled
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        activeTextRef.current = ""
        textChunksRef.current = []
        currentChunkIndexRef.current = 0
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
      }
    }
  }, [settings.voiceEnabled, state])

  // Sync state with speechSynthesis engine state
  const syncStateWithEngine = useCallback(() => {
    if (!isSupported || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    const synth = window.speechSynthesis
    
    // If engine says it's not speaking and not paused, but we think we're playing/paused,
    // we need to check if we should transition to idle
    if (!synth.speaking && !synth.pending && !synth.paused) {
      // Only transition to idle if we're not intentionally in a paused state
      // IMPORTANT: If we're paused (chunk-based pause), keep the paused state even if engine is idle
      if (state === "paused" && isPausedRef.current) {
        // We're intentionally paused (chunk-based), keep the paused state
        // Don't transition to idle - the engine is idle because we cancelled it
        return
      }
      if (state === "playing" && !isPausedRef.current) {
        // Speech ended naturally
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        textChunksRef.current = []
        currentChunkIndexRef.current = 0
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
      }
    } else if (synth.paused && state === "playing") {
      // Engine is paused but our state says playing - sync to paused
      setState("paused")
      isPausedRef.current = true
    } else if (synth.speaking && state === "paused" && !synth.paused) {
      // Engine is speaking but our state says paused
      // IMPORTANT: Only sync to playing if we're NOT intentionally paused
      // This prevents flickering when pause() is called but engine hasn't paused yet
      if (!isPausedRef.current) {
        // We're not intentionally paused, so sync to playing
        setState("playing")
        isPausedRef.current = false
      }
      // If isPausedRef.current is true, we just paused and engine hasn't caught up yet
      // Keep the paused state - don't sync back to playing
    }
  }, [isSupported, state])

  // Set up periodic state sync (for cross-browser compatibility)
  useEffect(() => {
    if (!isSupported) return

    const interval = setInterval(() => {
      syncStateWithEngine()
    }, 200) // Check every 200ms

    return () => clearInterval(interval)
  }, [isSupported, syncStateWithEngine])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        // Clear all state
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        activeTextRef.current = ""
        textChunksRef.current = []
        currentChunkIndexRef.current = 0
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
        useNativePauseResumeRef.current = true
        isSpeakingRef.current = false
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

        // Log current index for debugging
        console.log(`[TTS Controller] speakNextChunk: index=${currentChunkIndexRef.current}, total=${chunks.length}`)

        if (currentChunkIndexRef.current >= chunks.length) {
          console.log("[TTS Controller] All chunks completed")
          setState("idle")
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          activeTextRef.current = ""
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
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
            // Always set playing state when utterance starts
            if (activeBiasIdRef.current === biasId) {
              console.log("[TTS Controller] Speech started at chunk", currentChunkIndexRef.current, "of", chunks.length)
              setState("playing")
              isPausedRef.current = false
              // Clear paused index when we start speaking the chunk we paused at (or later)
              // This confirms we've successfully resumed from the paused position
              if (pausedChunkIndexRef.current !== null && currentChunkIndexRef.current >= pausedChunkIndexRef.current) {
                console.log(`[TTS Controller] Cleared paused index ${pausedChunkIndexRef.current}, now speaking chunk ${currentChunkIndexRef.current}`)
                pausedChunkIndexRef.current = null
              }
            }
          } catch (error) {
            console.error("[TTS Controller] Error in onstart:", error)
          }
        }

        utterance.onpause = () => {
          try {
            // Only update state if this is our active bias
            // Don't check state === "playing" because pause() might have already set it to "paused"
            // Just confirm the paused state if it's our active bias
            if (activeBiasIdRef.current === biasId) {
              console.log("[TTS Controller] Speech paused at chunk", currentChunkIndexRef.current)
              // Only update if not already paused (to avoid unnecessary state updates)
              if (state !== "paused") {
                setState("paused")
              }
              isPausedRef.current = true
              pausedChunkIndexRef.current = currentChunkIndexRef.current
            }
          } catch (error) {
            console.error("[TTS Controller] Error in onpause:", error)
          }
        }

        utterance.onresume = () => {
          try {
            // Only update state if this is our active bias
            if (activeBiasIdRef.current === biasId && state === "paused") {
              console.log("[TTS Controller] Speech resumed at chunk", currentChunkIndexRef.current)
              setState("playing")
              isPausedRef.current = false
            }
          } catch (error) {
            console.error("[TTS Controller] Error in onresume:", error)
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
          } catch (error) {
            console.error("[TTS Controller] Error in onerror handler:", error)
            setState("idle")
            activeBiasIdRef.current = null
            activeSectionIdRef.current = null
            textChunksRef.current = []
            currentChunkIndexRef.current = 0
            pausedChunkIndexRef.current = null
            isPausedRef.current = false
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
    if (!isSupported) {
      console.warn("[TTS Controller] Cannot resume: not supported")
      return
    }

    if (!isEnabled) {
      console.warn("[TTS Controller] Cannot resume: voice disabled")
      return
    }

    // Only resume if we're in paused state
    if (state !== "paused" || !isPausedRef.current) {
      console.warn("[TTS Controller] Cannot resume: not paused")
      return
    }

    try {
      // Check if we have a paused state to resume from
      if (
        activeBiasIdRef.current === null ||
        textChunksRef.current.length === 0 ||
        pausedChunkIndexRef.current === null
      ) {
        console.warn("[TTS Controller] Cannot resume: no paused state")
        setState("idle")
        isPausedRef.current = false
        pausedChunkIndexRef.current = null
        return
      }

      const biasId = activeBiasIdRef.current
      const chunks = textChunksRef.current
      const resumeIndex = pausedChunkIndexRef.current

      // Try native resume first (if we used native pause)
      // IMPORTANT: Even if engine doesn't report paused, if we used native pause, try native resume first
      // The utterance might have been interrupted but we can still try to resume
      if (useNativePauseResumeRef.current) {
        try {
          // Check if engine is actually paused
          if (window.speechSynthesis.paused) {
            // Engine is paused - use native resume
            window.speechSynthesis.resume()
            // State will be updated by onresume event handler
            console.log(`[TTS Controller] Resumed using native resume() from chunk ${resumeIndex} (engine was paused)`)
            return
          } else if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            // Engine is speaking/pending but not paused - might be a state issue
            // Try resume anyway - some browsers allow this
            console.log("[TTS Controller] Engine not paused but has active speech, trying native resume anyway")
            try {
              window.speechSynthesis.resume()
              console.log(`[TTS Controller] Resumed using native resume() from chunk ${resumeIndex} (engine had active speech)`)
              return
            } catch (e) {
              console.log("[TTS Controller] Native resume failed when engine had active speech, falling back to chunk-based")
              useNativePauseResumeRef.current = false
            }
          } else {
            // Engine is idle - native pause was used but utterance was interrupted/cancelled
            // We need to fall back to chunk-based resume
            console.log("[TTS Controller] Native pause was used but engine is idle (utterance interrupted), using chunk-based resume")
            useNativePauseResumeRef.current = false
          }
        } catch (nativeError) {
          // Native resume failed, fall back to chunk-based approach
          console.log("[TTS Controller] Native resume failed, using chunk-based approach", nativeError)
          useNativePauseResumeRef.current = false
          // Cancel any pending speech
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel()
          }
        }
      }

      // Fallback: chunk-based resume (for mobile or when native resume fails)
      // NOTE: Chunk-based resume can only resume from chunk boundaries, not exact positions within a chunk
      // If we paused mid-chunk using native pause, we'll restart that chunk from the beginning
      console.log(
        `[TTS Controller] Resuming from chunk ${resumeIndex}/${chunks.length} (chunk-based)`,
        { biasId, chunksLength: chunks.length, resumeIndex }
      )

      // Validate resume index
      if (resumeIndex < 0 || resumeIndex >= chunks.length) {
        console.warn(`[TTS Controller] Invalid resume index ${resumeIndex}, resetting to 0`)
        currentChunkIndexRef.current = 0
      } else {
        // Restart from paused chunk index
        // IMPORTANT: This will restart the chunk from the beginning, not from where we paused within it
        // This is a limitation of chunk-based resume - we can only resume from chunk boundaries
        currentChunkIndexRef.current = resumeIndex
        console.log(`[TTS Controller] Will resume from beginning of chunk ${resumeIndex} (chunk-based limitation)`)
      }

      // Cancel any pending speech (important for mobile)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Get voices and continue from saved position
      const voices = await getVoices()
      if (voices.length === 0) {
        console.warn("[TTS Controller] No voices available for resume")
        setState("idle")
        isPausedRef.current = false
        pausedChunkIndexRef.current = null
        return
      }

      // Clear paused state before resuming
      isPausedRef.current = false
      // Don't clear pausedChunkIndexRef yet - let onstart handler do it after confirming

      // Continue speaking from the paused position
      // speakChunks will use currentChunkIndexRef.current which we just set above
      console.log(`[TTS Controller] Starting speakChunks from index ${currentChunkIndexRef.current}`)
      speakChunks(chunks, biasId, voices)
    } catch (error) {
      console.error("[TTS Controller] Error resuming:", error)
      setState("idle")
      isPausedRef.current = false
      pausedChunkIndexRef.current = null
    }
  }, [isSupported, isEnabled, state, getVoices, speakChunks])

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

      try {
        isSpeakingRef.current = true
        
        const currentSectionId = sectionId || "full"
        const isSameTarget = 
          activeBiasIdRef.current === biasId &&
          activeSectionIdRef.current === currentSectionId

        // If switching to a different bias or section, stop current speech and reset
        if (
          (activeBiasIdRef.current !== null && activeBiasIdRef.current !== biasId) ||
          (activeSectionIdRef.current !== null && activeSectionIdRef.current !== currentSectionId)
        ) {
          // Cancel any ongoing speech (including paused speech)
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel()
          }
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          activeTextRef.current = ""
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
          useNativePauseResumeRef.current = true
          setState("idle")
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // If text changed for the same target, reset and start fresh
        if (isSameTarget && activeTextRef.current !== text) {
          console.log("[TTS Controller] Text changed for same target, resetting")
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel()
          }
          textChunksRef.current = []
          currentChunkIndexRef.current = 0
          pausedChunkIndexRef.current = null
          isPausedRef.current = false
          useNativePauseResumeRef.current = true
          setState("idle")
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // If already playing this target, do nothing
        if (isSameTarget && state === "playing") {
          console.log("[TTS Controller] Already playing this target")
          isSpeakingRef.current = false
          return
        }

        // If paused for this target, resume instead
        if (isSameTarget && (state === "paused" || isPausedRef.current)) {
          console.log("[TTS Controller] Resuming paused speech")
          await resume()
          isSpeakingRef.current = false
          return
        }

        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
          window.speechSynthesis.cancel()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Set up for new speech
        activeBiasIdRef.current = biasId
        activeSectionIdRef.current = currentSectionId
        activeTextRef.current = text
        const chunks = splitTextIntoChunks(text)
        textChunksRef.current = chunks
        currentChunkIndexRef.current = 0
        // Clear any paused state when starting fresh
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
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
          setState("idle")
          activeBiasIdRef.current = null
          activeSectionIdRef.current = null
          activeTextRef.current = ""
          isSpeakingRef.current = false
          return
        }

        // Start speaking
        speakChunks(chunks, biasId, voices, overrideVoiceName)
      } catch (error) {
        console.error("[TTS Controller] Failed to speak:", error)
        setState("idle")
        activeBiasIdRef.current = null
        activeSectionIdRef.current = null
        activeTextRef.current = ""
        textChunksRef.current = []
        currentChunkIndexRef.current = 0
        pausedChunkIndexRef.current = null
        isPausedRef.current = false
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
    if (!isSupported) {
      console.warn("[TTS Controller] Cannot pause: not supported")
      return
    }

    if (!isEnabled) {
      console.warn("[TTS Controller] Cannot pause: voice disabled")
      return
    }

    // Only pause if currently playing
    if (state !== "playing" || activeBiasIdRef.current === null) {
      console.log("[TTS Controller] Cannot pause: not playing")
      return
    }

    try {
      // Save current position before pausing
      // IMPORTANT: currentChunkIndexRef.current is the chunk we're currently speaking (or about to speak)
      // For native pause: we pause mid-chunk, so we save the current chunk index
      // For chunk-based pause: we cancel and will restart from this chunk index
      const pausedIndex = currentChunkIndexRef.current
      
      // CRITICAL: Set isPausedRef and save index BEFORE calling pause() so syncStateWithEngine knows we're intentionally pausing
      isPausedRef.current = true
      pausedChunkIndexRef.current = pausedIndex
      // Set state immediately to prevent flickering
      setState("paused")

      console.log(`[TTS Controller] Pausing at chunk ${pausedIndex}/${textChunksRef.current.length}`)

      // Try native pause/resume first (works on desktop browsers)
      if (useNativePauseResumeRef.current && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        try {
          window.speechSynthesis.pause()
          // State already set above, onpause event handler will confirm it
          console.log(`[TTS Controller] Paused using native pause() at chunk ${pausedIndex}`)
          return
        } catch (nativeError) {
          // Native pause failed, fall back to chunk-based approach
          console.log("[TTS Controller] Native pause failed, using chunk-based approach")
          useNativePauseResumeRef.current = false
        }
      }

      // Fallback: chunk-based approach (for mobile or when native pause fails)
      // IMPORTANT: State and refs already set above, just cancel the speech
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }

      console.log(`[TTS Controller] Paused at chunk ${pausedIndex} (chunk-based)`)
    } catch (error) {
      console.error("[TTS Controller] Error pausing:", error)
      setState("idle")
      isPausedRef.current = false
      pausedChunkIndexRef.current = null
    }
  }, [isSupported, isEnabled, state])

  // Reset speech (stop and clear state)
  const reset = useCallback(() => {
    if (!isSupported) {
      console.warn("[TTS Controller] Cannot reset: not supported")
      return
    }

    try {
      isIntentionallyStoppingRef.current = true

      // Cancel any ongoing speech (including paused speech)
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel()
      }

      // Clear all state - ensure next Listen starts from beginning
      setState("idle")
      activeBiasIdRef.current = null
      activeSectionIdRef.current = null
      activeTextRef.current = ""
      textChunksRef.current = []
      currentChunkIndexRef.current = 0
      pausedChunkIndexRef.current = null
      isPausedRef.current = false
      useNativePauseResumeRef.current = true
      isSpeakingRef.current = false

      console.log("[TTS Controller] Reset - all state cleared, next Listen will start from beginning")

      setTimeout(() => {
        isIntentionallyStoppingRef.current = false
      }, 100)
    } catch (error) {
      console.error("[TTS Controller] Error resetting:", error)
      setState("idle")
      activeBiasIdRef.current = null
      activeSectionIdRef.current = null
      activeTextRef.current = ""
      textChunksRef.current = []
      currentChunkIndexRef.current = 0
      pausedChunkIndexRef.current = null
      isPausedRef.current = false
      isIntentionallyStoppingRef.current = false
      useNativePauseResumeRef.current = true
      isSpeakingRef.current = false
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


"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSettings } from "./use-settings"

// Maximum character length per utterance (speech synthesis can fail on very long text)
const MAX_CHUNK_LENGTH = 300

export function useSpeech() {
  const { settings, saveSetting } = useSettings()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([])
  const currentChunkIndexRef = useRef(0)
  const isIntentionallyStoppingRef = useRef(false)

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
      
      // Check if we're in an in-app browser
      const userAgent = navigator.userAgent.toLowerCase()
      const isInAppBrowser = 
        userAgent.includes('telegram') ||
        userAgent.includes('whatsapp') ||
        userAgent.includes('fbav') ||
        userAgent.includes('fban') ||
        userAgent.includes('instagram') ||
        userAgent.includes('twitterandroid') ||
        userAgent.includes('twitterios') ||
        userAgent.includes('linkedinapp') ||
        (userAgent.includes('wv') && !userAgent.includes('chrome')) ||
        (userAgent.includes('webkit') && !userAgent.includes('safari') && !userAgent.includes('chrome'))
      
      if (isInAppBrowser) {
        console.log('[Speech] Detected in-app browser - speech may not work properly')
      }
      
      // MOBILE FIX: Initialize speech synthesis on page load
      // This helps with iOS Safari and mobile browsers
      // Some browsers need the API to be "touched" early to work properly
      const initSpeech = () => {
        try {
          // Get voices to initialize the API
          const voices = window.speechSynthesis.getVoices()
          if (voices.length === 0) {
            // Voices not loaded yet, wait for event
            window.speechSynthesis.addEventListener('voiceschanged', () => {
              console.log('[Speech] Voices loaded:', window.speechSynthesis.getVoices().length)
            }, { once: true })
          } else {
            console.log('[Speech] Speech API initialized with', voices.length, 'voices')
          }
        } catch (error) {
          console.warn('[Speech] Failed to initialize:', error)
        }
      }
      
      // Initialize immediately
      initSpeech()
      
      // Also try on first user interaction (important for mobile)
      const initOnInteraction = () => {
        initSpeech()
        document.removeEventListener('touchstart', initOnInteraction)
        document.removeEventListener('click', initOnInteraction)
      }
      
      document.addEventListener('touchstart', initOnInteraction, { once: true, passive: true })
      document.addEventListener('click', initOnInteraction, { once: true })
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Split long text into manageable chunks
  const splitTextIntoChunks = useCallback((text: string): string[] => {
    // If text is short enough, return as single chunk
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

  const getVoices = useCallback((): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis
      let voices = synth.getVoices()

      // Voices may already be ready
      if (voices.length > 0) {
        console.log("[Speech] Voices already loaded:", voices.length)
        resolve(voices)
        return
      }

      // iOS Safari (including installed PWAs) is notorious for delaying
      // voice availability and sometimes not firing 'voiceschanged'. We
      // poll for a short period to increase reliability.
      const maxWaitMs = 5000
      const start = Date.now()

      const tryResolve = () => {
        voices = synth.getVoices()
        console.log("[Speech] Voice check:", voices.length, "voices found")
        
        if (voices.length > 0 || Date.now() - start >= maxWaitMs) {
          clearInterval(poller)
          if (voices.length > 0) {
            console.log("[Speech] Successfully loaded voices:", voices.map(v => v.name))
          } else {
            console.warn("[Speech] No voices found after waiting", maxWaitMs, "ms")
          }
          resolve(voices)
        }
      }

      const onVoicesChanged = () => {
        console.log("[Speech] voiceschanged event fired")
        tryResolve()
      }

      const poller = setInterval(tryResolve, 120)
      synth.addEventListener("voiceschanged", onVoicesChanged, { once: true })

      // Final safety timeout
      setTimeout(tryResolve, maxWaitMs)

      // MOBILE WARMUP: Some browsers don't populate voices until we've
      // invoked speak() at least once. Trigger a no-op utterance.
      try {
        // Cancel anything pending to avoid queue buildup
        if (synth.speaking || synth.pending) synth.cancel()
        const warmup = new SpeechSynthesisUtterance("")
        warmup.volume = 0
        // Use common English tag so platforms load en-* voices
        warmup.lang = "en-US"
        console.log("[Speech] Triggering voice warmup...")
        synth.speak(warmup)
        // Cancel shortly after to keep it silent and quick
        setTimeout(() => {
          try { 
            synth.cancel() 
            console.log("[Speech] Voice warmup completed")
          } catch {}
        }, 50)
      } catch (error) {
        console.warn("[Speech] Voice warmup failed:", error)
      }
    })
  }, [])

  const selectBestVoice = useCallback(
    (voices: SpeechSynthesisVoice[], overrideVoiceName?: string) => {
      console.log("[Speech] Available voices:", voices.map(v => `${v.name} (${v.lang}, local: ${v.localService})`))
      console.log("[Speech] Target voice from settings:", overrideVoiceName || settings.voiceName)
      
      let selectedVoice: SpeechSynthesisVoice | undefined

      // 1. Try to find the exact voice name from override or settings (case-insensitive)
      const targetVoiceName = overrideVoiceName || settings.voiceName
      if (targetVoiceName) {
        // First try exact match (case-sensitive)
        selectedVoice = voices.find((voice) => voice.name === targetVoiceName)
        
        // If exact match fails, try case-insensitive match
        if (!selectedVoice) {
          selectedVoice = voices.find((voice) => 
            voice.name.toLowerCase() === targetVoiceName.toLowerCase()
          )
        }
        
        // If still not found, try partial match (for voice names that might have extra info)
        if (!selectedVoice) {
          const targetLower = targetVoiceName.toLowerCase()
          selectedVoice = voices.find((voice) => 
            voice.name.toLowerCase().includes(targetLower) ||
            targetLower.includes(voice.name.toLowerCase())
          )
        }
        
        if (selectedVoice) {
          console.log("[Speech] Using selected voice:", selectedVoice.name)
          return selectedVoice
        } else {
          console.warn("[Speech] Target voice not found:", targetVoiceName, "- Available voices:", voices.map(v => v.name))
        }
      }

      // 2. Only use priority list if no user selection exists (fallback for first-time setup)
      // This prevents overriding user's explicit voice selection
      if (!settings.voiceName) {
        const voicePriority = [
          "Google US English",  // Best desktop voice
          "Samantha",          // High-quality, natural sounding
          "Alex",              // High-quality iOS voice
          "Victoria",          // Good iOS voice
          "Karen",             // Decent Android voice
          "Daniel",            // Common but lower quality Android voice
          "Tessa",             // Good iOS voice
          "Tom"                // Alternative Android voice
        ]
        
        for (const priorityVoice of voicePriority) {
          selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes(priorityVoice.toLowerCase()))
          if (selectedVoice) {
            console.log("[Speech] Using priority voice as fallback:", selectedVoice.name)
            return selectedVoice
          }
        }
      }
      
      console.log("[Speech] No priority voices found, trying fallback options")

      // 3. Try to find a high-quality LOCAL English voice (avoid network voices)
      selectedVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          voice.localService === true &&
          !voice.name.toLowerCase().match(/novelty|bells|bad news|albert|zarvox/)
      )

      if (selectedVoice) {
        console.log("[Speech] Using local fallback voice:", selectedVoice.name)
        return selectedVoice
      }

      // 4. Final fallback - use any English voice
      selectedVoice = voices.find((voice) => voice.lang.startsWith("en"))

      if (selectedVoice) {
        console.log(
          "[Speech] Using any English voice:",
          selectedVoice.name,
          "- Local:",
          selectedVoice.localService
        )
      } else {
        console.warn("[Speech] No suitable voice found, using system default")
      }

      return selectedVoice
    },
    [settings.voiceName]
  )


  const speakChunks = useCallback(
    (chunks: string[], voices: SpeechSynthesisVoice[], overrideVoiceName?: string) => {
      if (chunks.length === 0) {
        setIsSpeaking(false)
        return
      }

      currentChunkIndexRef.current = 0
      utteranceQueueRef.current = []

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
        if (currentChunkIndexRef.current >= chunks.length) {
          console.log("[Speech] All chunks completed")
          setIsSpeaking(false)
          utteranceQueueRef.current = []
          return
        }

        const chunk = chunks[currentChunkIndexRef.current]
        const utterance = new SpeechSynthesisUtterance(chunk)

        utterance.rate = rate
        utterance.pitch = pitch
        // Always align utterance language with the selected voice to avoid
        // browsers (notably iOS) silently falling back to the system default.
        if (selectedVoice) {
          utterance.lang = selectedVoice.lang
          utterance.voice = selectedVoice
          console.log("=== ACTIVE VOICE DEBUG ===")
          console.log("[Speech] ACTIVE VOICE:", selectedVoice.name)
          console.log("[Speech] Voice language:", selectedVoice.lang)
          console.log("[Speech] Voice is local:", selectedVoice.localService)
          console.log("[Speech] Is mobile:", /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768 || ('ontouchstart' in window))
          console.log("=========================")
        } else {
          // Fallback language
          utterance.lang = "en-US"
          console.log("[Speech] Using system default voice (no voice selected)")
        }

        utterance.onstart = () => {
          try {
            if (currentChunkIndexRef.current === 0) {
              console.log("[Speech] Started speaking with voice:", utterance.voice?.name || "default")
              setIsSpeaking(true)
            }
          } catch (error) {
            console.error("[Speech] Error in onstart handler:", error)
          }
        }

        utterance.onend = () => {
          try {
            currentChunkIndexRef.current++
            console.log(`[Speech] Chunk ${currentChunkIndexRef.current}/${chunks.length} completed`)

            // Small delay between chunks to prevent issues
            setTimeout(() => {
              try {
                speakNextChunk()
              } catch (error) {
                console.error("[Speech] Error in onend speakNextChunk:", error)
                setIsSpeaking(false)
                utteranceQueueRef.current = []
              }
            }, 50)
          } catch (error) {
            console.error("[Speech] Error in onend handler:", error)
            setIsSpeaking(false)
            utteranceQueueRef.current = []
          }
        }

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          try {
            const errorType = event.error || "unknown"
            const voiceName = utterance.voice?.name || "default"
            const isLocal = utterance.voice?.localService ?? false

            // Handle specific errors with appropriate log levels
            // Check for both British and American spellings of canceled/cancelled
            if (
              errorType === "interrupted" ||
              errorType === "canceled" ||
              (errorType as string) === "cancelled"
            ) {
              // This is normal behavior when user stops speech or starts new speech
              const logLevel = isIntentionallyStoppingRef.current ? "log" : "warn"
              console[logLevel](
                `[Speech] Speech ${errorType}: voice="${voiceName}", chunk=${currentChunkIndexRef.current + 1}/${chunks.length}${isIntentionallyStoppingRef.current ? " (intentional stop)" : ""}`
              )
              setIsSpeaking(false)
              utteranceQueueRef.current = []
              return
            }

            if (errorType === "not-allowed") {
              console.warn(
                `[Speech] Not allowed - user interaction required first: voice="${voiceName}", chunk=${currentChunkIndexRef.current + 1}/${chunks.length}`
              )
              setIsSpeaking(false)
              utteranceQueueRef.current = []
              return
            }

            // For network or synthesis errors, try to continue with next chunk
            if (errorType === "network" || errorType === "synthesis-failed") {
              console.warn(
                `[Speech] ${errorType} - attempting next chunk: voice="${voiceName}", local=${isLocal}, chunk=${currentChunkIndexRef.current + 1}/${chunks.length}`
              )
              currentChunkIndexRef.current++
              setTimeout(() => {
                try {
                  speakNextChunk()
                } catch (error) {
                  console.error("[Speech] Error in onerror speakNextChunk:", error)
                  setIsSpeaking(false)
                  utteranceQueueRef.current = []
                }
              }, 100)
              return
            }

            // Unknown/unexpected error - use console.error
            console.error(
              `[Speech] Unexpected error: type="${errorType}", voice="${voiceName}", local=${isLocal}, chunk=${currentChunkIndexRef.current + 1}/${chunks.length}`
            )
            setIsSpeaking(false)
            utteranceQueueRef.current = []
          } catch (error) {
            console.error("[Speech] Error in onerror handler:", error)
            setIsSpeaking(false)
            utteranceQueueRef.current = []
          }
        }

        utteranceRef.current = utterance
        utteranceQueueRef.current.push(utterance)

        try {
          // Cancel any pending utterances to ensure voice switch takes effect
          // Some browsers queue synthesis and ignore new voice assignments.
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel()
          }
          window.speechSynthesis.speak(utterance)
        } catch (error) {
          console.error("[Speech] Exception while speaking:", error)
          setIsSpeaking(false)
          utteranceQueueRef.current = []
        }
      }

      console.log(
        `[Speech] Speaking ${chunks.length} chunk(s) with voice:`,
        selectedVoice?.name || "default"
      )
      speakNextChunk()
    },
    [settings.voiceRate, settings.voicePitch, selectBestVoice]
  )

  const speak = useCallback(
    async (text: string, overrideVoiceName?: string) => {
      if (!isSupported) {
        console.error("[Speech] Speech synthesis not supported in this browser")
        return
      }

      if (!settings.voiceEnabled) {
        console.log("[Speech] Voice is disabled in settings. Go to Settings to enable it.")
        return
      }

      try {
        // MOBILE FIX: Cancel any ongoing speech first
        // This is crucial for mobile browsers, especially iOS
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel()
          // Add a small delay to ensure cancellation completes on mobile
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        utteranceQueueRef.current = []
        currentChunkIndexRef.current = 0

        // Get voices with mobile-specific handling
        const voices = await getVoices()

        if (voices.length === 0) {
          console.warn("[Speech] No voices available - may need user interaction on mobile")
          // MOBILE FIX: Try to initialize speech synthesis with empty utterance
          // This helps "warm up" the API on iOS
          try {
            const warmup = new SpeechSynthesisUtterance("")
            window.speechSynthesis.speak(warmup)
            window.speechSynthesis.cancel()
          } catch (e) {
            console.log("[Speech] Warmup failed, continuing anyway")
          }
          return
        }

        // Split text into chunks
        const chunks = splitTextIntoChunks(text)
        console.log(`[Speech] Text split into ${chunks.length} chunk(s)`)

        // Speak chunks with optional voice override
        speakChunks(chunks, voices, overrideVoiceName)
      } catch (error) {
        console.error("[Speech] Failed to speak:", error)
        setIsSpeaking(false)
      }
    },
    [isSupported, settings.voiceEnabled, getVoices, splitTextIntoChunks, speakChunks]
  )

  const stop = useCallback(() => {
    if (!isSupported) return

    try {
      // Set flag to indicate we're intentionally stopping
      isIntentionallyStoppingRef.current = true

      // Clear the queue first to prevent new utterances from starting
      utteranceQueueRef.current = []
      currentChunkIndexRef.current = 0

      // Cancel any ongoing speech synthesis
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }

      setIsSpeaking(false)
      console.log("[Speech] Stopped")

      // Reset the flag after a short delay
      setTimeout(() => {
        isIntentionallyStoppingRef.current = false
      }, 100)
    } catch (error) {
      console.error("[Speech] Error stopping speech:", error)
      setIsSpeaking(false)
      isIntentionallyStoppingRef.current = false
    }
  }, [isSupported])

  const toggleVoice = useCallback(() => {
    const newValue = !settings.voiceEnabled
    saveSetting("voiceEnabled", newValue)
    if (!newValue) {
      stop()
    }
  }, [settings.voiceEnabled, saveSetting, stop])

  const pause = useCallback(() => {
    if (!isSupported) return
    try {
      window.speechSynthesis.pause()
      console.log("[Speech] Paused")
    } catch (error) {
      console.error("[Speech] Error pausing speech:", error)
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return
    try {
      window.speechSynthesis.resume()
      console.log("[Speech] Resumed")
    } catch (error) {
      console.error("[Speech] Error resuming speech:", error)
    }
  }, [isSupported])

  return {
    speak,
    stop,
    pause,
    resume,
    toggleVoice,
    isSpeaking,
    isSupported,
    isEnabled: settings.voiceEnabled,
    // Allow UI to explicitly warm up voices after a user gesture if needed
    ensureVoicesLoaded: getVoices,
  }
}

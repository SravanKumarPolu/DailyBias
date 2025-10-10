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
      let voices = window.speechSynthesis.getVoices()

      if (voices.length > 0) {
        resolve(voices)
        return
      }

      // Wait for voices to load
      const voiceschanged = () => {
        voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          resolve(voices)
        }
      }

      window.speechSynthesis.addEventListener("voiceschanged", voiceschanged, { once: true })

      // Fallback timeout
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices()
        resolve(voices)
      }, 1000)
    })
  }, [])

  const selectBestVoice = useCallback(
    (voices: SpeechSynthesisVoice[]) => {
      let selectedVoice: SpeechSynthesisVoice | undefined

      // 1. Try to find the exact voice name from settings
      if (settings.voiceName) {
        selectedVoice = voices.find((voice) => voice.name === settings.voiceName)
        if (selectedVoice) {
          console.log("[Speech] Using saved voice:", selectedVoice.name)
          return selectedVoice
        }
      }

      // 2. If no voice found, try to find Daniel
      selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes("daniel"))
      if (selectedVoice) {
        console.log("[Speech] Using Daniel voice as fallback:", selectedVoice.name)
        return selectedVoice
      }

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
    (chunks: string[], voices: SpeechSynthesisVoice[]) => {
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
      const selectedVoice = selectBestVoice(voices)

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
        utterance.lang = "en-US"

        if (selectedVoice) {
          utterance.voice = selectedVoice
        }

        utterance.onstart = () => {
          if (currentChunkIndexRef.current === 0) {
            console.log("[Speech] Started speaking with voice:", utterance.voice?.name || "default")
            setIsSpeaking(true)
          }
        }

        utterance.onend = () => {
          currentChunkIndexRef.current++
          console.log(`[Speech] Chunk ${currentChunkIndexRef.current}/${chunks.length} completed`)

          // Small delay between chunks to prevent issues
          setTimeout(() => {
            speakNextChunk()
          }, 50)
        }

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
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
              speakNextChunk()
            }, 100)
            return
          }

          // Unknown/unexpected error - use console.error
          console.error(
            `[Speech] Unexpected error: type="${errorType}", voice="${voiceName}", local=${isLocal}, chunk=${currentChunkIndexRef.current + 1}/${chunks.length}`
          )
          setIsSpeaking(false)
          utteranceQueueRef.current = []
        }

        utteranceRef.current = utterance
        utteranceQueueRef.current.push(utterance)

        try {
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
    async (text: string) => {
      if (!isSupported) {
        console.error("[Speech] Speech synthesis not supported in this browser")
        return
      }

      if (!settings.voiceEnabled) {
        console.log("[Speech] Voice is disabled in settings. Go to Settings to enable it.")
        return
      }

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        utteranceQueueRef.current = []
        currentChunkIndexRef.current = 0

        // Get voices
        const voices = await getVoices()

        if (voices.length === 0) {
          console.warn("[Speech] No voices available")
          return
        }

        // Split text into chunks
        const chunks = splitTextIntoChunks(text)
        console.log(`[Speech] Text split into ${chunks.length} chunk(s)`)

        // Speak chunks
        speakChunks(chunks, voices)
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
  }
}

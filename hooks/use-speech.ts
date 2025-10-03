"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSettings } from "./use-settings"

export function useSpeech() {
  const { settings, saveSetting } = useSettings()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
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

        const utterance = new SpeechSynthesisUtterance(text)
        // Ensure valid finite numbers with fallbacks
        const rate = typeof settings.voiceRate === 'number' && isFinite(settings.voiceRate) ? settings.voiceRate : 1.0
        const pitch = typeof settings.voicePitch === 'number' && isFinite(settings.voicePitch) ? settings.voicePitch : 1.0
        
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.lang = "en-US"

        // Set voice if specified
        if (settings.voiceName) {
          const voices = window.speechSynthesis.getVoices()
          const selectedVoice = voices.find(voice => voice.name === settings.voiceName)
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }
        }

        utterance.onstart = () => {
          console.log("[Speech] Started speaking")
          setIsSpeaking(true)
        }
        utterance.onend = () => {
          console.log("[Speech] Finished speaking")
          setIsSpeaking(false)
        }
        utterance.onerror = (event) => {
          console.error("[Speech] Error:", event)
          setIsSpeaking(false)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        console.log("[Speech] Speech initiated")
      } catch (error) {
        console.error("[Speech] Failed to speak:", error)
        setIsSpeaking(false)
      }
    },
    [isSupported, settings.voiceEnabled, settings.voiceRate, settings.voicePitch, settings.voiceName]
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
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
    window.speechSynthesis.pause()
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
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


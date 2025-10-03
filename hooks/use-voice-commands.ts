"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface VoiceCommandsOptions {
  onReadCommand?: () => void
  onStopCommand?: () => void
  enabled?: boolean
}

export function useVoiceCommands({ onReadCommand, onStopCommand, enabled = true }: VoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || !enabled) return

    try {
      recognitionRef.current.start()
      setIsListening(true)
      console.log("[Voice Commands] Started listening...")
    } catch (error) {
      console.error("[Voice Commands] Error starting:", error)
    }
  }, [isSupported, enabled])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
      console.log("[Voice Commands] Stopped listening")
    } catch (error) {
      console.error("[Voice Commands] Error stopping:", error)
    }
  }, [])

  useEffect(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim()
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim()
      setTranscript(fullTranscript)

      // Check for commands in final transcript
      if (finalTranscript) {
        console.log("[Voice Commands] Detected:", finalTranscript)

        // Read command variations
        if (
          finalTranscript.includes("read") ||
          finalTranscript.includes("listen") ||
          finalTranscript.includes("play") ||
          finalTranscript.includes("speak")
        ) {
          console.log("[Voice Commands] READ command detected!")
          onReadCommand?.()
        }

        // Stop command variations
        if (
          finalTranscript.includes("stop") ||
          finalTranscript.includes("pause") ||
          finalTranscript.includes("quiet") ||
          finalTranscript.includes("silence")
        ) {
          console.log("[Voice Commands] STOP command detected!")
          onStopCommand?.()
        }
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("[Voice Commands] Error:", event.error)
      if (event.error === "no-speech") {
        // Restart if no speech detected
        setTimeout(() => {
          if (isListening && enabled) {
            stopListening()
            setTimeout(startListening, 100)
          }
        }, 100)
      }
    }

    recognitionRef.current.onend = () => {
      console.log("[Voice Commands] Recognition ended")
      // Auto-restart if it should be listening
      if (isListening && enabled) {
        setTimeout(startListening, 100)
      }
    }
  }, [isListening, enabled, onReadCommand, onStopCommand, startListening, stopListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  }
}


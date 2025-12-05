"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "@/lib/speech-recognition-types"

interface VoiceCommandsOptions {
  onReadCommand?: () => void
  onStopCommand?: () => void
  enabled?: boolean
}

export function useVoiceCommands({
  onReadCommand,
  onStopCommand,
  enabled = true,
}: VoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"
        recognitionRef.current.maxAlternatives = 3 // Get multiple recognition alternatives
        recognitionRef.current.serviceURI = undefined // Use default service
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

      // Clear any pending command timeout
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current)
        commandTimeoutRef.current = null
      }

      console.log("[Voice Commands] Stopped listening")
    } catch (error) {
      console.error("[Voice Commands] Error stopping:", error)
    }
  }, [])

  useEffect(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      try {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript.toLowerCase().trim()
          const confidence = result[0].confidence || 0

          // Only process results with reasonable confidence (if available)
          if (confidence > 0 || !confidence) {
            // confidence might not be available on all browsers
            if (result.isFinal) {
              finalTranscript += transcript + " "
              console.log(
                "[Voice Commands] Final result:",
                transcript,
                confidence ? `(confidence: ${confidence.toFixed(2)})` : ""
              )
            } else {
              interimTranscript += transcript
              console.log(
                "[Voice Commands] Interim result:",
                transcript,
                confidence ? `(confidence: ${confidence.toFixed(2)})` : ""
              )
            }
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim()
        setTranscript(fullTranscript)

        // Check for commands in both final and interim transcript
        // This ensures we catch commands even if they don't get final results
        const transcriptToCheck = (finalTranscript || interimTranscript).trim()

        if (transcriptToCheck) {
          console.log("[Voice Commands] Processing transcript:", transcriptToCheck)

          // More flexible command matching with word boundaries and variations
          const readPatterns = [
            /\b(read|reed|red)\b/,
            /\b(listen|listening)\b/,
            /\b(play|playing)\b/,
            /\b(speak|speaking)\b/,
            /\b(start)\b/,
          ]

          const stopPatterns = [
            /\b(stop|stopping)\b/,
            /\b(pause|pausing)\b/,
            /\b(quiet|quietly)\b/,
            /\b(silence|silent)\b/,
            /\b(end|ending)\b/,
            /\b(cease|ceasing)\b/,
            /\b(halt|halting)\b/,
            /\b(quit|quitting)\b/,
            /\b(cancel|canceling)\b/,
            /\b(abort|aborting)\b/,
          ]

          // Check for read commands
          const hasReadCommand = readPatterns.some((pattern) => pattern.test(transcriptToCheck))
          if (hasReadCommand) {
            console.log("[Voice Commands] READ command detected!")
            onReadCommand?.()
            // Clear transcript after processing to avoid duplicate commands
            setTranscript("")
            return
          }

          // Check for stop commands - be more aggressive with stop commands
          const hasStopCommand = stopPatterns.some((pattern) => pattern.test(transcriptToCheck))
          if (hasStopCommand) {
            console.log("[Voice Commands] STOP command detected!")
            onStopCommand?.()
            // Clear transcript after processing to avoid duplicate commands
            setTranscript("")
            return
          }

          // Also check for very short stop commands that might be missed
          const shortStopWords = ["stop", "pause", "quiet", "end", "halt"]
          const hasShortStopCommand = shortStopWords.some(
            (word) => transcriptToCheck === word || transcriptToCheck.endsWith(word)
          )
          if (hasShortStopCommand) {
            console.log("[Voice Commands] SHORT STOP command detected!")
            onStopCommand?.()
            setTranscript("")
            return
          }

          // Set a timeout to process commands even if they don't get final results
          // This helps catch short commands that might not trigger final results
          if (commandTimeoutRef.current) {
            clearTimeout(commandTimeoutRef.current)
          }

          commandTimeoutRef.current = setTimeout(() => {
            try {
              // Check again after a short delay for commands that might not have been processed
              const currentTranscript = transcriptToCheck
              if (currentTranscript) {
                console.log("[Voice Commands] Timeout check for:", currentTranscript)

                const hasReadCommand = readPatterns.some((pattern) => pattern.test(currentTranscript))
                if (hasReadCommand) {
                  console.log("[Voice Commands] READ command detected via timeout!")
                  onReadCommand?.()
                  setTranscript("")
                  return
                }

                const hasStopCommand = stopPatterns.some((pattern) => pattern.test(currentTranscript))
                if (hasStopCommand) {
                  console.log("[Voice Commands] STOP command detected via timeout!")
                  onStopCommand?.()
                  setTranscript("")
                  return
                }
              }
            } catch (error) {
              console.error("[Voice Commands] Error in timeout handler:", error)
            }
          }, 1000) // 1 second timeout
        }
      } catch (error) {
        console.error("[Voice Commands] Error in onresult handler:", error)
      }
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      try {
        console.error("[Voice Commands] Error:", event.error)

        // Handle different error types
        switch (event.error) {
          case "no-speech":
            // Restart if no speech detected
            console.log("[Voice Commands] No speech detected, restarting...")
            setTimeout(() => {
              try {
                if (isListening && enabled) {
                  stopListening()
                  setTimeout(startListening, 100)
                }
              } catch (error) {
                console.error("[Voice Commands] Error in no-speech restart:", error)
              }
            }, 100)
            break
          case "audio-capture":
            console.error("[Voice Commands] Audio capture error - microphone not available")
            setIsListening(false)
            break
          case "not-allowed":
            console.error("[Voice Commands] Permission denied - microphone access blocked")
            setIsListening(false)
            break
          case "network":
            console.error("[Voice Commands] Network error - speech recognition service unavailable")
            setIsListening(false)
            break
          default:
            console.error("[Voice Commands] Unknown error:", event.error)
            // For unknown errors, try to restart
            setTimeout(() => {
              try {
                if (isListening && enabled) {
                  stopListening()
                  setTimeout(startListening, 500)
                }
              } catch (error) {
                console.error("[Voice Commands] Error in unknown error restart:", error)
              }
            }, 500)
        }
      } catch (error) {
        console.error("[Voice Commands] Error in onerror handler:", error)
      }
    }

    recognitionRef.current.onend = () => {
      try {
        console.log("[Voice Commands] Recognition ended")
        // Auto-restart if it should be listening
        if (isListening && enabled) {
          setTimeout(() => {
            try {
              startListening()
            } catch (error) {
              console.error("[Voice Commands] Error in onend restart:", error)
            }
          }, 100)
        }
      } catch (error) {
        console.error("[Voice Commands] Error in onend handler:", error)
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

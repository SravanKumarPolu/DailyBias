"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/service-worker"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Handle unhandled promise rejections that might contain Event objects
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason
        
        // If the reason is an Event object, convert it to a proper error message
        if (reason instanceof Event) {
          const eventDetails = {
            type: reason.type,
            target: reason.target ? String(reason.target) : null,
            currentTarget: reason.currentTarget ? String(reason.currentTarget) : null,
            timeStamp: reason.timeStamp,
          }
          console.error("[Error Handler] Unhandled promise rejection with Event object:", eventDetails)
          // Prevent the default error handling to avoid showing [object Event]
          event.preventDefault()
          return
        }
        
        // For other errors, log them normally but prevent default to avoid console spam
        if (reason instanceof Error) {
          console.error("[Error Handler] Unhandled promise rejection:", reason.message, reason.stack)
        } else {
          console.error("[Error Handler] Unhandled promise rejection:", reason)
        }
        
        // Prevent default error handling to avoid showing in Next.js error overlay
        event.preventDefault()
      } catch (error) {
        // If the handler itself throws, log it but don't prevent default
        console.error("[Error Handler] Error in unhandled rejection handler:", error)
      }
    }

    // Also handle general errors
    const handleError = (event: ErrorEvent) => {
      try {
        // Only log if it's not already handled
        if (event.error && !(event.error instanceof Event)) {
          console.error("[Error Handler] Unhandled error:", event.error)
        }
      } catch (error) {
        console.error("[Error Handler] Error in error handler:", error)
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    registerServiceWorker()

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  return null
}

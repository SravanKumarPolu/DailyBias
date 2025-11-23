"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"
// Removed framer-motion imports - using static CSS transitions to prevent flickering on Android

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Use requestAnimationFrame to batch state updates and prevent flickering
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setShowStatus(false), 300) // Wait for fade out
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }

    // Only access navigator on client side
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Use static div with CSS transitions instead of motion.div to prevent flickering
  // CSS transitions are more performant on Android and don't cause re-render loops
  if (!showStatus) return null

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-xl ${
          isOnline
            ? "border-green-400 bg-green-500/90 text-white"
            : "border-red-400 bg-red-500/90 text-white"
        }`}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" aria-hidden="true" />
        ) : (
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? "Back online" : "You're offline"}
        </span>
      </div>
    </div>
  )
}

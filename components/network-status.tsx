"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
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

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-xl ${
              isOnline
                ? "border-green-400 bg-green-500/90 text-white"
                : "border-red-400 bg-red-500/90 text-white"
            }`}
          >
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {isOnline ? "Back online" : "You're offline"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

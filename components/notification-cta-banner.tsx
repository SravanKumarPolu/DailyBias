"use client"

import { useState, useEffect } from "react"
import { Bell, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const BANNER_DISMISSED_KEY = "notification-cta-banner-dismissed"

export function NotificationCTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if banner was already dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY) === "true"
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Check if notifications are supported and permission is default (not granted/denied)
    if ("Notification" in window) {
      const permission = Notification.permission
      // Only show if permission is default (user hasn't been asked yet)
      if (permission === "default") {
        setIsDismissed(false)
        // Small delay for smooth animation
        setTimeout(() => setIsVisible(true), 100)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== "undefined") {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true")
    }
    setIsDismissed(true)
  }

  const handleEnable = () => {
    handleDismiss()
    router.push("/settings#notifications")
  }

  if (isDismissed || !isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "glass mx-auto mb-6 max-w-3xl rounded-xl border border-primary/20 p-4 shadow-lg transition-all duration-300 sm:rounded-2xl sm:p-5",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
      role="banner"
      aria-label="Enable daily reminders"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12">
          <Bell className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            Never miss your daily bias
          </h3>
          <p className="mt-1 text-xs text-foreground/80 sm:text-sm">
            Enable daily reminders to get notified when a new bias is available
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleEnable}
              className="text-xs sm:text-sm"
              aria-label="Go to settings to enable daily reminders"
            >
              <Settings className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              Enable reminders
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs sm:text-sm"
              aria-label="Dismiss notification reminder"
            >
              Maybe later
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 shrink-0 sm:h-8 sm:w-8"
          aria-label="Dismiss notification reminder"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}


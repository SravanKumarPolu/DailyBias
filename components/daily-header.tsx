"use client"

import { Moon, Sun, Bell, BellRing, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getTimezoneAwareDateString } from "@/lib/timezone-utils"
import { siteConfig } from "@/lib/site-config"

export function DailyHeader() {
  const { settings, saveSetting } = useSettings()
  const [notificationState, setNotificationState] = useState<{
    enabled: boolean
    permission: "default" | "granted" | "denied" | "unsupported"
  }>({ enabled: false, permission: "default" })
  // FIX: Prevent hydration mismatch by using suppressHydrationWarning
  // Date formatting can legitimately differ between server and client due to locale
  const [today, setToday] = useState<string>(() => {
    // Always return empty string on initial render to match server
    // Will be set in useEffect after mount
    return ""
  })

  useEffect(() => {
    // Set date after mount to prevent hydration mismatch
    setToday(getTimezoneAwareDateString())

    // Update date if it changed (e.g., day changed)
    const interval = setInterval(() => {
      const currentDate = getTimezoneAwareDateString()
      setToday(prev => {
        if (prev !== currentDate) {
          return currentDate
        }
        return prev
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Check notification state for visual indicator
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkNotificationState = () => {
      let permission: "default" | "granted" | "denied" | "unsupported" = "unsupported"
      
      if ("Notification" in window) {
        permission = Notification.permission as "default" | "granted" | "denied"
      }

      setNotificationState({
        enabled: settings.dailyReminder && permission === "granted",
        permission,
      })
    }

    checkNotificationState()

    // Poll for changes (browsers don't always fire events)
    const interval = setInterval(checkNotificationState, 2000)
    return () => clearInterval(interval)
  }, [settings.dailyReminder])

  // Apply theme changes with requestAnimationFrame to prevent flicker
  useEffect(() => {
    // Use requestAnimationFrame to batch DOM updates and prevent flicker
    const updateTheme = () => {
      const root = document.documentElement
      if (settings.theme === "dark") {
        root.classList.add("dark")
        root.classList.remove("light")
      } else if (settings.theme === "light") {
        root.classList.add("light")
        root.classList.remove("dark")
      } else {
        // System theme - remove both and let CSS media query handle it
        root.classList.remove("dark", "light")
      }
    }

    // Batch theme updates to prevent flicker during rapid changes
    const rafId = requestAnimationFrame(updateTheme)
    return () => cancelAnimationFrame(rafId)
  }, [settings.theme])

  // Cycle through theme modes: light -> dark -> system -> light
  const toggleTheme = () => {
    const themeOrder: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
    const currentIndex = themeOrder.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    saveSetting("theme", themeOrder[nextIndex])
  }

  // Get the theme icon and label - MATCHES settings page icons
  const getThemeDisplay = () => {
    if (settings.theme === "dark") {
      return {
        icon: <Moon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />,
        label: "Dark mode (click to cycle)",
        nextMode: "system",
      }
    } else if (settings.theme === "system") {
      return {
        icon: <Monitor className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />,
        label: "System mode (click to cycle)",
        nextMode: "light",
      }
    } else {
      return {
        icon: <Sun className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />,
        label: "Light mode (click to cycle)",
        nextMode: "dark",
      }
    }
  }

  const themeDisplay = getThemeDisplay()

  // FIX: Always render the full header immediately to prevent flash
  // Removed the mounted check that was causing the skeleton flash

  return (
    <header className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 xl:max-w-3xl 2xl:max-w-3xl">
      <div className="group relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/15 bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/20 dark:via-black/15 dark:to-black/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        {/* Inner highlight for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 rounded-3xl pointer-events-none" />

        <div className="relative px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Top section: Title, Stats, and Icons */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:gap-8">
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <Link href="/" className="group/link inline-block cursor-pointer">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent transition-all duration-500 ease-out group-hover/link:scale-[1.02] group-hover/link:from-primary group-hover/link:via-primary group-hover/link:to-accent">
                    {siteConfig.name}
                  </h1>
                </Link>
                <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl text-foreground/80 font-normal tracking-wide leading-relaxed">
                  One bias daily • 50 total • ~2 months rotation
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-center gap-3 sm:gap-3.5">
                {/* FIX: Increased touch target to minimum 44px (iOS) / 48px (Android) for accessibility */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open("https://boostlly.netlify.app/", "_blank")}
                  aria-label="Visit Boostlly - Tiny words. Big impact."
                  title="Visit Boostlly - Tiny words. Big impact."
                  className="touch-target h-12 w-12 sm:h-14 sm:w-14 min-h-[48px] min-w-[48px] p-2.5 sm:p-3 relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 flex items-center justify-center"
                >
                  <Image
                    src="/boostlly-logo.png"
                    alt="Boostlly"
                    width={28}
                    height={28}
                    className="transition-all duration-300 relative z-10 object-contain"
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={themeDisplay.label}
                  title={themeDisplay.label}
                  className="touch-target h-12 w-12 sm:h-14 sm:w-14 min-h-[48px] min-w-[48px] p-2.5 sm:p-3 relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 flex items-center justify-center"
                >
                  <span className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 relative z-10">
                    {themeDisplay.icon}
                  </span>
                </Button>
                <Link href="/settings#notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      notificationState.enabled
                        ? "Notification settings - Daily reminders enabled"
                        : "Notification settings - Configure daily reminders"
                    }
                    title={
                      notificationState.enabled
                        ? "Daily reminders enabled - Click to manage"
                        : "Configure notification settings"
                    }
                    className="touch-target h-12 w-12 sm:h-14 sm:w-14 min-h-[48px] min-w-[48px] p-2.5 sm:p-3 relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 flex items-center justify-center"
                  >
                    <span className="relative flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300">
                      {notificationState.enabled ? (
                        <BellRing
                          className="h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 relative z-10 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bell
                          className="h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300 relative z-10"
                          aria-hidden="true"
                        />
                      )}
                      {notificationState.enabled && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary border-2 border-background z-20 animate-pulse" aria-hidden="true" />
                      )}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            {/* Bottom section: Date centered */}
            {/* FIX: Suppress hydration warning - date format can legitimately differ between server/client due to locale */}
            <div className="flex justify-center pt-4 sm:pt-5 border-t border-white/10 dark:border-white/10">
              <p className="text-sm font-medium text-foreground/80 tracking-wide sm:text-base" suppressHydrationWarning>
                {today || getTimezoneAwareDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

"use client"

import { Moon, Sun, Bell, Mic, MicOff, Monitor, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getTimezoneAwareDateString } from "@/lib/timezone-utils"
import { siteConfig } from "@/lib/site-config"

interface DailyHeaderProps {
  isVoiceListening?: boolean
  onToggleVoiceCommands?: () => void
  voiceCommandsSupported?: boolean
}

export function DailyHeader({
  isVoiceListening = false,
  onToggleVoiceCommands,
  voiceCommandsSupported = false,
}: DailyHeaderProps) {
  const { settings, saveSetting } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState("")

  useEffect(() => {
    setMounted(true)
    // Use timezone-aware date formatting
    setToday(getTimezoneAwareDateString())
  }, [])

  // Apply theme changes with requestAnimationFrame to prevent flicker
  useEffect(() => {
    if (!mounted) return

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
  }, [settings.theme, mounted])

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
        icon: <Moon className="h-5 w-5" aria-hidden="true" />,
        label: "Dark mode (click to cycle)",
        nextMode: "system",
      }
    } else if (settings.theme === "system") {
      return {
        icon: <Monitor className="h-5 w-5" aria-hidden="true" />,
        label: "System mode (click to cycle)",
        nextMode: "light",
      }
    } else {
      return {
        icon: <Sun className="h-5 w-5" aria-hidden="true" />,
        label: "Light mode (click to cycle)",
        nextMode: "dark",
      }
    }
  }

  const themeDisplay = getThemeDisplay()

  // Render skeleton immediately to prevent flicker - don't return null
  // The component will render with empty/loading state until mounted
  if (!mounted) {
    return (
      <header className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 sm:py-5 md:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <Link href="/" className="group inline-block cursor-pointer">
              <h1 className="group-hover:text-primary inline-block truncate text-lg font-bold tracking-tight transition-all duration-200 group-hover:scale-[1.02] sm:text-xl md:text-2xl">
                {siteConfig.name}
              </h1>
            </Link>
            <p className="text-muted-foreground truncate text-xs transition-colors duration-200 sm:text-sm">
              {/* Empty until mounted to prevent layout shift */}
            </p>
            <p className="text-muted-foreground truncate text-xs transition-colors duration-200">
              One bias daily • 50 total • ~2 months rotation
            </p>
          </div>
          <div className="flex shrink-0 gap-1 sm:gap-2">
            {/* Render buttons with same layout to prevent shift */}
            {/* FIX: Increased touch target to minimum 44px (iOS) / 48px (Android) for accessibility */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open("https://boostlly.netlify.app/", "_blank")}
              aria-label="Visit Boostlly - Tiny words. Big impact."
              title="Visit Boostlly - Tiny words. Big impact."
              className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
            >
              <Rocket
                className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Button>
            {voiceCommandsSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleVoiceCommands}
                aria-label="Click to enable voice commands"
                className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
                title="Enable voice commands"
              >
                <MicOff
                  className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
            >
              <span className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
            </Button>
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open settings"
                className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
              >
                <Bell
                  className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 sm:py-5 md:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <Link href="/" className="group inline-block cursor-pointer">
            <h1 className="group-hover:text-primary inline-block truncate text-lg font-bold tracking-tight transition-all duration-200 group-hover:scale-[1.02] sm:text-xl md:text-2xl">
              {siteConfig.name}
            </h1>
          </Link>
          <p className="text-muted-foreground truncate text-xs transition-colors duration-200 sm:text-sm">
            {today}
          </p>
          <p className="text-muted-foreground truncate text-xs transition-colors duration-200">
            One bias daily • 50 total • ~2 months rotation
          </p>
        </div>
        <div className="flex shrink-0 gap-1 sm:gap-2">
          {/* FIX: Increased touch target to minimum 44px (iOS) / 48px (Android) for accessibility */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open("https://boostlly.netlify.app/", "_blank")}
            aria-label="Visit Boostlly - Tiny words. Big impact."
            title="Visit Boostlly - Tiny words. Big impact."
            className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
          >
            <Rocket
              className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
          </Button>
          {voiceCommandsSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleVoiceCommands}
              aria-label={
                isVoiceListening
                  ? "Voice commands active - Click to stop"
                  : "Click to enable voice commands"
              }
              className={`touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] ${
                isVoiceListening ? "animate-pulse" : ""
              }`}
              title={
                isVoiceListening
                  ? "Voice commands active - Say 'read' or 'stop'"
                  : "Enable voice commands"
              }
            >
              {isVoiceListening ? (
                <Mic
                  className="h-4 w-4 text-green-500 transition-all duration-200 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              ) : (
                <MicOff
                  className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeDisplay.label}
            title={themeDisplay.label}
            className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
          >
            <span className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5">
              {themeDisplay.icon}
            </span>
          </Button>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open settings"
              className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px]"
            >
              <Bell
                className="h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

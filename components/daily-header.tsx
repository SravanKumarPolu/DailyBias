"use client"

import { Moon, Sun, Bell, Mic, MicOff, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"
import Link from "next/link"

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
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    )
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (settings.theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else if (settings.theme === "light") {
      root.classList.add("light")
      root.classList.remove("dark")
    } else {
      root.classList.remove("dark", "light")
    }
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

  if (!mounted) return null

  return (
    <header className="mx-auto w-full max-w-2xl px-3 py-3 sm:px-4 sm:py-4 md:py-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href="/" className="group inline-block cursor-pointer">
            <h1 className="group-hover:text-primary inline-block truncate text-lg font-bold transition-all duration-200 group-hover:scale-105 sm:text-xl md:text-2xl">
              Daily Bias
            </h1>
          </Link>
          <p className="text-muted-foreground truncate text-xs transition-colors duration-200 sm:text-sm">
            {today}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 sm:gap-2">
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
              className={`touch-target hover-grow button-press h-9 w-9 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10 ${
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
            className="touch-target hover-grow button-press h-9 w-9 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
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
              className="touch-target hover-grow button-press h-9 w-9 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
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

"use client"

import { Moon, Sun, Bell, Mic, MicOff, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
      <header className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="group relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/15 bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/20 dark:via-black/15 dark:to-black/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          {/* Inner highlight for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 rounded-3xl pointer-events-none" />
          
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4">
              {/* Top section: Title, Stats, and Icons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                  <Link href="/" className="group/link inline-block cursor-pointer">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent transition-all duration-500 ease-out group-hover/link:scale-[1.02] group-hover/link:from-primary group-hover/link:via-primary group-hover/link:to-accent">
                      {siteConfig.name}
                    </h1>
                  </Link>
                  <p className="text-xs sm:text-sm opacity-65 text-foreground/65 font-normal tracking-wide">
                    One bias daily • 50 total • ~2 months rotation
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-center gap-3 sm:gap-3.5">
                  {/* Render buttons with same layout to prevent shift */}
                  {/* FIX: Increased touch target to minimum 44px (iOS) / 48px (Android) for accessibility */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open("https://boostlly.netlify.app/", "_blank")}
                    aria-label="Visit Boostlly - Tiny words. Big impact."
                    title="Visit Boostlly - Tiny words. Big impact."
                    className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <Image
                      src="/boostlly-logo.png"
                      alt="Boostlly"
                      width={20}
                      height={20}
                      className="transition-all duration-300 relative z-10 object-contain"
                      aria-hidden="true"
                    />
                  </Button>
                  {voiceCommandsSupported && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleVoiceCommands}
                      aria-label="Click to enable voice commands"
                      className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                      title="Enable voice commands"
                    >
                      <MicOff
                        className="h-5 w-5 transition-all duration-300 relative z-10"
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
                    className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <span className="h-5 w-5 transition-all duration-300 relative z-10">
                      <Sun className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Button>
                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open settings"
                      className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <Bell
                        className="h-5 w-5 transition-all duration-300 relative z-10"
                        aria-hidden="true"
                      />
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Bottom section: Date centered */}
              <div className="flex justify-center pt-3 border-t border-white/10 dark:border-white/10">
                <p className="text-sm font-medium opacity-75 text-foreground/75 tracking-wide">
                  {/* Empty until mounted to prevent layout shift */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-6">
      <div className="group relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/15 bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/20 dark:via-black/15 dark:to-black/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        {/* Inner highlight for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 rounded-3xl pointer-events-none" />
        
        <div className="relative px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Top section: Title, Stats, and Icons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <Link href="/" className="group/link inline-block cursor-pointer">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent transition-all duration-500 ease-out group-hover/link:scale-[1.02] group-hover/link:from-primary group-hover/link:via-primary group-hover/link:to-accent">
                    {siteConfig.name}
                  </h1>
                </Link>
                <p className="text-xs sm:text-sm opacity-65 text-foreground/65 font-normal tracking-wide">
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
                  className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                  <Image
                    src="/boostlly-logo.png"
                    alt="Boostlly"
                    width={20}
                    height={20}
                    className="transition-all duration-300 relative z-10 object-contain"
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
                    className={`touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 ${
                      isVoiceListening ? "animate-pulse bg-green-500/20 border-green-500/40" : ""
                    }`}
                    title={
                      isVoiceListening
                        ? "Voice commands active - Say 'read' or 'stop'"
                        : "Enable voice commands"
                    }
                  >
                    {isVoiceListening ? (
                      <Mic
                        className="h-5 w-5 text-green-500 transition-all duration-300 relative z-10"
                        aria-hidden="true"
                      />
                    ) : (
                      <MicOff
                        className="h-5 w-5 transition-all duration-300 relative z-10"
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
                  className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="h-5 w-5 transition-all duration-300 relative z-10">
                    {themeDisplay.icon}
                  </span>
                </Button>
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open settings"
                    className="touch-target h-11 w-11 sm:h-12 sm:w-12 min-h-[44px] min-w-[44px] relative rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 transition-all duration-300 ease-out hover:scale-110 hover:bg-white/10 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <Bell
                      className="h-5 w-5 transition-all duration-300 relative z-10"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Bottom section: Date centered */}
            <div className="flex justify-center pt-3 border-t border-white/10 dark:border-white/10">
              <p className="text-sm font-medium opacity-75 text-foreground/75 tracking-wide">
                {today}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

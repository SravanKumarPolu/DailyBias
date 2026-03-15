"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  Palette,
  Bell,
  Info,
  Globe,
  Check,
} from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { haptics } from "@/lib/haptics"
import { getCommonTimezones, detectTimezone, isValidTimezone } from "@/lib/timezone-utils"
import { siteConfig } from "@/lib/site-config"
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  isNativeApp,
  requestNotificationPermissions as requestNativeNotificationPermissions
} from "@/lib/native-features"
import { logger } from "@/lib/logger"

export default function SettingsPage() {
  const { settings, saveSetting } = useSettings()
  const [availableTimezones] = useState(getCommonTimezones())
  const [currentTimezoneInfo, setCurrentTimezoneInfo] = useState(detectTimezone())
  const [timezoneSwitching, setTimezoneSwitching] = useState(false)
  const [mounted, setMounted] = useState(false)
  type NotifyState = "unknown" | "unsupported" | "denied" | "default" | "granted"
  const [notifyState, setNotifyState] = useState<NotifyState>("unknown")
  const [showHelp, setShowHelp] = useState(false)

  // Safe notification state detection (no hydration mismatch)
  const getNotifyState = useCallback((): NotifyState => {
    if (typeof window === "undefined") return "unknown"
    if (!("Notification" in window)) return "unsupported"
    return Notification.permission as NotifyState
  }, [])



  // Handle hydration and timezone detection
  useEffect(() => {
    setMounted(true)
    // Update timezone info after hydration to avoid mismatch
    setCurrentTimezoneInfo(detectTimezone())
  }, [])

  // Handle scroll to notifications section when hash is present
  useEffect(() => {
    if (!mounted || typeof window === "undefined" || window.location.hash !== "#notifications") {
      return
    }

    const scrollToSection = () => {
      const section = document.getElementById("notifications")
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" })
        // Clean URL after scroll completes
        window.history.replaceState(null, "", window.location.pathname)
      }
    }

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection)
    })
  }, [mounted])

  // Check notification support and permission state
  const updateNotificationState = useCallback(() => {
    if (typeof window === "undefined") return
    setNotifyState(getNotifyState())
  }, [getNotifyState])

  // Initialize notification state on mount
  useEffect(() => {
    if (mounted) {
      updateNotificationState()
    }
  }, [mounted, updateNotificationState])

  // Sync timezone info when settings change
  useEffect(() => {
    if (mounted && settings.timezone) {
      const timezoneInfo = detectTimezone()
      setCurrentTimezoneInfo(timezoneInfo)
    }
  }, [settings.timezone, mounted])

  const handleReminderToggle = async (checked: boolean) => {
    // Turning OFF - always allow
    if (!checked) {
      await saveSetting("dailyReminder", false)
      try {
        await cancelDailyReminder()
        logger.debug("[Settings] Daily reminder cancelled")
        haptics.success()
      } catch (error) {
        logger.error("[Settings] Error cancelling daily reminder:", error)
      }
      return
    }

    // Turning ON - check if action is allowed
    if (notifyState === "denied" || notifyState === "unsupported" || notifyState === "unknown") {
      return // Toggle is disabled, but handle gracefully
    }

    try {
      // Handle native app notifications
      if (isNativeApp()) {
        const granted = await requestNativeNotificationPermissions()
        if (granted) {
          await saveSetting("dailyReminder", true)
          await scheduleDailyReminder(9, 0)
          haptics.success()
          logger.debug("[Settings] Native notification permission granted and scheduled")
        } else {
          await saveSetting("dailyReminder", false)
        }
        updateNotificationState()
        return
      }

      // Handle web notifications
      if (notifyState === "default") {
        const permission = await Notification.requestPermission()
        updateNotificationState()
        
        if (permission === "granted") {
          await saveSetting("dailyReminder", true)
          await scheduleDailyReminder(9, 0)
          
          // Show confirmation notification
          try {
            new Notification("Bias Daily", {
              body: "Daily reminders enabled! You'll be notified when a new bias is available.",
              icon: "/icon-192.jpg",
            })
          } catch {
            // Silently fail if notification creation fails
          }

          haptics.success()
          logger.debug("[Settings] Web notification permission granted and scheduled")
        } else {
          await saveSetting("dailyReminder", false)
        }
        return
      }

      // Permission already granted - just enable
      if (notifyState === "granted") {
        await saveSetting("dailyReminder", true)
        await scheduleDailyReminder(9, 0)
        haptics.success()
      }
    } catch (error) {
      logger.error("[Settings] Notification error:", error)
      await saveSetting("dailyReminder", false)
      updateNotificationState()
    }
  }

  const handleTimezoneChange = (timezone: string) => {
    if (isValidTimezone(timezone)) {
      saveSetting("timezone", timezone)
      setCurrentTimezoneInfo(detectTimezone())
      haptics.selection()
    }
  }

  const handleAutoDetectToggle = async (enabled: boolean) => {
    try {
      console.log('[Settings] Timezone auto-detect:', enabled ? 'enabled' : 'disabled')
      setTimezoneSwitching(true)

      // Save the setting immediately
      await saveSetting("timezoneAutoDetect", enabled)

      if (enabled) {
        const detected = detectTimezone()
        console.log('[Settings] Auto-detected timezone:', detected.timezone)
        await saveSetting("timezone", detected.timezone)
        setCurrentTimezoneInfo(detected)
      }

      haptics.selection()
    } catch (error) {
      console.error('[Settings] Error toggling timezone auto-detect:', error)
      alert('Failed to update timezone settings. Please try again.')
    } finally {
      setTimezoneSwitching(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={456} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:py-10" aria-label="Settings">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl leading-relaxed">
              Customize your Bias Daily experience
            </p>
          </div>


          {/* Appearance Section */}
          <div className="glass space-y-6 rounded-xl p-6 sm:rounded-2xl sm:p-8">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                Appearance
              </h2>
              <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                Customize the look and feel
              </p>
            </div>


            {/* Background Style */}
            <div className="space-y-3">
              <Label>Background Style</Label>
              <RadioGroup
                value={settings.backgroundStyle}
                onValueChange={(value) =>
                  saveSetting("backgroundStyle", value as "gradient" | "glass" | "minimal")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gradient" id="gradient" data-testid="setting-bg-gradient" />
                  <Label htmlFor="gradient" className="cursor-pointer font-normal">
                    Gradient (Animated)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="glass" id="glass" data-testid="setting-bg-glass" />
                  <Label htmlFor="glass" className="cursor-pointer font-normal">
                    Glass (Blurred)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" data-testid="setting-bg-minimal" />
                  <Label htmlFor="minimal" className="cursor-pointer font-normal">
                    Minimal (Solid)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Notifications Section */}
          <div id="notifications" className="glass space-y-4 rounded-xl p-6 sm:rounded-2xl sm:p-8 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Notifications
              </h2>
              <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                Get reminded about daily biases
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reminder" className="cursor-pointer">
                    Daily Reminder
                  </Label>
                  <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl leading-relaxed">
                    Receive a notification when a new bias is available
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={settings.dailyReminder}
                  onCheckedChange={handleReminderToggle}
                  disabled={notifyState === "denied" || notifyState === "unsupported" || notifyState === "unknown"}
                  className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="setting-daily-reminder"
                  aria-disabled={notifyState === "denied" || notifyState === "unsupported" || notifyState === "unknown"}
                />
              </div>
              
              {/* Helper messages */}
              {notifyState === "denied" && (
                <div className="text-foreground/60 text-xs sm:text-sm leading-relaxed space-y-2">
                  <p>
                    Blocked by your browser. Enable from site settings.
                  </p>
                  {!showHelp ? (
                    <button
                      type="button"
                      onClick={() => setShowHelp(true)}
                      className="text-primary hover:text-primary/80 underline transition-colors text-xs sm:text-sm"
                    >
                      How to enable
                    </button>
                  ) : (
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-2 text-xs">
                      <p className="font-semibold">How to enable notifications:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          <strong>Chrome/Edge (Desktop):</strong> Click the lock icon in address bar → Site settings → Notifications → Allow
                        </li>
                        <li>
                          <strong>Chrome (Android):</strong> Menu (⋮) → Settings → Site settings → Notifications → Allow for this site
                        </li>
                        <li>
                          <strong>Safari (iOS):</strong> Add to Home Screen for best experience, or Settings → Safari → Notifications
                        </li>
                        <li>
                          <strong>Firefox:</strong> Click the lock icon → Permissions → Notifications → Allow
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => setShowHelp(false)}
                        className="text-primary hover:text-primary/80 underline mt-2"
                      >
                        Hide instructions
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {notifyState === "unsupported" && (
                <p className="text-foreground/60 text-xs sm:text-sm leading-relaxed">
                  Not supported on this browser.
                </p>
              )}
            </div>
          </div>

          {/* Daily Bias Section */}
          <div className="glass space-y-4 rounded-xl p-6 sm:rounded-2xl sm:p-8">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{siteConfig.name}</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Configure daily bias selection
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mix-user-biases" className="cursor-pointer">
                  Include Custom Biases
                </Label>
                <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl leading-relaxed">
                  Mix your custom biases into the daily selection
                </p>
              </div>
              <Switch
                id="mix-user-biases"
                checked={settings.mixUserBiasesInDaily}
                onCheckedChange={(checked) => saveSetting("mixUserBiasesInDaily", checked)}
                className="cursor-pointer"
                data-testid="setting-mix-user-biases"
              />
            </div>
          </div>

          {/* Smart Timezone Settings Section */}
          <div className="glass space-y-4 rounded-xl p-6 sm:rounded-2xl sm:p-8">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                Timezone
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Configure your local timezone for accurate daily bias timing
              </p>
            </div>

            <div className="space-y-4">
              {/* Show loading state during hydration */}
              {!mounted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900/20">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
                      <div>
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Auto-detected timezone display (default view) */}
                  {settings.timezoneAutoDetect !== false && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Auto-detected: {currentTimezoneInfo.city} ({currentTimezoneInfo.region})
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                          {currentTimezoneInfo.timezone} {currentTimezoneInfo.offset} • Detected automatically
                        </div>
                      </div>
                    </div>
              </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoDetectToggle(false)}
                    disabled={timezoneSwitching}
                    className="w-full justify-center bg-transparent text-sm"
                  >
                    {timezoneSwitching ? "Switching..." : "Use different timezone"}
                  </Button>
                </div>
              )}

              {/* Manual timezone selection (override view) */}
              {settings.timezoneAutoDetect === false && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                        <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-200">
                          Manual Selection Active
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                          Using manually selected timezone
                        </div>
                      </div>
                    </div>
                  </div>

              <div className="space-y-2">
                    <Label htmlFor="timezone-select">Select Timezone</Label>
                <select
                  id="timezone-select"
                  value={settings.timezone || currentTimezoneInfo.timezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="bg-secondary border-border text-foreground focus:ring-ring w-full cursor-pointer rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                  aria-label="Select timezone"
                >
                  {availableTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoDetectToggle(true)}
                      disabled={timezoneSwitching}
                      className="w-full justify-center bg-transparent text-sm"
                    >
                      {timezoneSwitching ? "Switching..." : "Switch back to auto-detect"}
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="glass space-y-4 rounded-xl p-6 sm:rounded-2xl sm:p-8">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                About
              </h2>
            </div>

            <div className="text-foreground/80 space-y-2 text-sm leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
              <p>
                <strong className="text-foreground">Bias Daily</strong> helps you learn one
                cognitive bias every day from a curated list of 50 research-backed cognitive biases.
              </p>
              <p>
                All your data is stored locally on your device. Nothing is sent to any server. The
                app works completely offline after the first load.
              </p>
              <p>Version 1.0.0</p>
              <Link href="/about" className="text-primary inline-block hover:underline">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}


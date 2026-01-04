"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  Palette,
  Bell,
  Info,
  Mic,
  RotateCcw,
  Globe,
  Check,
  Search,
} from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useSettings } from "@/hooks/use-settings"
import { useSpeech } from "@/hooks/use-speech"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { haptics } from "@/lib/haptics"
import { getCommonTimezones, detectTimezone, isValidTimezone } from "@/lib/timezone-utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const { ensureVoicesLoaded, isSupported: speechSupported, speak, stop } = useSpeech()
  const [localVoiceRate, setLocalVoiceRate] = useState(settings.voiceRate || 0.9)
  const [localVoicePitch, setLocalVoicePitch] = useState(settings.voicePitch || 1.0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [testingVoice, setTestingVoice] = useState(false)
  const [availableTimezones] = useState(getCommonTimezones())
  const [currentTimezoneInfo, setCurrentTimezoneInfo] = useState(detectTimezone())
  const [voicePopoverOpen, setVoicePopoverOpen] = useState(false)
  const [voiceSearch, setVoiceSearch] = useState("")
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



  // Helper to fetch and filter voices consistently
  const fetchAndFilterVoices = async () => {
    // Ensure voices are loaded before fetching (fixes iOS/Safari loading issue)
    if (speechSupported) {
      await ensureVoicesLoaded()
    }
    const voices = window.speechSynthesis.getVoices()
    console.log("[Settings] Loading voices:", voices.length, "available")

    // Blacklist of known poor quality/novelty voices
    const blacklistedVoices = [
      "albert",
      "bad news",
      "bahh",
      "bells",
      "boing",
      "bubbles",
      "cellos",
      "deranged",
      "good news",
      "jester",
      "organ",
      "superstar",
      "trinoids",
      "whisper",
      "wobble",
      "zarvox",
      "junior",
      "ralph",
      "fred",
      "kathy",
      "princess",
      "bruce",
      "flo",
      "grandma",
      "grandpa",
    ]

    // Filter for high-quality English voices only
    const englishVoices = voices
      .filter((voice) => {
        // Must be English
        if (!voice.lang.startsWith("en")) return false

        // Remove blacklisted voices
        const voiceLower = voice.name.toLowerCase()
        if (blacklistedVoices.some((bad) => voiceLower.includes(bad))) return false

        // Keep premium/enhanced voices
        const qualityTerms = [
          "premium",
          "enhanced",
          "neural",
          "natural",
          "hd",
          "google",
          "microsoft",
        ]
        const hasQuality = qualityTerms.some((term) => voiceLower.includes(term))

        // Keep standard voices with common names (Samantha, Alex, Victoria, Daniel, Karen, Moira, etc.)
        const goodStandardVoices = [
          "samantha",
          "alex",
          "victoria",
          "daniel",
          "karen",
          "moira",
          "tessa",
          "serena",
          "allison",
          "ava",
          "susan",
          "vicki",
          "tom",
          "aaron",
          "nicky",
          "diego",
          "jorge",
          "paulina",
        ]
        const isGoodStandard = goodStandardVoices.some((good) => voiceLower.includes(good))

        return hasQuality || isGoodStandard
      })
      .sort((a, b) => {
        // Prioritize voices with quality indicators
        const qualityTerms = ["premium", "enhanced", "neural", "natural", "hd"]
        const aHasQuality = qualityTerms.some((term) => a.name.toLowerCase().includes(term))
        const bHasQuality = qualityTerms.some((term) => b.name.toLowerCase().includes(term))

        if (aHasQuality && !bHasQuality) return -1
        if (!aHasQuality && bHasQuality) return 1

        // Prefer local voices over network
        if (a.localService && !b.localService) return -1
        if (!a.localService && b.localService) return 1

        return a.name.localeCompare(b.name)
      })

    console.log("[Settings] Filtered voices:", englishVoices.length, "high-quality English voices")
    setAvailableVoices(englishVoices)

    // Smart voice selection: prioritize same voice across all platforms
    if (englishVoices.length > 0) {
      // Priority order for voice selection (focus on high-quality voices)
      const voicePriority = [
        "Google US English",  // Best desktop voice
        "Samantha",          // High-quality, natural sounding
        "Alex",              // High-quality iOS voice
        "Victoria",          // Good iOS voice
        "Karen",             // Decent Android voice
        "Daniel",            // Common but lower quality Android voice
        "Tessa",             // Good iOS voice
        "Tom"                // Alternative Android voice
      ]

      // Find the best available voice based on priority
      let bestVoice = null
      for (const priorityVoice of voicePriority) {
        bestVoice = englishVoices.find((v) => v.name.toLowerCase().includes(priorityVoice.toLowerCase()))
        if (bestVoice) {
          console.log("[Settings] Selected priority voice:", bestVoice.name)
          break
        }
      }

      // If no priority voice found, use the first English voice
      if (!bestVoice && englishVoices.length > 0) {
        bestVoice = englishVoices[0]
        console.log("[Settings] Using first available voice:", bestVoice.name)
      }

      // Only auto-select if user hasn't explicitly selected a voice yet
      // This prevents overriding user's explicit choice
      if (bestVoice && !settings.voiceName) {
        console.log("[Settings] Auto-selecting voice for first-time setup:", bestVoice.name)
        saveSetting("voiceName", bestVoice.name)
      }
    }
  }

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      fetchAndFilterVoices().catch((error) => {
        console.error("[Settings] Error loading voices:", error)
      })
      window.speechSynthesis.onvoiceschanged = () => {
        fetchAndFilterVoices().catch((error) => {
          console.error("[Settings] Error loading voices on change:", error)
        })
      }
    }
    // saveSetting is stable from context, settings.voiceName triggers re-fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.voiceName, saveSetting, speechSupported, ensureVoicesLoaded])

  const handleRefreshVoices = async () => {
    try {
      // Ensure voices are populated (especially on iOS/PWA) after a user gesture
      if (speechSupported) {
        await ensureVoicesLoaded()
      }

      await fetchAndFilterVoices()
      haptics.selection()
    } catch (error) {
      console.error("[Settings] Error refreshing voices:", error)
      // Still attempt to refresh list even if ensureVoicesLoaded fails
      try {
        await fetchAndFilterVoices()
      } catch {
        // Final fallback - just try to get voices directly
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          setAvailableVoices(voices.filter(v => v.lang.startsWith("en")))
        }
      }
    }
  }

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

  // Sync local state with settings
  useEffect(() => {
    setLocalVoiceRate(settings.voiceRate || 0.9)
    setLocalVoicePitch(settings.voicePitch || 1.0)

    // Update timezone info when settings change (only after mounted)
    if (mounted && settings.timezone) {
      const timezoneInfo = detectTimezone()
      setCurrentTimezoneInfo(timezoneInfo)
    }
  }, [settings.voiceRate, settings.voicePitch, settings.timezone, mounted])

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
          } catch (err) {
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

  const handleResetVoiceSettings = async () => {
    // Reset to defaults
    const defaultRate = 0.9
    const defaultPitch = 1.0

    // Update local state immediately for instant UI feedback
    setLocalVoiceRate(defaultRate)
    setLocalVoicePitch(defaultPitch)

    // Save to database (don't wait to avoid blocking UI update)
    saveSetting("voiceRate", defaultRate)
    saveSetting("voicePitch", defaultPitch)

    // Provide haptic feedback
    haptics.success()

  }

  const handleVoiceRateChange = (value: number) => {
    setLocalVoiceRate(value)
  }

  const handleVoiceRateCommit = () => {
    saveSetting("voiceRate", localVoiceRate)
  }

  const handleVoicePitchChange = (value: number) => {
    setLocalVoicePitch(value)
  }

  const handleVoicePitchCommit = () => {
    saveSetting("voicePitch", localVoicePitch)
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

  const handleTestVoice = async () => {
    try {
      setTestingVoice(true)
      if (!speechSupported) {
        alert('Speech synthesis is not supported in this browser.')
        return
      }

      await ensureVoicesLoaded()

      // Use the saved settings value for the most up-to-date selection
      const selectedVoiceName = settings.voiceName || ""

      if (!selectedVoiceName) {
        alert('Please select a voice first.')
        return
      }

      // Short sample that announces the voice name
      const voiceLabel = selectedVoiceName || "Voice"
      const sample = `Hello. This is ${voiceLabel}. Testing voice quality and pronunciation.`

      console.log('[Settings] Testing voice:', selectedVoiceName)

      // Pass the selected voice name explicitly to bypass settings cache
      speak(sample, selectedVoiceName || undefined)

      // Stop after ~3 seconds to allow full sample
      setTimeout(() => {
        stop()
        setTestingVoice(false)
      }, 3000)

      haptics.selection()
    } catch (error) {
      console.error('[Settings] Voice test failed:', error)
      alert('Failed to test voice. Please try again.')
    } finally {
      setTestingVoice(false)
    }
  }

  const openVoicePicker = async () => {
    try {
      setVoicePopoverOpen(true)
      if (speechSupported) {
        await ensureVoicesLoaded()
      }
      await fetchAndFilterVoices()
      setVoiceSearch("")
    } catch (error) {
      console.error("[Settings] Error opening voice picker:", error)
      // Still try to fetch voices directly as fallback
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setAvailableVoices(voices.filter(v => v.lang.startsWith("en")))
      }
    }
  }

  const filteredVoices = availableVoices.filter((v) => {
    const q = voiceSearch.trim().toLowerCase()
    if (!q) return true
    return (
      v.name.toLowerCase().includes(q) ||
      (v.lang?.toLowerCase().includes(q) ?? false)
    )
  })

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

          {/* Voice Settings Section */}
          <div className="glass space-y-4 rounded-xl p-6 sm:rounded-2xl sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  Voice Settings
                </h2>
                <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                  Text-to-speech preferences
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-enabled" className="cursor-pointer">
                  Read bias content aloud
                </Label>
                <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl leading-relaxed">
                  Automatically read bias content when viewing
                </p>
              </div>
              <Switch
                id="voice-enabled"
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => {
                  saveSetting("voiceEnabled", checked)
                  // When enabling voice, also enable auto-read for better UX
                  // When disabling, auto-read is automatically disabled too
                  if (checked) {
                    saveSetting("readBiasAloud", true)
                  } else {
                    saveSetting("readBiasAloud", false)
                  }
                }}
                className="cursor-pointer"
                data-testid="setting-voice-enabled"
              />
            </div>

            {settings.voiceEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice</Label>
                  {/* Voice picker popover */}
                  <Popover open={voicePopoverOpen} onOpenChange={setVoicePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="voice-select"
                        variant="outline"
                        className="w-full justify-between bg-transparent"
                        onClick={openVoicePicker}
                      >
                        <span className="truncate">{settings.voiceName || "Select voice"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="border-b p-4">
                        <h4 className="font-medium">Select a voice</h4>
                        <div className="relative mt-3">
                          <label htmlFor="voice-search" className="sr-only">Search voices</label>
                          <input
                            id="voice-search"
                            type="text"
                            inputMode="search"
                            placeholder="Search voices by name or language"
                            value={voiceSearch}
                            onChange={(e) => setVoiceSearch(e.target.value)}
                            className="bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-md border px-9 py-2"
                            aria-label="Search voices by name or language"
                          />
                          <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        {filteredVoices.map((voice, index) => {
                          const selected = settings.voiceName === voice.name
                          return (
                            <button
                              key={`${voice.name}-${voice.voiceURI || index}`}
                              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${selected ? 'bg-accent/60' : ''}`}
                              onClick={() => {
                                saveSetting('voiceName', voice.name)
                                setVoicePopoverOpen(false)
                                haptics.selection()
                              }}
                              aria-label={`Select voice ${voice.name}${selected ? ' (currently selected)' : ''}`}
                              aria-pressed={selected}
                            >
                              <div className="min-w-0 grow">
                                <div className="truncate font-medium">{voice.name}</div>
                                <div className="text-foreground/80 mt-0.5 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                                  {voice.lang || 'en'}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {voice.localService && (
                                  <span className="text-xs">⭐</span>
                                )}
                                {selected && <Check className="h-4 w-4" />}
                              </div>
                            </button>
                          )
                        })}
                        {filteredVoices.length === 0 && (
                          <div className="p-4 text-center text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                            No voices found
                          </div>
                        )}
                        <div className="border-t p-3">
                          <Button size="sm" variant="ghost" className="w-full" onClick={handleRefreshVoices} aria-label="Refresh available voices list">
                            Refresh voices
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Test Voice Button - Modern inline design */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-foreground/60 text-xs">
                      ⭐ Local voices offer better quality
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={handleTestVoice}
                      disabled={testingVoice || !settings.voiceName}
                    >
                      {testingVoice ? (
                        <>
                          <span className="mr-2">Testing...</span>
                        </>
                      ) : (
                        <>
                          🔊 <span className="ml-2">Test Voice</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-rate">Speech Rate: {localVoiceRate.toFixed(1)}x</Label>
                  </div>
                  <input
                    type="range"
                    id="voice-rate"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localVoiceRate}
                    onInput={(e) => handleVoiceRateChange(parseFloat(e.currentTarget.value))}
                    onChange={(e) => handleVoiceRateChange(parseFloat(e.currentTarget.value))}
                    onMouseUp={handleVoiceRateCommit}
                    onTouchEnd={handleVoiceRateCommit}
                    className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-pitch">Pitch: {localVoicePitch.toFixed(1)}x</Label>
                  </div>
                  <input
                    type="range"
                    id="voice-pitch"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localVoicePitch}
                    onInput={(e) => handleVoicePitchChange(parseFloat(e.currentTarget.value))}
                    onChange={(e) => handleVoicePitchChange(parseFloat(e.currentTarget.value))}
                    onMouseUp={handleVoicePitchCommit}
                    onTouchEnd={handleVoicePitchCommit}
                    className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
                  />
                </div>

                {/* Reset Button - Modern placement at bottom */}
                <div className="pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetVoiceSettings}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    aria-label="Reset voice settings to default"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" />
                    Reset to defaults
                  </Button>
                </div>
              </>
            )}
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


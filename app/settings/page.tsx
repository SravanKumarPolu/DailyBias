"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Download,
  Upload,
  Palette,
  Bell,
  Database,
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
import { exportAllData, importAllData } from "@/lib/db"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { haptics } from "@/lib/haptics"
import { getCommonTimezones, detectTimezone, isValidTimezone } from "@/lib/timezone-utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { siteConfig } from "@/lib/site-config"

export default function SettingsPage() {
  const { settings, saveSetting, refresh } = useSettings()
  const { ensureVoicesLoaded, isSupported: speechSupported, speak, stop } = useSpeech()
  const router = useRouter()
  const [importing, setImporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
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



  // Helper to fetch and filter voices consistently
  const fetchAndFilterVoices = () => {
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
      
      // Set the best voice if it's different from current
      if (bestVoice && settings.voiceName !== bestVoice.name) {
        console.log("[Settings] Auto-selecting voice:", bestVoice.name)
        saveSetting("voiceName", bestVoice.name)
      }
    }
  }

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      fetchAndFilterVoices()
      window.speechSynthesis.onvoiceschanged = fetchAndFilterVoices
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.voiceName])

  const handleRefreshVoices = async () => {
    try {
      // Ensure voices are populated (especially on iOS/PWA) after a user gesture
      if (speechSupported) {
        await ensureVoicesLoaded()
      }
      
      fetchAndFilterVoices()
      haptics.selection()
    } catch {
      // no-op; we still attempt to refresh list
      fetchAndFilterVoices()
    }
  }

  // Handle hydration and timezone detection
  useEffect(() => {
    setMounted(true)
    // Update timezone info after hydration to avoid mismatch
    setCurrentTimezoneInfo(detectTimezone())
  }, [])

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

  const handleExport = async () => {
    try {
      console.log('[Settings] Exporting user data...')
      const data = await exportAllData()
      if (!data || Object.keys(data).length === 0) {
        alert("No data to export. Make sure you have some biases or settings to backup.")
        return
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bias-daily-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('[Settings] Data exported successfully')
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
      haptics.success()
    } catch (error) {
      console.error("[Settings] Export failed:", error)
      alert("Failed to export data. Please check your browser permissions and try again.")
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a valid JSON backup file.')
      event.target.value = ""
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please select a backup file smaller than 10MB.')
      event.target.value = ""
      return
    }

    setImporting(true)
    try {
      console.log('[Settings] Importing data from file:', file.name)
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format')
      }
      
      // Check if it looks like a valid backup file
      const expectedKeys = ['settings', 'userBiases', 'favorites', 'progress', 'streak']
      const hasValidKeys = expectedKeys.some(key => key in data)
      
      if (!hasValidKeys) {
        throw new Error('This does not appear to be a valid Bias Daily backup file.')
      }
      
      await importAllData(data)
      await refresh()
      console.log('[Settings] Data imported successfully')
      setImportSuccess(true)
      haptics.success()
      
      setTimeout(() => {
        setImportSuccess(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("[Settings] Import failed:", error)
      if (error instanceof SyntaxError) {
        alert("Invalid JSON file. Please check the file format and try again.")
      } else if (error instanceof Error && error.message.includes('backup file')) {
        alert(error.message)
      } else {
        alert("Failed to import data. Please check the file format and try again.")
      }
    } finally {
      setImporting(false)
      event.target.value = ""
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications")
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        await saveSetting("dailyReminder", true)
        
        // Show test notification
        if (Notification.permission === "granted") {
          new Notification("Bias Daily", {
            body: "Daily reminders enabled! You'll be notified when a new bias is available.",
            icon: "/icon-192.jpg",
          })
        }
        
        haptics.success()
        return true
      } else {
        await saveSetting("dailyReminder", false)
        if (permission === "denied") {
          alert(
            "Notifications were denied. Please enable them in your browser settings to receive daily reminders."
          )
        }
        return false
      }
    } catch (error) {
      console.error("[DailyBias] Notification permission error:", error)
      await saveSetting("dailyReminder", false)
      alert("Failed to request notification permission. Please try again.")
      return false
    }
  }

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await requestNotificationPermission()
    } else {
      await saveSetting("dailyReminder", false)
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
      fetchAndFilterVoices()
      setVoiceSearch("")
    } catch {
      // ignore
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

      <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div>
            <h1 className="mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl">Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Customize your Bias Daily experience
            </p>
          </div>


          {/* Appearance Section */}
          <div className="glass space-y-4 rounded-xl p-4 sm:space-y-6 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                Appearance
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
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
                  <RadioGroupItem value="gradient" id="gradient" />
                  <Label htmlFor="gradient" className="cursor-pointer font-normal">
                    Gradient (Animated)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="glass" id="glass" />
                  <Label htmlFor="glass" className="cursor-pointer font-normal">
                    Glass (Blurred)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" />
                  <Label htmlFor="minimal" className="cursor-pointer font-normal">
                    Minimal (Solid)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Notifications
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Get reminded about daily biases
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-reminder" className="cursor-pointer">
                  Daily Reminder
                </Label>
                <p className="text-muted-foreground text-sm">
                  Receive a notification when a new bias is available
                </p>
              </div>
              <Switch
                id="daily-reminder"
                checked={settings.dailyReminder}
                onCheckedChange={handleReminderToggle}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Voice Settings Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  Voice Settings
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Text-to-speech preferences
                </p>
              </div>
              {settings.voiceEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetVoiceSettings}
                  className="cursor-pointer bg-transparent"
                  aria-label="Reset voice settings to default"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-enabled" className="cursor-pointer">
                  Enable Voice
                </Label>
                <p className="text-muted-foreground text-sm">Read bias content aloud</p>
              </div>
              <Switch
                id="voice-enabled"
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => saveSetting("voiceEnabled", checked)}
                className="cursor-pointer"
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
                          <input
                            type="text"
                            inputMode="search"
                            placeholder="Search voices by name or language"
                            value={voiceSearch}
                            onChange={(e) => setVoiceSearch(e.target.value)}
                            className="bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-md border px-9 py-2"
                          />
                          <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
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
                            >
                              <div className="min-w-0 grow">
                                <div className="truncate font-medium">{voice.name}</div>
                                <div className="text-muted-foreground mt-0.5 text-xs">
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
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            No voices found
                          </div>
                        )}
                        <div className="border-t p-3">
                          <Button size="sm" variant="ghost" className="w-full" onClick={handleRefreshVoices}>
                            Refresh voices
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Current Voice Status Display */}
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Currently Active Voice:
                      </span>
                          </div>
                    <div className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                      {settings.voiceName || "None selected"}
                    </div>
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                      Device: {typeof window !== "undefined" && (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768 || ('ontouchstart' in window)) ? "Mobile" : "Desktop"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-8 text-xs"
                      onClick={() => {
                        if (window.speechSynthesis) {
                          const utterance = new SpeechSynthesisUtterance("Hello, this is the current voice speaking.")
                          utterance.rate = 0.9
                          utterance.pitch = 1.0
                          utterance.volume = 1.0
                          const voices = window.speechSynthesis.getVoices()
                          const selectedVoice = voices.find(v => v.name === settings.voiceName)
                          if (selectedVoice) {
                            utterance.voice = selectedVoice
                            utterance.lang = selectedVoice.lang
                          }
                          window.speechSynthesis.speak(utterance)
                        }
                      }}
                    >
                      🔊 Test Current Voice
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs">
                      ⭐ indicates high-quality local voices
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={handleRefreshVoices}
                    >
                      Refresh voices
                    </Button>
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      onClick={handleTestVoice}
                      disabled={testingVoice}
                    >
                      {testingVoice ? "Testing..." : "Test voice"}
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
              </>
            )}
          </div>

          {/* Daily Bias Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 text-lg font-semibold sm:text-xl">{siteConfig.name}</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Configure daily bias selection
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mix-user-biases" className="cursor-pointer">
                  Include Custom Biases
                </Label>
                <p className="text-muted-foreground text-sm">
                  Mix your custom biases into the daily selection
                </p>
              </div>
              <Switch
                id="mix-user-biases"
                checked={settings.mixUserBiasesInDaily}
                onCheckedChange={(checked) => saveSetting("mixUserBiasesInDaily", checked)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Smart Timezone Settings Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
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
                        <div className="text-xs text-green-600 dark:text-green-300">
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
                        <div className="text-xs text-blue-600 dark:text-blue-300">
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

          {/* Data Management Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                Data Management
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Export or import your data</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              {exportSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Data exported successfully!
                </p>
              )}

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                  disabled={importing}
                />
                <Label htmlFor="import-file">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    disabled={importing}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {importing ? "Importing..." : "Import Data"}
                    </span>
                  </Button>
                </Label>
              </div>
              {importSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Data imported successfully!
                </p>
              )}

              <p className="text-muted-foreground text-xs">
                Export includes your custom biases, favorites, and settings. Import will merge with
                existing data.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="glass space-y-3 rounded-xl p-4 sm:space-y-4 sm:rounded-2xl sm:p-6">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                About
              </h2>
            </div>

            <div className="text-muted-foreground space-y-2 text-xs sm:text-sm">
              <p>
                <strong className="text-foreground">Bias Daily</strong> helps you learn one
                cognitive bias every day from Elon Musk's curated list of 50 biases.
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


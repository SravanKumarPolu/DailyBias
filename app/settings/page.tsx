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
  Flame,
  Trophy,
  Eye,
  Star,
} from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { ProgressChart } from "@/components/progress-chart"
import { CategoryChart } from "@/components/category-chart"
import { StatCard } from "@/components/stat-card"
import { useSettings } from "@/hooks/use-settings"
import { useApp } from "@/contexts/app-context"
import { useSpeech } from "@/hooks/use-speech"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { exportAllData, importAllData } from "@/lib/db"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { haptics } from "@/lib/haptics"

export default function SettingsPage() {
  const { settings, saveSetting, refresh } = useSettings()
  const { progressStats, progressList, allBiases } = useApp()
  const { ensureVoicesLoaded, isSupported: speechSupported, speak, stop } = useSpeech()
  const router = useRouter()
  const [importing, setImporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [localVoiceRate, setLocalVoiceRate] = useState(settings.voiceRate || 0.9)
  const [localVoicePitch, setLocalVoicePitch] = useState(settings.voicePitch || 1.0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [testingVoice, setTestingVoice] = useState(false)

  // Basic platform detection for contextual hints
  const isiOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/i.test(navigator.userAgent)
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)

  // Helper to fetch and filter voices consistently
  const fetchAndFilterVoices = () => {
    const voices = window.speechSynthesis.getVoices()

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

    setAvailableVoices(englishVoices)

    // Auto-select Daniel as default voice, or fallback to best available
    if (!settings.voiceName && englishVoices.length > 0) {
      // Prefer Daniel voice as default
      const danielVoice = englishVoices.find((voice) => voice.name.toLowerCase().includes("daniel"))
      const defaultVoice = danielVoice || englishVoices[0]
      saveSetting("voiceName", defaultVoice.name)
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

  // Sync local state with settings
  useEffect(() => {
    setLocalVoiceRate(settings.voiceRate || 0.9)
    setLocalVoicePitch(settings.voicePitch || 1.0)
  }, [settings.voiceRate, settings.voicePitch])

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bias-daily-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("[DailyBias] Export failed:", error)
      alert("Failed to export data. Please try again.")
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllData(data)
      await refresh()
      setImportSuccess(true)
      setTimeout(() => {
        setImportSuccess(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("[DailyBias] Import failed:", error)
      alert("Failed to import data. Please check the file format and try again.")
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
        new Notification("Bias Daily", {
          body: "Daily reminders enabled! You'll be notified when a new bias is available.",
          icon: "/icon-192.jpg",
        })
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

    // Log for debugging
    console.log(
      `[DailyBias] Voice settings reset to defaults: rate=${defaultRate}x, pitch=${defaultPitch}x`
    )
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

  const handleTestVoice = async () => {
    try {
      setTestingVoice(true)
      if (!speechSupported) return
      await ensureVoicesLoaded()

      // Get the currently selected voice from the DOM (most up-to-date)
      const selectElement = document.getElementById("voice-select") as HTMLSelectElement
      const selectedVoiceName = selectElement?.value || ""

      // Short sample that announces the voice name
      const voiceLabel = selectedVoiceName || "System Default"
      const sample = `Hello. This is ${voiceLabel}.`

      // Pass the selected voice name explicitly to bypass settings cache
      speak(sample, selectedVoiceName || undefined)

      // Stop after ~2.5 seconds to keep it short
      setTimeout(() => {
        stop()
        setTestingVoice(false)
      }, 2500)

      haptics.selection()
    } catch {
      // ignored
      setTestingVoice(false)
    }
  }

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

          {/* Progress Stats Section */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="mb-1 text-lg font-semibold sm:text-xl">Your Progress</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Track your learning journey
              </p>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <StatCard
                icon={Flame}
                label="Current Streak"
                value={progressStats.currentStreak}
                suffix={progressStats.currentStreak === 1 ? "day" : "days"}
                color="text-orange-500"
                bgColor="bg-orange-500/10"
                delay={0}
              />
              <StatCard
                icon={Trophy}
                label="Longest Streak"
                value={progressStats.longestStreak}
                suffix={progressStats.longestStreak === 1 ? "day" : "days"}
                color="text-yellow-500"
                bgColor="bg-yellow-500/10"
                delay={0.1}
              />
              <StatCard
                icon={Eye}
                label="Biases Read"
                value={progressStats.totalBiasesRead}
                max={allBiases.length}
                color="text-primary"
                bgColor="bg-primary/10"
                delay={0.2}
              />
              <StatCard
                icon={Star}
                label="Mastered"
                value={progressStats.masteredCount}
                max={allBiases.length}
                color="text-purple-500"
                bgColor="bg-purple-500/10"
                delay={0.3}
              />
            </div>

            {/* Activity Chart */}
            <ProgressChart progressList={progressList} />

            {/* Category Breakdown */}
            <CategoryChart allBiases={allBiases} progressList={progressList} />
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
                  <select
                    id="voice-select"
                    value={settings.voiceName || ""}
                    onChange={(e) => saveSetting("voiceName", e.target.value)}
                    className="bg-secondary border-border text-foreground focus:ring-ring w-full cursor-pointer rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    onFocus={handleRefreshVoices}
                  >
                    <option value="">System Default</option>
                    {availableVoices.map((voice, index) => (
                      <option key={`${voice.name}-${voice.voiceURI || index}`} value={voice.name}>
                        {voice.name} {voice.localService ? "⭐" : ""}
                      </option>
                    ))}
                  </select>
                  {availableVoices.length <= 1 && (isiOS || isAndroid) && (
                    <div className="mt-2 space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
                      {isiOS ? (
                        <>
                          On iOS, web apps (especially installed PWAs) may only expose the system
                          voice. To enable more voices: open this site in Safari, go to iOS Settings
                          → Accessibility → Spoken Content → Voices and download additional English
                          voices. Then reopen the site and tap <strong>Refresh voices</strong>.
                        </>
                      ) : (
                        <>
                          On Android, make sure <strong>Google Text-to-speech</strong> is
                          installed/updated and set as the preferred TTS engine. Then tap{" "}
                          <strong>Refresh voices</strong>.
                          <div className="mt-2 flex flex-wrap gap-2">
                            <a
                              href="https://play.google.com/store/apps/details?id=com.google.android.tts"
                              target="_blank"
                              rel="noreferrer noopener"
                              className="rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                            >
                              Open Google TTS in Play Store
                            </a>
                            <a
                              href="intent://#Intent;action=android.settings.TTS_SETTINGS;end"
                              className="rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-amber-900 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                            >
                              Open TTS settings
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
              <h2 className="mb-1 text-lg font-semibold sm:text-xl">Daily Bias</h2>
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

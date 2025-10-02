"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Download, Upload, Moon, Sun, Monitor, Palette, Bell, Database, Info, Mic, RotateCcw } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { ProgressStatsComponent } from "@/components/progress-stats"
import { useSettings } from "@/hooks/use-settings"
import { useApp } from "@/contexts/app-context"
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
  const { progressStats } = useApp()
  const router = useRouter()
  const [importing, setImporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [localVoiceRate, setLocalVoiceRate] = useState(settings.voiceRate || 1.0)
  const [localVoicePitch, setLocalVoicePitch] = useState(settings.voicePitch || 1.0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        
        // Blacklist of known poor quality/novelty voices
        const blacklistedVoices = [
          'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 
          'cellos', 'deranged', 'good news', 'jester', 'organ', 
          'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
          'junior', 'ralph', 'fred', 'kathy', 'princess', 'bruce',
          'flo', 'grandma', 'grandpa'
        ]
        
        // Filter for high-quality English voices only
        const englishVoices = voices
          .filter(voice => {
            // Must be English
            if (!voice.lang.startsWith('en')) return false
            
            // Remove blacklisted voices
            const voiceLower = voice.name.toLowerCase()
            if (blacklistedVoices.some(bad => voiceLower.includes(bad))) return false
            
            // Keep premium/enhanced voices
            const qualityTerms = ['premium', 'enhanced', 'neural', 'natural', 'hd', 'google', 'microsoft']
            const hasQuality = qualityTerms.some(term => voiceLower.includes(term))
            
            // Keep standard voices with common names (Samantha, Alex, Victoria, Daniel, Karen, Moira, etc.)
            const goodStandardVoices = [
              'samantha', 'alex', 'victoria', 'daniel', 'karen', 'moira',
              'tessa', 'serena', 'allison', 'ava', 'susan', 'vicki',
              'tom', 'aaron', 'nicky', 'diego', 'jorge', 'paulina'
            ]
            const isGoodStandard = goodStandardVoices.some(good => voiceLower.includes(good))
            
            return hasQuality || isGoodStandard
          })
          .sort((a, b) => {
            // Prioritize voices with quality indicators
            const qualityTerms = ['premium', 'enhanced', 'neural', 'natural', 'hd']
            const aHasQuality = qualityTerms.some(term => a.name.toLowerCase().includes(term))
            const bHasQuality = qualityTerms.some(term => b.name.toLowerCase().includes(term))
            
            if (aHasQuality && !bHasQuality) return -1
            if (!aHasQuality && bHasQuality) return 1
            
            // Prefer local voices over network
            if (a.localService && !b.localService) return -1
            if (!a.localService && b.localService) return 1
            
            return a.name.localeCompare(b.name)
          })
        
        setAvailableVoices(englishVoices)
        
        // Auto-select best voice if none selected
        if (!settings.voiceName && englishVoices.length > 0) {
          const bestVoice = englishVoices[0]
          saveSetting("voiceName", bestVoice.name)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [settings.voiceName, saveSetting])

  // Sync local state with settings
  useEffect(() => {
    setLocalVoiceRate(settings.voiceRate || 1.0)
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
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      saveSetting("dailyReminder", true)
      new Notification("Bias Daily", {
        body: "Daily reminders enabled! You'll be notified when a new bias is available.",
        icon: "/icon-192.jpg",
      })
    } else {
      saveSetting("dailyReminder", false)
    }
  }

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await requestNotificationPermission()
    } else {
      saveSetting("dailyReminder", false)
    }
  }

  const handleResetVoiceSettings = async () => {
    setLocalVoiceRate(1.0)
    setLocalVoicePitch(1.0)
    await saveSetting("voiceRate", 1.0)
    await saveSetting("voicePitch", 1.0)
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

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={456} />
      <DailyHeader />

      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your Bias Daily experience</p>
          </div>

          {/* Progress Stats Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Your Progress</h2>
              <p className="text-sm text-muted-foreground">Track your learning journey</p>
            </div>
            <ProgressStatsComponent stats={progressStats} />
          </div>

          {/* Appearance Section */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </h2>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <Label>Theme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => saveSetting("theme", value as "light" | "dark" | "system")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Background Style */}
            <div className="space-y-3">
              <Label>Background Style</Label>
              <RadioGroup
                value={settings.backgroundStyle}
                onValueChange={(value) => saveSetting("backgroundStyle", value as "gradient" | "glass" | "minimal")}
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
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">Get reminded about daily biases</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-reminder">Daily Reminder</Label>
                <p className="text-sm text-muted-foreground">Receive a notification when a new bias is available</p>
              </div>
              <Switch id="daily-reminder" checked={settings.dailyReminder} onCheckedChange={handleReminderToggle} />
            </div>
          </div>

          {/* Voice Settings Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Settings
                </h2>
                <p className="text-sm text-muted-foreground">Text-to-speech preferences</p>
              </div>
              {settings.voiceEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetVoiceSettings}
                  className="bg-transparent"
                  aria-label="Reset voice settings to default"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-enabled">Enable Voice</Label>
                <p className="text-sm text-muted-foreground">Read bias content aloud</p>
              </div>
              <Switch
                id="voice-enabled"
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => saveSetting("voiceEnabled", checked)}
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
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    <option value="">System Default</option>
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} {voice.localService ? '⭐' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">⭐ indicates high-quality local voices</p>
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
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
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
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </>
            )}
          </div>

          {/* Daily Bias Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Daily Bias</h2>
              <p className="text-sm text-muted-foreground">Configure daily bias selection</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mix-user-biases">Include Custom Biases</Label>
                <p className="text-sm text-muted-foreground">Mix your custom biases into the daily selection</p>
              </div>
              <Switch
                id="mix-user-biases"
                checked={settings.mixUserBiasesInDaily}
                onCheckedChange={(checked) => saveSetting("mixUserBiasesInDaily", checked)}
              />
            </div>
          </div>

          {/* Data Management Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground">Export or import your data</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              {exportSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">Data exported successfully!</p>
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
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? "Importing..." : "Import Data"}
                    </span>
                  </Button>
                </Label>
              </div>
              {importSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">Data imported successfully!</p>
              )}

              <p className="text-xs text-muted-foreground">
                Export includes your custom biases, favorites, and settings. Import will merge with existing data.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <Info className="h-5 w-5" />
                About
              </h2>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Bias Daily</strong> helps you learn one cognitive bias every day
                from Elon Musk's curated list of 50 biases.
              </p>
              <p>
                All your data is stored locally on your device. Nothing is sent to any server. The app works completely
                offline after the first load.
              </p>
              <p>Version 1.0.0</p>
              <Link href="/about" className="text-primary hover:underline">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

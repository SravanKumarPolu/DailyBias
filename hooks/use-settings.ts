"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserSettings } from "@/lib/types"
import { getSettings, updateSettings } from "@/lib/db"
import { detectTimezone } from "@/lib/timezone-utils"

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "system",
    backgroundStyle: "gradient",
    dailyReminder: false,
    mixUserBiasesInDaily: true,
    voiceEnabled: true,
    voiceRate: 0.9,
    voicePitch: 1.0,
    voiceName: "Google US English", // Default to Google US English voice
    timezoneAutoDetect: false, // Auto-detect timezone disabled by default
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const settingsData = await getSettings()
      // Enforce a non-empty voice selection (no system-default fallback)
      if (!settingsData.voiceName || String(settingsData.voiceName).trim() === "") {
        settingsData.voiceName = "Google US English"
        await updateSettings(settingsData)
      }

      // Auto-detect timezone only if explicitly enabled by user
      if (settingsData.timezoneAutoDetect === true) {
        const detectedTimezone = detectTimezone()
        if (detectedTimezone.timezone !== settingsData.timezone) {
          const updatedSettings = {
            ...settingsData,
            timezone: detectedTimezone.timezone,
            timezoneAutoDetect: true
          }
          setSettings(updatedSettings)
          // Save the detected timezone
          await updateSettings(updatedSettings)
          return
        }
      } else if (!settingsData.timezone) {
        // If auto-detect is disabled and no timezone is set, use detected timezone as default
        const detectedTimezone = detectTimezone()
        const updatedSettings = {
          ...settingsData,
          timezone: detectedTimezone.timezone,
          timezoneAutoDetect: false
        }
        setSettings(updatedSettings)
        await updateSettings(updatedSettings)
        return
      }
      
      setSettings(settingsData)
    } catch (error) {
      console.error("[DailyBias] Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSetting = useCallback(
    async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      await updateSettings(newSettings)
    },
    [settings]
  )

  const saveAllSettings = useCallback(async (newSettings: UserSettings) => {
    setSettings(newSettings)
    await updateSettings(newSettings)
  }, [])

  return {
    settings,
    loading,
    saveSetting,
    saveAllSettings,
    refresh: loadSettings,
  }
}

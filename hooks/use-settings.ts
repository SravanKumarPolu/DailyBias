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
    timezoneAutoDetect: true, // Auto-detect timezone enabled by default
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const settingsData = await getSettings()
      console.log('[Settings] Loaded settings:', settingsData)
      
      // Enforce "Google US English" as the default voice for all users
      if (!settingsData.voiceName || String(settingsData.voiceName).trim() === "" || settingsData.voiceName !== "Google US English") {
        console.log('[Settings] Migrating to Google US English voice')
        settingsData.voiceName = "Google US English"
        await updateSettings(settingsData)
      }

      // Auto-detect timezone if enabled (now default behavior)
      if (settingsData.timezoneAutoDetect === true) {
        console.log('[Settings] Auto-detect is enabled, detecting timezone...')
        const detectedTimezone = detectTimezone()
        console.log('[Settings] Detected timezone:', detectedTimezone)
        if (detectedTimezone.timezone !== settingsData.timezone) {
          console.log('[Settings] Updating timezone from', settingsData.timezone, 'to', detectedTimezone.timezone)
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
      } else if (settingsData.timezoneAutoDetect === false && !settingsData.timezone) {
        console.log('[Settings] Auto-detect is disabled but no timezone set, using detected as default')
        // If auto-detect is explicitly disabled and no timezone is set, use detected timezone as default
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
      
      console.log('[Settings] Final settings to be set:', settingsData)
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
      console.log('[Settings] Saving setting:', key, '=', value)
      setSettings(prevSettings => {
        const newSettings = { ...prevSettings, [key]: value }
        console.log('[Settings] Updated settings state:', newSettings)
        // Save to database asynchronously
        updateSettings(newSettings).catch(console.error)
        return newSettings
      })
      console.log('[Settings] Setting state updated')
    },
    [] // Remove settings dependency to avoid stale closures
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

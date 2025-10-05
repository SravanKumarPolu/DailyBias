"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserSettings } from "@/lib/types"
import { getSettings, updateSettings } from "@/lib/db"

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "system",
    backgroundStyle: "gradient",
    dailyReminder: false,
    mixUserBiasesInDaily: true,
    voiceEnabled: true,
    voiceRate: 0.9,
    voicePitch: 1.0,
    voiceName: "Daniel", // Default to Daniel voice
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const settingsData = await getSettings()
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
    [settings],
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

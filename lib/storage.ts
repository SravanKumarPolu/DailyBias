// LocalStorage helpers for simple flags
export function getLocalFlag(key: string, defaultValue = false): boolean {
  if (typeof window === "undefined") return defaultValue
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : defaultValue
}

export function setLocalFlag(key: string, value: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getLocalString(key: string, defaultValue = ""): string {
  if (typeof window === "undefined") return defaultValue
  return localStorage.getItem(key) || defaultValue
}

export function setLocalString(key: string, value: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, value)
}

// Daily bias storage
interface DailyBiasCache {
  date: string
  biasId: string
}

export function getCachedDailyBias(date: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem("daily-bias-cache")
    if (cached) {
      const data: DailyBiasCache = JSON.parse(cached)
      if (data.date === date) {
        return data.biasId
      }
    }
  } catch (error) {
    console.error("Error reading cached daily bias:", error)
  }
  return null
}

export function cacheDailyBias(date: string, biasId: string): void {
  if (typeof window === "undefined") return
  try {
    const data: DailyBiasCache = { date, biasId }
    localStorage.setItem("daily-bias-cache", JSON.stringify(data))
  } catch (error) {
    console.error("Error caching daily bias:", error)
  }
}

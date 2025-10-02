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

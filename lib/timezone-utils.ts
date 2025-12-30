/**
 * Timezone utilities for DailyBias app
 * Handles automatic timezone detection and local date calculations
 */

export interface TimezoneInfo {
  timezone: string
  offset: string
  region: string
  city: string
}

/**
 * Automatically detect user's timezone
 */
export function detectTimezone(): TimezoneInfo {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      timezone: 'UTC',
      offset: '+00:00',
      region: 'UTC',
      city: 'UTC'
    }
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const offset = -now.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offset) / 60)
    const offsetMinutes = Math.abs(offset) % 60
    const offsetString = `${offset >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
    
    // Extract region and city from timezone string
    const parts = timezone.split('/')
    const region = parts[0] || 'Unknown'
    const city = parts[1]?.replace(/_/g, ' ') || timezone

    return {
      timezone,
      offset: offsetString,
      region,
      city
    }
  } catch (error) {
    console.warn('[DailyBias] Failed to detect timezone:', error)
    return {
      timezone: 'UTC',
      offset: '+00:00',
      region: 'UTC',
      city: 'UTC'
    }
  }
}

/**
 * Get current date in user's local timezone as YYYY-MM-DD string
 */
export function getLocalDateString(date?: Date): string {
  const targetDate = date || new Date()
  
  // Use local timezone instead of UTC
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get yesterday's date in user's local timezone as YYYY-MM-DD string
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return getLocalDateString(yesterday)
}

/**
 * Get date string for a specific number of days ago
 */
export function getDaysAgoDateString(daysAgo: number): string {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - daysAgo)
  return getLocalDateString(targetDate)
}

/**
 * Check if two date strings represent consecutive days
 */
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d1.getTime() - d2.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

/**
 * Get formatted date string for display in user's locale
 */
export function getFormattedDateString(date?: Date, options?: Intl.DateTimeFormatOptions): string {
  const targetDate = date || new Date()
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  try {
    return targetDate.toLocaleDateString(undefined, { ...defaultOptions, ...options })
  } catch (error) {
    console.warn('[DailyBias] Failed to format date:', error)
    // Fallback to basic formatting
    return targetDate.toDateString()
  }
}

/**
 * Get timezone-aware date string for display
 * Uses local timezone (same as bias selection) to ensure consistency
 */
export function getTimezoneAwareDateString(date?: Date): string {
  const targetDate = date || new Date()
  
  // Use local date formatting (same as getLocalDateString) to ensure consistency with bias selection
  // This ensures the displayed date matches the date used for daily bias selection
  try {
    return targetDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.warn('[DailyBias] Failed to get timezone-aware date:', error)
    // Fallback to formatted date string
    return getFormattedDateString(targetDate)
  }
}

/**
 * Get common timezone regions for settings
 */
export function getCommonTimezones(): Array<{label: string, value: string, region: string}> {
  return [
    // Americas
    { label: 'New York (EST/EDT)', value: 'America/New_York', region: 'Americas' },
    { label: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles', region: 'Americas' },
    { label: 'Chicago (CST/CDT)', value: 'America/Chicago', region: 'Americas' },
    { label: 'Denver (MST/MDT)', value: 'America/Denver', region: 'Americas' },
    { label: 'Phoenix (MST)', value: 'America/Phoenix', region: 'Americas' },
    { label: 'Toronto (EST/EDT)', value: 'America/Toronto', region: 'Americas' },
    { label: 'Vancouver (PST/PDT)', value: 'America/Vancouver', region: 'Americas' },
    { label: 'Mexico City (CST/CDT)', value: 'America/Mexico_City', region: 'Americas' },
    { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo', region: 'Americas' },
    { label: 'Buenos Aires (ART)', value: 'America/Argentina/Buenos_Aires', region: 'Americas' },
    
    // Europe
    { label: 'London (GMT/BST)', value: 'Europe/London', region: 'Europe' },
    { label: 'Paris (CET/CEST)', value: 'Europe/Paris', region: 'Europe' },
    { label: 'Berlin (CET/CEST)', value: 'Europe/Berlin', region: 'Europe' },
    { label: 'Madrid (CET/CEST)', value: 'Europe/Madrid', region: 'Europe' },
    { label: 'Rome (CET/CEST)', value: 'Europe/Rome', region: 'Europe' },
    { label: 'Amsterdam (CET/CEST)', value: 'Europe/Amsterdam', region: 'Europe' },
    { label: 'Moscow (MSK)', value: 'Europe/Moscow', region: 'Europe' },
    { label: 'Athens (EET/EEST)', value: 'Europe/Athens', region: 'Europe' },
    { label: 'Dublin (GMT/IST)', value: 'Europe/Dublin', region: 'Europe' },
    { label: 'Stockholm (CET/CEST)', value: 'Europe/Stockholm', region: 'Europe' },
    { label: 'Oslo (CET/CEST)', value: 'Europe/Oslo', region: 'Europe' },
    { label: 'Copenhagen (CET/CEST)', value: 'Europe/Copenhagen', region: 'Europe' },
    { label: 'Zurich (CET/CEST)', value: 'Europe/Zurich', region: 'Europe' },
    { label: 'Vienna (CET/CEST)', value: 'Europe/Vienna', region: 'Europe' },
    { label: 'Prague (CET/CEST)', value: 'Europe/Prague', region: 'Europe' },
    { label: 'Warsaw (CET/CEST)', value: 'Europe/Warsaw', region: 'Europe' },
    { label: 'Istanbul (TRT)', value: 'Europe/Istanbul', region: 'Europe' },
    
    // Asia
    { label: 'India (IST)', value: 'Asia/Kolkata', region: 'Asia' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo', region: 'Asia' },
    { label: 'Shanghai (CST)', value: 'Asia/Shanghai', region: 'Asia' },
    { label: 'Singapore (SGT)', value: 'Asia/Singapore', region: 'Asia' },
    { label: 'Dubai (GST)', value: 'Asia/Dubai', region: 'Asia' },
    { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong', region: 'Asia' },
    { label: 'Seoul (KST)', value: 'Asia/Seoul', region: 'Asia' },
    { label: 'Bangkok (ICT)', value: 'Asia/Bangkok', region: 'Asia' },
    { label: 'Jakarta (WIB)', value: 'Asia/Jakarta', region: 'Asia' },
    { label: 'Manila (PHT)', value: 'Asia/Manila', region: 'Asia' },
    { label: 'Taipei (CST)', value: 'Asia/Taipei', region: 'Asia' },
    { label: 'Kuala Lumpur (MYT)', value: 'Asia/Kuala_Lumpur', region: 'Asia' },
    { label: 'Tehran (IRST)', value: 'Asia/Tehran', region: 'Asia' },
    { label: 'Karachi (PKT)', value: 'Asia/Karachi', region: 'Asia' },
    { label: 'Dhaka (BST)', value: 'Asia/Dhaka', region: 'Asia' },
    { label: 'Colombo (SLST)', value: 'Asia/Colombo', region: 'Asia' },
    { label: 'Kathmandu (NPT)', value: 'Asia/Kathmandu', region: 'Asia' },
    { label: 'Almaty (ALMT)', value: 'Asia/Almaty', region: 'Asia' },
    { label: 'Tashkent (UZT)', value: 'Asia/Tashkent', region: 'Asia' },
    { label: 'Yekaterinburg (YEKT)', value: 'Asia/Yekaterinburg', region: 'Asia' },
    
    // Oceania
    { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney', region: 'Oceania' },
    { label: 'Melbourne (AEST/AEDT)', value: 'Australia/Melbourne', region: 'Oceania' },
    { label: 'Perth (AWST)', value: 'Australia/Perth', region: 'Oceania' },
    { label: 'Brisbane (AEST)', value: 'Australia/Brisbane', region: 'Oceania' },
    { label: 'Adelaide (ACST/ACDT)', value: 'Australia/Adelaide', region: 'Oceania' },
    { label: 'Auckland (NZST/NZDT)', value: 'Pacific/Auckland', region: 'Oceania' },
    { label: 'Fiji (FJT)', value: 'Pacific/Fiji', region: 'Oceania' },
    { label: 'Honolulu (HST)', value: 'Pacific/Honolulu', region: 'Pacific' },
    
    // Africa
    { label: 'Cairo (EET)', value: 'Africa/Cairo', region: 'Africa' },
    { label: 'Johannesburg (SAST)', value: 'Africa/Johannesburg', region: 'Africa' },
    { label: 'Lagos (WAT)', value: 'Africa/Lagos', region: 'Africa' },
    { label: 'Nairobi (EAT)', value: 'Africa/Nairobi', region: 'Africa' },
    { label: 'Casablanca (WET)', value: 'Africa/Casablanca', region: 'Africa' },
    { label: 'Tunis (CET)', value: 'Africa/Tunis', region: 'Africa' },
    
    // UTC
    { label: 'UTC', value: 'UTC', region: 'UTC' }
  ]
}

/**
 * Validate if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

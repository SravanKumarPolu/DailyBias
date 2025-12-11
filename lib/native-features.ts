/**
 * Native features for Capacitor mobile app
 * Provides notifications, share, and other native capabilities
 */

import { LocalNotifications } from '@capacitor/local-notifications'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { logger } from './logger'

const isNative = Capacitor.isNativePlatform()

// Web notification scheduler state
let webNotificationInterval: NodeJS.Timeout | null = null
const WEB_NOTIFICATION_STORAGE_KEY = 'daily-bias-last-notification-date'

/**
 * Check if running in native app
 */
export function isNativeApp(): boolean {
  return isNative
}

/**
 * Check if it's time to show notification (9 AM)
 */
function shouldShowNotification(hour: number, minute: number): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Check if current time matches the scheduled time
  return currentHour === hour && currentMinute === minute
}

/**
 * Check if notification was already shown today
 */
function wasNotificationShownToday(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const lastDate = localStorage.getItem(WEB_NOTIFICATION_STORAGE_KEY)
    if (!lastDate) return false

    const lastNotificationDate = new Date(lastDate)
    const today = new Date()

    // Check if it's the same day
    return (
      lastNotificationDate.getFullYear() === today.getFullYear() &&
      lastNotificationDate.getMonth() === today.getMonth() &&
      lastNotificationDate.getDate() === today.getDate()
    )
  } catch (error) {
    logger.error('[NativeFeatures] Error checking notification date:', error)
    return false
  }
}

/**
 * Mark notification as shown today
 */
function markNotificationShown(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(WEB_NOTIFICATION_STORAGE_KEY, new Date().toISOString())
  } catch (error) {
    logger.error('[NativeFeatures] Error saving notification date:', error)
  }
}

/**
 * Show web notification
 */
function showWebNotification(): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission !== 'granted') {
    logger.debug('[NativeFeatures] Web notification permission not granted')
    return
  }

  // Check if already shown today
  if (wasNotificationShownToday()) {
    logger.debug('[NativeFeatures] Web notification already shown today')
    return
  }

  try {
    const notification = new Notification('Your Daily Bias is Ready! 🧠', {
      body: 'Discover today\'s cognitive bias and improve your thinking',
      icon: '/icon-192.jpg',
      badge: '/icon-192.jpg',
      tag: 'daily-bias-reminder', // Prevents duplicate notifications
      requireInteraction: false,
    })

    // Mark as shown
    markNotificationShown()

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    logger.debug('[NativeFeatures] Web notification shown')
  } catch (error) {
    logger.error('[NativeFeatures] Error showing web notification:', error)
  }
}

/**
 * Start web notification scheduler
 */
function startWebNotificationScheduler(hour: number = 9, minute: number = 0): void {
  // Clear existing interval
  if (webNotificationInterval) {
    clearInterval(webNotificationInterval)
    webNotificationInterval = null
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    logger.debug('[NativeFeatures] Web notifications not supported')
    return
  }

  if (Notification.permission !== 'granted') {
    logger.debug('[NativeFeatures] Web notification permission not granted')
    return
  }

  // Check immediately if it's time
  if (shouldShowNotification(hour, minute) && !wasNotificationShownToday()) {
    showWebNotification()
  }

  // Check every minute if it's time to show notification
  webNotificationInterval = setInterval(() => {
    if (shouldShowNotification(hour, minute) && !wasNotificationShownToday()) {
      showWebNotification()
    }
  }, 60000) // Check every minute

  logger.debug(`[NativeFeatures] Web notification scheduler started for ${hour}:${minute.toString().padStart(2, '0')}`)
}

/**
 * Stop web notification scheduler
 */
function stopWebNotificationScheduler(): void {
  if (webNotificationInterval) {
    clearInterval(webNotificationInterval)
    webNotificationInterval = null
    logger.debug('[NativeFeatures] Web notification scheduler stopped')
  }
}

/**
 * Schedule daily bias reminder notification
 */
export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
  if (!isNative) {
    // Handle web notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        startWebNotificationScheduler(hour, minute)
        logger.debug(`[NativeFeatures] Web notification scheduled for ${hour}:${minute.toString().padStart(2, '0')}`)
      } else {
        logger.debug('[NativeFeatures] Web notification permission not granted')
      }
    }
    return
  }

  try {
    // Request permission first
    const permission = await LocalNotifications.checkPermissions()
    if (permission.display !== 'granted') {
      const requestResult = await LocalNotifications.requestPermissions()
      if (requestResult.display !== 'granted') {
        logger.warn('[NativeFeatures] Notification permission denied')
        return
      }
    }

    // Cancel existing notifications
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

    // Schedule daily notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Your Daily Bias is Ready! 🧠',
          body: 'Discover today\'s cognitive bias and improve your thinking',
          id: 1,
          schedule: {
            every: 'day',
            on: {
              hour,
              minute,
            },
            repeats: true,
          },
          sound: 'default',
          actionTypeId: 'OPEN_APP',
        },
      ],
    })

    logger.debug(`[NativeFeatures] Scheduled daily reminder for ${hour}:${minute.toString().padStart(2, '0')}`)
  } catch (error) {
    logger.error('[NativeFeatures] Error scheduling notification:', error)
  }
}

/**
 * Cancel daily reminder notification
 */
export async function cancelDailyReminder(): Promise<void> {
  if (!isNative) {
    // Stop web notification scheduler
    stopWebNotificationScheduler()
    logger.debug('[NativeFeatures] Web notification scheduler stopped')
    return
  }

  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] })
    logger.debug('[NativeFeatures] Cancelled daily reminder')
  } catch (error) {
    logger.error('[NativeFeatures] Error cancelling notification:', error)
  }
}

/**
 * Share bias card using native share sheet
 */
export async function shareBias(bias: {
  title: string
  summary: string
  why?: string
  counter?: string
}): Promise<void> {
  if (!isNative) {
    // Fallback to Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Bias: ${bias.title}`,
          text: `${bias.title}\n\n${bias.summary}`,
        })
        return
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('[NativeFeatures] Web share error:', error)
        }
        return
      }
    }
    // Fallback: copy to clipboard
    const text = `${bias.title}\n\n${bias.summary}`
    await navigator.clipboard.writeText(text)
    logger.debug('[NativeFeatures] Copied to clipboard (web fallback)')
    return
  }

  try {
    await Share.share({
      title: `Daily Bias: ${bias.title}`,
      text: `${bias.title}\n\n${bias.summary}${bias.why ? `\n\nWhy it happens: ${bias.why}` : ''}${bias.counter ? `\n\nHow to counter: ${bias.counter}` : ''}`,
      dialogTitle: 'Share Daily Bias',
    })
    logger.debug('[NativeFeatures] Shared bias via native share')
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).message !== 'User cancelled') {
      logger.error('[NativeFeatures] Error sharing bias:', error)
    }
  }
}

/**
 * Check notification permissions
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!isNative) {
    // Check web notification permissions
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  }

  try {
    const permission = await LocalNotifications.checkPermissions()
    return permission.display === 'granted'
  } catch (error) {
    logger.error('[NativeFeatures] Error checking permissions:', error)
    return false
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNative) {
    // Request web notification permissions
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (error) {
        logger.error('[NativeFeatures] Error requesting web notification permissions:', error)
        return false
      }
    }
    return false
  }

  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (error) {
    logger.error('[NativeFeatures] Error requesting permissions:', error)
    return false
  }
}


/**
 * Native features for Capacitor mobile app
 * Provides notifications, share, and other native capabilities
 */

import { LocalNotifications } from '@capacitor/local-notifications'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { logger } from './logger'

const isNative = Capacitor.isNativePlatform()

/**
 * Check if running in native app
 */
export function isNativeApp(): boolean {
  return isNative
}

/**
 * Schedule daily bias reminder notification
 */
export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
  if (!isNative) {
    logger.debug('[NativeFeatures] Not native platform, skipping notification')
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
  if (!isNative) return

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
  if (!isNative) return false

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
  if (!isNative) return false

  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (error) {
    logger.error('[NativeFeatures] Error requesting permissions:', error)
    return false
  }
}


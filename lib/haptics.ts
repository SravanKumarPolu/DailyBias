/**
 * Haptic feedback utilities for mobile devices
 */

export const haptics = {
  /**
   * Light haptic feedback for subtle interactions
   */
  light: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10)
    }
  },

  /**
   * Medium haptic feedback for standard interactions
   */
  medium: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(20)
    }
  },

  /**
   * Strong haptic feedback for important actions
   */
  strong: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(30)
    }
  },

  /**
   * Success pattern - double pulse
   */
  success: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([15, 50, 15])
    }
  },

  /**
   * Error pattern - triple short pulse
   */
  error: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([10, 30, 10, 30, 10])
    }
  },

  /**
   * Selection pattern - single short pulse
   */
  selection: () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(5)
    }
  },
}

"use client"

import { useEffect } from "react"

/**
 * Disable Service Worker completely
 * 
 * Service workers can cause issues because:
 * 1. They try to precache resources that may not exist (404 errors)
 * 2. They can cause appendChild errors if document.head is null
 * 3. They interfere with app behavior and cause repeated errors
 */
export function DisableServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Unregister all existing service workers immediately
    const unregisterAll = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          try {
            const success = await registration.unregister()
            if (success) {
              console.log("[ServiceWorker] Successfully unregistered service worker")
            }
          } catch (error) {
            console.warn("[ServiceWorker] Error unregistering:", error)
          }
        }
      } catch (error) {
        console.warn("[ServiceWorker] Error getting registrations:", error)
      }
    }

    // Unregister immediately
    unregisterAll()

    // Also unregister on page load (in case one registers immediately)
    let cleanup: (() => void) | undefined
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", unregisterAll)
      cleanup = () => {
        document.removeEventListener("DOMContentLoaded", unregisterAll)
      }
    } else {
      unregisterAll()
    }

    // Prevent new service worker registrations by overriding the register method
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    navigator.serviceWorker.register = function(..._args: unknown[]) {
      console.warn("[ServiceWorker] Service worker registration blocked")
      return Promise.reject(new Error("Service workers are disabled"))
    }

    // Clean up listener on unmount
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  return null
}


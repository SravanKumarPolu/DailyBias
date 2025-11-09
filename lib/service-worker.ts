function shouldBypassSW(): boolean {
  try {
    const params = new URLSearchParams(window.location.search)
    return (
      params.has("v") ||
      params.has("no-sw") ||
      params.has("nosw") ||
      params.get("cache") === "off" ||
      params.get("nocache") === "1"
    )
  } catch {
    return false
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("[SW] Service workers not supported")
    return
  }

  // Allow bypass/unregister via URL flags to avoid stale caches in the field
  if (shouldBypassSW()) {
    console.log("[SW] Bypassing service worker due to URL flag")
    unregisterServiceWorker()
    return
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Service worker registered:", registration.scope)
        
        // Handle service worker errors gracefully
        // Note: ServiceWorkerRegistration doesn't have an 'error' event
        // Errors are handled via the service worker's error event or registration.update() rejections
        if (registration.installing) {
          registration.installing.addEventListener("error", (event) => {
            console.warn("[SW] Service worker installation error:", event)
          })
        }
        if (registration.waiting) {
          registration.waiting.addEventListener("error", (event) => {
            console.warn("[SW] Service worker waiting error:", event)
          })
        }
        if (registration.active) {
          registration.active.addEventListener("error", (event) => {
            console.warn("[SW] Service worker active error:", event)
          })
        }

        // Always check for an update on load
        registration.update().catch((error) => {
          // Silently handle update errors - they're not critical
          if (process.env.NODE_ENV === "development") {
            console.warn("[SW] Update check failed:", error)
          }
        })

        // Check for updates periodically (every 15 minutes)
        setInterval(() => {
          registration.update().catch((error) => {
            // Silently handle update errors
            if (process.env.NODE_ENV === "development") {
              console.warn("[SW] Periodic update check failed:", error)
            }
          })
        }, 15 * 60 * 1000)

        // Also check when app becomes visible again or goes online
        const updateOnVisibility = () => {
          registration.update().catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.warn("[SW] Visibility update check failed:", error)
            }
          })
        }
        const updateOnOnline = () => {
          registration.update().catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.warn("[SW] Online update check failed:", error)
            }
          })
        }
        document.addEventListener("visibilitychange", updateOnVisibility)
        window.addEventListener("online", updateOnOnline)

        // Handle updates
        registration.addEventListener("updatefound", () => {
          try {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener("statechange", () => {
              try {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available - notify UI instead of auto-reload
                  console.log("[SW] New version available - notifying UI")
                  window.dispatchEvent(new CustomEvent("sw-update-available"))
                }
              } catch (error) {
                console.error("[SW] Error in statechange handler:", error)
              }
            })

            // Also listen for errors on the new worker
            newWorker.addEventListener("error", (event) => {
              console.warn("[SW] New worker error:", event)
            })
          } catch (error) {
            console.error("[SW] Error in updatefound handler:", error)
          }
        })
      })
      .catch((error) => {
        console.error("[SW] Service worker registration failed:", error)
        // If registration fails due to precaching issues, try to unregister and re-register
        if (error.message?.includes("bad-precaching-response")) {
          console.log("[SW] Attempting to clear cache and re-register...")
          unregisterServiceWorker()
          setTimeout(() => {
            navigator.serviceWorker.register("/sw.js").catch(() => {})
          }, 1000)
        }
      })

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      try {
        console.log("[SW] Controller changed, reloading page")
        window.location.reload()
      } catch (error) {
        console.error("[SW] Error in controllerchange handler:", error)
      }
    })
  })
}

export function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

export function clearServiceWorkerCache() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_CACHE" })
}

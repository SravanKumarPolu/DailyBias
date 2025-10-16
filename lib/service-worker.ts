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

        // Always check for an update on load
        registration.update().catch(() => {})

        // Check for updates periodically (every 15 minutes)
        setInterval(() => {
          registration.update().catch(() => {})
        }, 15 * 60 * 1000)

        // Also check when app becomes visible again or goes online
        const updateOnVisibility = () => registration.update().catch(() => {})
        const updateOnOnline = () => registration.update().catch(() => {})
        document.addEventListener("visibilitychange", updateOnVisibility)
        window.addEventListener("online", updateOnOnline)

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available - auto-activate and reload silently
              console.log("[SW] New version available - activating")
              try {
                newWorker.postMessage({ type: "SKIP_WAITING" })
              } catch {}
            }
          })
        })
      })
      .catch((error) => {
        console.error("[SW] Service worker registration failed:", error)
      })

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[SW] Controller changed, reloading page")
      window.location.reload()
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

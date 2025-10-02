export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("[SW] Service workers not supported")
    return
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Service worker registered:", registration.scope)

        // Check for updates periodically
        setInterval(
          () => {
            registration.update()
          },
          60 * 60 * 1000,
        ) // Check every hour

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available
              console.log("[SW] New version available")

              // Optionally notify user about update
              if (window.confirm("A new version is available. Reload to update?")) {
                newWorker.postMessage({ type: "SKIP_WAITING" })
                window.location.reload()
              }
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

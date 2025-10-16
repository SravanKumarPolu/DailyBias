"use client"

import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export function SWUpdateToaster() {
  useEffect(() => {
    const handler = () => {
      const t = toast({
        title: "New version available",
        description: "A new update is ready. Reload to get the latest.",
        action: (
          <ToastAction
            altText="Reload"
            onClick={() => {
              try {
                navigator.serviceWorker?.getRegistration()?.then((registration) => {
                  registration?.waiting?.postMessage?.({ type: "SKIP_WAITING" })
                })
              } catch {}
              window.location.reload()
            }}
          >
            Reload
          </ToastAction>
        ),
      })

      // Auto-dismiss after a while but keep it visible long enough
      setTimeout(() => t.dismiss(), 30000)
    }

    window.addEventListener("sw-update-available", handler)
    return () => window.removeEventListener("sw-update-available", handler)
  }, [])

  return null
}



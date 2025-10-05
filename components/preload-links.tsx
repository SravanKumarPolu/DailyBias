/**
 * Preload Links Component
 * 
 * This component preloads critical chunks and resources to improve performance.
 * Use this in your root layout to start loading chunks before they're needed.
 */

"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PreloadLinks() {
  const pathname = usePathname()

  useEffect(() => {
    // Preload common components likely to be needed soon
    const preloadComponents = () => {
      // Preload BiasCard component (used on most pages)
      import("@/components/bias-card")
      
      // Preload Navigation (shown on all pages after initial load)
      import("@/components/navigation")
    }

    // Start preloading after a short delay to not block initial render
    const timer = setTimeout(preloadComponents, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Preload page-specific components based on current route
    const preloadForRoute = () => {
      if (pathname === "/") {
        // On home page, preload common navigation targets
        import("@/components/recommendation-card")
      } else if (pathname === "/all") {
        // On all page, preload detail page components
        import("@/components/recommendation-card")
      } else if (pathname === "/settings") {
        // On settings, preload progress stats
        import("@/components/progress-stats")
      }
    }

    const timer = setTimeout(preloadForRoute, 500)
    return () => clearTimeout(timer)
  }, [pathname])

  return null // This component doesn't render anything
}

/**
 * Usage in app/layout.tsx:
 * 
 * import { PreloadLinks } from "@/components/preload-links"
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PreloadLinks />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 */

"use client"

import Script from "next/script"

/**
 * Plausible Analytics Component
 * 
 * Privacy-focused analytics that tracks unique visitors without cookies.
 * Only loads in production mode.
 * 
 * Setup:
 * 1. Sign up at https://plausible.io
 * 2. Add your domain (e.g., debiasdaily.com)
 * 3. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in your .env file
 * 
 * Features:
 * - No cookies required (GDPR compliant)
 * - Lightweight (~1KB script)
 * - Shows unique visitors, page views, referrers
 * - Privacy-focused (no personal data collected)
 */
export function PlausibleAnalytics() {
  // Only load in production
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  // Don't load if domain is not configured
  if (!domain) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "Plausible Analytics: NEXT_PUBLIC_PLAUSIBLE_DOMAIN is not set. Analytics will not be loaded."
      )
    }
    return null
  }

  // Don't load Plausible in Android WebView to avoid conflicts
  if (typeof window !== "undefined" && window.navigator?.userAgent?.includes("wv")) {
    return null
  }

  return (
    <Script
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
      defer
      onError={(e) => {
        console.warn("Plausible Analytics script failed to load:", e)
      }}
    />
  )
}


/**
 * Site Configuration
 * 
 * Centralized configuration for site URLs, social handles, and metadata.
 * Uses environment variables for flexibility across different environments.
 */

/**
 * Get the site URL from environment variable or fallback to default
 * In Next.js, environment variables are available at build time
 */
function getSiteUrl(): string {
  // Check for NEXT_PUBLIC_SITE_URL first (for client-side usage)
  // Then check for SITE_URL (for server-side usage)
  // Fallback to the current production domain
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://debiasdaily.com"
  )
}

/**
 * Get the Twitter handle from environment variable or fallback to default
 */
function getTwitterHandle(): string {
  return process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@debiasdaily"
}

/**
 * Get the site name from environment variable or fallback to default
 */
function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Bias Daily"
}

/**
 * Site configuration object
 * All URLs and social handles should be accessed through this object
 */
export const siteConfig = {
  /** Full site URL (e.g., https://debiasdaily.com) */
  url: getSiteUrl(),
  
  /** Twitter handle (e.g., @debiasdaily) */
  twitterHandle: getTwitterHandle(),
  
  /** Site name (configurable via NEXT_PUBLIC_SITE_NAME) */
  name: getSiteName(),
  
  /** Short site name (same as name, but can be customized separately if needed) */
  shortName: getSiteName(),
  
  /** Site description */
  description: "Learn one cognitive bias every day from Elon Musk's list of 50 biases.",
} as const

/**
 * Helper function to get the site URL
 * Use this in server components and API routes
 */
export function getSiteUrlValue(): string {
  return siteConfig.url
}

/**
 * Helper function to get the Twitter handle without @
 */
export function getTwitterHandleValue(): string {
  return siteConfig.twitterHandle.replace("@", "")
}


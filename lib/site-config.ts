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
 * Get the product name (for branding, app store, etc.)
 */
function getProductName(): string {
  return process.env.NEXT_PUBLIC_PRODUCT_NAME || "DebiasDaily"
}

/**
 * Get the in-app display name (for headings and UI)
 */
function getInAppName(): string {
  return process.env.NEXT_PUBLIC_IN_APP_NAME || "DebiasDaily"
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
  
  /** Product name for branding (DebiasDaily) */
  productName: getProductName(),
  
  /** In-app display name for headings and UI (DebiasDaily) */
  name: getInAppName(),
  
  /** Short site name (same as in-app name) */
  shortName: getInAppName(),
  
  /** Site description */
  description: "Learn one cognitive bias every day from a curated list of 50 research-backed cognitive biases.",
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


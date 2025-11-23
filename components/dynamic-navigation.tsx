/**
 * Navigation component export
 * Imported directly (not dynamically) to ensure it's always visible on Android
 * Dynamic imports can cause the navigation to be hidden or flicker on Android
 */

"use client"

import { Navigation } from "./navigation"

// Export directly to ensure navigation is always rendered and visible
// This prevents the navigation from being hidden on Android due to dynamic import issues
export const DynamicNavigation = Navigation

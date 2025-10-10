/**
 * Dynamically imported Navigation component
 * Since navigation is visible on every page, we use a small loading state
 */

"use client"

import dynamic from "next/dynamic"
import { NavigationLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { Navigation } from "./navigation"

export const DynamicNavigation = dynamic<ComponentProps<typeof Navigation>>(
  () => import("./navigation").then((mod) => ({ default: mod.Navigation })),
  {
    loading: () => <NavigationLoader />,
    ssr: false, // Navigation uses client-side routing
  }
)

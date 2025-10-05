/**
 * Dynamically imported ProgressStatsComponent
 * Loaded on demand to reduce initial bundle size
 */

"use client"

import dynamic from "next/dynamic"
import { ProgressStatsLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { ProgressStatsComponent } from "./progress-stats"

export const DynamicProgressStats = dynamic<ComponentProps<typeof ProgressStatsComponent>>(
  () => import("./progress-stats").then((mod) => ({ default: mod.ProgressStatsComponent })),
  {
    loading: () => <ProgressStatsLoader />,
    ssr: true, // Can be server-rendered since it's mostly static content
  },
)

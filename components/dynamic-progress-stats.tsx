/**
 * Dynamically imported ProgressStatsComponent
 * Loaded on demand to reduce initial bundle size
 */

"use client"

import dynamic from "next/dynamic"
import { ProgressStatsLoader } from "./loading-fallback"

export const DynamicProgressStats = dynamic(
  () => import("./progress-stats").then((mod) => mod.ProgressStatsComponent),
  {
    loading: () => <ProgressStatsLoader />,
    ssr: true,
  }
)

/**
 * Dynamically imported BiasCard component
 * Loaded on demand to reduce initial bundle size
 * 
 * FIX: Removed loading fallback to prevent content→skeleton→content flicker on Android
 * Since ssr: true, the component is pre-rendered on server, so no loading state needed
 */

"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import type { BiasCard } from "./bias-card"

// Dynamic import without loading fallback to prevent hydration flicker
// The component is SSR'd, so it should be available immediately on client
export const DynamicBiasCard = dynamic<ComponentProps<typeof BiasCard>>(
  () => import("./bias-card").then((mod) => ({ default: mod.BiasCard })),
  {
    // Removed loading prop - no skeleton fallback to prevent content→skeleton swap
    // ssr: true ensures component is pre-rendered, so it should be available on hydration
    ssr: true,
  }
)

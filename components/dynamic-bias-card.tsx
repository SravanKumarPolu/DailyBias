/**
 * Dynamically imported BiasCard component
 * Loaded on demand to reduce initial bundle size
 */

"use client"

import dynamic from "next/dynamic"
import { BiasCardDetailedLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { BiasCard } from "./bias-card"

// Dynamic import with default loader (detailed version)
export const DynamicBiasCard = dynamic<ComponentProps<typeof BiasCard>>(
  () => import("./bias-card").then((mod) => ({ default: mod.BiasCard })),
  {
    loading: () => <BiasCardDetailedLoader />,
    ssr: true,
  }
)

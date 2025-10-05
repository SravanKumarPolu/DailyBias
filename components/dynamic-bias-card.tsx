/**
 * Dynamically imported BiasCard component
 * Loaded on demand to reduce initial bundle size
 */

"use client"

import dynamic from "next/dynamic"
import { BiasCardDetailedLoader, BiasCardCompactLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { BiasCard } from "./bias-card"

// Dynamic import with variant-specific loaders
export const DynamicBiasCard = dynamic<ComponentProps<typeof BiasCard>>(
  () => import("./bias-card").then((mod) => ({ default: mod.BiasCard })),
  {
    loading: ({ variant }: { variant?: "detailed" | "compact" }) => 
      variant === "detailed" ? <BiasCardDetailedLoader /> : <BiasCardCompactLoader />,
    ssr: true,
  },
)

/**
 * Dynamically imported RecommendationCard component
 * Loaded on demand since it's only shown in certain contexts
 */

"use client"

import dynamic from "next/dynamic"
import { RecommendationCardLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { RecommendationCard } from "./recommendation-card"

export const DynamicRecommendationCard = dynamic<ComponentProps<typeof RecommendationCard>>(
  () => import("./recommendation-card").then((mod) => ({ default: mod.RecommendationCard })),
  {
    loading: () => <RecommendationCardLoader />,
    ssr: true,
  }
)

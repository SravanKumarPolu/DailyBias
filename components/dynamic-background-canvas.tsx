/**
 * Dynamically imported BackgroundCanvas component
 * This reduces the initial bundle size by loading the canvas and animation library on demand
 */

"use client"

import dynamic from "next/dynamic"
import { BackgroundCanvasLoader } from "./loading-fallback"
import type { ComponentProps } from "react"
import type { BackgroundCanvas } from "./background-canvas"

export const DynamicBackgroundCanvas = dynamic<ComponentProps<typeof BackgroundCanvas>>(
  () => import("./background-canvas").then((mod) => mod.BackgroundCanvas),
  {
    loading: () => <BackgroundCanvasLoader />,
    ssr: false, // Canvas requires client-side rendering
  }
)

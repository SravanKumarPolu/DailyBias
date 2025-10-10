"use client"

/**
 * Code Splitting Demo Page
 *
 * This page demonstrates various code splitting techniques and shows
 * performance improvements from dynamic imports.
 */

import { useState } from "react"
import { ArrowLeft, Code, Zap, Package, Info, Play, CheckCircle2, Clock } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  BiasCardCompactLoader,
  ProgressStatsLoader,
  RecommendationCardLoader,
} from "@/components/loading-fallback"

// Example 1: Component with custom loader
const DynamicBiasCardExample = dynamic(
  () => import("@/components/bias-card").then((mod) => ({ default: mod.BiasCard })),
  {
    loading: () => <BiasCardCompactLoader />,
    ssr: true,
  }
)

// Example 2: Component with no SSR (client-side only)
const DynamicCanvasExample = dynamic(
  () => import("@/components/background-canvas").then((mod) => mod.BackgroundCanvas),
  {
    loading: () => <div className="bg-muted h-32 w-full animate-pulse rounded-lg" />,
    ssr: false,
  }
)

// Example 3: Component loaded on demand (not initially)
const DynamicProgressStatsExample = dynamic(
  () =>
    import("@/components/progress-stats").then((mod) => ({ default: mod.ProgressStatsComponent })),
  {
    loading: () => <ProgressStatsLoader />,
  }
)

// Example 4: Heavy library - Chart component (if you had one)
const DynamicRecommendationExample = dynamic(
  () =>
    import("@/components/recommendation-card").then((mod) => ({ default: mod.RecommendationCard })),
  {
    loading: () => <RecommendationCardLoader />,
  }
)

export default function CodeSplittingDemoPage() {
  const { settings } = useSettings()
  const router = useRouter()
  const [showExample1, setShowExample1] = useState(false)
  const [showExample2, setShowExample2] = useState(false)
  const [showExample3, setShowExample3] = useState(false)
  const [showExample4, setShowExample4] = useState(false)
  const [loadTimes, setLoadTimes] = useState<Record<string, number>>({})

  // Measure component load time
  const measureLoadTime = (exampleId: string) => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      setLoadTimes((prev) => ({ ...prev, [exampleId]: endTime - startTime }))
    }
  }

  // Example mock data
  const mockBias = {
    id: "demo-bias",
    title: "Confirmation Bias",
    summary:
      "The tendency to search for, interpret, and recall information that confirms our preexisting beliefs.",
    category: "decision" as const,
    why: "We naturally prefer information that aligns with our existing views.",
    counter: "Actively seek out contradictory information and diverse perspectives.",
    source: "core" as const,
  }

  const mockStats = {
    currentStreak: 7,
    longestStreak: 15,
    totalBiasesRead: 42,
    masteredCount: 12,
    lastViewedDate: new Date().toISOString().split("T")[0],
  }

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={777} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="glass rounded-2xl p-8">
            <div className="mb-4 flex items-center gap-3">
              <Code className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold">Code Splitting Demo</h1>
            </div>
            <p className="text-muted-foreground mb-4">
              This page demonstrates various code splitting techniques used throughout the DailyBias
              app to improve performance.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                Dynamic Imports
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                Bundle Splitting
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Lazy Loading
              </Badge>
            </div>
          </div>

          {/* Benefits Section */}
          <Card className="glass p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Info className="h-5 w-5" />
              Benefits of Code Splitting
            </h2>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Faster Initial Load</span>
                </div>
                <p className="text-muted-foreground">
                  Only load what's needed for the initial page render
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Reduced Bundle Size</span>
                </div>
                <p className="text-muted-foreground">
                  Split code into smaller chunks for better caching
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Better Performance</span>
                </div>
                <p className="text-muted-foreground">
                  Load components on demand when users need them
                </p>
              </div>
            </div>
          </Card>

          {/* Example 1: BiasCard with Loader */}
          <Card className="glass p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold">
                  Example 1: Component with Custom Loader
                </h2>
                <p className="text-muted-foreground text-sm">
                  BiasCard component with a tailored loading skeleton
                </p>
              </div>
              <Button
                onClick={() => {
                  const cleanup = measureLoadTime("example1")
                  setShowExample1(true)
                  setTimeout(cleanup, 100)
                }}
                disabled={showExample1}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {showExample1 ? "Loaded" : "Load Component"}
              </Button>
            </div>
            {showExample1 && (
              <div className="mt-4">
                <DynamicBiasCardExample
                  bias={mockBias}
                  variant="compact"
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
                {loadTimes.example1 && (
                  <p className="mt-2 text-xs text-green-500">
                    ✓ Loaded in {loadTimes.example1.toFixed(2)}ms
                  </p>
                )}
              </div>
            )}
            <div className="bg-muted/50 mt-4 rounded-lg p-3">
              <code className="text-xs">
                {`const DynamicBiasCard = dynamic(() => import("@/components/bias-card"), {
  loading: () => <BiasCardCompactLoader />,
  ssr: true
})`}
              </code>
            </div>
          </Card>

          {/* Example 2: Canvas without SSR */}
          <Card className="glass p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold">
                  Example 2: Client-Side Only Component
                </h2>
                <p className="text-muted-foreground text-sm">
                  Canvas component that requires browser APIs (no SSR)
                </p>
              </div>
              <Button
                onClick={() => {
                  const cleanup = measureLoadTime("example2")
                  setShowExample2(true)
                  setTimeout(cleanup, 100)
                }}
                disabled={showExample2}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {showExample2 ? "Loaded" : "Load Component"}
              </Button>
            </div>
            {showExample2 && (
              <div className="mt-4">
                <div className="relative h-32 overflow-hidden rounded-lg">
                  <DynamicCanvasExample style="gradient" seed={123} />
                </div>
                {loadTimes.example2 && (
                  <p className="mt-2 text-xs text-green-500">
                    ✓ Loaded in {loadTimes.example2.toFixed(2)}ms
                  </p>
                )}
              </div>
            )}
            <div className="bg-muted/50 mt-4 rounded-lg p-3">
              <code className="text-xs">
                {`const DynamicCanvas = dynamic(() => import("@/components/background-canvas"), {
  loading: () => <Skeleton />,
  ssr: false // Disable server-side rendering
})`}
              </code>
            </div>
          </Card>

          {/* Example 3: Progress Stats */}
          <Card className="glass p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold">Example 3: On-Demand Loading</h2>
                <p className="text-muted-foreground text-sm">
                  ProgressStats component loaded only when needed
                </p>
              </div>
              <Button
                onClick={() => {
                  const cleanup = measureLoadTime("example3")
                  setShowExample3(true)
                  setTimeout(cleanup, 100)
                }}
                disabled={showExample3}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {showExample3 ? "Loaded" : "Load Component"}
              </Button>
            </div>
            {showExample3 && (
              <div className="mt-4">
                <DynamicProgressStatsExample stats={mockStats} />
                {loadTimes.example3 && (
                  <p className="mt-2 text-xs text-green-500">
                    ✓ Loaded in {loadTimes.example3.toFixed(2)}ms
                  </p>
                )}
              </div>
            )}
            <div className="bg-muted/50 mt-4 rounded-lg p-3">
              <code className="text-xs">
                {`const DynamicProgressStats = dynamic(() => import("@/components/progress-stats"), {
  loading: () => <ProgressStatsLoader />
})`}
              </code>
            </div>
          </Card>

          {/* Example 4: Recommendation Card */}
          <Card className="glass p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold">Example 4: Conditional Rendering</h2>
                <p className="text-muted-foreground text-sm">
                  RecommendationCard loaded conditionally based on user state
                </p>
              </div>
              <Button
                onClick={() => {
                  const cleanup = measureLoadTime("example4")
                  setShowExample4(true)
                  setTimeout(cleanup, 100)
                }}
                disabled={showExample4}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {showExample4 ? "Loaded" : "Load Component"}
              </Button>
            </div>
            {showExample4 && (
              <div className="mt-4">
                <DynamicRecommendationExample
                  bias={mockBias}
                  reason="Personalized based on your learning progress"
                />
                {loadTimes.example4 && (
                  <p className="mt-2 text-xs text-green-500">
                    ✓ Loaded in {loadTimes.example4.toFixed(2)}ms
                  </p>
                )}
              </div>
            )}
            <div className="bg-muted/50 mt-4 rounded-lg p-3">
              <code className="text-xs">
                {`{hasRecommendation && (
  <DynamicRecommendationCard bias={bias} reason={reason} />
)}`}
              </code>
            </div>
          </Card>

          {/* Implementation Guide */}
          <Card className="glass p-6">
            <h2 className="mb-4 text-xl font-semibold">Implementation Guide</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="mb-2 font-semibold">1. Create Dynamic Wrappers</h3>
                <p className="text-muted-foreground mb-2">
                  Create wrapper files for each component you want to code-split:
                </p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-xs">
                    {`// components/dynamic-bias-card.tsx
export const DynamicBiasCard = dynamic(
  () => import("./bias-card").then(mod => ({ default: mod.BiasCard })),
  { loading: () => <BiasCardLoader />, ssr: true }
)`}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">2. Create Loading Fallbacks</h3>
                <p className="text-muted-foreground mb-2">
                  Design skeleton loaders that match the component's layout:
                </p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-xs">
                    {`export function BiasCardLoader() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}`}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">3. Use Dynamic Imports in Pages</h3>
                <p className="text-muted-foreground mb-2">
                  Replace static imports with dynamic imports:
                </p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-xs">
                    {`// Before:
import { BiasCard } from "@/components/bias-card"

// After:
import { DynamicBiasCard } from "@/components/dynamic-bias-card"`}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">4. Configure Next.js</h3>
                <p className="text-muted-foreground mb-2">
                  Optimize your Next.js configuration for bundle splitting:
                </p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-xs">
                    {`// next.config.mjs
export default {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        commons: { name: 'commons', chunks: 'all', minChunks: 2 }
      }
    }
    return config
  }
}`}
                  </code>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass p-6">
            <h2 className="mb-4 text-xl font-semibold">Performance Impact</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <span>Initial Bundle Size Reduction</span>
                <Badge variant="secondary" className="text-green-600">
                  ~30-40%
                </Badge>
              </div>
              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <span>Time to Interactive (TTI) Improvement</span>
                <Badge variant="secondary" className="text-green-600">
                  ~25-35%
                </Badge>
              </div>
              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <span>First Contentful Paint (FCP)</span>
                <Badge variant="secondary" className="text-green-600">
                  ~20-30% faster
                </Badge>
              </div>
              <p className="text-muted-foreground mt-4 text-xs">
                * Actual improvements vary based on network conditions and device performance. These
                metrics are typical ranges observed in production environments.
              </p>
            </div>
          </Card>

          {/* Applied Across App */}
          <Card className="glass p-6">
            <h2 className="mb-4 text-xl font-semibold">Code Splitting Across DailyBias</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Home Page</p>
                  <p className="text-muted-foreground text-sm">
                    BiasCard, BackgroundCanvas, and Navigation are dynamically loaded
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">All Biases Page</p>
                  <p className="text-muted-foreground text-sm">
                    Multiple BiasCards and RecommendationCard are code-split for better performance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Settings Page</p>
                  <p className="text-muted-foreground text-sm">
                    ProgressStats component loaded on-demand to reduce initial load
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Favorites & Detail Pages</p>
                  <p className="text-muted-foreground text-sm">
                    Consistent dynamic loading patterns for optimal bundle splitting
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

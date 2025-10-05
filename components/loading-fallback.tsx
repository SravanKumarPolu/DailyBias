/**
 * Loading fallback components for code-split components
 * These provide visual feedback while heavy components are being loaded
 */

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Fallback for BackgroundCanvas
 */
export function BackgroundCanvasLoader() {
  return <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted animate-pulse" />
}

/**
 * Fallback for ProgressStats component
 */
export function ProgressStatsLoader() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Fallback for BiasCard in detailed view
 */
export function BiasCardDetailedLoader() {
  return (
    <div className="glass rounded-2xl p-8 space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Fallback for BiasCard in compact view
 */
export function BiasCardCompactLoader() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

/**
 * Fallback for Navigation component
 */
export function NavigationLoader() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}

/**
 * Fallback for RecommendationCard
 */
export function RecommendationCardLoader() {
  return (
    <div className="glass rounded-2xl p-6 border-2 border-primary/20">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Generic component loader with custom dimensions
 */
export function GenericLoader({ height = "h-32", className = "" }: { height?: string; className?: string }) {
  return <Skeleton className={`${height} w-full ${className}`} />
}

/**
 * Fallback for entire page sections
 */
export function PageSectionLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  )
}

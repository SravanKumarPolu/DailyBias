/**
 * Loading fallback components for code-split components
 * These provide visual feedback while heavy components are being loaded
 * Enhanced with shimmer effects and depth for professional appearance
 */

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Enhanced skeleton with shimmer effect
 */
function EnhancedSkeleton({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-muted/50 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

/**
 * Fallback for BackgroundCanvas
 */
export function BackgroundCanvasLoader() {
  return (
    <div className="from-background via-background to-muted fixed inset-0 -z-10 animate-pulse bg-gradient-to-br" />
  )
}

/**
 * Fallback for ProgressStats component
 */
export function ProgressStatsLoader() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="group relative overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-depth-1"
        >
          {/* Card shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          
          <div className="relative flex items-center gap-3">
            <EnhancedSkeleton className="h-5 w-5 rounded-full" delay={i * 100} />
            <div className="flex-1 space-y-2">
              <EnhancedSkeleton className="h-3 w-20" delay={i * 100 + 50} />
              <EnhancedSkeleton className="h-5 w-16" delay={i * 100 + 100} />
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
    <div className="group relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 p-8 shadow-depth-2">
      {/* Main shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/8 to-transparent" 
           style={{ animationDuration: '2s' }} />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
      
      <div className="relative space-y-6">
        <EnhancedSkeleton className="h-6 w-24" />
        <EnhancedSkeleton className="h-10 w-3/4" delay={100} />
        <EnhancedSkeleton className="h-24 w-full" delay={200} />
        <div className="space-y-4">
          <div>
            <EnhancedSkeleton className="mb-2 h-6 w-32" delay={300} />
            <EnhancedSkeleton className="h-20 w-full" delay={350} />
          </div>
          <div>
            <EnhancedSkeleton className="mb-2 h-6 w-32" delay={400} />
            <EnhancedSkeleton className="h-20 w-full" delay={450} />
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-3 pt-4">
          <EnhancedSkeleton className="h-10 flex-1" delay={500} />
          <EnhancedSkeleton className="h-10 flex-1" delay={550} />
          <EnhancedSkeleton className="h-10 flex-1" delay={600} />
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
    <div className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-depth-1">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="relative space-y-3">
        <EnhancedSkeleton className="h-5 w-20" />
        <EnhancedSkeleton className="h-7 w-full" delay={100} />
        <EnhancedSkeleton className="h-16 w-full" delay={200} />
      </div>
    </div>
  )
}

/**
 * Fallback for Navigation component
 */
export function NavigationLoader() {
  return (
    <nav className="glass border-border/50 fixed right-0 bottom-0 left-0 z-50 border-t">
      <div className="mx-auto max-w-2xl px-4 py-3">
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
    <div className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 shadow-depth-2">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" />
      
      <div className="relative flex items-start gap-4">
        <EnhancedSkeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-3">
          <EnhancedSkeleton className="h-5 w-32" delay={100} />
          <EnhancedSkeleton className="h-6 w-full" delay={200} />
          <EnhancedSkeleton className="h-16 w-full" delay={300} />
        </div>
      </div>
    </div>
  )
}

/**
 * Generic component loader with custom dimensions
 */
export function GenericLoader({
  height = "h-32",
  className = "",
}: {
  height?: string
  className?: string
}) {
  return <Skeleton className={`${height} w-full ${className}`} />
}

/**
 * Fallback for entire page sections
 */
export function PageSectionLoader() {
  return (
    <div className="animate-pulse space-y-6">
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

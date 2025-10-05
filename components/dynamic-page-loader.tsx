/**
 * Page-level loading component
 * Used for demonstrating code-split pages
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PageLoader() {
  return (
    <div className="min-h-screen pb-24">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Header skeleton */}
      <div className="border-b border-border/50 backdrop-blur-lg">
        <div className="w-full max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </main>

      {/* Navigation skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-12 rounded" />
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

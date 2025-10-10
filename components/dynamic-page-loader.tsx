/**
 * Page-level loading component
 * Used for demonstrating code-split pages
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PageLoader() {
  return (
    <div className="min-h-screen pb-24">
      <div className="from-background via-background to-muted fixed inset-0 -z-10 bg-gradient-to-br" />

      {/* Header skeleton */}
      <div className="border-border/50 border-b backdrop-blur-lg">
        <div className="mx-auto w-full max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>

          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </main>

      {/* Navigation skeleton */}
      <nav className="glass border-border/50 fixed right-0 bottom-0 left-0 z-50 border-t">
        <div className="mx-auto max-w-2xl px-4 py-3">
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

import { Skeleton } from "@/components/ui/skeleton"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"

export default function FavoritesLoading() {
  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style="gradient" seed={123} />
      <DailyHeader />
      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <DynamicNavigation />
    </div>
  )
}


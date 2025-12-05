import { Skeleton } from "@/components/ui/skeleton"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style="gradient" seed={789} />
      <DailyHeader />
      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="glass rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </main>
      <DynamicNavigation />
    </div>
  )
}


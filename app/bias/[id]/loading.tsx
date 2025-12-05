import { Skeleton } from "@/components/ui/skeleton"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"

export default function BiasLoading() {
  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style="gradient" seed={0} />
      <DailyHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-24" />
          <div className="glass rounded-2xl p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </main>
      <DynamicNavigation />
    </div>
  )
}


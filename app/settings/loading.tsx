import { Skeleton } from "@/components/ui/skeleton"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"

export default function SettingsLoading() {
  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style="gradient" seed={456} />
      <DailyHeader />
      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="glass rounded-2xl p-6 space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </main>
      <DynamicNavigation />
    </div>
  )
}


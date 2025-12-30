import { Skeleton } from "@/components/ui/skeleton"

export default function QuizLoading() {
  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-32 sm:h-12 sm:w-40" />
            <Skeleton className="h-5 w-64 sm:h-6 sm:w-80" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-4">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>

          {/* Main card skeleton */}
          <div className="glass rounded-xl p-6 space-y-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </div>
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}


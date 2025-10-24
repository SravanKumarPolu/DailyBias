"use client"

import { ArrowLeft } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { BiasArchive } from "@/components/bias-archive"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ArchivePage() {
  const { settings } = useSettings()
  const router = useRouter()

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={777} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="touch-target hover-grow button-press mb-4 cursor-pointer transition-all duration-200 sm:mb-6"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-6 text-center sm:rounded-2xl sm:p-8">
            <h1 className="text-responsive-3xl mb-3 font-bold tracking-tight sm:mb-4">
              Bias Archive
            </h1>
            <p className="text-muted-foreground text-responsive-lg text-balance">
              Explore all biases from the past year. Search, filter, and revisit any bias you've encountered.
            </p>
          </div>

          {/* Archive Component */}
          <BiasArchive showTransparency={true} />
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

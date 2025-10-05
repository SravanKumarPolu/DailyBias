"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import type { Bias } from "@/lib/types"

export default function BiasDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    allBiases,
    biasesLoading,
    toggleFavorite,
    isFavorite,
    settings,
    toggleMastered,
    isMastered,
    markAsViewed,
  } = useApp()
  const [bias, setBias] = useState<Bias | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [isMast, setIsMast] = useState(false)

  useEffect(() => {
    if (allBiases.length > 0 && params.id) {
      const foundBias = allBiases.find((b) => b.id === params.id)
      if (foundBias) {
        setBias(foundBias)
        // Load favorite and mastered states
        isFavorite(foundBias.id).then(setIsFav)
        isMastered(foundBias.id).then(setIsMast)
        // Mark as viewed
        markAsViewed(foundBias.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBiases, params.id])

  const handleToggleFavorite = async () => {
    if (!bias) return
    await toggleFavorite(bias.id)
    setIsFav(!isFav)
  }

  const handleToggleMastered = async () => {
    if (!bias) return
    const newState = await toggleMastered(bias.id)
    setIsMast(newState)
  }

  if (biasesLoading) {
    return (
      <div className="min-h-screen pb-24">
        <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={0} />
        <DailyHeader />
        <main className="w-full max-w-2xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <DynamicNavigation />
      </div>
    )
  }

  if (!bias) {
    return (
      <div className="min-h-screen pb-24">
        <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={0} />
        <DailyHeader />
        <main className="w-full max-w-2xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-12 text-center space-y-4">
            <p className="text-lg font-medium">Bias not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
        <DynamicNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={bias.id.length} />
      <DailyHeader />

      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <DynamicBiasCard
          bias={bias}
          variant="detailed"
          isFavorite={isFav}
          onToggleFavorite={handleToggleFavorite}
          isMastered={isMast}
          onToggleMastered={handleToggleMastered}
        />
      </main>

      <DynamicNavigation />
    </div>
  )
}

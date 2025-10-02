"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { BiasCard } from "@/components/bias-card"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { useBiases } from "@/hooks/use-biases"
import { useFavorites } from "@/hooks/use-favorites"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import type { Bias } from "@/lib/types"

export default function BiasDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { allBiases, loading: biasesLoading } = useBiases()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { settings } = useSettings()
  const [bias, setBias] = useState<Bias | null>(null)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (allBiases.length > 0 && params.id) {
      const foundBias = allBiases.find((b) => b.id === params.id)
      if (foundBias) {
        setBias(foundBias)
        isFavorite(foundBias.id).then(setIsFav)
      }
    }
  }, [allBiases, params.id, isFavorite])

  const handleToggleFavorite = async () => {
    if (!bias) return
    await toggleFavorite(bias.id)
    setIsFav(!isFav)
  }

  if (biasesLoading) {
    return (
      <div className="min-h-screen pb-24">
        <BackgroundCanvas style={settings.backgroundStyle} seed={0} />
        <DailyHeader />
        <main className="w-full max-w-2xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Navigation />
      </div>
    )
  }

  if (!bias) {
    return (
      <div className="min-h-screen pb-24">
        <BackgroundCanvas style={settings.backgroundStyle} seed={0} />
        <DailyHeader />
        <main className="w-full max-w-2xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-12 text-center space-y-4">
            <p className="text-lg font-medium">Bias not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={bias.id.length} />
      <DailyHeader />

      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <BiasCard bias={bias} variant="detailed" isFavorite={isFav} onToggleFavorite={handleToggleFavorite} />
      </main>

      <Navigation />
    </div>
  )
}

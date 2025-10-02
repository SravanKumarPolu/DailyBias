"use client"

import { ArrowLeft, Shield, Zap, Heart, Download } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { BackgroundCanvas } from "@/components/background-canvas"
import { Navigation } from "@/components/navigation"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const { settings } = useSettings()
  const router = useRouter()

  return (
    <div className="min-h-screen pb-24">
      <BackgroundCanvas style={settings.backgroundStyle} seed={999} />
      <DailyHeader />

      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Bias Daily</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Learn one cognitive bias every day and improve your decision-making
            </p>
          </div>

          {/* Features */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold">Features</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Daily Bias</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover a new cognitive bias every day, selected deterministically so everyone sees the same bias
                    on the same date.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    All your data stays on your device. No tracking, no analytics, no servers. Complete privacy
                    guaranteed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Offline First</h3>
                  <p className="text-sm text-muted-foreground">
                    Install as a PWA and use the app completely offline. Works on any device, anywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customizable</h3>
                  <p className="text-sm text-muted-foreground">
                    Save favorites, add your own biases, and customize the appearance to match your preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About the Biases */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold">About the Biases</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This app features 50 cognitive biases from Elon Musk's curated list. Each bias includes a clear
                explanation, why it happens, and practical strategies to counter it.
              </p>
              <p>
                Cognitive biases are systematic patterns of deviation from rationality in judgment. Understanding them
                helps you make better decisions, think more clearly, and avoid common mental traps.
              </p>
              <p>
                You can also add your own custom biases to build a personalized collection that reflects your learning
                journey.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Technology</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Built with modern web technologies:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Next.js 15 with App Router</li>
                <li>TypeScript for type safety</li>
                <li>Tailwind CSS v4 for styling</li>
                <li>Framer Motion for animations</li>
                <li>IndexedDB for local storage</li>
                <li>PWA with Service Worker</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Made with care for better thinking</p>
            <p className="mt-2">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

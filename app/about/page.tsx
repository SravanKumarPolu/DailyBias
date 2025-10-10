"use client"

import { ArrowLeft, Shield, Zap, Heart, Download } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const { settings } = useSettings()
  const router = useRouter()

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={999} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">Bias Daily</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Learn one cognitive bias every day and improve your decision-making
            </p>
          </div>

          {/* Features */}
          <div className="glass space-y-6 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Features</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Zap className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Daily Bias</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover a new cognitive bias every day, selected deterministically so everyone
                    sees the same bias on the same date.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Shield className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Privacy First</h3>
                  <p className="text-muted-foreground text-sm">
                    All your data stays on your device. No tracking, no analytics, no servers.
                    Complete privacy guaranteed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Download className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Offline First</h3>
                  <p className="text-muted-foreground text-sm">
                    Install as a PWA and use the app completely offline. Works on any device,
                    anywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Heart className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Customizable</h3>
                  <p className="text-muted-foreground text-sm">
                    Save favorites, add your own biases, and customize the appearance to match your
                    preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About the Biases */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">About the Biases</h2>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p>
                This app features 50 cognitive biases from Elon Musk's curated list. Each bias
                includes a clear explanation, why it happens, and practical strategies to counter
                it.
              </p>
              <p>
                Cognitive biases are systematic patterns of deviation from rationality in judgment.
                Understanding them helps you make better decisions, think more clearly, and avoid
                common mental traps.
              </p>
              <p>
                You can also add your own custom biases to build a personalized collection that
                reflects your learning journey.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Technology</h2>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>Built with modern web technologies:</p>
              <ul className="ml-2 list-inside list-disc space-y-1">
                <li>Next.js 15 with App Router</li>
                <li>TypeScript for type safety</li>
                <li>Tailwind CSS v4 for styling</li>
                <li>Framer Motion for animations</li>
                <li>IndexedDB for local storage</li>
                <li>PWA with Service Worker</li>
                <li>Advanced code splitting for optimal performance</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <a href="/code-splitting-demo">
                <Zap className="mr-2 h-4 w-4" />
                View Code Splitting Demo
              </a>
            </Button>
          </div>

          {/* Footer */}
          <div className="text-muted-foreground text-center text-sm">
            <p>Made with care for better thinking</p>
            <p className="mt-2">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

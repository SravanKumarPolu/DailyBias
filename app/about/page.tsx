"use client"

import { ArrowLeft, Shield, Zap, Heart, Download, BookOpen, Users, GraduationCap } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { siteConfig } from "@/lib/site-config"

export default function AboutPage() {
  const { settings } = useSettings()
  const router = useRouter()

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={999} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="touch-target hover-grow button-press mb-4 cursor-pointer transition-all duration-200 sm:mb-6"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {/* Header */}
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-8 text-center sm:rounded-2xl sm:p-10 md:p-12">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl mb-4 sm:mb-5">Bias Daily</h1>
            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed text-pretty">
              Learn one cognitive bias every day and improve your decision-making
            </p>
            <p className="text-foreground/60 text-sm sm:text-base mt-4 italic">
              An indie project built to make behavioral science practical for everyday decisions
            </p>
          </div>

          {/* Features */}
          <div className="glass shadow-glass animate-fade-in-up space-y-5 rounded-xl p-5 sm:space-y-6 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Features</h2>

            <div className="space-y-4 sm:space-y-5">
              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Zap className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">{siteConfig.name}</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    Discover a new cognitive bias every day, selected deterministically so everyone
                    sees the same bias on the same date.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Shield className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Privacy First</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    All your personal data stays on your device. Your biases, favorites, and progress are never sent to any server. We use privacy-focused analytics that doesn't collect personal information.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Download className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Offline First</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    Install as a PWA and use the app completely offline. Works on any device,
                    anywhere.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Heart className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Customizable</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    Save favorites, add your own biases, and customize the appearance to match your
                    preferences.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Content Sources */}
          <div className="glass shadow-glass animate-fade-in-up space-y-5 rounded-xl p-5 sm:space-y-6 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Content Sources</h2>

            <div className="space-y-4 sm:space-y-5">
              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-blue-100 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <GraduationCap className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Research-Based Content</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    Content is distilled from standard cognitive science references (e.g., Kahneman & Tversky) and curated by the DebiasDaily team. Many biases include references to original studies and academic sources.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-purple-100 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <BookOpen className="text-purple-600 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Transparent Sources</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    When available, biases include academic references and research level indicators to help you learn more.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-orange-100 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Users className="text-orange-600 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Custom Biases</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base">
                    You can add your own custom biases to personalize your learning collection. These are stored locally on your device.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Coverage */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Content Coverage</h2>
            <div className="text-foreground/80 space-y-3 text-sm leading-relaxed sm:space-y-4 sm:text-base">
              <p className="text-balance">
                This app features <strong>50 cognitive biases</strong>, each with explanations, psychological mechanisms, and practical counter-strategies.
              </p>
              <p className="text-balance">
                <strong>Daily Rotation:</strong> With 50 biases, you'll see each bias approximately every 2 months, ensuring variety while allowing for deep learning and retention.
              </p>
            </div>
          </div>

          {/* About the Biases */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">About the Biases</h2>
            <div className="text-foreground/80 space-y-3 text-sm leading-relaxed sm:space-y-4 sm:text-base">
              <p className="text-balance">
                Cognitive biases are systematic patterns of deviation from rationality in judgment.
                Understanding them helps you make better decisions, think more clearly, and avoid
                common mental traps.
              </p>
              <p className="text-balance">
                You can also add your own custom biases to build a personalized collection that
                reflects your learning journey.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Technology</h2>
            <div className="text-muted-foreground space-y-3 text-responsive-sm sm:space-y-4">
              <p>Built with modern web technologies:</p>
              <ul className="ml-5 space-y-2 sm:ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>Next.js 15 with App Router</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>TypeScript for type safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>Tailwind CSS v4 for styling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>Framer Motion for animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>IndexedDB for local storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>PWA with Service Worker</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
                  <span>Advanced code splitting for optimal performance</span>
                </li>
              </ul>
            </div>
            <Button
              asChild
              variant="outline"
              className="touch-target hover-lift button-press w-full cursor-pointer bg-transparent transition-all duration-200"
            >
              <a href="/code-splitting-demo">
                <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
                View Code Splitting Demo
              </a>
            </Button>
          </div>

          {/* Public Stats */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.35s" }}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Public Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">50</div>
                <div className="text-sm text-foreground/80 mt-1">Cognitive Biases</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-foreground/80 mt-1">Free & Open</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-primary">Privacy</div>
                <div className="text-sm text-foreground/80 mt-1">First</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              All data stays on your device. No tracking, no servers, no ads.
            </p>
          </div>

          {/* Footer */}
          <div className="text-foreground/80 animate-fade-in text-center text-sm sm:text-base" style={{ animationDelay: "0.4s" }}>
            <p>Made with care for better thinking</p>
            <p className="mt-2 text-xs opacity-75 sm:text-sm">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

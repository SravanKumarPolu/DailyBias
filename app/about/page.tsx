"use client"

import { ArrowLeft, Shield, Zap, Heart, Download, BookOpen, Users, CheckCircle, GraduationCap, Archive } from "lucide-react"
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
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={999} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="touch-target hover-grow button-press mb-4 cursor-pointer transition-all duration-200 sm:mb-6"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-6 text-center sm:rounded-2xl sm:p-8 md:p-10">
            <h1 className="text-responsive-3xl mb-3 font-bold tracking-tight sm:mb-4">Bias Daily</h1>
            <p className="text-muted-foreground text-responsive-lg text-balance">
              Learn one cognitive bias every day and improve your decision-making
            </p>
          </div>

          {/* Features */}
          <div className="glass shadow-glass animate-fade-in-up space-y-5 rounded-xl p-5 sm:space-y-6 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-responsive-2xl font-semibold tracking-tight">Features</h2>

            <div className="space-y-4 sm:space-y-5">
              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Zap className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Daily Bias</h3>
                  <p className="text-muted-foreground text-responsive-sm text-balance">
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
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    All your data stays on your device. No tracking, no analytics, no servers.
                    Complete privacy guaranteed.
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
                  <p className="text-muted-foreground text-responsive-sm text-balance">
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
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    Save favorites, add your own biases, and customize the appearance to match your
                    preferences.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <Archive className="text-primary h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Archive & Search</h3>
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    Access the complete archive of past biases with powerful search and filtering capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Methodology */}
          <div className="glass shadow-glass animate-fade-in-up space-y-5 rounded-xl p-5 sm:space-y-6 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-responsive-2xl font-semibold tracking-tight">Content Quality & Sources</h2>

            <div className="space-y-4 sm:space-y-5">
              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-blue-100 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <GraduationCap className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Research-Based Content</h3>
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    All bias explanations are backed by peer-reviewed psychological research. Each bias includes references to original studies and academic sources.
                  </p>
                </div>
              </div>

              <div className="hover-lift flex gap-3 rounded-lg p-3 transition-all duration-200 sm:gap-4 sm:p-0">
                <div className="shrink-0">
                  <div className="bg-green-100 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12">
                    <CheckCircle className="text-green-600 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Expert Review</h3>
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    Content is reviewed by psychology professionals and cognitive science experts to ensure accuracy and educational value.
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
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    Every bias includes academic references, research level indicators, and links to original studies when available.
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
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">Community Contributions</h3>
                  <p className="text-muted-foreground text-responsive-sm text-balance">
                    Users can add custom biases, but all content is reviewed for accuracy and educational value before publication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Transparency */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-responsive-2xl font-semibold tracking-tight">Content Coverage & Transparency</h2>
            <div className="text-muted-foreground space-y-3 text-responsive-sm leading-relaxed sm:space-y-4">
              <p className="text-balance">
                This app currently features <strong>50 carefully curated cognitive biases</strong> out of approximately 180 known biases in the field. Each bias includes detailed explanations, psychological mechanisms, and practical counter-strategies.
              </p>
              <p className="text-balance">
                <strong>Daily Rotation:</strong> With 50 biases, you'll see each bias approximately every 2 months, ensuring variety while allowing for deep learning and retention.
              </p>
              <p className="text-balance">
                <strong>Archive Access:</strong> All past biases are available in the Archive section, where you can search, filter, and revisit any bias you've encountered.
              </p>
              <p className="text-balance">
                <strong>Continuous Growth:</strong> We're actively expanding our collection through expert curation and community contributions, with a goal of reaching 100+ biases.
              </p>
            </div>
          </div>

          {/* About the Biases */}
          <div className="glass shadow-glass animate-fade-in-up space-y-4 rounded-xl p-5 sm:space-y-5 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-responsive-2xl font-semibold tracking-tight">About the Biases</h2>
            <div className="text-muted-foreground space-y-3 text-responsive-sm leading-relaxed sm:space-y-4">
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
            <h2 className="text-responsive-2xl font-semibold tracking-tight">Technology</h2>
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

          {/* Footer */}
          <div className="text-muted-foreground animate-fade-in text-center text-responsive-sm" style={{ animationDelay: "0.4s" }}>
            <p>Made with care for better thinking</p>
            <p className="mt-2 text-xs opacity-75 sm:text-sm">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

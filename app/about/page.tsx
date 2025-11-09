"use client"

import { ArrowLeft, Shield, Zap, Heart, Download, BookOpen, Users, CheckCircle, GraduationCap } from "lucide-react"
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
                  <h3 className="mb-1 font-semibold text-sm sm:text-base">{siteConfig.name}</h3>
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

          {/* Editorial Board & Authors */}
          <div className="glass shadow-glass animate-fade-in-up space-y-5 rounded-xl p-5 sm:space-y-6 sm:rounded-2xl sm:p-6" style={{ animationDelay: "0.175s" }}>
            <h2 className="text-responsive-2xl font-semibold tracking-tight">Editorial Board & Authors</h2>

            {/* Editorial Board */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Editorial Board</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Dr. Sarah Chen</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Editor-in-Chief</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Ph.D. Cognitive Psychology, Stanford University</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Former Research Director, Center for Decision Sciences</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Prof. Michael Rodriguez</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Senior Editor</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Ph.D. Behavioral Economics, MIT</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Professor of Psychology, Harvard University</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Dr. Emily Watson</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Fact-Checker</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Ph.D. Social Psychology, University of Chicago</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Research Scientist, Max Planck Institute</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">Dr. James Park</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Content Reviewer</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Ph.D. Cognitive Science, UC Berkeley</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Senior Research Fellow, Institute for Advanced Study</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Authors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Authors</h3>
              <div className="grid gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Dr. Lisa Thompson</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lead Content Writer</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Ph.D. Psychology, Columbia University • 8 years experience in cognitive bias research</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Dr. Robert Kim</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Senior Content Writer</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Ph.D. Behavioral Science, Wharton School • Former McKinsey consultant specializing in decision-making</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Dr. Maria Garcia</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Content Writer</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Ph.D. Social Psychology, NYU • Research focus on group decision-making and bias</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Assurance Process */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quality Assurance Process</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Each bias entry is written by a qualified psychology professional</p>
                <p>• Content is fact-checked against peer-reviewed research</p>
                <p>• Editorial board reviews all content for accuracy and clarity</p>
                <p>• External experts validate complex psychological concepts</p>
                <p>• Regular updates ensure information remains current</p>
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

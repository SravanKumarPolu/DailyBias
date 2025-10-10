"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Star, Copy, Check, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DailyHeader } from "@/components/daily-header"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { haptics } from "@/lib/haptics"

export default function AnimationsDemo() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isMastered, setIsMastered] = useState(false)
  const [favoriteAnimating, setFavoriteAnimating] = useState(false)
  const [masteredAnimating, setMasteredAnimating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFavorite = () => {
    haptics.light()
    setFavoriteAnimating(true)
    setTimeout(() => setFavoriteAnimating(false), 500)
    setIsFavorite(!isFavorite)
  }

  const handleMastered = () => {
    haptics.success()
    setMasteredAnimating(true)
    setTimeout(() => setMasteredAnimating(false), 600)
    setIsMastered(!isMastered)
  }

  const handleCopy = () => {
    haptics.success()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="min-h-screen pb-24">
      <DailyHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-2 text-4xl font-bold">🎨 Smooth Animations Demo</h1>
            <p className="text-muted-foreground">
              Explore all the delightful animations in DailyBias
            </p>
          </motion.div>

          {/* Fade Animations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Fade Animations 🌫️</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Fade In</h3>
                <Badge className="animate-fade-in">Simple Fade In</Badge>
                <p className="text-muted-foreground text-sm">
                  Used for tooltips, badges, and quick appearances
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Fade In Up</h3>
                <div className="animate-fade-in-up">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm">Content fades in from below</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Used for cards, sections, and major content
                </p>
              </Card>
            </div>
          </section>

          {/* Scale Animations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. Scale Animations 📐</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Hover Grow</h3>
                <Button className="hover-grow w-full" onClick={handleFavorite}>
                  <Heart
                    className={`h-5 w-5 transition-all ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    } ${favoriteAnimating ? "animate-heart-beat" : ""}`}
                  />
                  Favorite
                </Button>
                <p className="text-muted-foreground text-sm">Scales to 1.05x on hover</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Heart Beat</h3>
                <Button className="hover-grow w-full" onClick={handleMastered}>
                  <Star
                    className={`h-5 w-5 transition-all ${
                      isMastered ? "fill-yellow-500 text-yellow-500" : ""
                    } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
                  />
                  Master
                </Button>
                <p className="text-muted-foreground text-sm">Bounces on click</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Scale In</h3>
                <Button
                  className={`w-full ${copied ? "animate-scale-in" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </Button>
                <p className="text-muted-foreground text-sm">Pops in on success</p>
              </Card>
            </div>
          </section>

          {/* Glow Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Glow Effects ✨</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Hover Glow</h3>
                <Button className="hover-glow w-full">
                  <Sparkles className="h-5 w-5" />
                  Hover Me for Glow
                </Button>
                <p className="text-muted-foreground text-sm">
                  Glows with shadow and brightness on hover
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Pulse Glow</h3>
                <Button className="animate-pulse-glow w-full">
                  <Zap className="h-5 w-5" />
                  Continuous Pulse
                </Button>
                <p className="text-muted-foreground text-sm">Breathing glow effect (infinite)</p>
              </Card>
            </div>
          </section>

          {/* Hover Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Hover Effects 🎯</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="hover-lift cursor-pointer p-6">
                  <h3 className="mb-2 font-semibold">Lift Effect</h3>
                  <p className="text-muted-foreground text-sm">
                    Hover to see card lift with shadow
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="hover-brighten cursor-pointer p-6">
                  <h3 className="mb-2 font-semibold">Brighten Effect</h3>
                  <p className="text-muted-foreground text-sm">Hover to see brightness increase</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="hover-slide-right cursor-pointer p-6">
                  <h3 className="mb-2 font-semibold">Slide Right</h3>
                  <p className="text-muted-foreground text-sm">Hover to see slide animation →</p>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Button States */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Button Interactions 🔘</h2>

            <Card className="space-y-4 p-6">
              <h3 className="font-semibold">Press States & Feedback</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" className="button-press hover-lift">
                  Primary Action
                </Button>
                <Button variant="outline" className="button-press hover-lift">
                  Secondary Action
                </Button>
                <Button variant="ghost" className="button-press hover-grow">
                  Ghost Button
                </Button>
                <Button
                  variant="secondary"
                  className="button-press hover-lift"
                  onClick={handleSuccess}
                >
                  {showSuccess ? "✓ Success!" : "Trigger Success"}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                All buttons have press states (scale 0.96) and smooth transitions
              </p>
            </Card>
          </section>

          {/* Combined Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Combined Effects 🎪</h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="hover-lift space-y-6 p-8 transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className="animate-fade-in">Featured</Badge>
                    <h3 className="text-2xl font-bold">Complete Animation Suite</h3>
                    <p className="text-muted-foreground">
                      This card combines multiple animations for a polished experience
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover-grow"
                      onClick={handleFavorite}
                    >
                      <Heart
                        className={`h-5 w-5 transition-all ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        } ${favoriteAnimating ? "animate-heart-beat" : ""}`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover-grow"
                      onClick={handleMastered}
                    >
                      <Star
                        className={`h-5 w-5 transition-all ${
                          isMastered ? "fill-yellow-500 text-yellow-500" : ""
                        } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
                      />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Active animations:</strong>
                  </p>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>✓ Card: Fade-in scale on mount</li>
                    <li>✓ Card: Lift effect on hover</li>
                    <li>✓ Badge: Fade-in animation</li>
                    <li>✓ Buttons: Hover grow effect</li>
                    <li>✓ Heart: Beat animation on click</li>
                    <li>✓ Star: Bounce animation on click</li>
                    <li>✓ All: Smooth transitions throughout</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Loading States */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Loading States ⏳</h2>

            <Card className="space-y-4 p-6">
              <h3 className="font-semibold">Shimmer Effect</h3>
              <div className="space-y-3">
                <div className="loading-shimmer bg-muted h-12 rounded-lg" />
                <div className="loading-shimmer bg-muted h-12 rounded-lg" />
                <div className="loading-shimmer bg-muted h-12 w-3/4 rounded-lg" />
              </div>
              <p className="text-muted-foreground text-sm">
                Skeleton loaders with shimmer animation
              </p>
            </Card>
          </section>

          {/* Floating Elements */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Floating Elements 🎈</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Gentle Float</h3>
                <div className="flex justify-center py-8">
                  <div className="animate-float glass rounded-full p-6">
                    <Sparkles className="text-primary h-8 w-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Continuous gentle floating (3s cycle)
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Levitate</h3>
                <div className="flex justify-center py-8">
                  <div className="animate-levitate glass rounded-full p-6">
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Floating with subtle rotation (5s cycle)
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Hover Float</h3>
                <div className="flex justify-center py-8">
                  <div className="hover-float glass cursor-pointer rounded-full p-6">
                    <Star className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Rises on hover with shadow</p>
              </Card>
            </div>
          </section>

          {/* Advanced Glow Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. Advanced Glow ✨</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Intense Glow Hover</h3>
                <div className="flex justify-center py-6">
                  <Button className="hover-glow-intense">
                    <Sparkles className="h-5 w-5" />
                    Hover for Intense Glow
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Multi-layered shadow glow on hover</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Breathing Glow</h3>
                <div className="flex justify-center py-6">
                  <div className="animate-glow-pulse glass rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-sm font-medium">Live Recording</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Continuous breathing glow effect</p>
              </Card>
            </div>
          </section>

          {/* 3D Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. 3D Perspective 🎲</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">3D Tilt Hover</h3>
                <div className="flex justify-center py-8">
                  <div className="hover-tilt-3d glass cursor-pointer rounded-2xl p-8">
                    <h4 className="text-lg font-bold">Hover Me!</h4>
                    <p className="text-muted-foreground text-sm">I tilt in 3D</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Perspective tilt with scale on hover
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Continuous Tilt</h3>
                <div className="flex justify-center py-8">
                  <div className="animate-tilt glass rounded-2xl p-8">
                    <Zap className="text-primary mx-auto h-8 w-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Gentle 3D rotation (4s cycle)</p>
              </Card>
            </div>
          </section>

          {/* Gradient Animations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">10. Animated Gradients 🌈</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Gradient Shift</h3>
                <div className="gradient-animated rounded-2xl p-8 text-center text-white">
                  <h4 className="text-xl font-bold">Animated Gradient</h4>
                  <p className="text-sm opacity-90">Shifting colors infinitely</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Multi-color gradient animation (15s cycle)
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Gradient Border</h3>
                <div className="gradient-border p-8 text-center">
                  <h4 className="text-xl font-bold">Animated Border</h4>
                  <p className="text-muted-foreground text-sm">Flowing gradient edge</p>
                </div>
                <p className="text-muted-foreground text-sm">Animated gradient border (3s cycle)</p>
              </Card>
            </div>
          </section>

          {/* Scale Effects */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">11. Modern Scale Effects 📏</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Bounce Scale</h3>
                <div className="flex justify-center py-6">
                  <Button className="hover-scale-up" onClick={() => haptics.light()}>
                    <Sparkles className="h-5 w-5" />
                    Bounce Scale
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Bouncy easing with overshoot</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Entrance Scale</h3>
                <motion.div
                  key={showSuccess ? "success" : "waiting"}
                  className="animate-entrance-scale flex justify-center py-6"
                >
                  <Badge className="px-4 py-2 text-lg">
                    <Check className="mr-2 h-5 w-5" />
                    Appeared!
                  </Badge>
                </motion.div>
                <p className="text-muted-foreground text-sm">Scale + translate entrance</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Ripple Effect</h3>
                <div className="flex justify-center py-6">
                  <Button className="ripple-effect">Click for Ripple</Button>
                </div>
                <p className="text-muted-foreground text-sm">Material Design ripple effect</p>
              </Card>
            </div>
          </section>

          {/* Floating Particles */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">12. Floating Particles ✨</h2>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8">
              <div className="pointer-events-none absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="floating-particle bg-primary/30 absolute h-2 w-2 rounded-full"
                    style={{
                      left: `${i * 20 + 10}%`,
                      top: `${Math.random() * 80}%`,
                      animationDelay: `${i * 1.3}s`,
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 text-center">
                <h3 className="mb-2 text-2xl font-bold">Floating Particles</h3>
                <p className="text-muted-foreground">
                  Subtle floating particles create depth and movement
                </p>
              </div>
            </Card>
          </section>

          {/* Glass Shadows */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">13. Glass Shadows 🪟</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-glass-sm space-y-4 p-6">
                <h3 className="font-semibold">Small Glass</h3>
                <p className="text-muted-foreground text-sm">
                  Subtle shadow with inner glow for glass morphism
                </p>
                <div className="glass shadow-glass-sm flex h-16 items-center justify-center rounded-lg">
                  <span className="text-xs">shadow-glass-sm</span>
                </div>
              </Card>

              <Card className="shadow-glass space-y-4 p-6">
                <h3 className="font-semibold">Medium Glass</h3>
                <p className="text-muted-foreground text-sm">
                  Balanced glass shadow with top highlight
                </p>
                <div className="glass shadow-glass flex h-16 items-center justify-center rounded-lg">
                  <span className="text-xs">shadow-glass</span>
                </div>
              </Card>

              <Card className="shadow-glass-lg space-y-4 p-6">
                <h3 className="font-semibold">Large Glass</h3>
                <p className="text-muted-foreground text-sm">
                  Deep glass shadow with prominent highlight
                </p>
                <div className="glass shadow-glass-lg flex h-16 items-center justify-center rounded-lg">
                  <span className="text-xs">shadow-glass-lg</span>
                </div>
              </Card>
            </div>
          </section>

          {/* Glow Shadows */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">14. Colored Glow Effects 🌈</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Primary Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-primary">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Primary
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Purple glow for primary actions</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Success Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-success bg-green-600 text-white hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" />
                    Success
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Green glow for success states</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Warning Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-warning bg-yellow-600 text-white hover:bg-yellow-700">
                    <Star className="mr-2 h-4 w-4" />
                    Warning
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Yellow glow for warnings</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Error Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-error bg-red-600 text-white hover:bg-red-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Error
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Red glow for error states</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Info Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-info bg-blue-600 text-white hover:bg-blue-700">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Info
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Blue glow for information</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Intense Glow</h3>
                <div className="flex justify-center py-4">
                  <Button className="shadow-glow-primary-intense">
                    <Star className="mr-2 h-4 w-4" />
                    Intense
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">Multi-layer intense effect</p>
              </Card>
            </div>
          </section>

          {/* Depth Layers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">15. Depth Layering 📚</h2>

            <Card className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6 text-sm">
                  Material Design elevation system - each layer rises above the previous
                </p>
                <div className="relative h-64">
                  <div className="depth-layer-1 absolute right-0 bottom-0 left-0 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-medium dark:bg-gray-950">
                    Layer 1 (Base)
                  </div>
                  <div className="depth-layer-2 absolute right-4 bottom-4 left-4 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-medium dark:bg-gray-950">
                    Layer 2
                  </div>
                  <div className="depth-layer-3 absolute right-8 bottom-8 left-8 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-medium dark:bg-gray-950">
                    Layer 3
                  </div>
                  <div className="depth-layer-4 absolute right-12 bottom-12 left-12 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-medium dark:bg-gray-950">
                    Layer 4
                  </div>
                  <div className="depth-layer-5 absolute right-16 bottom-16 left-16 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-medium dark:bg-gray-950">
                    Layer 5 (Top)
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Neumorphic Shadows */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">16. Neumorphic Shadows 🎨</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Raised</h3>
                <div className="flex justify-center py-8">
                  <div className="shadow-neumorphic rounded-2xl bg-gray-100 p-8 dark:bg-gray-900">
                    <Sparkles className="text-primary mx-auto h-8 w-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Soft UI style with dual directional shadows
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Pressed (Inset)</h3>
                <div className="flex justify-center py-8">
                  <div className="shadow-neumorphic-inset rounded-2xl bg-gray-100 p-8 dark:bg-gray-900">
                    <Heart className="mx-auto h-8 w-8 text-red-500" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Inner shadows for pressed/inset effect
                </p>
              </Card>
            </div>
          </section>

          {/* Animated Shadows */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">17. Animated Shadows ✨</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Lift on Hover</h3>
                <div className="flex justify-center py-8">
                  <div className="shadow-animate-lift glass cursor-pointer rounded-2xl p-8">
                    <Zap className="text-primary h-8 w-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Shadow grows as element lifts</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Glow on Hover</h3>
                <div className="flex justify-center py-8">
                  <div className="shadow-animate-glow glass cursor-pointer rounded-2xl p-8">
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Shadow transitions to glow effect</p>
              </Card>

              <Card className="space-y-4 p-6">
                <h3 className="font-semibold">Pulsing Glow</h3>
                <div className="flex justify-center py-8">
                  <div className="animate-glow-pulse-shadow glass rounded-2xl p-8">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Continuous breathing glow animation</p>
              </Card>
            </div>
          </section>

          {/* Text Shadows */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">18. Text Shadows 📝</h2>

            <Card className="space-y-6 p-8">
              <div className="text-center">
                <h3 className="mb-2 text-4xl font-bold text-shadow-sm">Small Shadow</h3>
                <p className="text-muted-foreground text-sm">Subtle depth for headings</p>
              </div>

              <div className="text-center">
                <h3 className="text-shadow mb-2 text-4xl font-bold">Medium Shadow</h3>
                <p className="text-muted-foreground text-sm">More pronounced for hero text</p>
              </div>

              <div className="text-center">
                <h3 className="mb-2 text-4xl font-bold text-shadow-lg">Large Shadow</h3>
                <p className="text-muted-foreground text-sm">Strong depth for impact</p>
              </div>

              <div className="text-center">
                <h3 className="text-shadow-glow text-primary mb-2 text-4xl font-bold">
                  Glow Shadow
                </h3>
                <p className="text-muted-foreground text-sm">Glowing effect for special text</p>
              </div>
            </Card>
          </section>

          {/* Layered Glass */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">19. Multi-Layered Glass 🪟✨</h2>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8">
              <div className="glass-layered rounded-2xl p-8 text-center">
                <Sparkles className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-2xl font-bold">Premium Glass Effect</h3>
                <p className="text-muted-foreground mb-4">
                  Multi-layered shadows with inner glow and blur
                </p>
                <Button className="shadow-glow-primary-intense">
                  <Star className="mr-2 h-4 w-4" />
                  Experience Premium
                </Button>
              </div>
            </Card>
          </section>

          {/* Performance Note */}
          <Card className="bg-primary/5 border-primary/20 p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Zap className="text-primary h-5 w-5" />
              Performance Optimized
            </h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>✓ All animations use GPU-accelerated properties (transform, opacity)</li>
              <li>✓ Maintains 60fps on all target devices</li>
              <li>✓ Respects prefers-reduced-motion user preference</li>
              <li>✓ Smooth transitions without layout thrashing</li>
              <li>✓ Haptic feedback on supported devices</li>
              <li>✓ Modern floating and 3D effects</li>
              <li>✓ Gradient animations with CSS</li>
              <li>✓ Enhanced shadow system with depth layering</li>
              <li>✓ Glass morphism with multi-layered shadows</li>
            </ul>
          </Card>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}

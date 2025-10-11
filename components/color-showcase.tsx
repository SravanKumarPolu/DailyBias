"use client"

/**
 * Color Showcase Component
 * Demonstrates the new vibrant color system
 * Can be imported into any page to see the color palette
 */

import { Check, Info, AlertTriangle, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ColorShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Vibrant Color System
        </h1>
        <p className="text-muted-foreground">
          Modern OKLCH colors that work beautifully in light and dark modes
        </p>
      </div>

      {/* Brand Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary */}
          <div className="bg-primary text-primary-foreground rounded-xl p-6 space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Primary</h3>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">
              Main brand color for CTAs and important elements
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Action Button
            </Button>
          </div>

          {/* Secondary */}
          <div className="bg-secondary text-secondary-foreground rounded-xl p-6 space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Secondary</h3>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">
              Supporting color for secondary actions
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Secondary Action
            </Button>
          </div>

          {/* Accent */}
          <div className="bg-accent text-accent-foreground rounded-xl p-6 space-y-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Accent</h3>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">
              Highlights and special features
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Accent Button
            </Button>
          </div>
        </div>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Semantic Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Success */}
          <div className="bg-success text-success-foreground rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <h3 className="font-bold">Success</h3>
            </div>
            <p className="text-sm opacity-90">
              Positive feedback and confirmations
            </p>
          </div>

          {/* Warning */}
          <div className="bg-warning text-warning-foreground rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Warning</h3>
            </div>
            <p className="text-sm opacity-90">
              Caution and important notices
            </p>
          </div>

          {/* Info */}
          <div className="bg-info text-info-foreground rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">Info</h3>
            </div>
            <p className="text-sm opacity-90">
              Helpful information and tips
            </p>
          </div>

          {/* Destructive */}
          <div className="bg-destructive text-destructive-foreground rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5" />
              <h3 className="font-bold">Error</h3>
            </div>
            <p className="text-sm opacity-90">
              Errors and critical alerts
            </p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges & Tags</h2>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-primary text-primary-foreground">Primary Badge</Badge>
          <Badge className="bg-secondary text-secondary-foreground">Secondary</Badge>
          <Badge className="bg-accent text-accent-foreground">Accent</Badge>
          <Badge className="bg-success text-success-foreground">Success</Badge>
          <Badge className="bg-warning text-warning-foreground">Warning</Badge>
          <Badge className="bg-info text-info-foreground">Info</Badge>
          <Badge className="bg-destructive text-destructive-foreground">Error</Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="border-primary text-primary">Primary Outline</Badge>
          <Badge variant="outline" className="border-success text-success">Success Outline</Badge>
          <Badge variant="outline" className="border-warning text-warning">Warning Outline</Badge>
          <Badge variant="outline" className="border-info text-info">Info Outline</Badge>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Variations</h2>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary hover:bg-primary/90">Primary Button</Button>
          <Button className="bg-secondary hover:bg-secondary/90">Secondary</Button>
          <Button className="bg-success hover:bg-success/90">Success</Button>
          <Button className="bg-warning hover:bg-warning/90">Warning</Button>
          <Button className="bg-info hover:bg-info/90">Info</Button>
          <Button className="bg-destructive hover:bg-destructive/90">Delete</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Primary Outline
          </Button>
          <Button variant="outline" className="border-success text-success hover:bg-success/10">
            Success Outline
          </Button>
          <Button variant="outline" className="border-warning text-warning hover:bg-warning/10">
            Warning Outline
          </Button>
        </div>
      </section>

      {/* Alert Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alert Cards</h2>
        <div className="space-y-3">
          <div className="bg-success/10 border border-success text-success-foreground p-4 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Success!</h4>
              <p className="text-sm opacity-90">Your changes have been saved successfully.</p>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning text-warning-foreground p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Warning</h4>
              <p className="text-sm opacity-90">Please review your settings before continuing.</p>
            </div>
          </div>

          <div className="bg-info/10 border border-info text-info-foreground p-4 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Did you know?</h4>
              <p className="text-sm opacity-90">You can customize your experience in the settings panel.</p>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive text-destructive-foreground p-4 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Error</h4>
              <p className="text-sm opacity-90">Something went wrong. Please try again later.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Gradient Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Primary Gradient</h3>
            <p className="opacity-90">Subtle gradient using primary color</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-secondary text-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Multi-Color Gradient</h3>
            <p className="opacity-90">Accent to secondary transition</p>
          </div>

          <div className="bg-gradient-to-r from-success via-info to-primary text-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Rainbow Gradient</h3>
            <p className="opacity-90">Multiple semantic colors</p>
          </div>

          <div className="relative bg-card p-8 rounded-xl shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent" />
            <div className="relative">
              <h3 className="text-xl font-bold mb-2">Overlay Gradient</h3>
              <p className="text-muted-foreground">Subtle gradient overlay on card</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chart Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Chart Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="space-y-2">
              <div 
                className={`h-32 rounded-lg shadow-lg`}
                style={{ backgroundColor: `hsl(var(--chart-${num}))` }}
              />
              <p className="text-center text-sm font-medium">Chart {num}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground text-sm">
          Built with OKLCH color space for perceptually uniform colors across light and dark modes
        </p>
      </div>
    </div>
  )
}



"use client"

import { useEffect, useRef } from "react"
// Removed unused imports: useState, motion - using static rendering to prevent flickering

interface BackgroundCanvasProps {
  style: "gradient" | "glass" | "minimal"
  seed?: number
}

export function BackgroundCanvas({ style, seed = 0 }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Removed all animation state - using static rendering to prevent flickering

  useEffect(() => {
    if (style !== "gradient") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
      // Android performance optimization
      willReadFrequently: false,
    })
    if (!ctx) return

    // Set canvas size once - no animation loop to prevent flickering
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Draw static gradient once - no animation loop
      // This prevents flickering on Android from continuous requestAnimationFrame
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)

      // Rotate colors based on seed
      const hue1 = (200 + seed * 50) % 360
      const hue2 = (280 + seed * 50) % 360

      gradient.addColorStop(0, `hsl(${hue1}, 70%, 60%)`)
      gradient.addColorStop(0.5, `hsl(${(hue1 + hue2) / 2}, 60%, 50%)`)
      gradient.addColorStop(1, `hsl(${hue2}, 70%, 60%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    updateSize()
    window.addEventListener("resize", updateSize)

    return () => {
      window.removeEventListener("resize", updateSize)
      // No animation frame to cancel - we're using static rendering
    }
  }, [style, seed])

  if (style === "minimal") {
    return (
      <div className="from-background via-background to-muted fixed inset-0 -z-10 bg-gradient-to-br" />
    )
  }

  if (style === "glass") {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>
    )
  }

  // Only render motion.canvas for gradient style
  if (style !== "gradient") {
    return null
  }

  // Use static canvas instead of motion.canvas to prevent flickering
  // No animations - just render once and stay static
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        opacity: 0.3,
        willChange: "auto", // Changed from "transform" to prevent unnecessary GPU layer
        transform: "translate3d(0, 0, 0)",
        WebkitTransform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    />
  )
}

"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface BackgroundCanvasProps {
  style: "gradient" | "glass" | "minimal"
  seed?: number
}

export function BackgroundCanvas({ style, seed = 0 }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (style !== "gradient") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    // Track visibility to pause animation when tab is hidden
    let isVisible = !document.hidden
    let frame = 0

    // Animated gradient background
    const animate = () => {
      if (!isVisible) {
        // Pause animation when page is hidden
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      frame++
      const time = frame * 0.01 + seed

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)

      // Rotate colors based on seed
      const hue1 = (200 + seed * 50) % 360
      const hue2 = (280 + seed * 50) % 360

      gradient.addColorStop(0, `hsl(${hue1}, 70%, 60%)`)
      gradient.addColorStop(0.5, `hsl(${(hue1 + hue2) / 2}, 60%, 50%)`)
      gradient.addColorStop(1, `hsl(${hue2}, 70%, 60%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      isVisible = !document.hidden
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    animate()

    return () => {
      window.removeEventListener("resize", updateSize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [style, seed])

  if (style === "minimal") {
    return <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted" />
  }

  if (style === "glass") {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>
    )
  }

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ willChange: "transform" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1 }}
    />
  )
}

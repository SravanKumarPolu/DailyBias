"use client"

import { motion } from "framer-motion"
import { useScrollFade, useScrollScale } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: "fade" | "scale" | "slide"
  delay?: number
}

export function ScrollReveal({
  children,
  className,
  variant = "fade",
  delay = 0,
}: ScrollRevealProps) {
  const { ref: fadeRef, opacity: fadeOpacity, y } = useScrollFade()
  const { ref: scaleRef, scale, opacity: scaleOpacity } = useScrollScale()

  if (variant === "scale") {
    return (
      <motion.div
        ref={scaleRef}
        style={{ scale, opacity: scaleOpacity }}
        className={cn(className)}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    )
  }

  if (variant === "slide") {
    return (
      <motion.div
        ref={fadeRef}
        style={{ opacity: fadeOpacity, y }}
        className={cn(className)}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    )
  }

  // Default fade
  return (
    <motion.div
      ref={fadeRef}
      style={{ opacity: fadeOpacity }}
      className={cn(className)}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { ref, y } = useScrollFade()

  return (
    <motion.div 
      ref={ref} 
      style={{ 
        y: y,
        willChange: "transform"
      }} 
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}


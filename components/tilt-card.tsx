"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltStrength?: number
  glareEnabled?: boolean
}

// Simplified TiltCard - removed all Framer Motion animations to prevent flickering on Android
// The 3D tilt effect was causing constant re-renders and blocking button clicks
// Parameters kept for API compatibility but not used (static rendering)
export function TiltCard({
  children,
  className,
  tiltStrength: _tiltStrength = 10, // Unused - kept for API compatibility
  glareEnabled: _glareEnabled = true, // Unused - kept for API compatibility
}: TiltCardProps) {
  // Use static div instead of motion.div to prevent flickering and ensure buttons work
  return (
    <div
      className={cn("relative", className)}
      style={{
        // Ensure buttons inside are clickable
        pointerEvents: "auto",
        touchAction: "manipulation",
      }}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}


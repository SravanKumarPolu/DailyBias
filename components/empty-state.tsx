"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 sm:py-16 sm:px-6 animate-fade-in-up",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon container with CSS animation */}
      <div
        className="relative mb-6 animate-scale-in"
        style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
      >
        {/* Glowing background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-50" aria-hidden="true" />
        
        {/* Icon container */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 sm:h-24 sm:w-24">
          <Icon className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" aria-hidden="true" />
        </div>
      </div>

      {/* Content */}
      <div
        className="space-y-3 text-center max-w-md animate-fade-in-up"
        style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
      >
        <h3 className="text-xl font-semibold sm:text-2xl">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      </div>

      {/* Action */}
      {action && (
        <div
          className="mt-6 animate-fade-in-up"
          style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}
        >
          {action}
        </div>
      )}
    </div>
  )
}


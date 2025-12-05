/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

import { logger } from "./logger"
import { toast } from "@/hooks/use-toast"

export interface ErrorContext {
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

/**
 * Standard error handler that logs and optionally shows toast
 */
export function handleError(
  error: unknown,
  context: ErrorContext = {},
  showToast = false
): string {
  const message = error instanceof Error ? error.message : "An unexpected error occurred"
  const errorMessage = context.action
    ? `[${context.component || "App"}] ${context.action}: ${message}`
    : `[${context.component || "App"}] ${message}`

  logger.error(errorMessage, {
    error,
    ...context.metadata,
  })

  if (showToast) {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  return message
}

/**
 * Handle async operation errors with consistent pattern
 */
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  showToast = false
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    handleError(error, context, showToast)
    return null
  }
}

/**
 * Silent error handler (logs but doesn't show toast)
 * Use for non-critical operations
 */
export function handleSilentError(error: unknown, context: ErrorContext = {}): void {
  handleError(error, context, false)
}


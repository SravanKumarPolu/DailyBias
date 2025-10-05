"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  copied: boolean
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, copied: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DailyBias] Error caught by boundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  copyErrorDetails = async () => {
    const errorDetails = `
Error: ${this.state.error?.message || "Unknown error"}
Stack: ${this.state.error?.stack || "No stack trace"}
Component Stack: ${this.state.errorInfo?.componentStack || "No component stack"}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorDetails)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch (err) {
      console.error("Failed to copy error details:", err)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <div className="max-w-md w-full bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Something went wrong</h1>
            </div>
            
            <p className="text-red-700 dark:text-red-300 mb-2">
              {this.state.error?.message || "An unexpected error occurred while loading the app."}
            </p>
            
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              Don't worry, your data is safe. Try reloading the app or return to the home page.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
                }}
                className="w-full cursor-pointer"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Reload App
              </Button>

              <Button
                onClick={() => {
                  window.location.href = "/"
                }}
                variant="outline"
                className="w-full cursor-pointer"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go to Home
              </Button>

              <Button
                onClick={this.copyErrorDetails}
                variant="ghost"
                className="w-full cursor-pointer"
                disabled={this.state.copied}
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                    Error Details Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                    Copy Error Details
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-4 text-center">
              If this keeps happening, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

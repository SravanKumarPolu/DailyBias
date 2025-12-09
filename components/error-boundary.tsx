"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, Copy, Check, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  copied: boolean
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
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
        <div className="relative min-h-screen overflow-hidden bg-background">
          {/* Animated gradient background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-destructive/5 opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.1),rgba(255,255,255,0))]" />
          </div>

          {/* Content */}
          <div className="relative flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-full max-w-lg"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card/90 backdrop-blur-xl border-2 border-destructive/30 p-8 shadow-depth-4 sm:p-10">
                {/* Top glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                  className="mb-6 flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl animate-pulse" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive/30 sm:h-20 sm:w-20">
                      <AlertTriangle className="h-8 w-8 text-destructive sm:h-10 sm:w-10" />
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-4 text-center"
                >
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Something went wrong
                  </h2>
                  <p className="text-foreground/80 text-sm leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                    {this.state.error?.message || "An unexpected error occurred while loading the app."}
                  </p>
                  <p className="text-foreground/80 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl leading-relaxed">
                    Don't worry, your data is safe. Try reloading or return to home.
                  </p>

                  {/* Error details (development only) */}
                  {process.env.NODE_ENV === "development" && this.state.error && (
                    <details className="mt-4 rounded-lg bg-muted/30 p-4 text-left">
                      <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                        <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
                        Error Details (Dev Mode)
                      </summary>
                      <pre className="mt-3 overflow-x-auto text-sm text-foreground/80 whitespace-pre-wrap break-words sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-8 space-y-3"
                >
                  <Button
                    onClick={() => {
                      this.setState({ hasError: false, error: null, errorInfo: null })
                      window.location.reload()
                    }}
                    className="w-full cursor-pointer hover-lift button-press"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload App
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        window.location.href = "/"
                      }}
                      variant="outline"
                      className="cursor-pointer hover-lift button-press"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Button>

                    <Button
                      onClick={this.copyErrorDetails}
                      variant="outline"
                      className="cursor-pointer hover-lift button-press"
                      disabled={this.state.copied}
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Help text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-6 text-center text-sm text-foreground/80 space-y-1 leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl"
                >
                  <div>If this keeps happening, try clearing your browser cache</div>
                  <div className="text-sm opacity-75 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                    Error details copied to clipboard - share with support if needed
                  </div>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

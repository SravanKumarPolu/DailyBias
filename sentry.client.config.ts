// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  // Your Sentry DSN - Get this from https://sentry.io (Free tier: 5k errors/month)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration for session replay
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // This sets the sample rate to be 0.1%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.01, // 1% of normal sessions

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      // Disable automatic span creation for better performance
      traceFetch: false,
      traceXHR: false,
    }),
  ],

  // Filter out expected errors
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV !== "production") {
      return null
    }

    // Filter out common non-critical errors
    const error = hint.originalException

    // User canceled actions (not errors)
    if (error && typeof error === "object" && "message" in error) {
      const message = String(error.message).toLowerCase()

      if (
        message.includes("user canceled") ||
        message.includes("user denied") ||
        message.includes("aborted") ||
        message.includes("network request failed") ||
        message.includes("failed to fetch")
      ) {
        return null
      }

      // Speech synthesis expected errors
      if (
        message.includes("speech") &&
        (message.includes("interrupted") || message.includes("cancelled"))
      ) {
        return null
      }
    }

    // Add user context (privacy-safe)
    if (event.user) {
      // Don't send any identifying information
      delete event.user.email
      delete event.user.username
      delete event.user.ip_address
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",

    // Random plugins/extensions
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",

    // Network errors (often user connectivity issues)
    "NetworkError",
    "Network request failed",
    "Failed to fetch",
    "Load failed",

    // Speech synthesis errors (expected)
    "SpeechSynthesis",
    "speechSynthesis",
  ],

  // Don't send transactions for certain routes
  beforeSendTransaction(event) {
    // Filter out health check or static asset transactions
    if (event.transaction?.includes("/_next/") || event.transaction?.includes("/static/")) {
      return null
    }
    return event
  },

  // Add custom tags
  initialScope: {
    tags: {
      app: "bias-daily",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    },
  },
})

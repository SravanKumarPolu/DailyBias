import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatus } from "@/components/network-status"
import { AppProvider } from "@/contexts/app-context"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Bias Daily - Learn One Cognitive Bias Every Day",
  description:
    "Discover a new cognitive bias each day from Elon Musk's list of 50 biases. Free, offline-first PWA with no tracking.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bias Daily",
  },
  openGraph: {
    title: "Bias Daily - Learn One Cognitive Bias Every Day",
    description: "Discover a new cognitive bias each day from Elon Musk's list of 50 biases. Free, offline-first PWA.",
    url: "https://biasdaily.app",
    siteName: "Bias Daily",
    images: [
      {
        url: "/icon-512.jpg",
        width: 512,
        height: 512,
        alt: "Bias Daily Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bias Daily - Learn One Cognitive Bias Every Day",
    description: "Discover a new cognitive bias each day from Elon Musk's list of 50 biases.",
    images: ["/icon-512.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
    generator: 'Daily Bias'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="icon" href="/icon-192.jpg" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <AppProvider>
            <ServiceWorkerRegistration />
            <NetworkStatus />
            {children}
            <Toaster />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

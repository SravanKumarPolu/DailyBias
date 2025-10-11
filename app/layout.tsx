import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatus } from "@/components/network-status"
import { AppProvider } from "@/contexts/app-context"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

// Inter: Modern, highly legible sans-serif
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
})

// Instrument Serif: Elegant, modern serif for headings
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  // Basic Metadata
  title: "Bias Daily - Learn One Cognitive Bias Every Day",
  description:
    "Discover a new cognitive bias each day from Elon Musk's list of 50 biases. Free, offline-first PWA with no tracking.",
  applicationName: "Bias Daily",
  generator: "Daily Bias",
  keywords: [
    "cognitive biases",
    "daily learning",
    "psychology",
    "decision making",
    "critical thinking",
    "mental models",
    "PWA",
    "offline app",
  ],
  authors: [{ name: "Bias Daily" }],
  creator: "Bias Daily",
  publisher: "Bias Daily",
  category: "education",

  // PWA & Theme
  manifest: "/manifest.json",
  themeColor: "#000000",

  // Icons (Next.js way - replaces manual <link> tags)
  icons: {
    icon: [
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/icon-192.jpg", sizes: "192x192", type: "image/jpeg" }],
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bias Daily",
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Bias Daily - Learn One Cognitive Bias Every Day",
    description:
      "Discover a new cognitive bias each day from Elon Musk's list of 50 biases. Free, offline-first PWA.",
    url: "https://biasdaily.app",
    siteName: "Bias Daily",
    images: [
      {
        url: "/icon-512.jpg",
        width: 512,
        height: 512,
        alt: "Bias Daily Logo",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary",
    title: "Bias Daily - Learn One Cognitive Bias Every Day",
    description: "Discover a new cognitive bias each day from Elon Musk's list of 50 biases.",
    images: ["/icon-512.jpg"],
    creator: "@biasdaily",
  },

  // Viewport & Mobile
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // SEO & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL (prevents duplicate content)
  alternates: {
    canonical: "https://biasdaily.app",
  },

  // Format Detection (disable auto-detection of phone numbers, etc.)
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-screen font-sans" suppressHydrationWarning>
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

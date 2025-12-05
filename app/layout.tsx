import type { Metadata } from "next"
import type { ReactNode } from "react"
import Script from "next/script"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatus } from "@/components/network-status"
import { TelegramRedirectBanner } from "@/components/telegram-redirect-banner"
import { AppProvider } from "@/contexts/app-context"
import { PlausibleAnalytics } from "@/components/plausible-analytics"
import { DisableServiceWorker } from "@/components/disable-service-worker"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  // Basic Metadata
  metadataBase: new URL(siteConfig.url),
  title: "Bias Daily - Learn One Cognitive Bias Every Day",
  description: siteConfig.description,
  applicationName: siteConfig.name,
  generator: siteConfig.name,
  keywords: [
    "cognitive biases",
    "daily learning",
    "psychology",
    "decision making",
    "critical thinking",
    "mental models",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "education",

  // App Manifest (for PWA)
  manifest: "/manifest.json",

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
    title: siteConfig.name,
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Bias Daily - Learn One Cognitive Bias Every Day",
    description:
      "Discover a new cognitive bias each day from Elon Musk's list of 50 biases.",
    url: siteConfig.url,
    siteName: siteConfig.name,
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
    creator: siteConfig.twitterHandle,
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
    canonical: siteConfig.url,
  },

  // Format Detection (disable auto-detection of phone numbers, etc.)
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-screen font-sans" suppressHydrationWarning>
        {/* Immediately unregister service workers before anything else loads */}
        <Script
          id="disable-service-worker-immediate"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('serviceWorker' in navigator) {
                  // Unregister all service workers immediately
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister().catch(function(err) {
                        console.warn('[ServiceWorker] Error unregistering:', err);
                      });
                    }
                  }).catch(function(err) {
                    console.warn('[ServiceWorker] Error getting registrations:', err);
                  });
                  
                  // Prevent new registrations
                  var originalRegister = navigator.serviceWorker.register;
                  navigator.serviceWorker.register = function() {
                    console.warn('[ServiceWorker] Service worker registration blocked');
                    return Promise.reject(new Error('Service workers are disabled'));
                  };
                }
              })();
            `,
          }}
        />
        {/* Skip link for keyboard navigation accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        >
          Skip to main content
        </a>
        <DisableServiceWorker />
        <ErrorBoundary>
          <AppProvider>
            <NetworkStatus />
            <TelegramRedirectBanner />
            {children}
            <Toaster />
          </AppProvider>
        </ErrorBoundary>
        <PlausibleAnalytics />
      </body>
    </html>
  )
}

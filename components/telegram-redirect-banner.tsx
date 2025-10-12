"use client"

import { useState, useEffect } from "react"
import { ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TelegramRedirectBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)

  useEffect(() => {
    // Detect if we're in an in-app browser
    const userAgent = navigator.userAgent.toLowerCase()
    const isInAppBrowser = 
      // Telegram
      userAgent.includes('telegram') ||
      // WhatsApp
      userAgent.includes('whatsapp') ||
      // Facebook Messenger
      userAgent.includes('fbav') ||
      userAgent.includes('fban') ||
      // Instagram
      userAgent.includes('instagram') ||
      // Twitter/X
      userAgent.includes('twitterandroid') ||
      userAgent.includes('twitterios') ||
      // LinkedIn
      userAgent.includes('linkedinapp') ||
      // Generic in-app browser indicators
      (userAgent.includes('wv') && !userAgent.includes('chrome')) ||
      // iOS WebKit without Safari
      (userAgent.includes('webkit') && !userAgent.includes('safari') && !userAgent.includes('chrome'))

    setIsInAppBrowser(isInAppBrowser)

    // Show banner if in in-app browser and speech is not supported
    if (isInAppBrowser && !('speechSynthesis' in window)) {
      setShowBanner(true)
    }
  }, [])

  const handleOpenInBrowser = () => {
    const currentUrl = window.location.href
    
    // Try different methods to open in external browser
    if (navigator.userAgent.toLowerCase().includes('telegram')) {
      // For Telegram, try to open in external browser
      window.open(currentUrl, '_system')
    } else {
      // For other in-app browsers, try to open in new tab
      window.open(currentUrl, '_blank')
    }
    
    // Also try to copy URL to clipboard as fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        alert('URL copied to clipboard! Paste it in your browser.')
      })
    }
  }

  if (!showBanner || !isInAppBrowser) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span className="font-semibold text-sm">Open in Browser</span>
            </div>
            <p className="text-xs opacity-90 mt-1">
              For full features including voice reading, open this link in Chrome or Safari
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenInBrowser}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
            <Button
              onClick={() => setShowBanner(false)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

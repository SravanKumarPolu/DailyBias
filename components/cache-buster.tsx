"use client"

import { useEffect } from "react"

export function CacheBuster() {
  useEffect(() => {
    // Force clear all caches and update service worker
    const clearCaches = async () => {
      if ('caches' in window) {
        // Clear all caches
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('🧹 Cleared all caches:', cacheNames)
      }

      // Unregister old service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
        console.log('🔄 Unregistered service workers:', registrations.length)
      }

      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      console.log('🗑️ Cleared local storage')
    }

    // Check if we need to force update
    const currentVersion = '2.0.0'
    const storedVersion = localStorage.getItem('app-version')
    
    if (storedVersion !== currentVersion) {
      console.log('🔄 Version mismatch detected, clearing caches...')
      clearCaches().then(() => {
        localStorage.setItem('app-version', currentVersion)
        // Force reload after clearing caches
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      })
    }
  }, [])

  return null // This component doesn't render anything
}

// Temporary cache clear button for debugging
export function CacheClearButton() {
  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('Cleared caches:', cacheNames)
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => registration.unregister())
      )
      console.log('Unregistered service workers:', registrations.length)
    }

    localStorage.clear()
    sessionStorage.clear()
    
    alert('Cache cleared! Reloading page...')
    window.location.reload()
  }

  return (
    <button
      onClick={handleClearCache}
      className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
      style={{ fontSize: '12px' }}
    >
      🧹 Clear Cache
    </button>
  )
}

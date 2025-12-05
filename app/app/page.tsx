"use client"

// Mobile entry route - stable route for mobile shell
// This route avoids SSR/date mismatch issues by being client-only
// Redirects to home page which is the main Daily screen
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MobileAppPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page (Daily screen)
    // This ensures mobile apps always load the Daily screen
    router.replace("/")
  }, [router])

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}


"use client"

import { Moon, Sun, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useEffect, useState } from "react"
import Link from "next/link"

export function DailyHeader() {
  const { settings, saveSetting } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState("")

  useEffect(() => {
    setMounted(true)
    setToday(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }))
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (settings.theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else if (settings.theme === "light") {
      root.classList.add("light")
      root.classList.remove("dark")
    } else {
      root.classList.remove("dark", "light")
    }
  }, [settings.theme, mounted])

  const toggleTheme = () => {
    const newTheme = settings.theme === "dark" ? "light" : "dark"
    saveSetting("theme", newTheme)
  }

  if (!mounted) return null

  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/">
            <h1 className="text-2xl font-bold">Daily Bias</h1>
          </Link>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {settings.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

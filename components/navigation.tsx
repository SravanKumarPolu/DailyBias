"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Heart, Plus, BarChart3, Settings } from "lucide-react"
// Removed motion imports - using static CSS transitions instead to prevent flickering on Android

const navItems = [
  { href: "/", icon: Home, label: "Daily" },
  { href: "/all", icon: Grid3x3, label: "All" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/add", icon: Plus, label: "Add" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav 
      className="pb-safe fixed right-0 bottom-0 left-0 z-50" 
      aria-label="Main navigation"
      style={{
        // FIX: Ensure navigation is always visible and above all content
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
      }}
    >
      <div className="glass border-border/50 border-t backdrop-blur-xl bg-background/80 dark:bg-background/90">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  // FIX: Increased touch target to minimum 44px for accessibility
                  className="hover:bg-accent/50 focus:ring-ring touch-target relative flex cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95 sm:gap-1.5 sm:px-4 sm:py-3 min-h-[44px] min-w-[44px]"
                  aria-label={`${item.label} page`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <div
                      className="bg-accent absolute inset-0 rounded-xl"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`relative z-10 transition-all duration-200 ${
                      isActive ? "scale-110 -translate-y-0.5" : "scale-100 translate-y-0"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-200 sm:h-6 sm:w-6 ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className={`relative z-10 text-[10px] transition-all duration-200 sm:text-xs ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

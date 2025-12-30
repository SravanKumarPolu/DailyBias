"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Heart, RotateCcw, BarChart3, Settings } from "lucide-react"
// Removed motion imports - using static CSS transitions instead to prevent flickering on Android

const navItems = [
  { href: "/", icon: Home, label: "Daily" },
  { href: "/all", icon: Grid3x3, label: "All" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/review", icon: RotateCcw, label: "Review" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      className="pb-safe fixed right-0 bottom-0 left-0 z-50 w-full"
      aria-label="Main navigation"
      data-testid="bottom-navigation"
      style={{
        // Responsive navigation: fixed at bottom, centered, works across all screen sizes
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
      }}
    >
      {/* Mobile & Tablet: Full-width bar */}
      {/* Desktop & Big Screens: Centered pill-shaped container */}
      <div
        className="glass border-border/50 border-t backdrop-blur-xl bg-background/80 dark:bg-background/90 w-full lg:border lg:border-border/50 lg:border-t lg:border-l lg:border-r lg:rounded-t-3xl lg:mx-auto lg:max-w-4xl lg:shadow-lg xl:max-w-5xl 3xl:max-w-6xl"
      >
        {/* Container wrapper for responsive centering */}
        <div className="mx-auto w-full max-w-7xl px-safe">
          {/* Mobile: Full width with tight spacing */}
          {/* Tablet: More breathing room */}
          {/* Desktop: Elegant centered layout with optimal spacing */}
          <div
            className="flex items-center justify-around w-full py-2.5 px-2 sm:py-3 sm:px-3 md:py-3.5 md:px-4 md:gap-1 lg:py-4 lg:px-6 lg:justify-evenly lg:gap-2 xl:py-4 xl:px-8 xl:gap-3 2xl:py-5 2xl:px-10 2xl:gap-4 3xl:py-6 3xl:px-12"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  // Responsive touch targets: Mobile (44px min), Desktop (elegant hover states)
                  className="hover:bg-accent/50 focus:ring-ring touch-target relative flex cursor-pointer flex-col items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 rounded-xl lg:rounded-2xl px-2 py-2 sm:px-3 sm:py-2.5 md:px-3 md:py-3 lg:px-4 lg:py-3 xl:px-5 xl:py-4 2xl:px-6 2xl:py-4 transition-all duration-200 ease-out hover:scale-105 lg:hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95 lg:active:scale-100 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] lg:min-h-[56px] lg:min-w-[56px] xl:min-h-[64px] xl:min-w-[64px] flex-shrink-0"
                  aria-label={`${item.label} page`}
                  aria-current={isActive ? "page" : undefined}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && (
                    <div
                      className="bg-accent absolute inset-0 rounded-xl lg:rounded-2xl shadow-sm lg:shadow-md"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`relative z-10 transition-all duration-200 ease-out ${
                      isActive
                        ? "scale-110 -translate-y-0.5 lg:scale-110 lg:-translate-y-1"
                        : "scale-100 translate-y-0"
                    }`}
                  >
                    {/* Responsive icon sizes: Mobile (small) → Desktop (elegant larger) */}
                    <Icon
                      className={`transition-colors duration-200 ease-out h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      aria-hidden="true"
                    />
                  </div>
                  {/* Responsive text sizes: Mobile (readable minimum 11px) → Desktop (readable) */}
                  <span
                    className={`relative z-10 transition-all duration-200 ease-out text-[11px] leading-tight sm:text-xs sm:leading-snug md:text-xs md:leading-normal lg:text-sm lg:leading-relaxed lg:font-medium xl:text-sm xl:leading-relaxed 2xl:text-base 2xl:leading-relaxed whitespace-nowrap ${isActive ? "text-foreground font-semibold lg:font-bold" : "text-foreground/70 hover:text-foreground font-medium lg:font-normal"}`}
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

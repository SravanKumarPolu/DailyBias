"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Heart, Plus, Settings } from "lucide-react"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", icon: Home, label: "Daily" },
  { href: "/all", icon: Grid3x3, label: "All" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/add", icon: Plus, label: "Add" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe" aria-label="Main navigation">
      <div className="glass border-t border-border/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-around py-3" role="tablist">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${item.label} page`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 relative z-10 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-xs relative z-10 ${
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
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

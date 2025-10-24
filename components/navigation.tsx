"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Heart, Plus, BarChart3, Settings, Archive } from "lucide-react"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", icon: Home, label: "Daily" },
  { href: "/all", icon: Grid3x3, label: "All" },
  { href: "/archive", icon: Archive, label: "Archive" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/add", icon: Plus, label: "Add" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50" aria-label="Main navigation">
      <div className="glass border-border/50 border-t backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-accent focus:ring-ring touch-target button-press relative flex cursor-pointer flex-col items-center gap-spacing-xs rounded-xl px-2 py-1.5 transition-all duration-normal hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95 sm:gap-spacing-sm sm:px-4 sm:py-2"
                  aria-label={`${item.label} page`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="bg-accent absolute inset-0 rounded-xl"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8,
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      aria-hidden="true"
                    />
                  )}
                  <motion.div
                    className="relative z-10"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-fast sm:h-6 sm:w-6 ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-hidden="true"
                    />
                  </motion.div>
                  <span
                    className={`relative z-10 text-[10px] transition-all duration-fast sm:text-xs ${
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

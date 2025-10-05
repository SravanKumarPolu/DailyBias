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
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 hover:bg-accent hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer touch-target button-press"
                  aria-label={`${item.label} page`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent rounded-xl"
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30,
                        mass: 0.8
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
                      y: isActive ? -1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-hidden="true"
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] sm:text-xs relative z-10 transition-all duration-200 ${
                      isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
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

"use client"

import { Sparkles } from "lucide-react"
import type { Bias } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getCategoryColor, getCategoryLabel } from "@/lib/category-utils"

interface BiasOfTheDayProps {
  bias: Bias
}

export function BiasOfTheDay({ bias }: BiasOfTheDayProps) {
  return (
    <div
      className="glass rounded-3xl p-6 mb-8 border-2 border-primary/20 animate-in fade-in zoom-in-95 duration-500"
      role="region"
      aria-labelledby="bias-of-day-title"
    >
      <div className="flex items-center gap-2 mb-4">
     
        <h2 id="bias-of-day-title" className="text-sm font-bold uppercase tracking-wider text-primary font-serif">
          Bias of the Day
        </h2>
      </div>

    
    </div>
  )
}

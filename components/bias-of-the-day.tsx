"use client"

import { Sparkles, TrendingUp } from "lucide-react"
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
        <div className="animate-wiggle">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <h2 id="bias-of-day-title" className="text-sm font-bold uppercase tracking-wider text-primary font-serif">
          Bias of the Day
        </h2>
        <Badge variant="secondary" className="ml-auto">
          <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
          Featured
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <Badge className={`mb-2 ${getCategoryColor(bias.category)}`}>{getCategoryLabel(bias.category)}</Badge>
          <h3 className="text-2xl font-bold text-balance leading-tight font-serif">{bias.title}</h3>
        </div>

        <p className="text-base text-muted-foreground leading-relaxed text-pretty">{bias.summary}</p>

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground italic">
            💡 Scroll down to learn why this happens and how to counter it
          </p>
        </div>
      </div>
    </div>
  )
}

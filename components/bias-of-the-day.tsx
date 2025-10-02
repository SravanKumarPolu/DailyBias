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
        <div className="animate-wiggle">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <h2 id="bias-of-day-title" className="text-sm font-bold uppercase tracking-wider text-primary font-serif">
          Bias of the Day
        </h2>
      </div>

      <div className="space-y-4">
        {/* Category Badge and Title */}
        <div>
          <Badge className={`mb-3 ${getCategoryColor(bias.category)}`}>
            {getCategoryLabel(bias.category)}
          </Badge>
          <h3 className="text-2xl font-bold text-balance font-serif mb-3">
            {bias.title}
          </h3>
        </div>

        {/* Summary */}
        <p className="text-base leading-relaxed text-pretty">
          {bias.summary}
        </p>

        {/* Why it happens */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 font-serif">
            Why it happens
          </h4>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {bias.why}
          </p>
        </div>

        {/* How to counter */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 font-serif">
            How to counter it
          </h4>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {bias.counter}
          </p>
        </div>
      </div>
    </div>
  )
}

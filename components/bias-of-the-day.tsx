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
      className="glass border-primary/20 animate-in fade-in zoom-in-95 mb-8 rounded-3xl border-2 p-6 duration-500"
      role="region"
      aria-labelledby="bias-of-day-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="animate-wiggle">
          <Sparkles className="text-primary h-5 w-5" aria-hidden="true" />
        </div>
        <h2
          id="bias-of-day-title"
          className="text-primary font-serif text-sm font-bold tracking-wider uppercase"
        >
          Bias of the Day
        </h2>
      </div>

      <div className="space-y-4">
        {/* Category Badge and Title */}
        <div>
          <Badge className={`mb-3 ${getCategoryColor(bias.category)}`}>
            {getCategoryLabel(bias.category)}
          </Badge>
          <h3 className="mb-3 font-serif text-2xl font-bold text-balance">{bias.title}</h3>
        </div>

        {/* Summary */}
        <p className="text-base leading-relaxed text-pretty">{bias.summary}</p>

        {/* Why it happens */}
        <div>
          <h4 className="text-muted-foreground mb-2 font-serif text-xs font-semibold tracking-wide uppercase">
            Why it happens
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{bias.why}</p>
        </div>

        {/* How to counter */}
        <div>
          <h4 className="text-muted-foreground mb-2 font-serif text-xs font-semibold tracking-wide uppercase">
            How to counter it
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
            {bias.counter}
          </p>
        </div>
      </div>
    </div>
  )
}

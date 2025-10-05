"use client"

import { motion } from "framer-motion"
import { Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Bias } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCategoryColor, getCategoryLabel } from "@/lib/category-utils"

interface RecommendationCardProps {
  bias: Bias
  reason?: string
}

export function RecommendationCard({ bias, reason = "Recommended for you" }: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-2">{reason}</p>
          <Badge className={`mb-2 ${getCategoryColor(bias.category)}`}>{getCategoryLabel(bias.category)}</Badge>
          <h3 className="text-xl font-bold mb-2 font-serif text-balance">{bias.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 text-pretty line-clamp-2">{bias.summary}</p>
          <Link href={`/bias/${bias.id}`} className="cursor-pointer">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent cursor-pointer">
              Learn more
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

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

export function RecommendationCard({
  bias,
  reason = "Recommended for you",
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-primary/20 rounded-2xl border p-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 rounded-xl p-3">
          <Lightbulb className="text-primary h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground mb-2 text-sm">{reason}</p>
          <Badge className={`mb-2 ${getCategoryColor(bias.category)}`}>
            {getCategoryLabel(bias.category)}
          </Badge>
          <h3 className="mb-2 font-serif text-xl font-bold text-balance">{bias.title}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm text-pretty">
            {bias.summary}
          </p>
          <Link href={`/bias/${bias.id}`} className="cursor-pointer">
            <Button variant="outline" size="sm" className="cursor-pointer gap-2 bg-transparent">
              Learn more
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

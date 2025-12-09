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
          <p className="text-foreground/80 mb-2 text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">{reason}</p>
          <Badge className={`mb-2 ${getCategoryColor(bias.category)}`}>
            {getCategoryLabel(bias.category)}
          </Badge>
          <h3 className="mb-2 text-xl font-bold tracking-tight text-balance sm:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl">{bias.title}</h3>
          <p className="text-foreground/80 mb-4 line-clamp-2 text-sm text-pretty leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
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

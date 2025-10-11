"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Link2, ArrowRight, Sparkles } from "lucide-react"
import type { Bias } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getCategoryColor, getCategoryLabel } from "@/lib/category-utils"

interface RelatedBiasesProps {
  currentBias: Bias
  allBiases: Bias[]
  maxResults?: number
}

export function RelatedBiases({
  currentBias,
  allBiases,
  maxResults = 3,
}: RelatedBiasesProps) {
  // Find related biases based on:
  // 1. Same category (highest priority)
  // 2. Similar keywords in title/summary
  // 3. Different biases to show variety
  const relatedBiases = allBiases
    .filter((bias) => bias.id !== currentBias.id)
    .map((bias) => {
      let score = 0

      // Same category gets high score
      if (bias.category === currentBias.category) {
        score += 10
      }

      // Similar words in title (basic keyword matching)
      const currentWords = currentBias.title.toLowerCase().split(" ")
      const biasWords = bias.title.toLowerCase().split(" ")
      const commonWords = currentWords.filter((word) =>
        word.length > 4 && biasWords.includes(word)
      )
      score += commonWords.length * 3

      // Similar words in summary
      const currentSummaryWords = currentBias.summary.toLowerCase().split(" ")
      const biasSummaryWords = bias.summary.toLowerCase().split(" ")
      const commonSummaryWords = currentSummaryWords.filter((word) =>
        word.length > 5 && biasSummaryWords.includes(word)
      )
      score += commonSummaryWords.length

      return { bias, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.bias)

  if (relatedBiases.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-primary/20 p-6 backdrop-blur-sm">
        {/* Decorative gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold sm:text-xl">
            Related Biases
          </h3>
          <Sparkles className="h-4 w-4 text-primary/60" />
        </div>

        {/* Related biases list */}
        <div className="space-y-3">
          {relatedBiases.map((bias, index) => (
            <motion.div
              key={bias.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            >
              <Link
                href={`/bias/${bias.id}`}
                className="group flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-primary/5 hover:shadow-depth-1"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary/20">
                  <ArrowRight className="h-5 w-5 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      className={`text-xs ${getCategoryColor(bias.category)}`}
                      variant="secondary"
                    >
                      {getCategoryLabel(bias.category)}
                    </Badge>
                  </div>
                  <h4 className="mb-1 font-medium leading-tight group-hover:text-primary transition-colors">
                    {bias.title}
                  </h4>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {bias.summary}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-4 text-center"
        >
          <Link
            href="/all"
            className="text-sm text-primary hover:underline underline-offset-2 transition-colors"
          >
            Explore all {allBiases.length} biases →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}


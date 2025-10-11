"use client"

import { motion } from "framer-motion"
import { Lightbulb, CheckCircle2 } from "lucide-react"
import type { Bias } from "@/lib/types"

interface BiasExamplesProps {
  bias: Bias
}

// Generate contextual examples based on bias type
export function generateExamples(bias: Bias): string[] {
  const examples: { [key: string]: string[] } = {
    "confirmation-bias": [
      "Only reading news sources that align with your political views",
      "Remembering instances that support your opinion while forgetting contradictory evidence",
      "Selectively interpreting ambiguous data to confirm pre-existing beliefs",
    ],
    "anchoring-bias": [
      "Being influenced by the first price you see when shopping, even if it's arbitrary",
      "Using an initial estimate as a reference point for all subsequent judgments",
      "Negotiating based on the first number mentioned, regardless of its relevance",
    ],
    "availability-bias": [
      "Overestimating plane crash risks after seeing news coverage of a crash",
      "Judging the likelihood of events based on how easily examples come to mind",
      "Making decisions based on recent or vivid memories rather than complete data",
    ],
    "sunk-cost-fallacy": [
      "Continuing to watch a boring movie because you already paid for the ticket",
      "Staying in an unsatisfying relationship because of time already invested",
      "Throwing good money after bad on a failing project",
    ],
    "dunning-kruger-effect": [
      "Beginners overestimating their skills in a new area",
      "Experts underestimating their knowledge due to awareness of complexity",
      "Confident but incompetent individuals making poor decisions",
    ],
  }

  // Return specific examples if available, otherwise generate generic ones
  if (examples[bias.id]) {
    return examples[bias.id]
  }

  // Generate generic examples based on category
  const categoryExamples: { [key: string]: string[] } = {
    decision: [
      `Making hasty decisions without considering all options`,
      `Being influenced by emotional factors rather than logic`,
      `Following the crowd instead of independent analysis`,
    ],
    memory: [
      `Misremembering events based on current beliefs`,
      `Confabulating details that weren't actually present`,
      `Being influenced by how questions are framed`,
    ],
    social: [
      `Judging others based on their group membership`,
      `Conforming to group opinions despite personal doubts`,
      `Attributing others' behavior to personality rather than context`,
    ],
    perception: [
      `Seeing patterns in random data`,
      `Being influenced by presentation over substance`,
      `Misjudging probabilities based on vivid examples`,
    ],
    misc: [
      `Being influenced by cognitive shortcuts in daily decisions`,
      `Making systematic errors in judgment`,
      `Falling into predictable thinking traps`,
    ],
  }

  return categoryExamples[bias.category] || categoryExamples.misc
}

export function generateTips(): string[] {
  return [
    "Actively seek out contradictory information",
    "Take time to reflect before making important decisions",
    "Ask others for their perspective to challenge your assumptions",
    "Use structured decision-making frameworks",
  ]
}

export function BiasExamples({ bias }: BiasExamplesProps) {
  const examples = generateExamples(bias)
  const tips = generateTips()

  return (
    <div className="mt-6 space-y-6">
      {/* Real-World Examples Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-muted-foreground mb-3 flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-wider sm:text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          Real-World Examples
        </h3>
        <div className="space-y-3">
          {examples.map((example, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              className="group flex gap-3 rounded-lg border border-accent/50 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-4 transition-all duration-200 hover:border-accent hover:shadow-depth-1"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm leading-relaxed sm:text-base">{example}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-muted-foreground mb-3 flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-wider sm:text-base">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Quick Tips
        </h3>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
              className="flex gap-3"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success transition-transform duration-200 hover:scale-110" />
              <span className="text-sm leading-relaxed">{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}


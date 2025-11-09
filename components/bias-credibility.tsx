"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, GraduationCap, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Bias } from "@/lib/types"

interface BiasCredibilityProps {
  bias: Bias
}

export function BiasCredibility({ bias }: BiasCredibilityProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!bias.references || bias.references.length === 0) {
    return null
  }

  const getResearchLevelColor = (level?: string) => {
    switch (level) {
      case "established":
        return "bg-success text-success-foreground border-success/50 dark:bg-success dark:text-success-foreground dark:border-success/60 font-semibold"
      case "emerging":
        return "bg-warning text-warning-foreground border-warning/50 dark:bg-warning dark:text-warning-foreground dark:border-warning/60 font-semibold"
      case "contested":
        return "bg-destructive text-destructive-foreground border-destructive/50 dark:bg-destructive dark:text-destructive-foreground dark:border-destructive/60 font-semibold"
      default:
        return "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border font-semibold"
    }
  }

  const getResearchLevelLabel = (level?: string) => {
    switch (level) {
      case "established":
        return "Well-Established"
      case "emerging":
        return "Emerging Research"
      case "contested":
        return "Contested"
      default:
        return "Research Status Unknown"
    }
  }

  const getReferenceIcon = (type: string) => {
    switch (type) {
      case "study":
        return <FileText className="h-4 w-4" />
      case "review":
        return <BookOpen className="h-4 w-4" />
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Research & Sources
                  </CardTitle>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {bias.references.length} reference{bias.references.length !== 1 ? 's' : ''} • {getResearchLevelLabel(bias.researchLevel)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Research Level Badge */}
              {bias.researchLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Status:</span>
                  <Badge className={getResearchLevelColor(bias.researchLevel)}>
                    {getResearchLevelLabel(bias.researchLevel)}
                  </Badge>
                </div>
              )}

              {/* References */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Academic Sources</h4>
                <div className="space-y-2">
                  {bias.references.map((ref, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getReferenceIcon(ref.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {ref.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {ref.authors} ({ref.year})
                            </p>
                            {ref.journal && (
                              <p className="text-gray-500 dark:text-gray-500 text-xs">
                                {ref.journal}
                              </p>
                            )}
                          </div>
                          {ref.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                              onClick={() => window.open(ref.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Methodology Note */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> This bias is based on established psychological research. 
                  The explanations and counter-strategies are derived from peer-reviewed studies and 
                  validated through experimental evidence.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, GraduationCap, FileText, Shield, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Bias } from "@/lib/types"

interface BiasResearchInfoProps {
  bias: Bias
}

export function BiasResearchInfo({ bias }: BiasResearchInfoProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const getSourceColor = (source: string) => {
    switch (source) {
      case "core":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "user":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "core":
        return "Curated Content"
      case "user":
        return "User Added"
      default:
        return "Unknown Source"
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
                  <CardTitle className="text-base font-bold tracking-wide uppercase sm:text-lg text-blue-900 dark:text-blue-100">
                    Research & Sources
                  </CardTitle>
                  <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    {bias.references?.length || 0} reference{(bias.references?.length || 0) !== 1 ? 's' : ''} • {getResearchLevelLabel(bias.researchLevel)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
                aria-label={isOpen ? "Collapse research information" : "Expand research information"}
                aria-expanded={isOpen}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Source and Research Level */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
                  <Badge className={getSourceColor(bias.source)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getSourceLabel(bias.source)}
                  </Badge>
                </div>
                {bias.researchLevel && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Status:</span>
                    <Badge className={getResearchLevelColor(bias.researchLevel)}>
                      {getResearchLevelLabel(bias.researchLevel)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Author Information */}
              {(bias.author || bias.reviewer) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:text-base">
                    <Users className="h-4 w-4" />
                    Author & Review Information
                  </h4>
                  <div className="space-y-3">
                    {bias.author && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-green-900 dark:text-green-100">Author</h5>
                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">{bias.author.name}</p>
                            <p className="text-xs text-green-700 dark:text-green-300">{bias.author.credentials}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">{bias.author.affiliation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {bias.reviewer && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">Reviewed By</h5>
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">{bias.reviewer.name}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">{bias.reviewer.credentials}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">{bias.reviewer.affiliation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* References */}
              {bias.references && bias.references.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:text-base">
                    <BookOpen className="h-4 w-4" />
                    Academic Sources
                  </h4>
                  <div className="space-y-2">
                    {bias.references.map((ref, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
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
                              <Badge variant="outline" className="mt-1 text-xs">
                                {ref.type.charAt(0).toUpperCase() + ref.type.slice(1)}
                              </Badge>
                            </div>
                            {ref.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                                onClick={() => window.open(ref.url, '_blank')}
                                aria-label={`Open reference: ${ref.title} in new tab`}
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No academic references available for this bias.
                  </p>
                </div>
              )}

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

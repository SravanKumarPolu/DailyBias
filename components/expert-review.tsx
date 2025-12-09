"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, CheckCircle, XCircle, Clock, Star, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Bias } from "@/lib/types"
import { contentVersionManager } from "@/lib/content-versioning"

interface ExpertReviewProps {
  bias: Bias
  isExpert?: boolean
}

interface ReviewData {
  biasId: string
  reviewerId: string
  reviewerName: string
  status: "pending" | "approved" | "rejected" | "needs_revision"
  accuracyScore: number
  clarityScore: number
  completenessScore: number
  comments: string
  suggestions: string[]
  timestamp: number
}

export function ExpertReview({ bias, isExpert = false }: ExpertReviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scores, setScores] = useState({
    accuracy: 0,
    clarity: 0,
    completeness: 0
  })
  const [comments, setComments] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newSuggestion, setNewSuggestion] = useState("")
  const { toast } = useToast()

  const loadExistingReview = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from a backend
      // For now, we'll simulate loading existing review data
      const existingReview = localStorage.getItem(`expert-review-${bias.id}`)
      if (existingReview) {
        setReviewData(JSON.parse(existingReview))
      }
    } catch (error) {
      console.error("Error loading review:", error)
    }
  }, [bias.id])

  useEffect(() => {
    if (isOpen && isExpert) {
      loadExistingReview()
    }
  }, [isOpen, isExpert, loadExistingReview])

  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }))
  }

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions(prev => [...prev, newSuggestion.trim()])
      setNewSuggestion("")
    }
  }

  const removeSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async () => {
    if (!isExpert) return

    setIsSubmitting(true)

    try {
      const review: ReviewData = {
        biasId: bias.id,
        reviewerId: "expert-1", // In real app, this would be the actual expert ID
        reviewerName: "Dr. Cognitive Science Expert", // In real app, this would be the actual expert name
        status: "approved", // This would be determined by the review process
        accuracyScore: scores.accuracy,
        clarityScore: scores.clarity,
        completenessScore: scores.completeness,
        comments,
        suggestions,
        timestamp: Date.now()
      }

      // Store review data
      localStorage.setItem(`expert-review-${bias.id}`, JSON.stringify(review))

      // Update quality metrics
      await contentVersionManager.updateQualityMetrics(bias.id, {
        accuracyScore: scores.accuracy / 10,
        clarityScore: scores.clarity / 10,
        completenessScore: scores.completeness / 10,
        expertReviewScore: (scores.accuracy + scores.clarity + scores.completeness) / 30
      })

      setReviewData(review)
      toast({
        title: "Review Submitted",
        description: "Expert review has been submitted successfully.",
      })

    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground border-success/50 dark:bg-success dark:text-success-foreground dark:border-success/60 font-semibold"
      case "rejected":
        return "bg-destructive text-destructive-foreground border-destructive/50 dark:bg-destructive dark:text-destructive-foreground dark:border-destructive/60 font-semibold"
      case "needs_revision":
        return "bg-warning text-warning-foreground border-warning/50 dark:bg-warning dark:text-warning-foreground dark:border-warning/60 font-semibold"
      default:
        return "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border font-semibold"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "needs_revision":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (reviewData && !isExpert) {
    return (
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-blue-900 dark:text-blue-100 sm:text-lg lg:text-xl xl:text-xl 2xl:text-2xl">
                Expert Review Status
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(reviewData.status)}>
                  {getStatusIcon(reviewData.status)}
                  <span className="ml-1 capitalize">{reviewData.status.replace('_', ' ')}</span>
                </Badge>
                <span className="text-sm text-blue-700 dark:text-blue-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                  by {reviewData.reviewerName}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Quality Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 sm:text-3xl lg:text-4xl xl:text-4xl 2xl:text-5xl">
                  {reviewData.accuracyScore}/10
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">Accuracy</div>
                <Progress value={reviewData.accuracyScore * 10} className="mt-1 h-2 sm:h-2.5 lg:h-3" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 sm:text-3xl lg:text-4xl xl:text-4xl 2xl:text-5xl">
                  {reviewData.clarityScore}/10
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">Clarity</div>
                <Progress value={reviewData.clarityScore * 10} className="mt-1 h-2 sm:h-2.5 lg:h-3" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 sm:text-3xl lg:text-4xl xl:text-4xl 2xl:text-5xl">
                  {reviewData.completenessScore}/10
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">Completeness</div>
                <Progress value={reviewData.completenessScore * 10} className="mt-1" />
              </div>
            </div>

            {/* Comments */}
            {reviewData.comments && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">Expert Comments</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                  {reviewData.comments}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {reviewData.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">Improvement Suggestions</h4>
                <ul className="space-y-1">
                  {reviewData.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0 sm:h-5 sm:w-5" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isExpert) {
    return null
  }

  return (
    <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
      <CardHeader className="cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-purple-900 dark:text-purple-100 sm:text-lg lg:text-xl xl:text-xl 2xl:text-2xl">
                Expert Review Panel
              </CardTitle>
              <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                Review and rate this bias content for accuracy and quality
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800">
            {isOpen ? "Hide" : "Review"}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Quality Scoring */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Quality Assessment</h4>

                  {Object.entries(scores).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                          {category}
                        </label>
                        <span className="text-sm text-gray-500 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">{score}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={score}
                        onChange={(e) => handleScoreChange(category as keyof typeof scores, parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                    Review Comments
                  </label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide detailed feedback on the content quality..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                    Improvement Suggestions
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="Add a suggestion..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      onKeyPress={(e) => e.key === 'Enter' && addSuggestion()}
                    />
                    <Button
                      onClick={addSuggestion}
                      size="sm"
                      aria-label="Add improvement suggestion"
                    >
                      Add
                    </Button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">{suggestion}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSuggestion(index)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Remove suggestion: ${suggestion}`}
                          >
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting}
                    className="flex-1"
                    aria-label={isSubmitting ? "Submitting review" : "Submit expert review"}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    aria-label="Cancel review submission"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

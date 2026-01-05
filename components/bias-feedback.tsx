"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown, MessageSquare, Send, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Bias } from "@/lib/types"
import { addFeedback, type FeedbackData } from "@/lib/db"
import { sendFeedbackEmail, initEmailJS, isEmailAvailable } from "@/lib/email"

interface BiasFeedbackProps {
  bias: Bias
}

export function BiasFeedback({ bias }: BiasFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackData["type"] | null>(null)
  const [rating, setRating] = useState<FeedbackData["rating"] | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  // Initialize EmailJS on component mount
  useEffect(() => {
    if (isEmailAvailable()) {
      initEmailJS()
    }
  }, [])

  const feedbackTypes = [
    { id: "accuracy", label: "Accuracy", description: "Is the information correct?" },
    { id: "clarity", label: "Clarity", description: "Is it easy to understand?" },
    { id: "completeness", label: "Completeness", description: "Is anything missing?" },
    { id: "other", label: "Other", description: "General feedback" }
  ]

  const handleSubmit = async () => {
    if (!feedbackType || !rating) return

    setIsSubmitting(true)

    try {
      const feedback: FeedbackData = {
        biasId: bias.id,
        type: feedbackType,
        rating,
        comment: comment.trim() || undefined,
        timestamp: Date.now()
      }

      // Store feedback in IndexedDB (local backup)
      await addFeedback(feedback)

      // Send email to debiasdaily@gmail.com (non-blocking)
      // If email fails, we still consider the submission successful since it's stored locally
      try {
        await sendFeedbackEmail({
          biasId: bias.id,
          biasTitle: bias.title,
          feedbackType: feedback.type,
          rating: feedback.rating,
          comment: feedback.comment,
          timestamp: feedback.timestamp,
        })
      } catch (emailError) {
        // Email failure is not critical - feedback is already stored in IndexedDB
        console.warn("Email send failed, but feedback is stored locally:", emailError)
      }

      setIsSubmitted(true)
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve our content quality!",
      })

      // Reset form after a delay
      setTimeout(() => {
        setIsSubmitted(false)
        setIsOpen(false)
        setFeedbackType(null)
        setRating(null)
        setComment("")
      }, 2000)

    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
      setFeedbackType(null)
      setRating(null)
      setComment("")
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-base font-semibold text-green-900 dark:text-green-100">
              Feedback Submitted Successfully
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
              Thank you for helping improve our content quality!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-wide uppercase sm:text-lg md:text-xl lg:text-xl xl:text-xl 2xl:text-2xl text-green-900 dark:text-green-100">
                Help Improve This Content
              </CardTitle>
              <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl text-green-700 dark:text-green-300 font-medium leading-relaxed">
                Found an error or have suggestions? Your feedback helps us improve.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-800"
            aria-label={isOpen ? "Close feedback form" : "Open feedback form"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MessageSquare className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Feedback Type Selection */}
                <div className="w-full overflow-hidden">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                    What would you like to provide feedback on?
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                    {feedbackTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={feedbackType === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFeedbackType(type.id as FeedbackData["type"])}
                        className="justify-start text-left h-auto p-4 sm:p-5 min-h-[80px] flex flex-col items-start gap-1.5 hover:shadow-md transition-all whitespace-normal overflow-hidden"
                        aria-label={`Select ${type.label} feedback type: ${type.description}`}
                        aria-pressed={feedbackType === type.id}
                      >
                        <div className="font-semibold text-base sm:text-lg break-words w-full">{type.label}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground leading-snug text-left break-words w-full line-clamp-2">
                          {type.description}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Selection */}
                {feedbackType && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 w-full overflow-hidden">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                      How would you rate this content?
                    </label>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant={rating === "positive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRating("positive")}
                        className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden whitespace-nowrap"
                        aria-label="Rate content as good"
                        aria-pressed={rating === "positive"}
                      >
                        <ThumbsUp className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">Good</span>
                      </Button>
                      <Button
                        variant={rating === "negative" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRating("negative")}
                        className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden whitespace-nowrap"
                        aria-label="Rate content as needing improvement"
                        aria-pressed={rating === "negative"}
                      >
                        <ThumbsDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">Needs Improvement</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comment Section */}
                {rating && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                      Additional Comments (Optional)
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Please provide specific details about what could be improved or what you found helpful..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                {/* Submit Button */}
                {feedbackType && rating && (
                  <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
                      This feedback displays only your analytics page and is also forwarded to the developer's email.
                    </p>
                    <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1"
                      aria-label={isSubmitting ? "Submitting feedback" : "Submit feedback"}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" aria-hidden="true" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      aria-label="Cancel feedback submission"
                    >
                      Cancel
                    </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        )}
    </Card>
  )
}


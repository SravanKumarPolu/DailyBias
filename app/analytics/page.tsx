"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BarChart3, TrendingUp, Users, Star, AlertTriangle } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { ContentQualityDashboard } from "@/components/content-quality-dashboard"
import { LearningProgressDashboard } from "@/components/learning-progress-dashboard"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { contentVersionManager, type ContentQualityMetrics } from "@/lib/content-versioning"
import { 
  calculateAnalyticsMetrics, 
  getRecentActivity, 
  formatRelativeTime,
  type AnalyticsMetrics,
  type RecentActivity 
} from "@/lib/analytics-utils"
import { getAllFeedback } from "@/lib/db"

export default function AnalyticsPage() {
  const { 
    allBiases, 
    biasesLoading, 
    progressList, 
    progressLoading,
    settings
  } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "quality" | "reviews">("overview")
  const [contentNeedingReview, setContentNeedingReview] = useState<string[]>([])
  const [qualityMetrics, setQualityMetrics] = useState<ContentQualityMetrics[]>([])
  // feedbackList state removed - feedback is used directly in calculations, not stored in state
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        
        // Load quality metrics
        const metrics = await contentVersionManager.getAllQualityMetrics()
        setQualityMetrics(metrics)
        
        // Load content needing review
        const needingReview = await contentVersionManager.getContentNeedingReview()
        setContentNeedingReview(needingReview)
        
        // Load feedback data
        const feedback = await getAllFeedback()
        
        // Calculate analytics metrics
        const calculatedMetrics = await calculateAnalyticsMetrics(
          allBiases,
          progressList,
          metrics,
          feedback
        )
        setMetrics(calculatedMetrics)
        
        // Get recent activity
        const activity = await getRecentActivity(allBiases, progressList, metrics, feedback)
        setRecentActivity(activity)
      } catch (error) {
        console.error("Error loading analytics data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (!biasesLoading && !progressLoading && allBiases.length > 0) {
      loadAnalyticsData()
    }
  }, [allBiases, progressList, biasesLoading, progressLoading])

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "progress", label: "Learning Progress", icon: TrendingUp },
    { id: "quality", label: "Content Quality", icon: Star },
    { id: "reviews", label: "Reviews", icon: Users }
  ]

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      <DynamicBackgroundCanvas style={settings.backgroundStyle} seed={888} />
      <DailyHeader />

      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8" aria-label="Content analytics">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="touch-target hover-grow button-press mb-4 cursor-pointer transition-all duration-200 sm:mb-6"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-6 text-center sm:rounded-2xl sm:p-8">
            <h1 className="text-responsive-3xl mb-3 font-bold tracking-tight sm:mb-4">
              Content Analytics
            </h1>
            <p className="text-muted-foreground text-responsive-lg text-balance">
              Monitor content quality, user feedback, and expert reviews
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-4 sm:rounded-2xl sm:p-6" role="tablist" aria-label="Analytics sections">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className="flex items-center gap-2"
                    aria-label={`Switch to ${tab.label} tab`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                    aria-controls={`tabpanel-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Content Needing Review Alert */}
          {contentNeedingReview.length > 0 && (
            <Card className="border-l-4 border-l-warning bg-warning/10 dark:bg-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  Content Needing Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-warning-foreground/90 mb-3">
                  {contentNeedingReview.length} content item{contentNeedingReview.length !== 1 ? 's' : ''} need{contentNeedingReview.length === 1 ? 's' : ''} expert review or have low quality scores.
                </p>
                <div className="flex flex-wrap gap-2">
                  {contentNeedingReview.map((biasId) => (
                    <Badge key={biasId} variant="outline" className="border-warning/30 text-warning-foreground bg-warning/10 dark:border-warning/40 dark:bg-warning/20">
                      {biasId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          <div className="space-y-6">
            <div 
              className="space-y-6" 
              role="tabpanel" 
              id="tabpanel-overview" 
              aria-labelledby="tab-overview"
              hidden={activeTab !== "overview"}
            >
              {activeTab === "overview" && (
                loading || biasesLoading || progressLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : metrics ? (
                  <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-info" />
                        Content Health Overview
                      </CardTitle>
                    </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-info/15 dark:bg-info/25 rounded-lg border border-info/30 dark:border-info/40">
                            <div className="text-2xl font-bold text-info dark:text-info-foreground">
                              {metrics.averageQualityScore.toFixed(1)}%
                            </div>
                            <div className="text-sm font-medium text-foreground dark:text-info-foreground mt-1">Average Quality Score</div>
                          </div>
                          <div className="text-center p-4 bg-success/15 dark:bg-success/25 rounded-lg border border-success/30 dark:border-success/40">
                            <div className="text-2xl font-bold text-success dark:text-success-foreground">
                              {metrics.expertReviewsCount}
                            </div>
                            <div className="text-sm font-medium text-foreground dark:text-success-foreground mt-1">Expert Reviews</div>
                          </div>
                          <div className="text-center p-4 bg-accent/15 dark:bg-accent/25 rounded-lg border border-accent/30 dark:border-accent/40">
                            <div className="text-2xl font-bold text-accent dark:text-accent-foreground">
                              {metrics.userFeedbackCount}
                            </div>
                            <div className="text-sm font-medium text-foreground dark:text-accent-foreground mt-1">User Feedback</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentActivity.length > 0 ? (
                          <div className="space-y-3">
                            {recentActivity.map((activity, index) => {
                              const iconMap = {
                                expert_review: { 
                                  icon: Star, 
                                  bgClass: "bg-success/20 dark:bg-success/30",
                                  iconClass: "text-success-foreground"
                                },
                                user_feedback: { 
                                  icon: Users, 
                                  bgClass: "bg-info/20 dark:bg-info/30",
                                  iconClass: "text-info-foreground"
                                },
                                quality_improvement: { 
                                  icon: TrendingUp, 
                                  bgClass: "bg-accent/20 dark:bg-accent/30",
                                  iconClass: "text-accent-foreground"
                                }
                              }
                              const { icon: Icon, bgClass, iconClass } = iconMap[activity.type]
                              
                              return (
                                <div key={`${activity.biasId}-${index}`} className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50">
                                  <div className={`${bgClass} p-2 rounded-lg`}>
                                    <Icon className={`h-4 w-4 ${iconClass}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatRelativeTime(activity.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No recent activity to display</p>
                            <p className="text-sm mt-2">Activity will appear here as content is reviewed and updated</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No analytics data available yet</p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>

            <div 
              role="tabpanel" 
              id="tabpanel-progress" 
              aria-labelledby="tab-progress"
              hidden={activeTab !== "progress"}
            >
              {activeTab === "progress" && <LearningProgressDashboard />}
            </div>

            <div 
              role="tabpanel" 
              id="tabpanel-quality" 
              aria-labelledby="tab-quality"
              hidden={activeTab !== "quality"}
            >
              {activeTab === "quality" && <ContentQualityDashboard showAll={true} />}
            </div>

            <div 
              role="tabpanel" 
              id="tabpanel-reviews" 
              aria-labelledby="tab-reviews"
              hidden={activeTab !== "reviews"}
            >
              {activeTab === "reviews" && (
              <div className="space-y-6">
                {loading || biasesLoading || progressLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                          </div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : metrics ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Review Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Approved</span>
                              <span className="font-medium text-foreground">{metrics.approvedCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Pending</span>
                              <span className="font-medium text-foreground">{metrics.pendingCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Needs Revision</span>
                              <span className="font-medium text-foreground">{metrics.needsRevisionCount}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Average Scores</h4>
                          {qualityMetrics.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Accuracy</span>
                                <span className="font-medium text-foreground">{metrics.averageAccuracy.toFixed(1)}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Clarity</span>
                                <span className="font-medium text-foreground">{metrics.averageClarity.toFixed(1)}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Completeness</span>
                                <span className="font-medium text-foreground">{metrics.averageCompleteness.toFixed(1)}/10</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No quality metrics available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No review statistics available yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}
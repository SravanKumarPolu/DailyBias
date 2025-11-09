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
        
        // Calculate analytics metrics
        const calculatedMetrics = await calculateAnalyticsMetrics(
          allBiases,
          progressList,
          metrics
        )
        setMetrics(calculatedMetrics)
        
        // Get recent activity
        const activity = await getRecentActivity(allBiases, progressList, metrics)
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

      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:py-8">
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
          <div className="glass shadow-glass animate-fade-in-up rounded-xl p-4 sm:rounded-2xl sm:p-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Content Needing Review Alert */}
          {contentNeedingReview.length > 0 && (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                  <AlertTriangle className="h-5 w-5" />
                  Content Needing Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-800 dark:text-orange-200 mb-3">
                  {contentNeedingReview.length} content item{contentNeedingReview.length !== 1 ? 's' : ''} need{contentNeedingReview.length === 1 ? 's' : ''} expert review or have low quality scores.
                </p>
                <div className="flex flex-wrap gap-2">
                  {contentNeedingReview.map((biasId) => (
                    <Badge key={biasId} variant="outline" className="text-orange-800 border-orange-300">
                      {biasId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {loading || biasesLoading || progressLoading ? (
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
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Content Health Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {metrics.averageQualityScore.toFixed(1)}%
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Average Quality Score</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {metrics.expertReviewsCount}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">Expert Reviews</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                              {metrics.userFeedbackCount}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">User Feedback</div>
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
                                  bgClass: "bg-green-100 dark:bg-green-900",
                                  iconClass: "text-green-600"
                                },
                                user_feedback: { 
                                  icon: Users, 
                                  bgClass: "bg-blue-100 dark:bg-blue-900",
                                  iconClass: "text-blue-600"
                                },
                                quality_improvement: { 
                                  icon: TrendingUp, 
                                  bgClass: "bg-purple-100 dark:bg-purple-900",
                                  iconClass: "text-purple-600"
                                }
                              }
                              const { icon: Icon, bgClass, iconClass } = iconMap[activity.type]
                              
                              return (
                                <div key={`${activity.biasId}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className={`${bgClass} p-2 rounded-lg`}>
                                    <Icon className={`h-4 w-4 ${iconClass}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {formatRelativeTime(activity.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                      <p className="text-gray-500 dark:text-gray-400">No analytics data available yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "progress" && (
              <LearningProgressDashboard />
            )}

            {activeTab === "quality" && (
              <ContentQualityDashboard showAll={true} />
            )}

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
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Review Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                              <span className="font-medium">{metrics.approvedCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                              <span className="font-medium">{metrics.pendingCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Needs Revision</span>
                              <span className="font-medium">{metrics.needsRevisionCount}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Average Scores</h4>
                          {qualityMetrics.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                                <span className="font-medium">{metrics.averageAccuracy.toFixed(1)}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Clarity</span>
                                <span className="font-medium">{metrics.averageClarity.toFixed(1)}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Completeness</span>
                                <span className="font-medium">{metrics.averageCompleteness.toFixed(1)}/10</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No quality metrics available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No review statistics available yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BarChart3, TrendingUp, Users, Star, AlertTriangle } from "lucide-react"
import { DailyHeader } from "@/components/daily-header"
import { DynamicBackgroundCanvas } from "@/components/dynamic-background-canvas"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { ContentQualityDashboard } from "@/components/content-quality-dashboard"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { contentVersionManager } from "@/lib/content-versioning"

export default function AnalyticsPage() {
  const { settings } = useSettings()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "reviews">("overview")
  const [contentNeedingReview, setContentNeedingReview] = useState<string[]>([])

  // Load content needing review
  useEffect(() => {
    const loadContentNeedingReview = async () => {
      try {
        const needingReview = await contentVersionManager.getContentNeedingReview()
        setContentNeedingReview(needingReview)
      } catch (error) {
        console.error("Error loading content needing review:", error)
      }
    }
    loadContentNeedingReview()
  }, [])

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
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
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">85%</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Average Quality Score</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">42</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Expert Reviews</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">156</div>
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
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                          <Star className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Expert review completed for "Confirmation Bias"
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            User feedback received for "Anchoring Bias"
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Content quality improved for "Availability Heuristic"
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "quality" && (
              <ContentQualityDashboard showAll={true} />
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
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
                            <span className="font-medium">38</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                            <span className="font-medium">4</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Needs Revision</span>
                            <span className="font-medium">2</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Average Scores</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                            <span className="font-medium">8.7/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Clarity</span>
                            <span className="font-medium">8.2/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completeness</span>
                            <span className="font-medium">8.5/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <DynamicNavigation />
    </div>
  )
}
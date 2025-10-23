"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Star, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { contentVersionManager, type ContentQualityMetrics } from "@/lib/content-versioning"

interface ContentQualityDashboardProps {
  biasId?: string
  showAll?: boolean
}

export function ContentQualityDashboard({ biasId, showAll = false }: ContentQualityDashboardProps) {
  const [metrics, setMetrics] = useState<ContentQualityMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [overallHealth, setOverallHealth] = useState(0)

  const loadQualityMetrics = useCallback(async () => {
    try {
      setLoading(true)
      
      if (biasId) {
        const singleMetric = await contentVersionManager.getQualityMetrics(biasId)
        setMetrics(singleMetric ? [singleMetric] : [])
      } else {
        const allMetrics = await contentVersionManager.getAllQualityMetrics()
        setMetrics(allMetrics)
      }
      
      // Calculate overall health score
      if (metrics.length > 0) {
        const totalHealth = metrics.reduce((sum, metric) => {
          return sum + (
            metric.accuracyScore * 0.3 +
            metric.clarityScore * 0.25 +
            metric.completenessScore * 0.25 +
            metric.userRating * 0.2
          )
        }, 0)
        setOverallHealth(totalHealth / metrics.length)
      }
    } catch (error) {
      console.error("Error loading quality metrics:", error)
    } finally {
      setLoading(false)
    }
  }, [biasId, metrics])

  useEffect(() => {
    loadQualityMetrics()
  }, [loadQualityMetrics])

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthBadge = (score: number) => {
    if (score >= 0.8) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 0.6) return { label: "Good", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Quality Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Quality metrics will appear here once content is reviewed and rated.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      {showAll && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Overall Content Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {(overallHealth * 100).toFixed(1)}%
              </div>
              <Badge className={getHealthBadge(overallHealth).color}>
                {getHealthBadge(overallHealth).label}
              </Badge>
            </div>
            <Progress value={overallHealth * 100} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Based on {metrics.length} content item{metrics.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Metrics */}
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const healthScore = (
            metric.accuracyScore * 0.3 +
            metric.clarityScore * 0.25 +
            metric.completenessScore * 0.25 +
            metric.userRating * 0.2
          )

          return (
            <motion.div
              key={metric.biasId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {metric.biasId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    <Badge className={getHealthBadge(healthScore).color}>
                      {getHealthBadge(healthScore).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quality Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {(metric.accuracyScore * 10).toFixed(1)}
                        </div>
                        <Progress value={metric.accuracyScore * 100} className="mt-1 h-1" />
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Clarity</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {(metric.clarityScore * 10).toFixed(1)}
                        </div>
                        <Progress value={metric.clarityScore * 100} className="mt-1 h-1" />
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completeness</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {(metric.completenessScore * 10).toFixed(1)}
                        </div>
                        <Progress value={metric.completenessScore * 100} className="mt-1 h-1" />
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Rating</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {(metric.userRating * 10).toFixed(1)}
                        </div>
                        <Progress value={metric.userRating * 100} className="mt-1 h-1" />
                      </div>
                    </div>

                    {/* Expert Review Score */}
                    {metric.expertReviewScore && (
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Expert Review Score
                          </span>
                          <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                            {(metric.expertReviewScore * 10).toFixed(1)}/10
                          </span>
                        </div>
                        <Progress value={metric.expertReviewScore * 100} className="mt-2 h-2" />
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                      <span>Last updated: {formatDate(metric.lastUpdated)}</span>
                      <span>Version: {metric.version}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={loadQualityMetrics} variant="outline">
          Refresh Data
        </Button>
        {showAll && (
          <Button variant="outline">
            Export Report
          </Button>
        )}
      </div>
    </div>
  )
}

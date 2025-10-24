"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calendar, Target, TrendingUp, Users, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/contexts/app-context"

interface ContentTransparencyProps {
  showDetails?: boolean
}

export function ContentTransparency({ showDetails = true }: ContentTransparencyProps) {
  const { allBiases } = useApp()
  const [contentStats, setContentStats] = useState({
    totalBiases: 0,
    coreBiases: 0,
    userBiases: 0,
    categories: {} as Record<string, number>,
    researchLevels: {} as Record<string, number>,
    totalKnownBiases: 180, // Approximate total of known cognitive biases
    coveragePercentage: 0
  })

  useEffect(() => {
    if (allBiases.length > 0) {
      const coreBiases = allBiases.filter(bias => bias.source === "core")
      const userBiases = allBiases.filter(bias => bias.source === "user")
      
      const categories = allBiases.reduce((acc, bias) => {
        acc[bias.category] = (acc[bias.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const researchLevels = allBiases.reduce((acc, bias) => {
        const level = bias.researchLevel || "unknown"
        acc[level] = (acc[level] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const coveragePercentage = (allBiases.length / 180) * 100

      setContentStats({
        totalBiases: allBiases.length,
        coreBiases: coreBiases.length,
        userBiases: userBiases.length,
        categories,
        researchLevels,
        totalKnownBiases: 180,
        coveragePercentage
      })
    }
  }, [allBiases])

  const getCategoryColor = (category: string) => {
    const colors = {
      social: "bg-blue-100 text-blue-800 border-blue-200",
      decision: "bg-green-100 text-green-800 border-green-200",
      memory: "bg-purple-100 text-purple-800 border-purple-200",
      perception: "bg-orange-100 text-orange-800 border-orange-200",
      misc: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[category as keyof typeof colors] || colors.misc
  }

  const getResearchLevelColor = (level: string) => {
    const colors = {
      established: "bg-green-100 text-green-800 border-green-200",
      emerging: "bg-yellow-100 text-yellow-800 border-yellow-200",
      contested: "bg-red-100 text-red-800 border-red-200",
      unknown: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[level as keyof typeof colors] || colors.unknown
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <div>
          <div className="font-medium text-blue-900 dark:text-blue-100">
            {contentStats.totalBiases} of ~{contentStats.totalKnownBiases} known biases
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {contentStats.coveragePercentage.toFixed(1)}% coverage
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Content Coverage & Transparency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {contentStats.totalBiases}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Biases</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {contentStats.coveragePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Coverage</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                ~{contentStats.totalKnownBiases}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Known Biases</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Coverage</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {contentStats.totalBiases} / {contentStats.totalKnownBiases}
                </span>
              </div>
              <Progress value={contentStats.coveragePercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {contentStats.coreBiases}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Core Biases</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {contentStats.userBiases}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">User Added</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(contentStats.categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} bias{count !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="w-24">
                  <Progress value={(count / contentStats.totalBiases) * 100} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Research Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Research Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(contentStats.researchLevels).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getResearchLevelColor(level)}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} bias{count !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="w-24">
                  <Progress value={(count / contentStats.totalBiases) * 100} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Update Schedule & Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">Current Status</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Daily bias rotation with {contentStats.totalBiases} biases means you'll see each bias approximately every {Math.ceil(contentStats.totalBiases / 365)} year{Math.ceil(contentStats.totalBiases / 365) !== 1 ? 's' : ''}.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Expansion Plan</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We're continuously adding new biases and improving existing content based on user feedback and expert review.
                </p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Community Contributions</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Users can add custom biases, and all content is reviewed for accuracy. We aim to reach 100+ biases through community contributions and expert curation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

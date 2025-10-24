"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, Search, Filter, Star, Heart, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { ContentTransparency } from "@/components/content-transparency"
import { useApp } from "@/contexts/app-context"
import { getTodayDateString } from "@/lib/daily-selector"
import { getCategoryLabel, getCategoryColor } from "@/lib/category-utils"
import type { Bias } from "@/lib/types"

interface BiasArchiveProps {
  showTransparency?: boolean
}

interface ArchiveEntry {
  date: string
  bias: Bias
  isViewed: boolean
  isFavorite: boolean
  isMastered: boolean
}

export function BiasArchive({ showTransparency = true }: BiasArchiveProps) {
  const { allBiases, isFavorite, isMastered } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([])

  // Generate archive entries for the past year
  useEffect(() => {
    if (allBiases.length === 0) return

    const generateEntries = async () => {
      const entries: ArchiveEntry[] = []
      const today = new Date()
      
      // Generate entries for the past 365 days
      for (let i = 365; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        
        // Get the bias for this date (using the same logic as daily selector)
        const hash = hashString(dateString)
        const biasIndex = hash % allBiases.length
        const bias = allBiases[biasIndex]
        
        if (bias) {
          const [favoriteStatus, masteredStatus] = await Promise.all([
            isFavorite(bias.id),
            isMastered(bias.id)
          ])
          
          entries.push({
            date: dateString,
            bias,
            isViewed: false, // This would be tracked in real implementation
            isFavorite: favoriteStatus,
            isMastered: masteredStatus
          })
        }
      }
      
      setArchiveEntries(entries)
    }

    generateEntries()
  }, [allBiases, isFavorite, isMastered])

  // Simple hash function for date-based bias selection
  const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Filter and search logic
  const filteredEntries = useMemo(() => {
    return archiveEntries.filter(entry => {
      const matchesSearch = searchQuery === "" || 
        entry.bias.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.bias.summary.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || entry.bias.category === selectedCategory
      
      const matchesMonth = selectedMonth === "all" || 
        new Date(entry.date).getMonth() === parseInt(selectedMonth)
      
      return matchesSearch && matchesCategory && matchesMonth
    })
  }, [archiveEntries, searchQuery, selectedCategory, selectedMonth])

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allBiases.map(bias => bias.category))]
    return uniqueCategories.sort()
  }, [allBiases])

  // Get months for filter
  const months = useMemo(() => {
    const uniqueMonths = [...new Set(archiveEntries.map(entry => 
      new Date(entry.date).getMonth()
    ))].sort()
    
    return uniqueMonths.map(month => ({
      value: month.toString(),
      label: new Date(2024, month, 1).toLocaleString('default', { month: 'long' })
    }))
  }, [archiveEntries])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isToday = (dateString: string) => {
    return dateString === getTodayDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header with Transparency */}
      {showTransparency && (
        <ContentTransparency showDetails={true} />
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Bias Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search biases by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Filter className="h-4 w-4" />
                {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archive Entries */}
      <div className="space-y-4">
        {currentEntries.map((entry, index) => (
          <motion.div
            key={`${entry.date}-${entry.bias.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`transition-all duration-200 hover:shadow-md ${
              isToday(entry.date) ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {formatDate(entry.date)}
                        {isToday(entry.date) && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                            Today
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(entry.bias.category)}>
                          {getCategoryLabel(entry.bias.category)}
                        </Badge>
                        {entry.isFavorite && (
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            <Heart className="h-3 w-3 mr-1" />
                            Favorite
                          </Badge>
                        )}
                        {entry.isMastered && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            <Star className="h-3 w-3 mr-1" />
                            Mastered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DynamicBiasCard
                  bias={entry.bias}
                  variant="compact"
                  isFavorite={entry.isFavorite}
                  isMastered={entry.isMastered}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Biases Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedMonth("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

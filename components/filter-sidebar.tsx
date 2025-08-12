"use client"

import { useState } from "react"
import { Calendar, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PRESS_RELEASE_CATEGORIES, type SearchFilters } from "@/lib/contentful"

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableTags?: string[]
  className?: string
}

export function FilterSidebar({ filters, onFiltersChange, availableTags = [], className = "" }: FilterSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({ query: filters.query }) // Keep search query, clear other filters
  }

  const hasActiveFilters = filters.category || filters.dateFrom || filters.dateTo || (filters.tags && filters.tags.length > 0)

  const displayedCategories = showAllCategories ? PRESS_RELEASE_CATEGORIES : PRESS_RELEASE_CATEGORIES.slice(0, 5)
  const displayedTags = showAllTags ? availableTags : availableTags.slice(0, 8)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {filters.category}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => handleCategoryChange(filters.category!)}
                />
              </Badge>
            )}
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {tag}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
            {(filters.dateFrom || filters.dateTo) && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Date filter
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                filters.category === category
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
          {PRESS_RELEASE_CATEGORIES.length > 5 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              {showAllCategories ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show more ({PRESS_RELEASE_CATEGORIES.length - 5})
                </>
              )}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors ${
                    filters.tags?.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {availableTags.length > 8 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                {showAllTags ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show more ({availableTags.length - 8})
                  </>
                )}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
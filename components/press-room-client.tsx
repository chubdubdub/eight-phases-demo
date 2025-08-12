"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from 'next-intl'
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, Moon, Filter, Grid, List } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { FilterSidebar } from "@/components/filter-sidebar"
import { type PressRelease, type SearchFilters } from "@/lib/contentful"
import type { EntryCollection } from "contentful"

interface PressRoomClientProps {
  initialPressReleases: EntryCollection<PressRelease>
  availableTags: string[]
}

export function PressRoomClient({ initialPressReleases, availableTags }: PressRoomClientProps) {
  const t = useTranslations('pressRoom')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter press releases based on current filters
  const filteredPressReleases = useMemo(() => {
    let filtered = [...initialPressReleases.items]

    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(release => 
        release.fields.title.toLowerCase().includes(query) ||
        release.fields.summary.toLowerCase().includes(query) ||
        (release.fields.category?.toLowerCase().includes(query)) ||
        (release.fields.tags?.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(release => release.fields.category === filters.category)
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(release => 
        release.fields.tags && filters.tags!.some(tag => release.fields.tags!.includes(tag))
      )
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(release => new Date(release.fields.publishDate) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(release => new Date(release.fields.publishDate) <= toDate)
    }

    return filtered
  }, [initialPressReleases.items, filters])

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Awards": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Hotel Openings": "bg-green-500/20 text-green-400 border-green-500/30", 
      "Partnerships": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Executive News": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Company Updates": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Events": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Sustainability": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    }
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search and View Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={filters.query || ""}
            onChange={(query) => handleFiltersChange({ ...filters, query })}
            className="w-full lg:max-w-lg"
            placeholder={t('search.placeholder')}
          />
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('filters.button')}
            </Button>
            
            <div className="flex items-center border border-gray-700 rounded-md">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {filteredPressReleases.length === initialPressReleases.items.length
              ? t('results.showing', { count: filteredPressReleases.length })
              : t('results.filtered', { filtered: filteredPressReleases.length, total: initialPressReleases.items.length })
            }
          </span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableTags={availableTags}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {filteredPressReleases.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-6"
            }>
              {filteredPressReleases.map((release) => (
                <Card
                  key={release.sys.id}
                  className={`bg-gray-900 border-gray-800 text-white overflow-hidden group transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 ${
                    viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                  }`}
                >
                  <CardHeader className={`p-0 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                    <Link href={`/press/${release.fields.slug}`} className="block">
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'h-32' : 'h-48'}`}>
                        {release.fields.coverImage?.fields?.file?.url ? (
                          <Image
                            src={`https:${release.fields.coverImage.fields.file.url}`}
                            alt={release.fields.title}
                            width={release.fields.coverImage.fields.file.details.image?.width || 400}
                            height={release.fields.coverImage.fields.file.details.image?.height || 300}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Moon className="w-12 h-12 text-gray-700" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardHeader>
                  
                  <div className="flex flex-col flex-1">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">
                          {new Date(release.fields.publishDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long", 
                            day: "numeric",
                          })}
                        </Badge>
                        {release.fields.category && (
                          <Badge className={getCategoryColor(release.fields.category)}>
                            {release.fields.category}
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className={`mb-3 ${viewMode === 'list' ? 'text-lg' : 'text-xl'}`}>
                        <Link
                          href={`/press/${release.fields.slug}`}
                          className="hover:text-primary transition-colors line-clamp-2"
                        >
                          {release.fields.title}
                        </Link>
                      </CardTitle>
                      
                      <p className={`text-gray-400 leading-relaxed ${viewMode === 'list' ? 'text-sm line-clamp-2' : 'text-sm line-clamp-3'}`}>
                        {release.fields.summary}
                      </p>

                      {/* Tags */}
                      {release.fields.tags && release.fields.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {release.fields.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {release.fields.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                              {t('tags.more', { count: release.fields.tags.length - 3 })}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0">
                      <Link
                        href={`/press/${release.fields.slug}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {t('readMore')} &rarr;
                      </Link>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-white">{t('noResults.title')}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {Object.keys(filters).length > 1 || filters.query
                  ? t('noResults.searchAdjust')
                  : t('noResults.configError')
                }
              </p>
              {(Object.keys(filters).length > 1 || filters.query) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="mt-4"
                >
                  {t('filters.clearAll')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
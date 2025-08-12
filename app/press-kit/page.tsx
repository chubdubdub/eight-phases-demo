import Link from "next/link"
import { getTranslations } from 'next-intl/server'
import { getPressKitAssets } from "@/lib/contentful"
import { ArrowLeft, Download, FileText, Image as ImageIcon, Folder } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ErrorDisplay } from "@/components/error-display"
import { PRESS_KIT_CATEGORIES } from "@/lib/contentful"

export const revalidate = 300 // 5 minutes

export const metadata = {
  title: "Press Kit - Eight Phases Press Room",
  description: "Download logos, brand guidelines, fact sheets, and other media resources from Eight Phases Hotels.",
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Logos":
      return <ImageIcon className="h-5 w-5" />
    case "Brand Guidelines":
      return <FileText className="h-5 w-5" />
    case "Fact Sheets":
      return <FileText className="h-5 w-5" />
    case "Images":
      return <ImageIcon className="h-5 w-5" />
    case "Documents":
      return <Folder className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

const getCategoryDescription = (category: string, t: any) => {
  const categoryKey = category.replace(/\s+/g, ' ')
  return t(`assetCategories.${categoryKey}.description`)
}

export default async function PressKitPage() {
  const t = await getTranslations('pressKit')
  const { ok, data: pressKitAssets, error } = await getPressKitAssets()

  if (!ok || !pressKitAssets) {
    return (
      <div className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t('backToPress')}
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{t('title')}</h1>
          </div>
          <ErrorDisplay message={error || "Could not fetch press kit assets."} />
        </div>
      </div>
    )
  }

  // Group assets by category
  const assetsByCategory = pressKitAssets.items.reduce((acc, item) => {
    const category = item.fields.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, typeof pressKitAssets.items>)

  return (
    <div className="py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t('backToPress')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">{t('title')}</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Press Kit Overview */}
        <div className="mb-12 p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('aboutTitle')}</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            {t('aboutDescription')}
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-1">{t('founded.label')}</h3>
              <p className="text-gray-400">{t('founded.value')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t('properties.label')}</h3>
              <p className="text-gray-400">{t('properties.value')} {t('coverage')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{t('headquarters.label')}</h3>
              <p className="text-gray-400">{t('headquarters.value')}</p>
            </div>
          </div>
        </div>

        {/* Assets by Category */}
        {pressKitAssets.items.length > 0 ? (
          <div className="space-y-12">
            {PRESS_KIT_CATEGORIES.map(category => {
              const categoryAssets = assetsByCategory[category] || []
              if (categoryAssets.length === 0) return null

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-primary">
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{t(`assetCategories.${category}.title`)}</h2>
                      <p className="text-gray-400 text-sm">{getCategoryDescription(category, t)}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryAssets.map((asset) => (
                      <Card key={asset.sys.id} className="bg-gray-900 border-gray-800 text-white">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start justify-between">
                            <span className="line-clamp-2">{asset.fields.title}</span>
                            <Badge variant="secondary" className="ml-2 flex-shrink-0">
                              {asset.fields.fileSize || "N/A"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {asset.fields.description && (
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                              {asset.fields.description}
                            </p>
                          )}
                          
                          {asset.fields.lastUpdated && (
                            <p className="text-xs text-gray-500">
                              {t('updated')}: {new Date(asset.fields.lastUpdated).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          )}

                          <Button 
                            asChild 
                            className="w-full"
                            variant="outline"
                          >
                            <a
                              href={`https:${asset.fields.file.fields.file.url}`}
                              download={asset.fields.file.fields.title || asset.fields.title}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {t('download')}
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50">
            <Folder className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-white">{t('noAssets.title')}</h3>
            <p className="mt-2 text-sm text-gray-400">{t('noAssets.description')}</p>
            <p className="mt-1 text-xs text-gray-500">
              Ensure you have published entries with the content type ID 'pressKitAsset' in Contentful.
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-16 p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('mediaContact')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">{t('pressInquiries')}</h3>
              <p className="text-gray-300 mb-1">Sarah Johnson</p>
              <p className="text-gray-400 text-sm mb-1">Director of Communications</p>
              <p className="text-gray-400 text-sm">press@eightphases.com</p>
              <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">{t('partnershipInquiries')}</h3>
              <p className="text-gray-300 mb-1">Michael Chen</p>
              <p className="text-gray-400 text-sm mb-1">Business Development</p>
              <p className="text-gray-400 text-sm">partnerships@eightphases.com</p>
              <p className="text-gray-400 text-sm">+1 (555) 123-4568</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
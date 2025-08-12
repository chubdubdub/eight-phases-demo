import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getPressReleases, getPressReleaseTags } from "@/lib/contentful"
import { ErrorDisplay } from "@/components/error-display"
import { PressRoomClient } from "@/components/press-room-client"
import { Button } from "@/components/ui/button"

export const revalidate = 300 // 5 minutes

export default async function PressRoomPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations()
  const [pressReleasesResult, tagsResult] = await Promise.all([
    getPressReleases(),
    getPressReleaseTags()
  ])

  if (!pressReleasesResult.ok || !pressReleasesResult.data) {
    return (
      <div className="py-12 md:py-16 px-4 md:px-8">
        <ErrorDisplay message={pressReleasesResult.error || "Could not fetch press releases."} />
      </div>
    )
  }

  const availableTags = tagsResult.ok && tagsResult.data ? tagsResult.data : []

  return (
    <div className="py-12 md:py-16 px-4 md:px-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{t('home.title')}</h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Press Room Client Component */}
      <PressRoomClient 
        initialPressReleases={pressReleasesResult.data}
        availableTags={availableTags}
      />
      
      {/* Press Kit Section */}
      <div className="mt-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-white mb-4">{t('home.mediaResources.title')}</h3>
          <p className="text-gray-400 mb-6">
            {t('home.mediaResources.description')}
          </p>
          <Link href={`/${locale}/press-kit`}>
            <Button variant="outline" size="lg">
              {t('home.mediaResources.downloadButton')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

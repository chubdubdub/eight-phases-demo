import Link from "next/link"
import { getPressReleases, getPressReleaseTags } from "@/lib/contentful"
import { ErrorDisplay } from "@/components/error-display"
import { PressRoomClient } from "@/components/press-room-client"
import { Button } from "@/components/ui/button"

export const revalidate = 300 // 5 minutes

export default async function PressRoomPage() {
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
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Latest News</h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Stay up-to-date with the latest announcements and media coverage from Eight Phases.
        </p>
        <div className="mt-6">
          <Link href="/press-kit">
            <Button variant="outline" className="mr-4">
              Download Press Kit
            </Button>
          </Link>
        </div>
      </div>

      {/* Press Room Client Component */}
      <PressRoomClient 
        initialPressReleases={pressReleasesResult.data}
        availableTags={availableTags}
      />
    </div>
  )
}

import Link from "next/link"
import Image from "next/image"
import { getPressReleases } from "@/lib/contentful"
import { AlertCircle, Moon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ErrorDisplay } from "@/components/error-display"

export const revalidate = 300 // 5 minutes

export default async function PressRoomPage() {
  const { ok, data: pressReleases, error } = await getPressReleases()

  if (!ok || !pressReleases) {
    return (
      <div className="py-12 md:py-16 px-4 md:px-8">
        <ErrorDisplay message={error || "Could not fetch press releases."} />
      </div>
    )
  }

  return (
    <div className="py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Latest News</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Stay up-to-date with the latest announcements and media coverage from Eight Phases.
          </p>
        </div>

        {pressReleases.items.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pressReleases.items.map((release) => (
              <Card
                key={release.sys.id}
                className="bg-gray-900 border-gray-800 text-white flex flex-col overflow-hidden group transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
              >
                <CardHeader className="p-0">
                  <Link href={`/press/${release.fields.slug}`} className="block">
                    <div className="relative h-48 overflow-hidden">
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
                <CardContent className="p-6 flex-grow">
                  <Badge variant="secondary" className="mb-2">
                    {new Date(release.fields.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Badge>
                  <CardTitle className="text-xl mb-3">
                    <Link
                      href={`/press/${release.fields.slug}`}
                      className="hover:text-primary transition-colors line-clamp-2"
                    >
                      {release.fields.title}
                    </Link>
                  </CardTitle>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{release.fields.summary}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link
                    href={`/press/${release.fields.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Read More &rarr;
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-white">No Press Releases Found</h3>
            <p className="mt-2 text-sm text-gray-400">Please check your Contentful space configuration.</p>
            <p className="mt-1 text-xs text-gray-500">
              Ensure you have published entries with the content type ID 'pressRelease'.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

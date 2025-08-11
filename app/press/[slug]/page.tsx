import { getPressReleaseBySlug, getPressReleases } from "@/lib/contentful"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer"
import { BLOCKS, INLINES, type Document } from "@contentful/rich-text-types"
import { Badge } from "@/components/ui/badge"
import type { ReactNode } from "react"
import { ErrorDisplay } from "@/components/error-display"

export const revalidate = 300 // 5 minutes

export async function generateStaticParams() {
  const { ok, data: pressReleases } = await getPressReleases()
  if (!ok || !pressReleases) {
    return []
  }
  return pressReleases.items.map((release) => ({
    slug: release.fields.slug,
  }))
}

const renderOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: ReactNode) => (
      <p className="mb-6 text-lg leading-relaxed text-gray-300">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: ReactNode) => (
      <h2 className="text-3xl font-bold mt-12 mb-4 text-white border-b border-gray-700 pb-2">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: any, children: ReactNode) => (
      <h3 className="text-2xl font-bold mt-10 mb-4 text-white">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: ReactNode) => (
      <ul className="list-disc list-inside mb-6 pl-4 space-y-2 text-lg text-gray-300">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: ReactNode) => (
      <ol className="list-decimal list-inside mb-6 pl-4 space-y-2 text-lg text-gray-300">{children}</ol>
    ),
    [BLOCKS.QUOTE]: (node: any, children: ReactNode) => (
      <blockquote className="border-l-4 border-primary bg-gray-900 p-4 my-6 text-gray-300 italic">
        {children}
      </blockquote>
    ),
    [INLINES.HYPERLINK]: (node: any, children: ReactNode) => (
      <a href={node.data.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {children}
      </a>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { title, description, file } = node.data.target.fields
      if (file?.contentType.includes("image")) {
        const { url } = file
        const { width, height } = file.details.image
        return (
          <figure className="my-8">
            <Image
              src={`https:${url}`}
              alt={title || ""}
              width={width}
              height={height}
              className="rounded-lg shadow-lg mx-auto"
            />
            {description && <figcaption className="text-center text-sm text-gray-500 mt-2">{description}</figcaption>}
          </figure>
        )
      }
      return null
    },
  },
}

export default async function PressReleasePage({ params }: { params: { slug: string } }) {
  const { ok, data: release, error } = await getPressReleaseBySlug(params.slug)

  if (!ok || !release) {
    if (error === "Press release not found.") {
      notFound()
    }
    return (
      <div className="py-12 md:py-16 px-4 md:px-8">
        <ErrorDisplay message={error || "Could not fetch this press release."} />
      </div>
    )
  }

  return (
    <div className="py-12 md:py-16">
      <article className="max-w-3xl mx-auto px-4 md:px-0">
        <div className="mb-8">
          <Badge variant="secondary">
            {new Date(release.publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          {release.title}
        </h1>
        <p className="text-xl text-gray-400 mb-8">{release.summary}</p>

        {release.coverImage?.fields?.file?.url && (
          <div className="my-8 rounded-lg overflow-hidden shadow-lg aspect-video relative">
            <Image
              src={`https:${release.coverImage.fields.file.url}`}
              alt={release.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          {documentToReactComponents(release.content as Document, renderOptions)}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            &larr; Back to Press Room
          </Link>
        </div>
      </article>
    </div>
  )
}

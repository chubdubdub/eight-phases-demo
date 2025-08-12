import { getPressReleaseBySlug, getPressReleases, getRelatedPressReleases } from "@/lib/contentful"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from 'next-intl/server'
import Image from "next/image"
import Link from "next/link"
import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer"
import { BLOCKS, INLINES, type Document } from "@contentful/rich-text-types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Moon } from "lucide-react"
import type { ReactNode } from "react"
import { ErrorDisplay } from "@/components/error-display"

export const revalidate = 300 // 5 minutes

export async function generateStaticParams() {
  // Generate params for both locales
  const locales = ['en', 'fr']
  const allParams = []
  
  for (const locale of locales) {
    const { ok, data: pressReleases } = await getPressReleases(undefined, locale)
    if (ok && pressReleases) {
      pressReleases.items.forEach((release) => {
        allParams.push({
          slug: release.fields.slug,
        })
      })
    }
  }
  return allParams
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
  const locale = await getLocale()
  const t = await getTranslations('article')
  const { ok, data: release, error } = await getPressReleaseBySlug(params.slug, locale)

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

  // Fetch related articles
  const { ok: relatedOk, data: relatedReleases } = await getRelatedPressReleases(
    params.slug,
    release.category,
    release.tags,
    3,
    locale
  )

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

        {/* Article Tags */}
        {release.tags && release.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">{t('tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {release.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category Badge */}
        {release.category && (
          <div className="mt-6">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {release.category}
            </Badge>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            &larr; {t('backToPress')}
          </Link>
        </div>
      </article>
      
      {/* Related Articles Section */}
      {relatedOk && relatedReleases && relatedReleases.items.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{t('relatedArticles')}</h2>
            <p className="text-gray-400">{t('moreFromCategory', { category: release.category })}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedReleases.items.map((relatedRelease) => (
              <Card
                key={relatedRelease.sys.id}
                className="bg-gray-900 border-gray-800 text-white flex flex-col overflow-hidden group transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <CardHeader className="p-0">
                  <Link href={`/press/${relatedRelease.fields.slug}`} className="block">
                    <div className="relative h-32 overflow-hidden">
                      {relatedRelease.fields.coverImage?.fields?.file?.url ? (
                        <Image
                          src={`https:${relatedRelease.fields.coverImage.fields.file.url}`}
                          alt={relatedRelease.fields.title}
                          width={relatedRelease.fields.coverImage.fields.file.details.image?.width || 400}
                          height={relatedRelease.fields.coverImage.fields.file.details.image?.height || 300}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Moon className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                    </div>
                  </Link>
                </CardHeader>
                
                <CardContent className="p-4 flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {new Date(relatedRelease.fields.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <CardTitle className="text-base mb-2">
                    <Link
                      href={`/press/${relatedRelease.fields.slug}`}
                      className="hover:text-primary transition-colors line-clamp-2"
                    >
                      {relatedRelease.fields.title}
                    </Link>
                  </CardTitle>
                  
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {relatedRelease.fields.summary}
                  </p>
                  
                  <div className="mt-3">
                    <Link
                      href={`/press/${relatedRelease.fields.slug}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Read More &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

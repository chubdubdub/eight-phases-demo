import { createClient, type Asset, type EntryCollection } from "contentful"
import type { Document } from "@contentful/rich-text-types"

// Define the interface for a Press Release content type
export interface PressRelease {
  title: string
  slug: string
  publishDate: string
  summary: string
  coverImage?: Asset
  content: Document
}

// Define the interface for the Contentful client
interface ContentfulClient {
  getEntries<T>(query?: any): Promise<EntryCollection<T>>
}

// Create a function to get the Contentful client
const getContentfulClient = (): { client: ContentfulClient | null; error?: string } => {
  const space = process.env.CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

  if (!space || !accessToken) {
    const errorMessage =
      "Contentful environment variables are not set. Please add CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN to your Vercel project settings."
    console.error(errorMessage)
    return { client: null, error: errorMessage }
  }

  return {
    client: createClient({
      space,
      accessToken,
    }),
  }
}

// Define a generic response type
export type ApiResponse<T> = {
  ok: boolean
  data: T | null
  error?: string
}

// Function to fetch all press releases
export const getPressReleases = async (): Promise<ApiResponse<EntryCollection<PressRelease>>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const entries = await client.getEntries<PressRelease>({
      content_type: "pressRelease",
      order: ["-fields.publishDate"],
    })
    return { ok: true, data: entries }
  } catch (e: any) {
    console.error(e)
    return { ok: false, data: null, error: "Failed to fetch data from Contentful." }
  }
}

// Function to fetch a single press release by its slug
export const getPressReleaseBySlug = async (slug: string): Promise<ApiResponse<PressRelease>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const entries = await client.getEntries<PressRelease>({
      content_type: "pressRelease",
      "fields.slug": slug,
      limit: 1,
    })

    if (entries.items && entries.items.length > 0) {
      return { ok: true, data: entries.items[0].fields }
    }

    return { ok: false, data: null, error: "Press release not found." }
  } catch (e: any) {
    console.error(e)
    return { ok: false, data: null, error: "Failed to fetch data from Contentful." }
  }
}

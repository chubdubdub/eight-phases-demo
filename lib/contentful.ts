import { createClient, type Asset, type EntryCollection } from "contentful"
import type { Document } from "@contentful/rich-text-types"

// Define the interface for a Press Release content type
export interface PressRelease {
  title: string
  slug: string
  publishDate: string
  summary: string
  category: string
  tags?: string[]
  coverImage?: Asset
  content: Document
}

// Define the interface for a Press Kit Asset content type
export interface PressKitAsset {
  title: string
  description?: string
  category: string
  file: Asset
  fileSize?: string
  lastUpdated?: string
}

// Define search and filter parameters
export interface SearchFilters {
  query?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

// Define press release categories
export const PRESS_RELEASE_CATEGORIES = [
  "Awards",
  "Hotel Openings", 
  "Partnerships",
  "Executive News",
  "Company Updates",
  "Events",
  "Sustainability"
] as const

export type PressReleaseCategory = typeof PRESS_RELEASE_CATEGORIES[number]

// Define press kit asset categories
export const PRESS_KIT_CATEGORIES = [
  "Logos",
  "Brand Guidelines",
  "Fact Sheets", 
  "Images",
  "Documents"
] as const

export type PressKitCategory = typeof PRESS_KIT_CATEGORIES[number]

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

// Function to fetch all press releases with optional filtering
export const getPressReleases = async (filters?: SearchFilters): Promise<ApiResponse<EntryCollection<PressRelease>>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const query: any = {
      content_type: "pressRelease",
      order: ["-fields.publishDate"],
    }

    // Apply filters if provided
    if (filters?.category) {
      query["fields.category"] = filters.category
    }
    
    if (filters?.dateFrom) {
      query["fields.publishDate[gte]"] = filters.dateFrom
    }
    
    if (filters?.dateTo) {
      query["fields.publishDate[lte]"] = filters.dateTo
    }
    
    if (filters?.query) {
      query["query"] = filters.query
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      query["fields.tags[in]"] = filters.tags.join(",")
    }

    const entries = await client.getEntries<PressRelease>(query)
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

// Function to fetch related press releases based on category and tags
export const getRelatedPressReleases = async (currentSlug: string, category: string, tags?: string[], limit: number = 3): Promise<ApiResponse<EntryCollection<PressRelease>>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const query: any = {
      content_type: "pressRelease",
      "fields.slug[ne]": currentSlug, // Exclude current article
      "fields.category": category,
      order: ["-fields.publishDate"],
      limit,
    }

    // If tags are provided, prefer articles with matching tags
    if (tags && tags.length > 0) {
      query["fields.tags[in]"] = tags.join(",")
    }

    const entries = await client.getEntries<PressRelease>(query)
    return { ok: true, data: entries }
  } catch (e: any) {
    console.error(e)
    return { ok: false, data: null, error: "Failed to fetch related press releases." }
  }
}

// Function to fetch all press kit assets
export const getPressKitAssets = async (category?: string): Promise<ApiResponse<EntryCollection<PressKitAsset>>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const query: any = {
      content_type: "pressKitAsset",
      order: ["fields.category", "fields.title"],
    }

    if (category) {
      query["fields.category"] = category
    }

    const entries = await client.getEntries<PressKitAsset>(query)
    return { ok: true, data: entries }
  } catch (e: any) {
    console.error(e)
    return { ok: false, data: null, error: "Failed to fetch press kit assets." }
  }
}

// Function to get all unique tags from press releases (for filter options)
export const getPressReleaseTags = async (): Promise<ApiResponse<string[]>> => {
  const { client, error } = getContentfulClient()
  if (!client) {
    return { ok: false, data: null, error }
  }

  try {
    const entries = await client.getEntries<PressRelease>({
      content_type: "pressRelease",
      select: "fields.tags",
      limit: 1000, // Get all entries to collect tags
    })

    const allTags = new Set<string>()
    entries.items.forEach(item => {
      if (item.fields.tags) {
        item.fields.tags.forEach(tag => allTags.add(tag))
      }
    })

    return { ok: true, data: Array.from(allTags).sort() }
  } catch (e: any) {
    console.error(e)
    return { ok: false, data: null, error: "Failed to fetch press release tags." }
  }
}

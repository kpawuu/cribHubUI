import { useSitePagesStore } from '@@/stores/sitePages'
import type { PaginatedResult } from '../../utils/feathersNormalize'

export type SitePageRecord = {
  _id: string
  slug: string
  title: string
  body: string
  section: string
  status: string
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

/** Delegates to Pinia `useSitePagesStore` (realtime wired on first fetch). */
export function useSitePagesApi() {
  const store = useSitePagesStore()

  async function fetchBySlug(slug: string): Promise<SitePageRecord | null> {
    return (await store.fetchBySlug(slug)) as SitePageRecord | null
  }

  async function fetchBlogList(limit = 50): Promise<PaginatedResult<SitePageRecord>> {
    return store.fetchBlogList(limit) as Promise<PaginatedResult<SitePageRecord>>
  }

  return { fetchBySlug, fetchBlogList }
}

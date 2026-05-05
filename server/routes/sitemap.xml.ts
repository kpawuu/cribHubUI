/**
 * Dynamic sitemap.xml
 * Accessible at: GET /sitemap.xml
 *
 * Generates a complete sitemap by fetching live properties and blog posts
 * from the API at render time. Cached for 1 hour via Cache-Control so the
 * origin is not hammered on every crawler request.
 */

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public?.siteUrl as string) || 'https://cribhub.com'
  // Use private apiBaseUrl for server-side fetch (avoids going through public internet)
  const apiBase = (config.apiBaseUrl as string) || (config.public?.apiBaseUrl as string) || 'http://localhost:3036'

  const today = new Date().toISOString().split('T')[0]

  // ── Static routes ────────────────────────────────────────────────────────
  const staticUrls: SitemapUrl[] = [
    { loc: '/',                         priority: '1.0', changefreq: 'daily',   lastmod: today },
    { loc: '/listings',                 priority: '0.95', changefreq: 'hourly', lastmod: today },
    { loc: '/agents',                   priority: '0.85', changefreq: 'daily',  lastmod: today },
    { loc: '/blog',                     priority: '0.75', changefreq: 'daily',  lastmod: today },
    { loc: '/tools/price-calculator',   priority: '0.65', changefreq: 'weekly', lastmod: today },
    { loc: '/tools/market-trends',      priority: '0.65', changefreq: 'weekly', lastmod: today },
    { loc: '/tools/valuation',          priority: '0.65', changefreq: 'weekly', lastmod: today },
    { loc: '/explore/neighborhoods',    priority: '0.6',  changefreq: 'weekly', lastmod: today },
    { loc: '/p/about',                  priority: '0.4',  changefreq: 'monthly',lastmod: today },
    { loc: '/p/contact',                priority: '0.4',  changefreq: 'monthly',lastmod: today },
    { loc: '/p/privacy-policy',         priority: '0.3',  changefreq: 'yearly', lastmod: today },
    { loc: '/p/terms-of-service',       priority: '0.3',  changefreq: 'yearly', lastmod: today },
  ]

  // ── Dynamic: properties ──────────────────────────────────────────────────
  let propertyUrls: SitemapUrl[] = []
  try {
    const res = await $fetch<any>(`${apiBase}/properties`, {
      query: { $limit: 2000, $select: ['_id', 'updatedAt'], $sort: { updatedAt: -1 } },
      timeout: 8000,
    })
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    propertyUrls = list.map((p) => ({
      loc: `/properties/${p._id}`,
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : today,
      changefreq: 'weekly',
      priority: '0.8',
    }))
  } catch {
    // Graceful degradation — sitemap still works without dynamic URLs
  }

  // ── Dynamic: agent profiles ──────────────────────────────────────────────
  let agentUrls: SitemapUrl[] = []
  try {
    const res = await $fetch<any>(`${apiBase}/agent-profiles`, {
      query: { $limit: 1000, $select: ['_id', 'userId', 'updatedAt'] },
      timeout: 8000,
    })
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    agentUrls = list.map((a) => ({
      loc: `/agents/${a._id || a.userId}`,
      lastmod: a.updatedAt ? a.updatedAt.split('T')[0] : today,
      changefreq: 'monthly',
      priority: '0.6',
    }))
  } catch {}

  // ── Dynamic: blog posts ──────────────────────────────────────────────────
  let blogUrls: SitemapUrl[] = []
  try {
    const res = await $fetch<any>(`${apiBase}/site-pages`, {
      query: { section: 'blog', status: 'published', $limit: 500, $select: ['slug', 'updatedAt'] },
      timeout: 8000,
    })
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    blogUrls = list
      .filter((p) => p.slug)
      .map((p) => ({
        loc: `/blog/${p.slug}`,
        lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : today,
        changefreq: 'monthly',
        priority: '0.6',
      }))
  } catch {}

  // ── Build XML ────────────────────────────────────────────────────────────
  const allUrls: SitemapUrl[] = [...staticUrls, ...propertyUrls, ...agentUrls, ...blogUrls]

  const urlNodes = allUrls
    .map((u) =>
      [
        '  <url>',
        `    <loc>${escapeXml(siteUrl + u.loc)}</loc>`,
        u.lastmod    ? `    <lastmod>${u.lastmod}</lastmod>` : '',
        u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : '',
        u.priority   ? `    <priority>${u.priority}</priority>` : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlNodes}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  // Cache for 1 hour in CDN / shared caches; private caches revalidate sooner
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400')

  return xml
})

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

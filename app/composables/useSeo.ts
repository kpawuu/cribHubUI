/**
 * useSeo — centralised SEO composable for CribHub.
 *
 * Writes reactive Open Graph, Twitter, canonical, and JSON-LD tags in a
 * single call. All options accept plain values or computed refs so dynamic
 * pages (property detail, agent profile, blog post) work without watchers.
 *
 * Usage — static page:
 *   useSeo({ title: 'Find an Agent', description: '…' })
 *
 * Usage — dynamic page (values resolved reactively):
 *   useSeo(computed(() => ({
 *     title: property.value?.name ?? 'Property',
 *     description: property.value?.description,
 *     image: property.value?.images?.[0],
 *     structuredData: buildListingSchema(property.value),
 *   })))
 */

export interface SeoOptions {
  /** Page title — appended with titleTemplate in nuxt.config ('… | CribHub'). */
  title: string
  /** Meta description (150–160 chars ideal). Falls back to global default. */
  description?: string
  /** Absolute URL of the OG/Twitter card image (1200×630 recommended). */
  image?: string
  /** Canonical URL override — defaults to current route path. */
  canonicalUrl?: string
  /** OG type — 'website' for most pages, 'article' for blog posts. */
  type?: 'website' | 'article'
  /** Prevent indexing — use only for private/thin content pages. */
  noindex?: boolean
  /** JSON-LD structured data object (rendered as <script type="application/ld+json">). */
  structuredData?: Record<string, any> | null
}

export function useSeo(optionsOrGetter: SeoOptions | Ref<SeoOptions> | ComputedRef<SeoOptions>) {
  const config = useRuntimeConfig()
  const route  = useRoute()

  const siteUrl = (config.public.siteUrl as string) || 'https://cribhub.com'
  const defaultImage = `${siteUrl}/images/og-default.jpg`

  /** Resolve options whether passed as plain object, ref, or computed ref. */
  const opts = computed<SeoOptions>(() =>
    isRef(optionsOrGetter) ? optionsOrGetter.value : optionsOrGetter
  )

  const canonical = computed(() => {
    const override = opts.value.canonicalUrl
    if (override) return override
    // Strip query params from canonical (avoids duplicate-content issues with filters)
    return `${siteUrl}${route.path}`
  })

  const ogImage = computed(() => opts.value.image || defaultImage)

  useSeoMeta({
    title:            () => opts.value.title,
    ogTitle:          () => opts.value.title,
    description:      () => opts.value.description,
    ogDescription:    () => opts.value.description,
    ogImage:          () => ogImage.value,
    ogImageAlt:       () => opts.value.title,
    ogUrl:            () => canonical.value,
    ogType:           () => opts.value.type || 'website',
    twitterTitle:     () => opts.value.title,
    twitterDescription: () => opts.value.description,
    twitterImage:     () => ogImage.value,
    twitterImageAlt:  () => opts.value.title,
    twitterCard:      'summary_large_image',
    robots:           () => opts.value.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonical.value }],
    script: opts.value.structuredData
      ? [{
          type: 'application/ld+json',
          key: 'structured-data',
          innerHTML: JSON.stringify(opts.value.structuredData),
        }]
      : [],
  }))
}

// ── Pre-built JSON-LD schema helpers ────────────────────────────────────────

/** Organization schema — used on homepage / sitewide. */
export function buildOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CribHub',
    url: siteUrl,
    logo: `${siteUrl}/images/logo/logo.png`,
    sameAs: [],
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'English',
    }],
  }
}

/** WebSite schema with SearchAction — enables Google's sitelinks search box. */
export function buildWebSiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CribHub',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/listings?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** RealEstateListing schema for individual property pages. */
export function buildListingSchema(property: any, siteUrl: string) {
  if (!property) return null
  const images: string[] = Array.isArray(property.images)
    ? property.images
    : property.coverImageUrl
    ? [property.coverImageUrl]
    : []

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name || 'Property Listing',
    description: property.description || undefined,
    url: `${siteUrl}/properties/${property._id}`,
    image: images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || undefined,
      addressLocality: property.city || undefined,
      addressRegion: property.state || undefined,
      addressCountry: property.country || 'GH',
    },
    ...(property.price != null && {
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: property.priceCurrency || 'GHS',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(property.bedrooms != null && { numberOfRooms: property.bedrooms }),
  }
}

/** Person schema for agent profile pages. */
export function buildAgentSchema(agent: any, siteUrl: string) {
  if (!agent) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: agent.displayName || agent.name,
    description: agent.bio || undefined,
    image: agent.avatarUrl || undefined,
    url: `${siteUrl}/agents/${agent._id || agent.userId}`,
    jobTitle: 'Real Estate Agent',
    worksFor: agent.agency ? { '@type': 'Organization', name: agent.agency } : undefined,
  }
}

/** BlogPosting schema for blog post pages. */
export function buildBlogPostSchema(post: any, siteUrl: string) {
  if (!post) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || undefined,
    image: post.coverImageUrl || `${siteUrl}/images/og-default.jpg`,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    publisher: {
      '@type': 'Organization',
      name: 'CribHub',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/images/logo/logo.png` },
    },
    author: { '@type': 'Organization', name: 'CribHub' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
  }
}

/** BreadcrumbList schema helper. */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

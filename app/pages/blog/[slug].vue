<template>
  <div class="min-h-screen bg-gray-50">
    <SitePageArticle
      :title="pageLive?.title || ''"
      :html-body="htmlBody"
      :loading="pending"
      :not-found="!pending && !pageLive"
      section-label="Blog"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Blog', to: '/blog' },
        { label: pageLive?.title || 'Article' }
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { useSitePagesStore } from '@@/stores/sitePages'
import { useSeo, buildBlogPostSchema, buildBreadcrumbSchema } from '../../composables/useSeo'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { public: { siteUrl } } = useRuntimeConfig()

const sitePages = useSitePagesStore()
const { data: page, pending } = await useAsyncData(
  () => `blog-post-${slug.value}`,
  () => sitePages.fetchBySlug(slug.value),
  { watch: [slug] }
)

const pageLive = computed(() => sitePages.detailBySlug[slug.value] ?? page.value ?? null)
const { toDisplayHtml } = useSitePageBody()

const htmlBody = computed(() => (pageLive.value ? toDisplayHtml(pageLive.value.body) : ''))

useSeo(computed(() => {
  const p = pageLive.value
  const title = p?.metaTitle || p?.title || 'CribHub Blog'
  return {
    title,
    description: p?.metaDescription || `Read "${title}" on the CribHub blog — insights and guides on Ghana real estate.`,
    image: p?.coverImageUrl || undefined,
    type: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        buildBlogPostSchema(p, siteUrl as string),
        buildBreadcrumbSchema([
          { name: 'Home', url: siteUrl as string },
          { name: 'Blog', url: `${siteUrl}/blog` },
          { name: title,  url: `${siteUrl}/blog/${slug.value}` },
        ]),
      ].filter(Boolean),
    },
  }
}))
</script>

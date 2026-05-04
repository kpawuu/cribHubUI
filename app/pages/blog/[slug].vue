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

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const sitePages = useSitePagesStore()
const { data: page, pending } = await useAsyncData(
  () => `blog-post-${slug.value}`,
  () => import.meta.server ? Promise.resolve(null) : sitePages.fetchBySlug(slug.value),
  { watch: [slug], server: false, lazy: true }
)

const pageLive = computed(() => sitePages.detailBySlug[slug.value] ?? page.value ?? null)
const { toDisplayHtml } = useSitePageBody()

const htmlBody = computed(() => (pageLive.value ? toDisplayHtml(pageLive.value.body) : ''))

useHead(() => ({
  title: pageLive.value?.metaTitle || pageLive.value?.title
    ? `${pageLive.value?.metaTitle || pageLive.value?.title} — CribHub`
    : 'Blog — CribHub',
  meta: pageLive.value?.metaDescription
    ? [{ name: 'description', content: pageLive.value.metaDescription }]
    : []
}))
</script>

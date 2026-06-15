<template>
  <div class="min-h-screen bg-gray-50">
    <SitePageArticle
      :title="pageLive?.title || ''"
      :html-body="htmlBody"
      :loading="pending"
      :not-found="!pending && !pageLive"
      section-label="Page"
      :breadcrumbs="[{ label: 'Home', to: '/' }, { label: pageLive?.title || 'Page' }]"
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
  () => `site-page-${slug.value}`,
  () => sitePages.fetchBySlug(slug.value),
  { watch: [slug] }
)

const pageLive = computed(() => sitePages.detailBySlug[slug.value] ?? page.value ?? null)
const { toDisplayHtml } = useSitePageBody()

const htmlBody = computed(() => (pageLive.value ? toDisplayHtml(pageLive.value.body) : ''))

useHead(() => ({
  title: pageLive.value?.metaTitle || pageLive.value?.title
    ? `${pageLive.value?.metaTitle || pageLive.value?.title} — CribHub`
    : 'CribHub',
  meta: pageLive.value?.metaDescription
    ? [{ name: 'description', content: pageLive.value.metaDescription }]
    : []
}))
</script>

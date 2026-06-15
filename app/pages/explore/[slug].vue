<template>
  <div class="min-h-screen bg-gray-50">
    <SitePageArticle
      :title="pageLive?.title || ''"
      :html-body="htmlBody"
      :loading="pending"
      :not-found="!pending && !pageLive"
      section-label="Explore"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Explore', to: '/explore/neighborhoods' },
        { label: pageLive?.title || 'Explore' }
      ]"
    />

    <!-- Neighborhoods widget -->
    <div v-if="pageLive && slug === 'neighborhoods'" class="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <i class="las la-map-marker-alt text-lg"></i>
          </div>
          <div>
            <h2 class="text-sm font-bold text-gray-900">Browse by Neighborhood</h2>
            <p class="text-[11px] text-gray-500">Jump directly to listings in popular Accra areas</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-3">
          <NuxtLink
            v-for="a in areaLinks"
            :key="a.q"
            :to="{ path: '/listings', query: { type: 'rent', location: a.q } }"
            class="group flex items-center gap-3 bg-white px-4 py-3.5 transition-colors hover:bg-primary-50"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-all text-sm font-bold">
              {{ a.label.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition-colors truncate">{{ a.label }}</p>
              <p class="text-[11px] text-gray-400">{{ a.count }} listings</p>
            </div>
            <i class="las la-arrow-right ml-auto text-gray-300 group-hover:text-primary-500 transition-all group-hover:translate-x-0.5"></i>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSitePagesStore } from '@@/stores/sitePages'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const sitePages = useSitePagesStore()
const { data: page, pending } = await useAsyncData(
  () => `explore-page-${slug.value}`,
  () => sitePages.fetchBySlug(slug.value),
  { watch: [slug] }
)

const pageLive = computed(() => sitePages.detailBySlug[slug.value] ?? page.value ?? null)
const { toDisplayHtml } = useSitePageBody()
const htmlBody = computed(() => (pageLive.value ? toDisplayHtml(pageLive.value.body) : ''))

const areaLinks = [
  { label: 'East Legon', q: 'East Legon', count: '240+' },
  { label: 'Cantonments', q: 'Cantonments', count: '180+' },
  { label: 'Airport Residential', q: 'Airport Residential', count: '210+' },
  { label: 'Spintex', q: 'Spintex', count: '320+' },
  { label: 'Tema', q: 'Tema', count: '290+' },
  { label: 'Achimota', q: 'Achimota', count: '155+' },
  { label: 'Osu', q: 'Osu', count: '120+' },
  { label: 'Labone', q: 'Labone', count: '95+' },
  { label: 'Accra Central', q: 'Accra', count: '380+' },
]

useHead(() => ({
  title: pageLive.value?.metaTitle || pageLive.value?.title
    ? `${pageLive.value?.metaTitle || pageLive.value?.title} — CribHub`
    : 'Explore — CribHub',
  meta: pageLive.value?.metaDescription
    ? [{ name: 'description', content: pageLive.value.metaDescription }]
    : []
}))
</script>

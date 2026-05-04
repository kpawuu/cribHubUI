<template>
  <div class="min-h-screen bg-gray-50">
    <div class="border-b border-gray-100 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <nav class="flex items-center gap-1.5 text-xs text-gray-500">
          <NuxtLink to="/" class="font-medium hover:text-primary-600 transition-colors">Home</NuxtLink>
          <i class="las la-angle-right text-[10px] text-gray-300"></i>
          <span class="font-semibold text-gray-900">Tools</span>
          <template v-if="pageLive?.title">
            <i class="las la-angle-right text-[10px] text-gray-300"></i>
            <span class="font-semibold text-gray-900">{{ pageLive.title }}</span>
          </template>
        </nav>
      </div>
    </div>

    <!-- Tool hub landing -->
    <template v-if="!slug || slug === 'tools'">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div class="mb-6">
          <p class="text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-1">Property Tools</p>
          <h1 class="font-heading text-3xl font-bold tracking-tight text-gray-900">Smart Real Estate Tools</h1>
          <p class="mt-2 text-sm text-gray-600 max-w-xl">Make smarter property decisions with data-driven tools built for the Accra market.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <NuxtLink
            v-for="t in toolCards"
            :key="t.slug"
            :to="`/tools/${t.slug}`"
            class="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-3 group-hover:bg-primary-100 transition-colors">
              <i :class="t.icon" class="text-xl"></i>
            </div>
            <h3 class="font-heading text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{{ t.title }}</h3>
            <p class="mt-1 text-xs text-gray-500 flex-1">{{ t.description }}</p>
            <p class="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-600">
              Open tool <i class="las la-arrow-right transition-transform group-hover:translate-x-1"></i>
            </p>
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Price Calculator -->
    <template v-else-if="slug === 'price-calculator'">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SiteToolPageIntro :page="pageLive" :html-body="htmlBody" :pending="pending" />
        <SitePriceCalculatorWidget />
      </div>
    </template>

    <!-- Market Trends -->
    <template v-else-if="slug === 'market-trends'">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SiteToolPageIntro :page="pageLive" :html-body="htmlBody" :pending="pending" />
        <SiteMarketTrendsTool />
      </div>
    </template>

    <!-- Valuation -->
    <template v-else-if="slug === 'valuation'">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SiteToolPageIntro :page="pageLive" :html-body="htmlBody" :pending="pending" />
        <SiteValuationTool />
      </div>
    </template>

    <!-- Generic CMS page -->
    <template v-else>
      <SitePageArticle
        :title="pageLive?.title || ''"
        :html-body="htmlBody"
        :loading="pending"
        :not-found="!pending && !pageLive"
        section-label="Tools"
        :breadcrumbs="[
          { label: 'Home', to: '/' },
          { label: 'Tools', to: '/tools/price-calculator' },
          { label: pageLive?.title || slug }
        ]"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSitePagesStore } from '@@/stores/sitePages'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const toolCards = [
  { slug: 'price-calculator', title: 'Mortgage Calculator', description: 'Estimate monthly repayments with deposit, interest rate, and term adjustments.', icon: 'las la-calculator' },
  { slug: 'market-trends', title: 'Market Trends', description: 'Compare property prices across Accra areas with 12-month trend data.', icon: 'las la-chart-line' },
  { slug: 'valuation', title: 'Property Valuation', description: 'Get an indicative value range based on location, type, size, and condition.', icon: 'las la-home' },
]

const sitePages = useSitePagesStore()
const { data: page, pending } = await useAsyncData(
  () => `tools-page-${slug.value}`,
  () => import.meta.server ? Promise.resolve(null) : sitePages.fetchBySlug(slug.value),
  { watch: [slug], server: false, lazy: true }
)

const pageLive = computed(() => sitePages.detailBySlug[slug.value] ?? page.value ?? null)
const { toDisplayHtml } = useSitePageBody()
const htmlBody = computed(() => (pageLive.value ? toDisplayHtml(pageLive.value.body) : ''))

useHead(() => ({
  title: pageLive.value?.metaTitle || pageLive.value?.title
    ? `${pageLive.value?.metaTitle || pageLive.value?.title} — CribHub`
    : 'Tools — CribHub',
  meta: pageLive.value?.metaDescription
    ? [{ name: 'description', content: pageLive.value.metaDescription }]
    : []
}))
</script>

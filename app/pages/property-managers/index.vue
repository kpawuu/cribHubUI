<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Hero -->
    <div class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="mb-3 inline-block rounded bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
              TRUSTED PROPERTY MANAGERS
            </span>
            <h1 class="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">Find a Property Manager</h1>
            <p class="max-w-xl text-sm text-gray-500">
              Browse certified property managers across Ghana. Compare services, fees, and reviews.
              <span class="font-medium text-gray-700">{{ pms.total }}</span> managers on CribHub.
            </p>
          </div>
          <NuxtLink
            to="/listings"
            class="inline-flex shrink-0 items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <i class="las la-search text-base text-violet-600"></i>
            Browse listings
          </NuxtLink>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded border border-gray-200 bg-white p-3 text-center">
            <p class="text-xl font-bold tabular-nums text-gray-900">{{ pms.total }}</p>
            <p class="mt-0.5 text-[11px] text-gray-500">Total managers</p>
          </div>
          <div class="rounded border border-gray-200 bg-white p-3 text-center">
            <p class="text-xl font-bold tabular-nums text-emerald-600">{{ verifiedCount }}</p>
            <p class="mt-0.5 text-[11px] text-gray-500">Verified</p>
          </div>
          <div class="rounded border border-gray-200 bg-white p-3 text-center">
            <p class="text-xl font-bold tabular-nums text-violet-600">{{ filtered.length }}</p>
            <p class="mt-0.5 text-[11px] text-gray-500">In this view</p>
          </div>
          <div class="rounded border border-gray-200 bg-white p-3 text-center">
            <p class="text-xl font-bold tabular-nums text-amber-600">{{ uniqueRegions }}</p>
            <p class="mt-0.5 text-[11px] text-gray-500">Regions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div class="flex overflow-x-auto rounded border border-gray-200 bg-white p-0.5 text-xs font-medium">
          <button
            v-for="tab in serviceTabs"
            :key="tab.key"
            type="button"
            class="whitespace-nowrap rounded px-3 py-1.5 transition"
            :class="serviceFilter === tab.key ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
            @click="serviceFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <label class="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-medium text-gray-700">
          <input
            v-model="verifiedOnly"
            type="checkbox"
            class="h-3.5 w-3.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          Verified only
        </label>

        <div class="relative ml-auto w-full sm:w-72">
          <i class="las la-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by name, company, region…"
            class="w-full rounded border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-violet-400 focus:outline-none"
          />
        </div>

        <select
          v-model="sortBy"
          class="rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-violet-400 focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="verified">Verified first</option>
          <option value="rating">Top rated</option>
          <option value="portfolio">Largest portfolio</option>
          <option value="years">Most experience</option>
          <option value="name">A–Z name</option>
        </select>
      </div>
    </div>

    <!-- Main grid -->
    <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div v-if="pms.isLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div class="h-28 animate-pulse bg-gray-100"></div>
          <div class="space-y-3 p-5 pt-10">
            <div class="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
            <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100"></div>
            <div class="h-3 w-full animate-pulse rounded bg-gray-100"></div>
            <div class="mt-4 h-8 w-full animate-pulse rounded bg-gray-100"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!filtered.length"
        class="rounded border border-gray-200 bg-white p-16 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <i class="las la-user-tie text-3xl text-gray-300"></i>
        </div>
        <p class="text-sm font-semibold text-gray-900">No property managers found</p>
        <p class="mt-1 text-xs text-gray-500">
          {{ searchQuery ? `No results for "${searchQuery}".` : 'No managers match the current filter.' }}
        </p>
        <button
          v-if="searchQuery || verifiedOnly || serviceFilter !== 'all'"
          type="button"
          class="mt-4 inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          @click="clearFilters"
        >
          <i class="las la-times"></i> Clear filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UiPmProfileCard v-for="pm in filtered" :key="String(pm._id)" :pm="pm" />
      </div>

      <div ref="scrollSentinel" class="flex h-16 items-center justify-center py-6">
        <span v-if="pms.isLoadingMore" class="flex items-center gap-2 text-sm text-gray-400">
          <i class="las la-circle-notch la-spin"></i> Loading more…
        </span>
        <span v-else-if="pms.hasMore" class="text-xs text-gray-300">Scroll for more managers</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePropertyManagersStore } from '@@/stores/propertyManagers'
import { useSeo } from '../../composables/useSeo'

definePageMeta({ layout: 'default' })
useSeo({
  title: 'Find a Property Manager in Ghana',
  description:
    'Browse certified property managers across Ghana. Compare services, regions, fees, and reviews. Connect with trusted managers to oversee your rental portfolio on CribHub.',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Property Managers in Ghana — CribHub',
    description: 'Directory of certified property managers on CribHub'
  }
})

const pms = usePropertyManagersStore()
const scrollSentinel = ref<HTMLElement | null>(null)

const searchQuery = ref('')
const serviceFilter = ref('all')
const verifiedOnly = ref(false)
const sortBy = ref<'newest' | 'verified' | 'rating' | 'portfolio' | 'years' | 'name'>('newest')

const serviceTabs = [
  { key: 'all', label: 'All Managers' },
  { key: 'residential', label: 'Residential' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'leasing', label: 'Leasing' }
]

const verifiedCount = computed(() => pms.list.filter((p: any) => p.verified).length)
const uniqueRegions = computed(() => {
  const all = pms.list.flatMap((p: any) => p.regions || [])
  return new Set(all).size
})

const filtered = computed(() => {
  let list = [...pms.list]
  if (verifiedOnly.value) list = list.filter((p: any) => p.verified)
  if (serviceFilter.value !== 'all') {
    const f = serviceFilter.value.toLowerCase()
    list = list.filter((p: any) => {
      const services = (p.services || []).join(' ').toLowerCase()
      const bio = (p.bio || '').toLowerCase()
      const company = (p.companyName || '').toLowerCase()
      return services.includes(f) || bio.includes(f) || company.includes(f)
    })
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p: any) =>
      [p.displayName, p.companyName, p.bio, ...(p.regions || []), ...(p.services || []), ...(p.languages || [])].some(
        (s: any) => (s || '').toLowerCase().includes(q)
      )
    )
  }
  switch (sortBy.value) {
    case 'verified':
      list = [...list].sort((a: any, b: any) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
      break
    case 'rating':
      list = [...list].sort((a: any, b: any) => {
        const avg = (x: any) => Number(x.ratingAvg) || 0
        const cnt = (x: any) => Number(x.ratingCount) || 0
        if (avg(b) !== avg(a)) return avg(b) - avg(a)
        return cnt(b) - cnt(a)
      })
      break
    case 'portfolio':
      list = [...list].sort((a: any, b: any) => (b.portfolioSize ?? 0) - (a.portfolioSize ?? 0))
      break
    case 'years':
      list = [...list].sort((a: any, b: any) => (b.yearsManaging ?? 0) - (a.yearsManaging ?? 0))
      break
    case 'name':
      list = [...list].sort((a: any, b: any) => (a.displayName || '').localeCompare(b.displayName || ''))
      break
  }
  return list
})

function clearFilters() {
  searchQuery.value = ''
  serviceFilter.value = 'all'
  verifiedOnly.value = false
}

useInfiniteScroll(scrollSentinel, () => { void pms.loadMore() })

onMounted(() => { void pms.fetchList() })
</script>

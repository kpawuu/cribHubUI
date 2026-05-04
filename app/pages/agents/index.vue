<template>
  <!-- Public page — no auth required, uses default layout -->
  <div class="min-h-screen bg-gray-50">

    <!-- Hero banner -->
    <div class="bg-white border-b border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-[11px] font-bold rounded uppercase tracking-wide mb-3">
              TOP PERFORMERS
            </span>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Find an Agent</h1>
            <p class="text-sm text-gray-500 max-w-xl">
              Browse certified professionals with proven real estate track records.
              <span class="font-medium text-gray-700">{{ agents.total }}</span> agents on CribHub.
            </p>
          </div>
          <NuxtLink
            to="/listings"
            class="shrink-0 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Browse listings
          </NuxtLink>
        </div>

        <!-- Stats row -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white rounded border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-gray-900 tabular-nums">{{ agents.total }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5">Total agents</p>
          </div>
          <div class="bg-white rounded border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-emerald-600 tabular-nums">{{ verifiedCount }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5">Verified</p>
          </div>
          <div class="bg-white rounded border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-primary-600 tabular-nums">{{ filteredAgents.length }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5">In this view</p>
          </div>
          <div class="bg-white rounded border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-amber-600 tabular-nums">{{ uniqueRegions }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5">Regions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">

        <!-- Specialty filter tabs -->
        <div class="flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium overflow-x-auto">
          <button
            v-for="tab in specialtyTabs"
            :key="tab.key"
            type="button"
            class="rounded px-3 py-1.5 whitespace-nowrap transition"
            :class="specialtyFilter === tab.key ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
            @click="specialtyFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Verified only -->
        <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 whitespace-nowrap">
          <input
            v-model="verifiedOnly"
            type="checkbox"
            class="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Verified only
        </label>

        <!-- Search -->
        <div class="relative ml-auto w-full sm:w-72">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by name, agency, region…"
            class="w-full rounded border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400"
          />
        </div>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-primary-400"
        >
          <option value="newest">Newest first</option>
          <option value="verified">Verified first</option>
          <option value="rating">Top rated</option>
          <option value="listings">Most listings</option>
          <option value="response">Fastest response</option>
          <option value="name">A–Z name</option>
        </select>
      </div>
    </div>

    <!-- Main content -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">

      <!-- Loading skeletons -->
      <div v-if="agents.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div class="h-28 animate-pulse bg-gray-100"></div>
          <div class="pt-10 p-5 space-y-3">
            <div class="h-4 w-2/3 animate-pulse bg-gray-100 rounded"></div>
            <div class="h-3 w-1/2 animate-pulse bg-gray-100 rounded"></div>
            <div class="h-3 w-full animate-pulse bg-gray-100 rounded"></div>
            <div class="h-8 w-full animate-pulse bg-gray-100 rounded mt-4"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!filteredAgents.length"
        class="bg-white rounded border border-gray-200 p-16 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-900">No agents found</p>
        <p class="mt-1 text-xs text-gray-500">
          {{ searchQuery ? `No results for "${searchQuery}".` : 'No agents match the current filter.' }}
        </p>
        <button
          v-if="searchQuery || verifiedOnly || specialtyFilter !== 'all'"
          type="button"
          class="mt-4 inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          @click="clearFilters"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Clear filters
        </button>
      </div>

      <!-- Agent grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiAgentProfileCard v-for="(a, idx) in filteredAgents" :key="String(a._id)" :agent="a" :card-index="idx" />
      </div>

      <!-- Load more -->
      <div ref="scrollSentinel" class="flex h-16 items-center justify-center py-6">
        <span v-if="agents.isLoadingMore" class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Loading more…
        </span>
        <span v-else-if="agents.hasMore" class="text-xs text-gray-300">Scroll for more agents</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAgentsStore } from '@@/stores/agents'

definePageMeta({ layout: 'default' })
useHead({ title: 'Find an Agent - CribHub' })

const agents = useAgentsStore()
const scrollSentinel = ref<HTMLElement | null>(null)

const searchQuery = ref('')
const specialtyFilter = ref('all')
const verifiedOnly = ref(false)
const sortBy = ref<'newest' | 'verified' | 'listings' | 'response' | 'name' | 'rating'>('newest')

const specialtyTabs = [
  { key: 'all', label: 'All Agents' },
  { key: 'residential', label: 'Residential' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'investment', label: 'Investment' },
]

const verifiedCount = computed(() => agents.list.filter((a) => a.verified).length)
const uniqueRegions = computed(() => {
  const all = agents.list.flatMap((a) => a.regions || [])
  return new Set(all).size
})

const filteredAgents = computed(() => {
  let list = [...agents.list]

  if (verifiedOnly.value) list = list.filter((a) => a.verified)

  if (specialtyFilter.value !== 'all') {
    const f = specialtyFilter.value.toLowerCase()
    list = list.filter((a) => {
      const regions = (a.regions || []).join(' ').toLowerCase()
      const bio = (a.bio || '').toLowerCase()
      const agency = (a.agency || '').toLowerCase()
      return regions.includes(f) || bio.includes(f) || agency.includes(f)
    })
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((a) =>
      [a.displayName, a.agency, a.bio, ...(a.regions || []), ...(a.languages || [])].some((s) =>
        (s || '').toLowerCase().includes(q)
      )
    )
  }

  switch (sortBy.value) {
    case 'verified':
      list = [...list].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
      break
    case 'rating':
      list = [...list].sort((a, b) => {
        const avg = (x: any) => Number(x.ratingAvg) || 0
        const cnt = (x: any) => Number(x.ratingCount) || 0
        if (avg(b) !== avg(a)) return avg(b) - avg(a)
        return cnt(b) - cnt(a)
      })
      break
    case 'listings':
      list = [...list].sort((a, b) => (b.listingsCount ?? 0) - (a.listingsCount ?? 0))
      break
    case 'response':
      list = [...list].sort((a, b) => (a.responseTimeMinutes ?? 9999) - (b.responseTimeMinutes ?? 9999))
      break
    case 'name':
      list = [...list].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
      break
  }

  return list
})

function clearFilters() {
  searchQuery.value = ''
  specialtyFilter.value = 'all'
  verifiedOnly.value = false
}

useInfiniteScroll(scrollSentinel, () => { void agents.loadMore() })

onMounted(() => { void agents.fetchList() })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 mb-0.5">Wishlists</p>
        <h1 class="text-xl font-bold text-gray-900">Saved properties</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          <span class="font-medium text-gray-700">{{ favorites.total }}</span> saved
          · updates when you heart any listing
        </p>
      </div>
      <NuxtLink
        to="/listings"
        class="shrink-0 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <i class="las la-search-location text-primary-600 text-sm"></i>
        Browse listings
      </NuxtLink>
    </div>

    <!-- Stats row -->
    <div class="mb-5 grid grid-cols-3 gap-2">
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-gray-900 tabular-nums">{{ favorites.total }}</p>
        <p class="text-[11px] text-gray-500">Saved</p>
      </div>
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-primary-600 tabular-nums">{{ apartmentCount }}</p>
        <p class="text-[11px] text-gray-500">Apartments</p>
      </div>
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ otherCount }}</p>
        <p class="text-[11px] text-gray-500">Other types</p>
      </div>
    </div>

    <!-- Filter / sort row -->
    <div class="mb-4 flex items-center gap-2">
      <div class="flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium w-fit">
        <button
          v-for="s in sortOptions"
          :key="s.key"
          type="button"
          class="rounded px-3 py-1.5 transition"
          :class="sortBy === s.key ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="sortBy = s.key"
        >
          {{ s.label }}
        </button>
      </div>

      <div class="relative ml-auto">
        <i class="las la-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          v-model="query"
          type="search"
          placeholder="Search saved…"
          class="rounded border border-gray-200 bg-white pl-7 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 w-48"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="favorites.isLoading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-64 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!favorites.list.length" class="compact-card bg-white rounded border border-gray-200 p-12 text-center">
      <i class="las la-heart-broken block mb-2 text-4xl text-gray-200"></i>
      <p class="text-sm font-semibold text-gray-900">No saved properties yet</p>
      <p class="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
        Tap the heart on any listing to save it here — build your personal shortlist.
      </p>
      <NuxtLink
        to="/listings"
        class="mt-4 inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
      >
        <i class="las la-search-location"></i>
        Browse listings
      </NuxtLink>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredFavorites.length === 0" class="compact-card bg-white rounded border border-gray-200 p-8 text-center">
      <i class="las la-search block mb-2 text-3xl text-gray-200"></i>
      <p class="text-sm text-gray-500">No matches for "<span class="font-medium text-gray-700">{{ query }}</span>"</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="f in filteredFavorites"
        :key="f._id"
        class="compact-card overflow-hidden rounded border border-gray-200 bg-white transition hover:shadow-md group"
      >
        <!-- Cover image -->
        <NuxtLink :to="`/properties/${f.propertyId}`" class="relative block aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            v-if="coverFor(f.propertyId)"
            :src="coverFor(f.propertyId)"
            alt=""
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300">
            <i class="las la-image text-3xl"></i>
            <span class="text-xs">No image</span>
          </div>
          <!-- Type badge -->
          <span
            v-if="typeFor(f.propertyId)"
            class="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700 shadow-sm"
          >
            {{ typeFor(f.propertyId) }}
          </span>
          <!-- Remove heart -->
          <button
            type="button"
            class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded bg-white/90 text-red-500 shadow-sm transition hover:bg-red-50"
            title="Remove from saved"
            @click.prevent="removeFavorite(f.propertyId)"
          >
            <i class="las la-heart text-base"></i>
          </button>
        </NuxtLink>

        <!-- Card body -->
        <div class="p-3">
          <NuxtLink
            :to="`/properties/${f.propertyId}`"
            class="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-primary-700 leading-snug"
          >
            {{ titleFor(f.propertyId) }}
          </NuxtLink>
          <p class="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <i class="las la-map-marker text-primary-500"></i>
            {{ subtitleFor(f.propertyId) || 'Location unavailable' }}
          </p>

          <!-- Details row -->
          <div v-if="detailsFor(f.propertyId)" class="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span v-if="detailsFor(f.propertyId)?.bedrooms">
              <i class="las la-bed mr-0.5"></i>{{ detailsFor(f.propertyId)?.bedrooms }} bd
            </span>
            <span v-if="detailsFor(f.propertyId)?.bathrooms">
              <i class="las la-bath mr-0.5"></i>{{ detailsFor(f.propertyId)?.bathrooms }} ba
            </span>
            <span v-if="detailsFor(f.propertyId)?.rentAmount" class="ml-auto font-semibold text-gray-800">
              {{ fmtCurrency(detailsFor(f.propertyId)?.rentAmount) }}
            </span>
          </div>

          <!-- Saved date -->
          <p class="mt-1.5 text-[10px] text-gray-400">
            <i class="las la-bookmark mr-0.5"></i>Saved {{ fmtDate(f.createdAt) }}
          </p>

          <!-- Actions -->
          <div class="mt-3 flex gap-2">
            <NuxtLink
              :to="`/properties/${f.propertyId}`"
              class="flex-1 rounded bg-primary-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-primary-700"
            >
              View property
            </NuxtLink>
            <button
              type="button"
              class="rounded border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              @click="removeFavorite(f.propertyId)"
            >
              <i class="las la-trash-alt"></i>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Load more -->
    <div ref="scrollSentinel" class="flex h-10 items-center justify-center py-6">
      <span v-if="favorites.isLoadingMore" class="flex items-center gap-1.5 text-xs text-gray-400">
        <i class="las la-spinner animate-spin"></i>Loading more…
      </span>
      <span v-else-if="favorites.hasMore" class="text-xs text-gray-300">
        <i class="las la-angle-down mr-1"></i>Scroll for more
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeFeathersFind } from '../../utils/feathersNormalize'
import { useFavoritesStore } from '@@/stores/favorites'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Saved properties - CribHub' })

const favorites = useFavoritesStore()
const scrollSentinel = ref<HTMLElement | null>(null)
const propertyMap = ref<Record<string, any>>({})
const query = ref('')
const sortBy = ref<'recent' | 'name'>('recent')

const sortOptions = [
  { key: 'recent' as const, label: 'Recent' },
  { key: 'name' as const, label: 'A–Z' },
]

const apartmentCount = computed(() =>
  Object.values(propertyMap.value).filter((p) => (p?.propertyType || p?.type || '').toLowerCase().includes('apart')).length
)
const otherCount = computed(() =>
  Object.values(propertyMap.value).filter((p) => !(p?.propertyType || p?.type || '').toLowerCase().includes('apart')).length
)

const filteredFavorites = computed(() => {
  let list = [...favorites.list]
  if (query.value.trim()) {
    const q = query.value.toLowerCase()
    list = list.filter((f) => {
      const p = propertyMap.value[String(f.propertyId)]
      return [p?.name, p?.city, p?.country].some((s) => (s || '').toLowerCase().includes(q))
    })
  }
  if (sortBy.value === 'name') {
    list = list.sort((a, b) => {
      const ta = titleFor(a.propertyId) || ''
      const tb = titleFor(b.propertyId) || ''
      return ta.localeCompare(tb)
    })
  }
  return list
})

function coverFor(propertyId: string) { return propertyMap.value[propertyId]?.coverImageUrl as string | undefined }
function titleFor(propertyId: string) { return (propertyMap.value[propertyId]?.name as string) || `Property ${String(propertyId).slice(-6)}` }
function subtitleFor(propertyId: string) {
  const p = propertyMap.value[propertyId]
  return p ? [p.city, p.country].filter(Boolean).join(', ') : ''
}
function typeFor(propertyId: string) { return propertyMap.value[propertyId]?.propertyType || propertyMap.value[propertyId]?.type || '' }
function detailsFor(propertyId: string) { return propertyMap.value[propertyId] as any }

function fmtCurrency(amount?: number | string) {
  if (!amount) return ''
  return `GHS ${Number(amount).toLocaleString()}`
}

function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function hydrateProperties() {
  const ids = [...new Set(favorites.list.map((x) => String(x.propertyId)))]
  const missing = ids.filter((id) => !propertyMap.value[id])
  if (!missing.length) return
  const feathers = useNuxtApp().$feathers as any
  try {
    const res = await feathers.service('properties').find({
      query: { _id: { $in: missing }, $limit: Math.min(100, Math.max(1, missing.length)) }
    })
    const norm = normalizeFeathersFind(res)
    const next = { ...propertyMap.value }
    for (const row of norm.data) next[String((row as any)._id)] = row
    propertyMap.value = next
  } catch { /* ignore */ }
}

async function removeFavorite(propertyId: string) {
  try { await favorites.toggle(propertyId) } catch { /* ignore */ }
}

watch(
  () => favorites.list.map((x) => x._id).join(','),
  () => { void hydrateProperties() }
)

useInfiniteScroll(scrollSentinel, () => { void favorites.loadMore() })

onMounted(async () => {
  await favorites.fetchList()
  await hydrateProperties()
})
</script>

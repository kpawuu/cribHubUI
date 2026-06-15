<template>
  <div class="bg-gray-50">
    <!-- Search / Filter bar -->
    <!-- z-30: below site nav (z-50) so header dropdowns are not covered on /listings -->
    <div class="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-4">

        <!-- ── Mobile compact bar (visible on < md) ─────────────────── -->
        <div class="flex items-center gap-2 py-2.5 md:hidden">
          <!-- Location input stays always visible on mobile -->
          <div class="relative min-w-0 flex-1">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="qLocation"
              type="text"
              placeholder="Location…"
              class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
              @keydown.enter="applyFilters"
            />
          </div>

          <!-- Filters toggle button -->
          <button
            type="button"
            class="relative shrink-0 inline-flex items-center gap-1.5 rounded border px-3 py-2.5 text-sm font-medium transition"
            :class="mobileFiltersOpen
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            @click="mobileFiltersOpen = !mobileFiltersOpen"
          >
            <i class="las la-sliders-h text-base leading-none"></i>
            <span>Filters</span>
            <!-- Active-filter dot -->
            <span
              v-if="activeFilterCount > 0"
              class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white"
            >{{ activeFilterCount }}</span>
          </button>

          <!-- Search button -->
          <button
            type="button"
            class="shrink-0 rounded bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            :disabled="properties.isLoading"
            @click="applyFilters"
          >
            <i class="las la-search text-base leading-none"></i>
          </button>
        </div>

        <!-- ── Expandable filter panel (mobile: toggled; md+: always shown) ── -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out overflow-hidden"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[500px] opacity-100"
          leave-active-class="transition-all duration-150 ease-in overflow-hidden"
          leave-from-class="max-h-[500px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="mobileFiltersOpen || !isMobile" class="pb-3 md:pt-3">
            <div class="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-2">
              <!-- Location (hidden on mobile — shown in compact bar above) -->
              <div class="hidden md:block md:col-span-3 lg:col-span-4">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    v-model="qLocation"
                    type="text"
                    placeholder="City, community or building"
                    class="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                  />
                </div>
              </div>

              <!-- Type -->
              <div class="md:col-span-1 lg:col-span-1">
                <select
                  v-model="qType"
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="commercial">Commercial</option>
                  <option value="new">New</option>
                </select>
              </div>

              <!-- Property Type -->
              <div class="md:col-span-1 lg:col-span-2">
                <select
                  v-model="qPropertyType"
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="">Property Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Land">Land</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <!-- Beds & Baths -->
              <div class="md:col-span-1 lg:col-span-2">
                <select
                  v-model="qBedsBaths"
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="">Beds and Baths</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <!-- Price -->
              <div class="md:col-span-1 lg:col-span-2">
                <select
                  v-model="qPrice"
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="">Price</option>
                  <option value="500">$500+</option>
                  <option value="1000">$1,000+</option>
                  <option value="2000">$2,000+</option>
                  <option value="5000">$5,000+</option>
                </select>
              </div>

              <!-- Search Button (md+) / Apply on mobile -->
              <div class="md:col-span-1 lg:col-span-1">
                <button
                  type="button"
                  class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition disabled:opacity-60"
                  :disabled="properties.isLoading"
                  @click="onApplyFilters"
                >
                  <span class="md:hidden">Apply filters</span>
                  <i class="las la-search hidden md:inline"></i>
                </button>
              </div>
            </div>

            <!-- Checkbox filters -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input v-model="qVerified" type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span class="text-sm text-gray-700"><i class="las la-shield-alt"></i> Verified</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input v-model="qSuperAgent" type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span class="text-sm text-gray-700"><i class="las la-user-circle"></i> Super Agent</span>
              </label>
              <a href="#" class="text-sm text-primary-600 hover:text-primary-700">
                <i class="las la-question-circle"></i> What is this?
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="text-xl font-bold text-gray-900 mb-2">Properties in Greater Accra</h1>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div class="flex items-center space-x-2 text-sm">
            <span class="text-gray-600">{{ resultsLabel }}</span>
            <span v-if="qType === 'new'" class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">New builds</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button class="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition inline-flex items-center gap-1" type="button">
              <i class="las la-map-marker-alt"></i><span class="hidden sm:inline"> Map View</span>
            </button>
            <button class="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition inline-flex items-center gap-1" type="button">
              <i class="las la-star"></i><span class="hidden sm:inline"> Save</span>
            </button>
            <select
              v-model="qSort"
              class="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              @change="applyFilters"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price ↑</option>
              <option value="priceDesc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Property Types Card -->
      <div class="compact-card bg-gray-50 rounded p-4 mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Apartment')">Apartments</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Villa')">Villa</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Townhouse')">Town Houses</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Land')">Land</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Penthouse')">Penthouses</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Duplex')">Duplexes</button>
          </div>
          <div>
            <button type="button" class="font-semibold text-gray-900 hover:text-primary-600 text-left" @click="applyQuickPropertyType('Apartment')">Hotel Apartments</button>
          </div>
          <div class="text-right">
            <button type="button" class="font-semibold text-primary-600 hover:text-primary-700" @click="clearPropertyTypeChip">Show All <i class="las la-angle-down"></i></button>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Main Content (Left) -->
        <div class="lg:col-span-3 space-y-4">
          <ClientOnly>
            <template v-if="properties.isLoading && properties.list.length === 0">
              <UiSkeletonPropertyRow v-for="n in 4" :key="n" />
            </template>

            <div v-else-if="!properties.isLoading && properties.list.length === 0" class="text-sm text-gray-600">No properties yet.</div>

            <template v-else>
              <div v-for="p in properties.list" :key="p._id" class="compact-card bg-gray-50 rounded overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-0 md:items-stretch">
              <!-- Image: full card height on md+ (stretches with grid row); fixed height when stacked on small screens. -->
              <div class="md:col-span-1 relative min-h-48 bg-gray-200">
                <div class="relative h-48 w-full overflow-hidden md:absolute md:inset-0 md:min-h-full">
                  <img
                    :src="p.coverImageUrl || '/images/apartments/1.jpeg'"
                    alt=""
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                  <div v-if="(p as any).verified !== false" class="absolute top-2 left-2">
                    <span class="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                      <i class="las la-star"></i> VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              <!-- Property Details -->
              <div class="md:col-span-3">
                <div class="p-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <NuxtLink :to="`/properties/${p._id}`" class="block">
                        <p class="text-xs text-gray-600 uppercase mb-1">{{ p.propertyType || 'Apartment' }}</p>
                        <h3 class="text-lg font-bold text-gray-900 mb-1">
                          {{ (p.priceCurrency || 'GHS') }} {{ p.price?.toLocaleString?.() || '—' }}<span v-if="p.pricePeriod">/{{ p.pricePeriod }}</span>
                        </h3>
                        <p class="text-sm font-medium text-gray-700 mb-3">{{ p.name || 'Brand New | Ready Move | Top Quality' }}</p>
                        <p class="text-sm text-gray-600 flex items-center mb-3">
                          <i class="las la-map-marker mr-1"></i>
                          {{ [p.country, p.city, p.address].filter(Boolean).join(', ') }}
                        </p>
                        <div class="flex items-center space-x-4 text-sm text-gray-600">
                          <div class="flex items-center">
                            <i class="las la-bed text-lg mr-1"></i>
                            <span>{{ p.bedrooms ?? 2 }} Bedrooms</span>
                          </div>
                          <div class="flex items-center">
                            <i class="las la-shower text-lg mr-1"></i>
                            <span>{{ p.bathrooms ?? 2 }} Bathrooms</span>
                          </div>
                          <div class="flex items-center">
                            <i class="las la-compress-arrows-alt text-lg mr-1"></i>
                            <span>{{ (p as any).sizeLabel || '1,011 sqft' }}</span>
                          </div>
                        </div>
                      </NuxtLink>
                    </div>
                    <div class="text-center ml-4">
                      <p class="text-xs font-bold text-yellow-600 mb-1">Premium</p>
                      <div class="w-16 h-16 bg-white rounded border border-gray-200 flex items-center justify-center">
                        <i class="las la-crown text-3xl text-yellow-500"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Actions -->
                <div class="border-t border-gray-200 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                  <div class="text-xs text-gray-600">Listed 15 days ago</div>
                  <div class="flex items-center space-x-2">
                    <button class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition" type="button">
                      <i class="las la-phone"></i> Call
                    </button>
                    <button class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition" type="button">
                      <i class="las la-envelope"></i> Email
                    </button>
                    <button class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition" type="button">
                      <i class="lab la-whatsapp"></i> Whatsapp
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition"
                      :class="favorites.isFavorited(String(p._id)) ? 'text-red-600 border-red-200 bg-red-50' : ''"
                      @click="onFavorite(String(p._id))"
                    >
                      <i class="las la-heart"></i>
                    </button>
                    <div class="relative group">
                      <button class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition" type="button">
                        <i class="las la-ellipsis-v"></i>
                      </button>
                      <div
                        class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                      >
                        <a href="#" class="block px-4 py-2 text-xs hover:bg-gray-50">
                          <i class="las la-external-link-alt mr-2"></i>Share
                        </a>
                        <a href="#" class="block px-4 py-2 text-xs hover:bg-gray-50">
                          <i class="lar la-flag mr-2"></i>Report
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </template>

            <div ref="scrollSentinel" class="h-8 flex items-center justify-center py-4">
              <span v-if="properties.isLoadingMore" class="text-sm text-gray-500">Loading more…</span>
              <span v-else-if="properties.hasMore" class="text-xs text-gray-400">Scroll for more</span>
            </div>

            <template #fallback>
              <UiSkeletonPropertyRow v-for="n in 4" :key="'fb-' + n" />
            </template>
          </ClientOnly>
        </div>

        <!-- Sidebar (Right) -->
        <aside class="lg:col-span-1">
          <div class="sticky top-24 space-y-6 lg:top-28">
            <div class="compact-card bg-white rounded border border-gray-100 p-4 shadow-sm">
              <h3 class="mb-3 text-base font-bold text-gray-900">Popular Searches</h3>
              <div v-if="listingSidebar.isLoading && !listingSidebar.popularSearches.length" class="space-y-2">
                <div v-for="n in 6" :key="'ps-' + n" class="h-4 animate-pulse rounded bg-gray-100"></div>
              </div>
              <nav v-else class="space-y-2 text-sm" aria-label="Popular searches">
                <NuxtLink
                  v-for="(item, i) in listingSidebar.popularSearches"
                  :key="'pop-' + i"
                  :to="{ path: '/listings', query: item.query }"
                  class="block text-gray-600 transition hover:text-primary-600"
                >
                  {{ item.label }}
                </NuxtLink>
              </nav>
            </div>

            <div class="compact-card bg-white rounded border border-gray-100 p-4 shadow-sm">
              <h3 class="mb-3 text-base font-bold text-gray-900">Nearby Areas</h3>
              <div v-if="listingSidebar.isLoading && !listingSidebar.nearbyAreas.length" class="space-y-2">
                <div v-for="n in 5" :key="'na-' + n" class="h-4 animate-pulse rounded bg-gray-100"></div>
              </div>
              <nav v-else class="space-y-2 text-sm" aria-label="Nearby areas">
                <NuxtLink
                  v-for="(item, i) in listingSidebar.nearbyAreas"
                  :key="'near-' + i"
                  :to="{ path: '/listings', query: item.query }"
                  class="block text-gray-600 transition hover:text-primary-600"
                >
                  {{ item.label }}
                </NuxtLink>
              </nav>
              <p v-if="listingSidebar.error" class="mt-2 text-xs text-amber-700">{{ listingSidebar.error }}</p>
            </div>

            <div class="compact-card bg-gray-50 rounded p-4">
              <p class="text-sm font-bold text-gray-900 mb-2">Need help?</p>
              <p class="text-sm text-gray-600">Connect with verified agents for viewings and negotiations.</p>
              <a href="/#agents" class="mt-3 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">Find Agent →</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useFavoritesStore } from '@@/stores/favorites'
import { usePropertiesStore } from '@@/stores/properties'
import { useListingSidebarStore } from '@@/stores/listingSidebar'
import { useSeo } from '../composables/useSeo'

definePageMeta({ layout: 'default' })

// IMPORTANT: resolve `useRoute()` once at setup time. Composables that rely on
// the Nuxt instance MUST NOT be called inside a `computed` getter, because
// `unhead` resolves head values lazily (sometimes outside the Vue setup
// context) and would throw "called outside of a plugin / setup function".
const route = useRoute()

useSeo(computed(() => {
  const location = String(route.query.location || '')
  const type = String(route.query.type || 'rent')
  const titleParts = ['Properties']
  if (location) titleParts.push(`in ${location}`)
  const typeLabel = type === 'rent' ? 'for Rent' : type === 'buy' ? 'for Sale' : type === 'commercial' ? '(Commercial)' : ''
  if (typeLabel) titleParts.push(typeLabel)
  titleParts.push('Ghana')
  return {
    title: titleParts.join(' '),
    description: `Browse verified properties ${location ? `in ${location}` : 'across Ghana'} ${typeLabel.toLowerCase()}. Filter by type, price, and size. Find your perfect home on CribHub.`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      name: `Property Search Results – CribHub`,
      description: `Search results for properties in Ghana on CribHub`,
    },
  }
}))

const pinia = usePinia()
const properties = usePropertiesStore(pinia)
const listingSidebar = useListingSidebarStore(pinia)
const favorites = useFavoritesStore(pinia)
const auth = useAuthStore(pinia)

const qLocation = ref(String(route.query.location || ''))
const qType = ref(String(route.query.type || 'rent'))
const qPropertyType = ref(String(route.query.propertyType || ''))
const qBedsBaths = ref(String(route.query.bedsBaths || ''))
const qPrice = ref(String(route.query.price || ''))
const qVerified = ref(String(route.query.verified || '') === 'true')
const qSuperAgent = ref(route.query.superAgent === 'true')
const qSort = ref(String(route.query.sort || 'featured'))

// Mobile filter panel toggle
const mobileFiltersOpen = ref(false)

// True when viewport is below md breakpoint (768px)
const isMobile = ref(false)
function checkMobile() { isMobile.value = window.innerWidth < 768 }
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => window.removeEventListener('resize', checkMobile))

// Count active filters (excluding location & sort) for the badge
const activeFilterCount = computed(() => {
  let n = 0
  if (qType.value && qType.value !== 'rent') n++
  if (qPropertyType.value) n++
  if (qBedsBaths.value) n++
  if (qPrice.value) n++
  if (qVerified.value) n++
  if (qSuperAgent.value) n++
  return n
})

// On mobile: apply filters and close the panel
async function onApplyFilters() {
  mobileFiltersOpen.value = false
  await applyFilters()
}

const scrollSentinel = ref<HTMLElement | null>(null)

const resultsLabel = computed(() => {
  const shown = properties.list.length
  const tot = properties.total || shown
  return `${shown.toLocaleString()} of ${tot.toLocaleString()} results`
})

function syncQueryFromRoute() {
  const q = route.query
  qLocation.value = String(q.location || '')
  qType.value = String(q.type || 'rent')
  qPropertyType.value = String(q.propertyType || '')
  qBedsBaths.value = String(q.bedsBaths || '')
  qPrice.value = String(q.price || '')
  qVerified.value = String(q.verified || '') === 'true'
  qSuperAgent.value = q.superAgent === 'true'
  qSort.value = String(q.sort || 'featured')
}

/** Maps UI state to Feathers `properties.find` query (API expands `$search`, `type`, `superAgent`). */
function buildListingsQuery(): Record<string, any> {
  const query: Record<string, any> = {}

  if (qVerified.value) query.verified = true
  if (qPropertyType.value.trim()) query.propertyType = qPropertyType.value.trim()

  const loc = qLocation.value.trim()
  if (loc) query.$search = loc

  if (qType.value === 'buy' || qType.value === 'rent' || qType.value === 'commercial' || qType.value === 'new') {
    query.type = qType.value
  }

  if (qSuperAgent.value) query.superAgent = true

  const beds = Number(qBedsBaths.value)
  if (Number.isFinite(beds) && beds > 0) {
    query.bedrooms = { $gte: beds }
    query.bathrooms = { $gte: beds }
  }

  const pmin = Number(qPrice.value)
  if (Number.isFinite(pmin) && pmin > 0) {
    query.price = { $gte: pmin }
  }

  const s = qSort.value
  if (s === 'priceAsc') query.$sort = { price: 1 }
  else if (s === 'priceDesc') query.$sort = { price: -1 }
  else if (s === 'newest') query.$sort = { createdAt: -1 }
  else query.$sort = { createdAt: -1 }

  return query
}

async function runFetch() {
  await properties.fetchList(buildListingsQuery())
}

async function applyFilters() {
  await navigateTo({
    path: '/listings',
    query: {
      type: qType.value,
      location: qLocation.value.trim() || undefined,
      propertyType: qPropertyType.value.trim() || undefined,
      bedsBaths: qBedsBaths.value || undefined,
      price: qPrice.value || undefined,
      verified: qVerified.value ? 'true' : undefined,
      superAgent: qSuperAgent.value ? 'true' : undefined,
      sort: qSort.value !== 'featured' ? qSort.value : undefined
    }
  })
}

async function applyQuickPropertyType(value: string) {
  qPropertyType.value = value
  await applyFilters()
}

async function clearPropertyTypeChip() {
  qPropertyType.value = ''
  await applyFilters()
}

watch(
  () => route.fullPath,
  async () => {
    if (!route.path.startsWith('/listings')) return
    syncQueryFromRoute()
    await runFetch()
  },
  { immediate: true }
)

useInfiniteScroll(scrollSentinel, () => {
  void properties.loadMore()
})

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  void listingSidebar.fetchSidebar()
  if (auth.isAuthenticated) {
    try {
      await favorites.syncFavoriteIds()
    } catch {
      /* guest */
    }
  }
})

async function onFavorite(propertyId: string) {
  if (!auth.isAuthenticated) {
    await navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await favorites.toggle(propertyId)
  } catch {
    /* toast optional */
  }
}
</script>


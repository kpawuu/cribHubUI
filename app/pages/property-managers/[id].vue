<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="mx-auto max-w-5xl px-4 py-10">
      <div class="h-44 animate-pulse rounded-lg bg-gray-100"></div>
      <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="h-72 animate-pulse rounded bg-white"></div>
        <div class="h-72 animate-pulse rounded bg-white lg:col-span-2"></div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!pm" class="mx-auto max-w-3xl px-4 py-20 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <i class="las la-user-times text-3xl text-gray-400"></i>
      </div>
      <h1 class="text-lg font-bold text-gray-900">Property manager not found</h1>
      <p class="mt-1 text-sm text-gray-500">This profile may have been removed or is not yet public.</p>
      <NuxtLink
        to="/property-managers"
        class="mt-6 inline-flex items-center gap-1.5 rounded bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
      >
        <i class="las la-arrow-left"></i> Back to directory
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="relative h-44 sm:h-56">
        <div class="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-30%,#ffffff35,transparent_60%)]"></div>
      </div>

      <div class="mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- Left card: identity -->
          <aside class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div class="flex flex-col items-center text-center">
              <div class="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow ring-1 ring-gray-100">
                <img v-if="pm.avatarUrl" :src="pm.avatarUrl" :alt="pm.displayName" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center bg-violet-600 text-2xl font-bold text-white">
                  {{ initials(pm.displayName) }}
                </div>
              </div>
              <h1 class="mt-3 text-lg font-bold text-gray-900">{{ pm.displayName }}</h1>
              <p class="text-sm text-gray-500">{{ pm.companyName || 'Independent property manager' }}</p>
              <span
                v-if="pm.verified"
                class="mt-2 inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
              >
                <i class="las la-check-circle"></i> Verified manager
              </span>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
              <div>
                <p class="text-sm font-bold text-gray-900">{{ pm.portfolioSize ?? '—' }}</p>
                <p class="text-[11px] text-gray-500">Units</p>
              </div>
              <div class="border-x border-gray-100">
                <p class="text-sm font-bold text-gray-900">{{ pm.yearsManaging ?? '—' }}</p>
                <p class="text-[11px] text-gray-500">Years</p>
              </div>
              <div>
                <p class="text-sm font-bold" :class="pm.verified ? 'text-emerald-600' : 'text-gray-400'">
                  {{ pm.verified ? 'Verified' : 'Pending' }}
                </p>
                <p class="text-[11px] text-gray-500">Status</p>
              </div>
            </div>

            <div class="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
              <div v-if="pm.phone" class="flex items-center gap-2">
                <i class="las la-phone text-base text-gray-400"></i>
                <a :href="`tel:${pm.phone}`" class="hover:text-violet-600">{{ pm.phone }}</a>
              </div>
              <div v-if="pm.whatsapp" class="flex items-center gap-2">
                <i class="lab la-whatsapp text-base text-emerald-500"></i>
                <a
                  :href="`https://wa.me/${String(pm.whatsapp).replace(/[^0-9]/g, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="hover:text-violet-600"
                >
                  {{ pm.whatsapp }}
                </a>
              </div>
              <div v-if="pm.emailPublic" class="flex items-center gap-2">
                <i class="las la-envelope text-base text-gray-400"></i>
                <a :href="`mailto:${pm.emailPublic}`" class="break-all hover:text-violet-600">{{ pm.emailPublic }}</a>
              </div>
              <div v-if="pm.websiteUrl" class="flex items-center gap-2">
                <i class="las la-globe text-base text-gray-400"></i>
                <a :href="pm.websiteUrl" target="_blank" rel="noopener" class="break-all hover:text-violet-600">
                  {{ pm.websiteUrl }}
                </a>
              </div>
            </div>

            <button
              v-if="canStartThread"
              type="button"
              :disabled="threadBusy"
              class="mt-4 flex w-full items-center justify-center gap-2 rounded bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              @click="openConversation"
            >
              <i class="las la-comment-dots"></i>
              {{ threadBusy ? 'Opening…' : 'Message manager' }}
            </button>
            <NuxtLink
              v-else-if="!auth.isAuthenticated"
              :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`"
              class="mt-4 flex w-full items-center justify-center gap-2 rounded border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              <i class="las la-sign-in-alt"></i> Sign in to message
            </NuxtLink>
          </aside>

          <!-- Right column: about + tabs -->
          <div class="space-y-4 lg:col-span-2">
            <section v-if="pm.bio" class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 class="mb-2 text-sm font-bold text-gray-900">About</h2>
              <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">{{ pm.bio }}</p>
            </section>

            <section v-if="(pm.services || []).length || (pm.regions || []).length || (pm.languages || []).length" class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 class="mb-3 text-sm font-bold text-gray-900">Services & coverage</h2>
              <div v-if="(pm.services || []).length" class="mb-3">
                <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Services</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="s in pm.services"
                    :key="'s-' + s"
                    class="rounded border border-violet-100 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                  >
                    {{ s }}
                  </span>
                </div>
              </div>
              <div v-if="(pm.regions || []).length" class="mb-3">
                <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Regions</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="r in pm.regions"
                    :key="'r-' + r"
                    class="rounded border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    <i class="las la-map-marker-alt mr-0.5 text-gray-400"></i>{{ r }}
                  </span>
                </div>
              </div>
              <div v-if="(pm.languages || []).length">
                <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Languages</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="l in pm.languages"
                    :key="'l-' + l"
                    class="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    <i class="las la-language mr-0.5 text-blue-500"></i>{{ l }}
                  </span>
                </div>
              </div>
            </section>

            <section v-if="defaultFeeSummary" class="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
              <h2 class="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-900">
                <i class="las la-tag text-emerald-600"></i> Default rate card
              </h2>
              <p class="text-sm text-emerald-800">{{ defaultFeeSummary }}</p>
              <p class="mt-2 text-[11px] text-emerald-700/80">
                Final fee is negotiated per listing — landlords can accept or counter this proposal.
              </p>
            </section>

            <!-- Tabs -->
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div class="flex border-b border-gray-100 px-3 pt-3 text-xs font-medium">
                <button
                  v-for="t in tabs"
                  :key="t.id"
                  type="button"
                  class="-mb-px border-b-2 px-3 py-2 transition"
                  :class="
                    activeTab === t.id
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  "
                  @click="activeTab = t.id"
                >
                  <i :class="`${t.icon} mr-1`"></i>{{ t.label }}
                </button>
              </div>

              <div v-show="activeTab === 'properties'" class="p-5">
                <div v-if="propsLoading" class="space-y-3">
                  <div class="h-16 animate-pulse rounded bg-gray-100"></div>
                  <div class="h-16 animate-pulse rounded bg-gray-100"></div>
                </div>
                <div
                  v-else-if="!properties.length"
                  class="rounded border border-dashed border-gray-200 px-4 py-10 text-center text-xs text-gray-500"
                >
                  <i class="las la-city mb-2 text-3xl text-gray-300"></i>
                  <p>No properties currently managed (or none visible to public).</p>
                </div>
                <ul v-else class="divide-y divide-gray-100">
                  <li v-for="p in properties" :key="String(p._id)" class="flex items-center justify-between gap-3 py-3">
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-gray-900">{{ p.name || 'Untitled property' }}</p>
                      <p class="truncate text-[11px] text-gray-500">
                        {{ [p.address, p.city].filter(Boolean).join(', ') || '—' }}
                      </p>
                    </div>
                    <NuxtLink
                      :to="`/properties/${String(p._id)}`"
                      class="inline-flex shrink-0 items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      View <i class="las la-arrow-right"></i>
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div v-show="activeTab === 'reviews'" class="p-5">
                <div v-if="ratingsLoading" class="space-y-3">
                  <div class="h-12 animate-pulse rounded bg-gray-100"></div>
                  <div class="h-12 animate-pulse rounded bg-gray-100"></div>
                </div>
                <template v-else>
                  <div class="mb-4 flex items-start gap-5 border-b border-gray-100 pb-4">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-gray-900">{{ ratingAvg || '—' }}</div>
                      <div class="mt-0.5 flex items-center justify-center gap-0.5">
                        <i
                          v-for="s in 5"
                          :key="s"
                          class="las la-star text-base"
                          :class="s <= filledStars ? 'text-yellow-400' : 'text-gray-200'"
                        ></i>
                      </div>
                      <div class="text-[11px] text-gray-500">{{ ratingCount }} review{{ ratingCount === 1 ? '' : 's' }}</div>
                    </div>
                    <div class="flex-1 space-y-1">
                      <div
                        v-for="row in ratingDistribution"
                        :key="row.star"
                        class="flex items-center gap-2 text-[11px] text-gray-500"
                      >
                        <span class="w-3">{{ row.star }}</span>
                        <i class="las la-star text-yellow-400"></i>
                        <div class="h-1.5 flex-1 overflow-hidden rounded bg-gray-100">
                          <div class="h-full bg-yellow-400" :style="{ width: row.pct + '%' }"></div>
                        </div>
                        <span class="w-8 text-right tabular-nums">{{ row.count }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Submit review (auth required, not the PM themselves) -->
                  <div
                    v-if="canReview"
                    class="mb-4 rounded border border-violet-100 bg-violet-50/40 p-3"
                  >
                    <p class="mb-2 text-xs font-semibold text-violet-900">
                      {{ myRating ? 'Update your review' : 'Leave a review' }}
                    </p>
                    <div class="mb-2 flex items-center gap-1">
                      <button
                        v-for="s in 5"
                        :key="s"
                        type="button"
                        class="text-2xl transition"
                        :class="(hoverStar || formStar) >= s ? 'text-yellow-400' : 'text-gray-300'"
                        @mouseenter="hoverStar = s"
                        @mouseleave="hoverStar = 0"
                        @click="formStar = s"
                      >
                        <i class="las la-star"></i>
                      </button>
                    </div>
                    <textarea
                      v-model="formComment"
                      rows="3"
                      placeholder="Share your experience working with this property manager…"
                      class="w-full rounded border border-gray-200 px-3 py-2 text-xs focus:border-violet-400 focus:outline-none"
                    ></textarea>
                    <div class="mt-2 flex items-center justify-between gap-2">
                      <button
                        v-if="myRating"
                        type="button"
                        class="text-[11px] text-red-500 hover:underline"
                        @click="deleteRating"
                      >
                        Delete my review
                      </button>
                      <div class="ml-auto flex items-center gap-2">
                        <span v-if="submitState === 'success'" class="text-[11px] text-emerald-600">
                          <i class="las la-check"></i> Saved
                        </span>
                        <span v-if="submitState === 'error'" class="text-[11px] text-red-500">{{ submitError }}</span>
                        <button
                          type="button"
                          :disabled="!formStar || submitState === 'saving'"
                          class="inline-flex items-center gap-1 rounded bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                          @click="submitRating"
                        >
                          <i v-if="submitState === 'saving'" class="las la-circle-notch la-spin"></i>
                          {{ myRating ? 'Update' : 'Submit' }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else-if="!auth.isAuthenticated" class="mb-3 text-[11px] text-gray-500">
                    <NuxtLink :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`" class="text-violet-600 hover:underline">
                      Sign in
                    </NuxtLink>
                    to leave a review.
                  </p>

                  <ul v-if="recentReviews.length" class="space-y-3">
                    <li v-for="r in recentReviews" :key="String(r._id)" class="rounded border border-gray-100 bg-white p-3">
                      <div class="mb-1 flex items-center gap-2 text-[11px] text-gray-500">
                        <span class="font-semibold text-gray-800">{{ r.reviewerName || 'Anonymous' }}</span>
                        <span>·</span>
                        <span>{{ relativeTime(r.createdAt) }}</span>
                        <span class="ml-auto flex items-center gap-0.5">
                          <i
                            v-for="s in 5"
                            :key="s"
                            class="las la-star text-xs"
                            :class="s <= (r.rating || 0) ? 'text-yellow-400' : 'text-gray-200'"
                          ></i>
                        </span>
                      </div>
                      <p class="text-xs text-gray-700">{{ r.comment }}</p>
                    </li>
                  </ul>
                  <p v-else class="text-center text-xs text-gray-400">No written reviews yet.</p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeFeathersFind } from '../../../utils/feathersNormalize'
import { useAuthStore } from '@@/stores/auth'
import { summarizeProposal, defaultFeeToProposal } from '../../composables/useFeeProposal'

definePageMeta({ layout: 'default' })

const route = useRoute()
const auth = useAuthStore()
const id = computed(() => String(route.params.id))

const pm = ref<any | null>(null)
const loading = ref(true)

const properties = ref<any[]>([])
const propsLoading = ref(false)

const ratings = ref<any[]>([])
const ratingsLoading = ref(false)
const myRating = ref<any | null>(null)
const hoverStar = ref(0)
const formStar = ref(0)
const formComment = ref('')
const submitState = ref<'idle' | 'saving' | 'success' | 'error'>('idle')
const submitError = ref('')

const activeTab = ref<'properties' | 'reviews'>('properties')
const tabs = [
  { id: 'properties', label: 'Managed properties', icon: 'las la-building' },
  { id: 'reviews', label: 'Reviews', icon: 'las la-comments' }
]

const threadBusy = ref(false)
const canStartThread = computed(
  () => auth.isAuthenticated && String((auth.user as any)?._id || '') !== String(pm.value?.userId || '')
)

const canReview = computed(
  () =>
    auth.isAuthenticated &&
    !!pm.value?.userId &&
    String((auth.user as any)?._id || '') !== String(pm.value?.userId)
)

const filledStars = computed(() => {
  const av = Number(pm.value?.ratingAvg || 0)
  if (!Number.isFinite(av) || av <= 0) return 0
  return Math.min(5, Math.max(0, Math.round(av)))
})

const ratingAvg = computed(() => {
  const av = Number(pm.value?.ratingAvg || 0)
  if (Number.isFinite(av) && av > 0) return Number(av.toFixed(1))
  if (!ratings.value.length) return 0
  const sum = ratings.value.reduce((s, r: any) => s + (r.rating ?? 0), 0)
  return Number((sum / ratings.value.length).toFixed(1))
})

const ratingCount = computed(() => {
  const n = Number(pm.value?.ratingCount || 0)
  if (Number.isFinite(n) && n > 0) return n
  return ratings.value.length
})

const ratingDistribution = computed(() => {
  return [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.value.filter((r: any) => r.rating === star).length
    const pct = ratingCount.value > 0 ? Math.round((count / ratingCount.value) * 100) : 0
    return { star, count, pct }
  })
})

const recentReviews = computed(() => ratings.value.filter((r: any) => r.comment?.trim()).slice(0, 12))

const defaultFeeSummary = computed(() => {
  if (!pm.value?.defaultFee) return ''
  const s = summarizeProposal(defaultFeeToProposal(pm.value.defaultFee))
  return s === 'No fee proposed' ? '' : s
})

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function relativeTime(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

async function fetchPm() {
  loading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    pm.value = await feathers.service('property-manager-profiles').get(id.value)
  } catch {
    pm.value = null
  } finally {
    loading.value = false
  }
}

async function fetchManagedProperties() {
  if (!pm.value?.userId) return
  propsLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const assignsRes = await feathers.service('property-manager-assignments').find({
      query: { managerUserId: String(pm.value.userId), $limit: 50 }
    })
    const assigns = normalizeFeathersFind(assignsRes).data
    const pids = [...new Set(assigns.map((a: any) => String(a.propertyId)).filter(Boolean))]
    if (!pids.length) {
      properties.value = []
      return
    }
    const results = await Promise.allSettled(pids.map((pid: string) => feathers.service('properties').get(pid)))
    properties.value = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value)
  } catch {
    properties.value = []
  } finally {
    propsLoading.value = false
  }
}

async function fetchRatings() {
  if (!pm.value?._id) return
  ratingsLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('pm-ratings').find({
      query: { pmProfileId: id.value, $limit: 200, $sort: { createdAt: -1 } }
    })
    const norm = normalizeFeathersFind(res)
    ratings.value = norm.data
    if (auth.user?._id) {
      const userId = String((auth.user as any)._id)
      const mine = norm.data.find((r: any) => String(r.userId) === userId)
      if (mine) {
        myRating.value = mine
        formStar.value = mine.rating
        formComment.value = mine.comment ?? ''
      }
    }
  } catch {
    ratings.value = []
  } finally {
    ratingsLoading.value = false
  }
}

async function submitRating() {
  if (!formStar.value) return
  submitState.value = 'saving'
  submitError.value = ''
  try {
    const feathers = useNuxtApp().$feathers as any
    const payload = { rating: formStar.value, comment: formComment.value.trim() || undefined }
    if (myRating.value?._id) {
      const updated = await feathers.service('pm-ratings').patch(String(myRating.value._id), payload)
      myRating.value = updated
      const idx = ratings.value.findIndex((r: any) => String(r._id) === String(myRating.value!._id))
      if (idx >= 0) ratings.value[idx] = updated
    } else {
      const created = await feathers.service('pm-ratings').create({
        pmProfileId: id.value,
        ...payload
      })
      myRating.value = created
      ratings.value.unshift(created)
    }
    const refreshed = await feathers.service('property-manager-profiles').get(id.value)
    pm.value = refreshed
    submitState.value = 'success'
    setTimeout(() => { submitState.value = 'idle' }, 3000)
  } catch (err: any) {
    submitState.value = 'error'
    submitError.value = err?.message ?? 'Could not save your review. Please try again.'
  }
}

async function deleteRating() {
  if (!myRating.value?._id) return
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('pm-ratings').remove(String(myRating.value._id))
    ratings.value = ratings.value.filter((r: any) => String(r._id) !== String(myRating.value!._id))
    myRating.value = null
    formStar.value = 0
    formComment.value = ''
    const refreshed = await feathers.service('property-manager-profiles').get(id.value)
    pm.value = refreshed
  } catch (err: any) {
    submitError.value = err?.message ?? 'Could not delete your review.'
  }
}

async function openConversation() {
  if (!auth.isAuthenticated || !pm.value?.userId) return
  threadBusy.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const myId = String((auth.user as any)._id)
    const created = await feathers.service('threads').create({
      kind: 'landlord-pm',
      participantIds: [myId, String(pm.value.userId)],
      subject: { type: 'pm-profile', id: String(pm.value._id) },
      title: pm.value.displayName ? `Chat with ${pm.value.displayName}` : 'Property manager conversation'
    })
    const tid = String((created as any)?._id || '')
    if (tid) await navigateTo(`/messages/${tid}`)
  } catch {
    /* ignore */
  } finally {
    threadBusy.value = false
  }
}

useHead(() => ({
  title: pm.value ? `${pm.value.displayName} — Property Manager · CribHub` : 'Property Manager · CribHub'
}))

onMounted(async () => {
  await fetchPm()
  await Promise.all([fetchManagedProperties(), fetchRatings()])
})

watch(id, async () => {
  properties.value = []
  ratings.value = []
  myRating.value = null
  formStar.value = 0
  formComment.value = ''
  await fetchPm()
  await Promise.all([fetchManagedProperties(), fetchRatings()])
})

/* Realtime: keep the public review list and the profile aggregate in sync.
 * Filters strictly on `pmProfileId` so events for other profiles are ignored.
 * Hidden reviews are dropped for non-admins (mirrors the server-side `hideModeratedFromPublic` hook). */
if (import.meta.client) {
  const isAdmin = computed(() => Array.isArray(auth.roles) && auth.roles.includes('admin'))
  const myUserId = computed(() => String((auth.user as any)?._id || ''))
  const matchesProfile = (row: any) => row && String(row.pmProfileId) === String(id.value)
  const visibleToMe = (row: any) =>
    !row?.hidden || isAdmin.value || (myUserId.value && String(row.userId) === myUserId.value)

  const stopRatingRealtime = useFeathersRealtime<any>('pm-ratings', {
    onCreated: (row) => {
      if (!matchesProfile(row) || !visibleToMe(row)) return
      if (!ratings.value.some((r: any) => String(r._id) === String(row._id))) ratings.value.unshift(row)
      if (myUserId.value && String(row.userId) === myUserId.value) myRating.value = row
    },
    onPatched: (row) => {
      if (!matchesProfile(row)) return
      const idx = ratings.value.findIndex((r: any) => String(r._id) === String(row._id))
      if (visibleToMe(row)) {
        if (idx >= 0) ratings.value[idx] = row
        else ratings.value.unshift(row)
      } else if (idx >= 0) {
        ratings.value.splice(idx, 1)
      }
      if (myRating.value && String(myRating.value._id) === String(row._id)) myRating.value = row
    },
    onUpdated: (row) => {
      if (!matchesProfile(row)) return
      const idx = ratings.value.findIndex((r: any) => String(r._id) === String(row._id))
      if (idx >= 0) ratings.value[idx] = row
    },
    onRemoved: (row) => {
      if (!matchesProfile(row)) return
      ratings.value = ratings.value.filter((r: any) => String(r._id) !== String(row._id))
      if (myRating.value && String(myRating.value._id) === String(row._id)) myRating.value = null
    }
  })
  const stopProfileRealtime = useFeathersRealtime<any>('property-manager-profiles', {
    onPatched: (row) => { if (row && String(row._id) === String(id.value)) pm.value = row },
    onUpdated: (row) => { if (row && String(row._id) === String(id.value)) pm.value = row }
  })
  onScopeDispose(() => { stopRatingRealtime(); stopProfileRealtime() })
}
</script>

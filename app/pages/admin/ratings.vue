<template>
  <div class="mx-auto w-full max-w-7xl px-3 py-4 lg:px-6 lg:py-6">
    <!-- Header -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-widest text-primary-600">Admin · Moderation</p>
        <h1 class="mt-0.5 text-xl font-bold text-gray-900 lg:text-2xl">Ratings moderation</h1>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Review every public review left on agent and property-manager profiles. Hide reviews that
          violate community standards or remove abusive content.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        @click="refresh()"
      >
        <i class="las la-sync"></i> Refresh
      </button>
    </div>

    <!-- Kind toggle -->
    <div class="mb-4 inline-flex rounded border border-gray-200 bg-white p-0.5 text-sm">
      <button
        v-for="t in kindTabs"
        :key="t.value"
        type="button"
        class="rounded px-3 py-1.5 font-medium transition"
        :class="kind === t.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'"
        @click="setKind(t.value)"
      >
        <i :class="t.icon" class="mr-1"></i>{{ t.label }}
      </button>
    </div>

    <!-- KPI cards -->
    <div class="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total reviews</p>
        <p class="mt-1 text-lg font-bold text-gray-900">{{ list.length }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Visible</p>
        <p class="mt-1 text-lg font-bold text-emerald-700">{{ counts.visible }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hidden</p>
        <p class="mt-1 text-lg font-bold text-red-700">{{ counts.hidden }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average rating</p>
        <p class="mt-1 text-lg font-bold text-amber-600">
          {{ avgRating ? avgRating.toFixed(2) : '—' }} <span class="text-sm text-amber-400">/ 5</span>
        </p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Low ratings (≤ 2★)</p>
        <p class="mt-1 text-lg font-bold text-red-700">{{ counts.low }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 grid gap-2 md:grid-cols-4">
      <div class="md:col-span-2">
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Search</label>
        <input
          v-model="search"
          type="text"
          placeholder="Search by reviewer, comment, or profile…"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Visibility</label>
        <select
          v-model="visibilityFilter"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All reviews</option>
          <option value="visible">Visible only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Rating</label>
        <select
          v-model="ratingFilter"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All ratings</option>
          <option value="5">5 ★ only</option>
          <option value="4">4 ★ only</option>
          <option value="3">3 ★ only</option>
          <option value="2">2 ★ only</option>
          <option value="1">1 ★ only</option>
          <option value="low">≤ 2 ★ (flagged)</option>
        </select>
      </div>
    </div>

    <!-- Action message -->
    <div
      v-if="actionMsg"
      class="mb-4 flex items-start gap-2 rounded border px-4 py-3 text-sm"
      :class="actionMsgType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'"
    >
      <i :class="actionMsgType === 'error' ? 'las la-exclamation-triangle' : 'las la-check-circle'" class="mt-0.5"></i>
      <span class="flex-1">{{ actionMsg }}</span>
      <button class="text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100" @click="actionMsg = null">
        Dismiss
      </button>
    </div>

    <!-- List -->
    <div v-if="isLoading" class="flex items-center justify-center py-20 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>
    <div v-else-if="!filtered.length" class="rounded border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
      <i class="las la-comments text-4xl text-gray-300"></i>
      <p class="mt-2 text-sm font-medium text-gray-600">No reviews match the current filters.</p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="r in filtered"
        :key="String(r._id)"
        class="rounded border bg-white p-4"
        :class="r.hidden ? 'border-red-200 bg-red-50/30' : 'border-gray-100'"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <!-- Reviewer block -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-0.5 text-amber-500">
                <i v-for="i in 5" :key="i" class="las" :class="i <= r.rating ? 'la-star' : 'la-star text-amber-200'"></i>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ r.rating }} / 5</span>
              <span v-if="r.hidden" class="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                <i class="las la-eye-slash"></i> Hidden
              </span>
              <span v-else class="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                <i class="las la-eye"></i> Visible
              </span>
            </div>

            <p class="mt-2 text-sm text-gray-800">
              <span v-if="r.comment" class="whitespace-pre-line">{{ r.comment }}</span>
              <span v-else class="italic text-gray-400">(no comment)</span>
            </p>

            <dl class="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-500 md:grid-cols-4">
              <div>
                <dt class="font-semibold uppercase tracking-wide text-gray-400">Reviewer</dt>
                <dd class="mt-0.5 text-gray-700">{{ r.reviewerName || reviewerLabel(r) }}</dd>
              </div>
              <div>
                <dt class="font-semibold uppercase tracking-wide text-gray-400">Created</dt>
                <dd class="mt-0.5 text-gray-700">{{ formatDate(r.createdAt) }}</dd>
              </div>
              <div>
                <dt class="font-semibold uppercase tracking-wide text-gray-400">{{ kind === 'agent' ? 'Agent profile' : 'PM profile' }}</dt>
                <dd class="mt-0.5 text-gray-700">{{ profileLabel(r) }}</dd>
              </div>
              <div v-if="r.hidden">
                <dt class="font-semibold uppercase tracking-wide text-red-500">Hidden at</dt>
                <dd class="mt-0.5 text-red-700">{{ formatDate(r.hiddenAt) }}</dd>
              </div>
            </dl>

            <div v-if="r.moderationNote" class="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <p class="font-semibold uppercase tracking-wide text-[10px] text-amber-700">Moderation note</p>
              <p class="mt-0.5 whitespace-pre-line">{{ r.moderationNote }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col items-end gap-2">
            <NuxtLink
              :to="profileLink(r)"
              class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              target="_blank"
              rel="noopener"
            >
              <i class="las la-external-link-alt"></i> Open profile
            </NuxtLink>
            <button
              v-if="!r.hidden"
              type="button"
              class="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="actingId === String(r._id)"
              @click="hide(r)"
            >
              <i class="las la-eye-slash"></i> Hide
            </button>
            <button
              v-else
              type="button"
              class="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="actingId === String(r._id)"
              @click="unhide(r)"
            >
              <i class="las la-eye"></i> Unhide
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              :disabled="actingId === String(r._id)"
              @click="removeRecord(r)"
            >
              <i class="las la-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth', 'admin'] })
useHead({ title: 'Ratings moderation' })

const feathers = useNuxtApp().$feathers as any

type Kind = 'agent' | 'pm'
const kind = ref<Kind>('agent')
const kindTabs: Array<{ value: Kind; label: string; icon: string }> = [
  { value: 'agent', label: 'Agent reviews', icon: 'las la-user-tie' },
  { value: 'pm', label: 'PM reviews', icon: 'las la-briefcase' }
]

const list = ref<any[]>([])
const profileMap = ref<Record<string, any>>({})
const userMap = ref<Record<string, any>>({})
const isLoading = ref(false)
const actingId = ref<string | null>(null)
const actionMsg = ref<string | null>(null)
const actionMsgType = ref<'success' | 'error'>('success')

const search = ref('')
const visibilityFilter = ref<'all' | 'visible' | 'hidden'>('all')
const ratingFilter = ref<'all' | '5' | '4' | '3' | '2' | '1' | 'low'>('all')

function svcPath() { return kind.value === 'agent' ? 'agent-ratings' : 'pm-ratings' }
function profilesPath() { return kind.value === 'agent' ? 'agent-profiles' : 'property-manager-profiles' }
function profileIdField() { return kind.value === 'agent' ? 'agentProfileId' : 'pmProfileId' }

function reviewerLabel(r: any): string {
  const uid = String(r.userId || '')
  return userMap.value[uid]?.fullName || userMap.value[uid]?.email || (uid ? uid.slice(-8) : '—')
}
function profileLabel(r: any): string {
  const pid = String(r[profileIdField()] || '')
  const p = profileMap.value[pid]
  if (!p) return pid ? pid.slice(-8) : '—'
  return p.displayName || p.agency || p.businessName || p.fullName || pid.slice(-8)
}
function profileLink(r: any): string {
  const pid = String(r[profileIdField()] || '')
  if (!pid) return '#'
  return kind.value === 'agent' ? `/agents/${pid}` : `/property-managers/${pid}`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return list.value.filter((r) => {
    if (visibilityFilter.value === 'visible' && r.hidden) return false
    if (visibilityFilter.value === 'hidden' && !r.hidden) return false
    if (ratingFilter.value === 'low' && Number(r.rating) > 2) return false
    if (['1','2','3','4','5'].includes(ratingFilter.value) && Number(r.rating) !== Number(ratingFilter.value)) return false
    if (!q) return true
    const hay = [
      String(r.comment || ''),
      String(r.reviewerName || ''),
      reviewerLabel(r),
      profileLabel(r),
      String(r._id || '')
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const counts = computed(() => ({
  visible: list.value.filter((r) => !r.hidden).length,
  hidden: list.value.filter((r) => r.hidden).length,
  low: list.value.filter((r) => Number(r.rating) <= 2).length
}))

const avgRating = computed(() => {
  const arr = list.value.filter((r) => !r.hidden)
  if (!arr.length) return 0
  const sum = arr.reduce((s, r) => s + Number(r.rating || 0), 0)
  return sum / arr.length
})

async function loadProfiles(ids: string[]) {
  const need = ids.filter((id) => id && !profileMap.value[id])
  if (!need.length) return
  try {
    const res = await feathers.service(profilesPath()).find({
      query: { _id: { $in: need }, $limit: need.length }
    })
    const arr = Array.isArray(res) ? res : res?.data || []
    for (const p of arr) profileMap.value[String(p._id)] = p
  } catch { /* non-fatal */ }
}
async function loadUsers(ids: string[]) {
  const need = ids.filter((id) => id && !userMap.value[id])
  if (!need.length) return
  try {
    const res = await feathers.service('users').find({
      query: { _id: { $in: need }, $limit: need.length }
    })
    const arr = Array.isArray(res) ? res : res?.data || []
    for (const u of arr) userMap.value[String(u._id)] = u
  } catch { /* non-fatal */ }
}

async function refresh() {
  isLoading.value = true
  try {
    const res = await feathers.service(svcPath()).find({
      query: { $sort: { createdAt: -1 }, $limit: 500 }
    })
    const arr = Array.isArray(res) ? res : res?.data || []
    list.value = arr
    await Promise.all([
      loadProfiles([...new Set(arr.map((r: any) => String(r[profileIdField()])).filter(Boolean) as string[])]),
      loadUsers([...new Set(arr.map((r: any) => String(r.userId)).filter(Boolean) as string[])])
    ])
    wireRealtime()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to load reviews.'
    actionMsgType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

/* Realtime: keep the moderation list in sync as reviews are created, edited,
 * hidden/unhidden by other admins, or removed. Listeners are re-bound when the
 * admin toggles between agent and PM kinds. */
let stopRatingRt: (() => void) | null = null
function wireRealtime() {
  stopRatingRt?.()
  if (!import.meta.client) return
  stopRatingRt = useFeathersRealtime<any>(svcPath(), {
    onCreated: (row) => {
      if (!list.value.some((x) => String(x._id) === String(row._id))) list.value.unshift(row)
      void loadProfiles([String(row[profileIdField()] || '')])
      void loadUsers([String(row.userId || '')])
    },
    onPatched: (row) => {
      const i = list.value.findIndex((x) => String(x._id) === String(row._id))
      if (i >= 0) list.value[i] = row
      else list.value.unshift(row)
    },
    onUpdated: (row) => {
      const i = list.value.findIndex((x) => String(x._id) === String(row._id))
      if (i >= 0) list.value[i] = row
    },
    onRemoved: (row) => {
      list.value = list.value.filter((x) => String(x._id) !== String(row._id))
    }
  })
}

function setKind(k: Kind) {
  if (kind.value === k) return
  kind.value = k
  refresh()
}

onScopeDispose(() => stopRatingRt?.())

async function hide(r: any) {
  const note = prompt('Optional moderation note (visible to admins, recorded with the action):', '') ?? ''
  actingId.value = String(r._id)
  try {
    await feathers.service(svcPath()).patch(String(r._id), {
      hidden: true,
      ...(note ? { moderationNote: note } : {})
    })
    actionMsg.value = 'Review hidden from public listings.'
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to hide review.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

async function unhide(r: any) {
  if (!confirm('Restore this review to public visibility?')) return
  actingId.value = String(r._id)
  try {
    await feathers.service(svcPath()).patch(String(r._id), { hidden: false })
    actionMsg.value = 'Review restored.'
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to restore review.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

async function removeRecord(r: any) {
  if (!confirm('Permanently delete this review? This cannot be undone.')) return
  actingId.value = String(r._id)
  try {
    await feathers.service(svcPath()).remove(String(r._id))
    actionMsg.value = 'Review deleted.'
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to delete review.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

onMounted(refresh)
</script>

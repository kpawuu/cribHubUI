<template>
  <div>
    <!-- Header -->
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 mb-0.5">Landlord</p>
        <h1 class="text-xl font-bold text-gray-900">Review applications</h1>
        <p class="mt-0.5 text-sm text-gray-500">Tenant applications for units on your properties</p>
      </div>
      <div class="flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium shrink-0">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="rounded px-3 py-1.5 transition"
          :class="activeTab === tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-4 grid grid-cols-3 gap-2">
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-lg font-bold text-amber-600 tabular-nums">{{ allCounts.pending }}</p>
        <p class="text-[11px] text-gray-500">Pending</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ allCounts.approved }}</p>
        <p class="text-[11px] text-gray-500">Approved</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-lg font-bold text-red-500 tabular-nums">{{ allCounts.rejected }}</p>
        <p class="text-[11px] text-gray-500">Rejected</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="apps.isLoading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-36 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty -->
    <div v-else-if="!apps.list.length" class="compact-card rounded bg-white p-10 text-center">
      <i class="las la-clipboard-check mb-2 block text-4xl text-gray-200"></i>
      <p class="text-sm font-semibold text-gray-900">
        {{ activeTab === 'pending' ? 'No pending applications' : 'No applications found' }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ activeTab === 'pending' ? "You're all caught up." : 'Try switching the status filter.' }}
      </p>
    </div>

    <!-- Applications list -->
    <div v-else class="space-y-3">
      <div
        v-for="a in apps.list"
        :key="a._id"
        class="compact-card bg-white rounded overflow-hidden"
        :data-application-id="String(a._id)"
      >

        <!-- Unit details strip -->
        <div class="flex items-stretch border-b border-gray-100">
          <!-- Unit thumbnail -->
          <div class="shrink-0 w-24 sm:w-28 relative overflow-hidden bg-gray-100 min-h-[88px]">
            <img v-if="unitThumb(a.unitId)" :src="unitThumb(a.unitId)" alt="" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
              <i class="las la-door-open text-3xl"></i>
            </div>
            <!-- Status accent bar -->
            <div class="absolute left-0 top-0 bottom-0 w-1" :class="statusAccent(a.status)" />
          </div>

          <!-- Unit meta -->
          <div class="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center gap-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-sm font-bold text-gray-900">Unit {{ unitLabel(a.unitId) }}</span>
                  <span v-if="propName(a.unitId)" class="text-xs text-gray-500">· {{ propName(a.unitId) }}</span>
                </div>
                <div class="flex flex-wrap gap-3 mt-0.5 text-[11px] text-gray-500">
                  <span v-if="unitField(a.unitId, 'bedrooms') != null" class="flex items-center gap-0.5">
                    <i class="las la-bed text-gray-400"></i>{{ unitField(a.unitId, 'bedrooms') }} bed
                  </span>
                  <span v-if="unitField(a.unitId, 'bathrooms') != null" class="flex items-center gap-0.5">
                    <i class="las la-bath text-gray-400"></i>{{ unitField(a.unitId, 'bathrooms') }} bath
                  </span>
                  <span v-if="unitField(a.unitId, 'floor') != null" class="flex items-center gap-0.5">
                    <i class="las la-layer-group text-gray-400"></i>Floor {{ unitField(a.unitId, 'floor') }}
                  </span>
                  <span v-if="unitPrice(a.unitId)" class="flex items-center gap-0.5 font-semibold text-gray-700">
                    <i class="las la-tag text-gray-400"></i>{{ unitPrice(a.unitId) }}
                  </span>
                </div>
              </div>
              <!-- Status badge + date -->
              <div class="shrink-0 text-right">
                <span class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold capitalize" :class="statusClass(a.status)">
                  <i :class="statusIcon(a.status)"></i>{{ a.status }}
                </span>
                <p class="mt-1 text-[11px] text-gray-400">{{ fmtDate(a.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Applicant details -->
        <div class="px-3 pt-3 pb-2 space-y-2">

          <!-- Applicant identity row -->
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-primary-600 uppercase leading-none">
                {{ (a.applicationData?.fullName || a.applicationData?.applicantEmail || 'T').charAt(0) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold text-gray-900 truncate">
                {{ a.applicationData?.fullName || 'Tenant applicant' }}
              </p>
              <div class="flex flex-wrap gap-2 text-[11px] text-gray-400">
                <span v-if="a.applicationData?.phone" class="flex items-center gap-0.5">
                  <i class="las la-phone"></i>{{ a.applicationData.phone }}
                </span>
                <span v-if="a.applicationData?.moveInDate" class="flex items-center gap-0.5">
                  <i class="las la-sign-in-alt"></i>Move-in {{ fmtDate(a.applicationData.moveInDate) }}
                </span>
                <span v-if="a.applicationData?.occupants" class="flex items-center gap-0.5">
                  <i class="las la-users"></i>{{ a.applicationData.occupants }} {{ a.applicationData.occupants === 1 ? 'person' : 'people' }}
                </span>
              </div>
            </div>
            <NuxtLink
              v-if="propertyIdFor(a.unitId)"
              :to="`/properties/${propertyIdFor(a.unitId)}`"
              class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary-700 border border-primary-200 rounded hover:bg-primary-50 transition"
            >
              <i class="las la-external-link-alt"></i> Property
            </NuxtLink>
          </div>

          <!-- Employment & income -->
          <div v-if="a.applicationData?.employer || a.applicationData?.monthlyIncome" class="flex flex-wrap gap-3 text-[11px] text-gray-600 px-0.5">
            <span v-if="a.applicationData?.employer" class="flex items-center gap-1">
              <i class="las la-briefcase text-gray-400"></i>{{ a.applicationData.employer }}
            </span>
            <span v-if="a.applicationData?.monthlyIncome" class="flex items-center gap-1">
              <i class="las la-money-bill-wave text-gray-400"></i>{{ Number(a.applicationData.monthlyIncome).toLocaleString() }} / mo
            </span>
          </div>

          <!-- Cover letter -->
          <div v-if="a.applicationData?.message" class="rounded border border-gray-100 bg-gray-50 px-3 py-2">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Cover letter</p>
            <p class="text-xs text-gray-700 leading-relaxed line-clamp-3">"{{ a.applicationData.message }}"</p>
          </div>

          <!-- Review notes (decided) -->
          <div
            v-if="a.reviewNotes"
            class="flex items-start gap-2 rounded border p-2.5 text-xs"
            :class="a.status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'"
          >
            <i class="las la-comment-dots text-base shrink-0 mt-0.5" :class="a.status === 'approved' ? 'text-emerald-500' : 'text-red-400'"></i>
            <p class="leading-relaxed">{{ a.reviewNotes }}</p>
          </div>
        </div>

        <!-- Action bar — pending -->
        <div v-if="a.status === 'pending'" class="flex flex-col gap-2 border-t border-gray-100 px-3 py-3 sm:flex-row sm:items-center">
          <input
            v-model="notes[a._id]"
            type="text"
            class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Review notes (optional)"
          />
          <div class="flex gap-2 shrink-0">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              :disabled="busyId === a._id"
              @click="decide(a._id, 'approved')"
            >
              <i v-if="busyId === a._id" class="las la-circle-notch la-spin"></i>
              <i v-else class="las la-check"></i>
              Approve
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              :disabled="busyId === a._id"
              @click="decide(a._id, 'rejected')"
            >
              <i v-if="busyId === a._id" class="las la-circle-notch la-spin"></i>
              <i v-else class="las la-times"></i>
              Decline
            </button>
          </div>
        </div>

        <!-- Decided footer bar -->
        <div v-else class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <p class="text-[11px] text-gray-400">
            Reviewed{{ a.reviewedAt ? ` · ${fmtDate(a.reviewedAt)}` : '' }}
          </p>
          <span v-if="a.status === 'approved'" class="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <i class="las la-check-circle"></i> Unit marked occupied
          </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeFeathersFind } from '../../../utils/feathersNormalize'
import { scrollToDataTarget } from '../../../utils/scrollToQueryTarget'
import { useRentalApplicationsStore } from '@@/stores/rentalApplications'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Review applications - CribHub' })

const route = useRoute()
const apps = useRentalApplicationsStore()
const unitMap = ref<Record<string, any>>({})
const propMap = ref<Record<string, any>>({})
const notes = ref<Record<string, string>>({})
const busyId = ref<string | null>(null)
const activeTab = ref('pending')
const allCounts = ref({ pending: 0, approved: 0, rejected: 0 })

const statusTabs = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
]

function countByStatus(status: string) {
  return (apps.list as any[]).filter((a: any) => a.status === status).length
}

function unitLabel(unitId: string) {
  const u = unitMap.value[String(unitId)]
  return u?.unitNumber ? `#${u.unitNumber}` : `#${String(unitId).slice(-6)}`
}

function unitThumb(unitId: string) {
  return unitMap.value[String(unitId)]?.photos?.[0] || null
}

function unitField(unitId: string, field: string) {
  const u = unitMap.value[String(unitId)]
  return u ? u[field] : null
}

function unitPrice(unitId: string) {
  const u = unitMap.value[String(unitId)]
  if (!u) return null
  const currency = u.rentCurrency || 'GHS'
  if (u.listingType === 'sale' && u.salePrice) {
    return `${currency} ${Number(u.salePrice).toLocaleString()}`
  }
  if (u.rentAmount) {
    return `${currency} ${Number(u.rentAmount).toLocaleString()}/mo`
  }
  return null
}

function propertyIdFor(unitId: string) {
  return unitMap.value[String(unitId)]?.propertyId as string | undefined
}

function propName(unitId: string) {
  const pid = propertyIdFor(unitId)
  return pid ? propMap.value[pid]?.name : undefined
}

function statusClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-800'
}

function statusIcon(status: string) {
  if (status === 'approved') return 'las la-check-circle'
  if (status === 'rejected') return 'las la-times-circle'
  return 'las la-clock'
}

function statusAccent(status: string) {
  if (status === 'approved') return 'bg-emerald-500'
  if (status === 'rejected') return 'bg-red-500'
  return 'bg-amber-400'
}

function fmtDate(iso: string | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

async function hydrateUnits() {
  const ids = [...new Set(apps.list.map((x: any) => String(x.unitId)))]
  if (!ids.length) return
  const feathers = useNuxtApp().$feathers as any
  try {
    const res = await feathers.service('units').find({ query: { _id: { $in: ids }, $limit: 100 } })
    const norm = normalizeFeathersFind(res)
    const next = { ...unitMap.value }
    for (const row of norm.data) next[String((row as any)._id)] = row
    unitMap.value = next
    void hydrateProperties()
  } catch { /* ignore */ }
}

async function hydrateProperties() {
  const propIds = [...new Set(Object.values(unitMap.value).map((u: any) => String(u?.propertyId || '')).filter(Boolean))]
  const missing = propIds.filter((id) => !propMap.value[id])
  if (!missing.length) return
  const feathers = useNuxtApp().$feathers as any
  try {
    const res = await feathers.service('properties').find({ query: { _id: { $in: missing }, $limit: 100, $select: ['_id', 'name'] } })
    const norm = normalizeFeathersFind(res)
    const next = { ...propMap.value }
    for (const row of norm.data) next[String((row as any)._id)] = row
    propMap.value = next
  } catch { /* ignore */ }
}

async function loadAllCounts() {
  const feathers = useNuxtApp().$feathers as any
  try {
    const [p, a, r] = await Promise.all([
      feathers.service('rental-applications').find({ query: { status: 'pending', $limit: 0 } }),
      feathers.service('rental-applications').find({ query: { status: 'approved', $limit: 0 } }),
      feathers.service('rental-applications').find({ query: { status: 'rejected', $limit: 0 } }),
    ])
    allCounts.value = {
      pending: p?.total ?? 0,
      approved: a?.total ?? 0,
      rejected: r?.total ?? 0,
    }
  } catch { /* ignore */ }
}

async function switchTab(status: string) {
  activeTab.value = status
  await apps.fetchList({ status, $sort: { createdAt: -1 } })
  await hydrateUnits()
}

async function decide(id: string, status: 'approved' | 'rejected') {
  busyId.value = id
  try {
    await apps.updateApplication(id, { status, reviewNotes: notes.value[id]?.trim() || undefined })
    allCounts.value.pending = Math.max(0, allCounts.value.pending - 1)
    if (status === 'approved') allCounts.value.approved++
    else allCounts.value.rejected++
    await apps.fetchList({ status: activeTab.value, $sort: { createdAt: -1 } })
    await hydrateUnits()
  } finally {
    busyId.value = null
  }
}

watch(() => apps.list.map((x: any) => x._id).join(','), () => void hydrateUnits())

async function focusApplicationFromQuery() {
  const id = route.query.application
  if (typeof id !== 'string' || !id) return
  try {
    const feathers = useNuxtApp().$feathers as any
    const row = await feathers.service('rental-applications').get(id)
    const st = String((row as any)?.status || 'pending')
    const tab = ['pending', 'approved', 'rejected'].includes(st) ? st : 'pending'
    await switchTab(tab)
    await hydrateUnits()
    scrollToDataTarget('application-id', id)
  } catch {
    await switchTab('pending')
  }
}

onMounted(async () => {
  if (typeof route.query.application === 'string' && route.query.application) {
    await loadAllCounts()
    await focusApplicationFromQuery()
    await hydrateUnits()
  } else {
    await Promise.all([
      apps.fetchList({ status: 'pending', $sort: { createdAt: -1 } }),
      loadAllCounts(),
    ])
    await hydrateUnits()
  }
})

watch(
  () => route.query.application,
  async (q) => {
    if (typeof q !== 'string' || !q) return
    await focusApplicationFromQuery()
    await hydrateUnits()
  }
)
</script>

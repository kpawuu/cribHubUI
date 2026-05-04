<template>
  <div>
    <!-- Header -->
    <div class="mb-5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 mb-0.5">Agent</p>
      <h1 class="text-xl font-bold text-gray-900">Unit applications</h1>
      <p class="mt-0.5 text-sm text-gray-500">Tenant applications for units on your assigned properties.</p>
    </div>

    <!-- Stats -->
    <div class="mb-4 grid grid-cols-3 gap-2">
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-amber-600 tabular-nums">{{ countByStatus('pending') }}</p>
        <p class="text-[11px] text-gray-500">Pending</p>
      </div>
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ countByStatus('approved') }}</p>
        <p class="text-[11px] text-gray-500">Approved</p>
      </div>
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-red-500 tabular-nums">{{ countByStatus('rejected') }}</p>
        <p class="text-[11px] text-gray-500">Declined</p>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="mb-4 flex rounded border border-gray-200 bg-white p-0.5 w-fit text-xs font-medium">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="rounded px-3 py-1.5 transition"
        :class="activeTab === tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.value !== 'all'" class="ml-1 tabular-nums opacity-70">{{ countByStatus(tab.value) }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="apps.isLoading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredList.length" class="compact-card bg-white rounded p-10 text-center">
      <i class="las la-clipboard-list mb-2 block text-4xl text-gray-200"></i>
      <p class="text-sm font-semibold text-gray-900">
        {{ activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications` }}
      </p>
      <p class="mt-1 text-xs text-gray-500">Applications will appear here once tenants apply for units on your assigned properties.</p>
    </div>

    <!-- Applications list -->
    <div v-else class="space-y-3">
      <div v-for="a in filteredList" :key="a._id" class="compact-card bg-white rounded overflow-hidden">

        <!-- Main row -->
        <div class="flex items-stretch gap-0">
          <!-- Unit thumbnail -->
          <div class="shrink-0 w-20 bg-gray-100 relative overflow-hidden min-h-[80px]">
            <img v-if="unitThumb(a.unitId)" :src="unitThumb(a.unitId)" alt="" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
              <i class="las la-building text-2xl"></i>
            </div>
            <div class="absolute left-0 top-0 bottom-0 w-1" :class="statusAccent(a.status)" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span class="text-sm font-bold text-gray-900">Unit {{ unitLabel(a.unitId) }}</span>
                  <span v-if="propertyName(a.unitId)" class="text-xs text-gray-500">· {{ propertyName(a.unitId) }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                  <span class="flex items-center gap-1">
                    <i class="las la-calendar-alt"></i>
                    Applied {{ fmtDate(a.createdAt) }}
                  </span>
                  <span v-if="a.applicationData?.moveInDate" class="flex items-center gap-1">
                    <i class="las la-sign-in-alt"></i>
                    Move-in {{ fmtDate(a.applicationData.moveInDate) }}
                  </span>
                  <span v-if="a.applicationData?.occupants" class="flex items-center gap-1">
                    <i class="las la-users"></i>
                    {{ a.applicationData.occupants }} {{ a.applicationData.occupants === 1 ? 'person' : 'people' }}
                  </span>
                </div>
              </div>
              <span class="shrink-0 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold capitalize" :class="statusClass(a.status)">
                <i :class="statusIcon(a.status)"></i>
                {{ a.status || 'pending' }}
              </span>
            </div>

            <!-- Cover letter -->
            <p v-if="a.applicationData?.message" class="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
              "{{ a.applicationData.message }}"
            </p>

            <!-- Employment -->
            <div v-if="a.applicationData?.employer || a.applicationData?.monthlyIncome" class="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
              <span v-if="a.applicationData?.employer" class="flex items-center gap-1">
                <i class="las la-briefcase text-gray-400"></i>{{ a.applicationData.employer }}
              </span>
              <span v-if="a.applicationData?.monthlyIncome" class="flex items-center gap-1">
                <i class="las la-money-bill-wave text-gray-400"></i>{{ a.applicationData.monthlyIncome.toLocaleString() }} / mo
              </span>
            </div>
          </div>
        </div>

        <!-- Review notes (if any) -->
        <div
          v-if="a.reviewNotes"
          class="mx-3 mb-3 flex items-start gap-2 rounded border p-2.5 text-xs"
          :class="a.status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'"
        >
          <i class="las la-comment-dots text-base shrink-0 mt-0.5" :class="a.status === 'approved' ? 'text-emerald-500' : 'text-red-400'"></i>
          <div>
            <p class="font-semibold mb-0.5">Landlord note</p>
            <p class="leading-relaxed">{{ a.reviewNotes }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <p class="text-[11px] text-gray-400 font-mono truncate max-w-[120px]">{{ a._id }}</p>
          <div class="flex items-center gap-2">
            <NuxtLink
              v-if="propertyIdForUnit(a.unitId)"
              :to="`/properties/${propertyIdForUnit(a.unitId)}`"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary-700 border border-primary-200 rounded hover:bg-primary-50 transition"
            >
              <i class="las la-external-link-alt"></i> View property
            </NuxtLink>
            <span class="text-[11px] text-gray-400 italic">Review by landlord</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="scrollSentinel" class="flex h-10 items-center justify-center py-6">
      <span v-if="apps.isLoadingMore" class="text-xs text-gray-400">Loading more…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeFeathersFind } from '../../../utils/feathersNormalize'
import { useRentalApplicationsStore } from '@@/stores/rentalApplications'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Unit applications - CribHub' })

const apps = useRentalApplicationsStore()
const scrollSentinel = ref<HTMLElement | null>(null)
const unitMap = ref<Record<string, any>>({})
const propMap = ref<Record<string, any>>({})
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
]

const filteredList = computed(() =>
  activeTab.value === 'all' ? apps.list : apps.list.filter((a: any) => a.status === activeTab.value)
)

function countByStatus(status: string) {
  return apps.list.filter((a: any) => a.status === status).length
}

function unitLabel(unitId: string) {
  const u = unitMap.value[String(unitId)]
  return u?.unitNumber ? `#${u.unitNumber}` : `#${String(unitId).slice(-6)}`
}

function unitThumb(unitId: string) {
  const u = unitMap.value[String(unitId)]
  return u?.photos?.[0] || null
}

function propertyIdForUnit(unitId: string) {
  return unitMap.value[String(unitId)]?.propertyId as string | undefined
}

function propertyName(unitId: string) {
  const pid = propertyIdForUnit(unitId)
  return pid ? propMap.value[pid]?.name : undefined
}

function fmtDate(iso: string | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
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

async function hydrateUnits() {
  const ids = [...new Set(apps.list.map((x: any) => String(x.unitId)))]
  const missing = ids.filter((id) => !unitMap.value[id])
  if (!missing.length) return
  const feathers = useNuxtApp().$feathers as any
  try {
    const res = await feathers.service('units').find({ query: { _id: { $in: missing }, $limit: 100 } })
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

async function switchTab(status: string) {
  activeTab.value = status
  if (status === 'all') {
    await apps.fetchList({ $sort: { createdAt: -1 } })
  } else {
    await apps.fetchList({ status, $sort: { createdAt: -1 } })
  }
  await hydrateUnits()
}

watch(() => apps.list.map((x: any) => x._id).join(','), () => { void hydrateUnits() })

useInfiniteScroll(scrollSentinel, () => { void apps.loadMore() })

onMounted(async () => {
  await apps.fetchList({ $sort: { createdAt: -1 } })
  await hydrateUnits()
})
</script>

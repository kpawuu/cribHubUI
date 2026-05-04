<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Landlord</p>
        <h1 class="mt-0.5 text-xl font-bold tracking-tight text-gray-900">Maintenance</h1>
        <p class="mt-0.5 text-sm text-gray-500">Tenant requests across your portfolio</p>
      </div>
      <!-- Status filter tabs -->
      <div class="flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="rounded px-3 py-1.5 transition"
          :class="activeStatus === tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="activeStatus = tab.value; loadList()"
        >
          {{ tab.label }}
          <span v-if="countByStatus[tab.value] != null" class="ml-1 opacity-70">({{ countByStatus[tab.value] }})</span>
        </button>
      </div>
    </div>

    <!-- Summary row -->
    <div class="mb-6 grid grid-cols-3 gap-3">
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-amber-600">{{ countByStatus['pending'] || 0 }}</p>
        <p class="text-xs text-gray-500">Pending</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-blue-600">{{ countByStatus['in_progress'] || 0 }}</p>
        <p class="text-xs text-gray-500">In progress</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-emerald-600">{{ countByStatus['completed'] || 0 }}</p>
        <p class="text-xs text-gray-500">Completed</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="m.isLoading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty -->
    <div v-else-if="!m.list.length" class="compact-card rounded bg-white p-12 text-center">
      <i class="las la-tools mb-3 block text-5xl text-gray-200"></i>
      <p class="font-semibold text-gray-900">No maintenance tickets</p>
      <p class="mt-1 text-sm text-gray-500">Tenant requests will appear here once submitted.</p>
    </div>

    <!-- Tickets list -->
    <div v-else class="space-y-3">
      <div
        v-for="row in m.list"
        :key="String(row._id)"
        class="compact-card rounded bg-white"
        :data-ticket-id="String(row._id)"
      >
        <div class="flex items-start gap-4 p-4">
          <!-- Priority indicator -->
          <div :class="`flex h-10 w-10 shrink-0 items-center justify-center rounded ${priorityIconClass(row.priority)}`">
            <i :class="priorityIcon(row.priority)" class="text-lg"></i>
          </div>

          <!-- Main content -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-gray-900">{{ row.title }}</p>
                <p class="mt-0.5 text-sm text-gray-600 line-clamp-2">{{ row.description }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span class="flex items-center gap-1"><i class="las la-layer-group"></i>Unit {{ row.unitId }}</span>
                  <span>·</span>
                  <span class="flex items-center gap-1"><i class="las la-tag"></i>{{ row.category || 'General' }}</span>
                  <span>·</span>
                  <span>{{ row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded px-2 py-0.5 text-xs font-semibold capitalize" :class="priorityBadgeClass(row.priority)">{{ row.priority || 'medium' }}</span>
                <span class="rounded px-2 py-0.5 text-xs font-semibold capitalize" :class="statusBadgeClass(row.status)">{{ row.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions bar -->
        <div class="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3">
          <span class="text-xs text-gray-400 mr-auto">Update status:</span>
          <button
            v-if="row.status !== 'in_progress'"
            type="button"
            class="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
            :disabled="busy === String(row._id)"
            @click="setStatus(String(row._id), 'in_progress')"
          >
            <i class="las la-spinner mr-1"></i>In progress
          </button>
          <button
            v-if="row.status !== 'completed'"
            type="button"
            class="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            :disabled="busy === String(row._id)"
            @click="setStatus(String(row._id), 'completed')"
          >
            <i class="las la-check mr-1"></i>Mark complete
          </button>
          <button
            v-if="row.status !== 'pending'"
            type="button"
            class="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            :disabled="busy === String(row._id)"
            @click="setStatus(String(row._id), 'pending')"
          >
            <i class="las la-undo mr-1"></i>Re-open
          </button>
          <div v-if="busy === String(row._id)" class="ml-2 text-xs text-gray-400">
            <i class="las la-spinner animate-spin"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMaintenanceRequestsStore } from '@@/stores/operations'
import { scrollToDataTarget } from '../../../utils/scrollToQueryTarget'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Maintenance - CribHub' })

const m = useMaintenanceRequestsStore()
const route = useRoute()
const busy = ref<string | null>(null)
const activeStatus = ref('all')

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
]

const countByStatus = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of (m.list as any[])) {
    counts[row.status] = (counts[row.status] || 0) + 1
  }
  return counts
})

function priorityIcon(priority: string) {
  const m: Record<string, string> = { high: 'las la-exclamation-triangle', medium: 'las la-tools', low: 'las la-info-circle' }
  return m[priority] || 'las la-tools'
}
function priorityIconClass(priority: string) {
  if (priority === 'high') return 'bg-red-50 text-red-500'
  if (priority === 'low') return 'bg-gray-100 text-gray-400'
  return 'bg-amber-50 text-amber-500'
}
function priorityBadgeClass(priority: string) {
  if (priority === 'high') return 'bg-red-50 text-red-700'
  if (priority === 'low') return 'bg-gray-100 text-gray-600'
  return 'bg-amber-50 text-amber-700'
}
function statusBadgeClass(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'in_progress') return 'bg-blue-50 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

async function loadList() {
  const q: Record<string, any> = {}
  if (activeStatus.value !== 'all') q.status = activeStatus.value
  await m.fetchList(q)
}

async function setStatus(id: string, status: string) {
  busy.value = id
  try {
    const completedAt = status === 'completed' ? new Date().toISOString() : undefined
    await m.patchRequest(id, { status, ...(completedAt ? { completedAt } : {}) })
    await loadList()
  } finally {
    busy.value = null
  }
}

async function focusTicketFromQuery() {
  const id = route.query.ticket
  if (typeof id !== 'string' || !id) return
  activeStatus.value = 'all'
  await loadList()
  scrollToDataTarget('ticket-id', id)
}

onMounted(async () => {
  if (typeof route.query.ticket === 'string' && route.query.ticket) {
    await focusTicketFromQuery()
  } else {
    await loadList()
  }
})

watch(
  () => route.query.ticket,
  async (q) => {
    if (typeof q !== 'string' || !q) return
    await focusTicketFromQuery()
  }
)
</script>

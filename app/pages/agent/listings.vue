<template>
  <div>
    <!-- Page header -->
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">My Listing Requests</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Browse properties and request to represent them as an agent.
        </p>
      </div>
      <NuxtLink
        to="/listings"
        class="inline-flex items-center gap-2 rounded border border-primary-600 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
      >
        <i class="las la-search text-base"></i>
        Browse listings
      </NuxtLink>
    </div>

    <!-- Status filter tabs -->
    <div class="mb-4 flex items-center gap-1 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition"
        :class="
          activeTab === tab.value
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="countForTab(tab.value) > 0"
          class="rounded-full px-1.5 py-0.5 text-xs font-semibold"
          :class="
            activeTab === tab.value
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600'
          "
        >{{ countForTab(tab.value) }}</span>
      </button>
    </div>

    <!-- Alert -->
    <div
      v-if="actionMsg"
      class="mb-4 flex items-center gap-2 rounded border px-4 py-3 text-sm"
      :class="actionMsgType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'"
    >
      <i class="text-lg" :class="actionMsgType === 'error' ? 'las la-exclamation-circle text-red-500' : 'las la-check-circle text-green-600'"></i>
      {{ actionMsg }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!filteredRequests.length"
      class="compact-card rounded bg-white px-4 py-12 text-center"
    >
      <i class="las la-clipboard-list text-4xl text-gray-300"></i>
      <p class="mt-2 text-sm font-medium text-gray-600">
        {{ activeTab === 'all' ? 'No listing requests yet' : `No ${activeTab} requests` }}
      </p>
      <p class="mt-1 text-xs text-gray-400">
        Browse properties on the listings page and click "Request to manage" on a listing.
      </p>
      <NuxtLink
        to="/listings"
        class="mt-4 inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <i class="las la-search text-base"></i> Browse listings
      </NuxtLink>
    </div>

    <!-- Request list -->
    <div v-else class="space-y-2">
      <div
        v-for="req in filteredRequests"
        :key="String(req._id)"
        class="compact-card rounded bg-white p-4"
      >
        <div class="flex items-start gap-3">
          <!-- Property thumbnail -->
          <div class="h-14 w-14 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
            <img
              v-if="propertiesMap[req.propertyId]?.coverImageUrl"
              :src="propertiesMap[req.propertyId].coverImageUrl"
              :alt="propertiesMap[req.propertyId]?.name"
              class="h-full w-full object-cover"
            />
            <span v-else class="flex h-full w-full items-center justify-center text-gray-300">
              <i class="las la-building text-2xl"></i>
            </span>
          </div>

          <!-- Details -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-gray-900">
                  {{ propertiesMap[req.propertyId]?.name || 'Property' }}
                </p>
                <p class="mt-0.5 truncate text-xs text-gray-500">
                  {{ propertiesMap[req.propertyId]?.location?.city || propertiesMap[req.propertyId]?.location?.address || req.propertyId }}
                </p>
              </div>
              <span class="shrink-0" :class="statusBadgeClass(req.status)">
                {{ statusLabel(req.status) }}
              </span>
            </div>

            <!-- Meta row -->
            <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span v-if="req.commissionPercent != null" class="inline-flex items-center gap-1">
                <i class="las la-percentage text-sm"></i>
                {{ req.commissionPercent }}% commission
              </span>
              <span class="inline-flex items-center gap-1">
                <i class="las la-calendar-alt text-sm"></i>
                {{ formatDate(req.createdAt) }}
              </span>
              <NuxtLink
                v-if="propertiesMap[req.propertyId]"
                :to="`/properties/${req.propertyId}`"
                class="inline-flex items-center gap-1 text-primary-600 hover:underline"
              >
                <i class="las la-external-link-alt text-sm"></i>
                View listing
              </NuxtLink>
            </div>

            <!-- Message -->
            <p v-if="req.message" class="mt-2 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700 italic">
              "{{ req.message }}"
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            v-if="req.status === 'pending'"
            type="button"
            class="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            :disabled="withdrawing === String(req._id)"
            @click="withdrawRequest(req)"
          >
            <i
              class="text-sm"
              :class="withdrawing === String(req._id) ? 'las la-circle-notch la-spin' : 'las la-undo'"
            ></i>
            Withdraw
          </button>
          <span v-if="req.status === 'accepted'" class="text-xs text-green-700 font-medium">
            <i class="las la-check mr-1"></i>You are assigned to this property
          </span>
          <span v-if="req.status === 'rejected'" class="text-xs text-gray-500">
            Request was declined by the landlord
          </span>
        </div>
      </div>
    </div>

    <!-- Send request modal (launched from listing page, but also accessible here via query) -->
    <Teleport to="body">
      <div
        v-if="showRequestModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-md rounded bg-white shadow-lg">
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 class="text-sm font-bold text-gray-900">Request to manage listing</h3>
            <button type="button" class="text-gray-400 hover:text-gray-600" @click="closeModal">
              <i class="las la-times text-xl"></i>
            </button>
          </div>

          <!-- Property info -->
          <div v-if="modalProperty" class="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
            <div class="h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
              <img
                v-if="modalProperty.coverImageUrl"
                :src="modalProperty.coverImageUrl"
                :alt="modalProperty.name"
                class="h-full w-full object-cover"
              />
              <span v-else class="flex h-full w-full items-center justify-center text-gray-300">
                <i class="las la-building text-xl"></i>
              </span>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-gray-900">{{ modalProperty.name }}</p>
              <p class="truncate text-xs text-gray-500">{{ modalProperty.location?.city || modalProperty.location?.address || '' }}</p>
            </div>
          </div>

          <form class="space-y-4 px-5 py-4" @submit.prevent="submitRequest">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">
                Commission % <span class="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                v-model.number="modalForm.commissionPercent"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="e.g. 5"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">
                Message to landlord <span class="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                v-model="modalForm.message"
                rows="3"
                maxlength="4000"
                placeholder="Introduce yourself and explain why you'd be a great fit for this property…"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              ></textarea>
            </div>
            <div v-if="modalError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {{ modalError }}
            </div>
            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                class="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="closeModal"
              >Cancel</button>
              <button
                type="submit"
                :disabled="modalSubmitting"
                class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                <i v-if="modalSubmitting" class="las la-circle-notch la-spin text-sm"></i>
                <i v-else class="las la-paper-plane text-sm"></i>
                {{ modalSubmitting ? 'Sending…' : 'Send request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useAgentListingRequestsStore } from '@@/stores/operations'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'My Listing Requests – CribHub' })

const auth = useAuthStore()
const alrStore = useAgentListingRequestsStore()
const feathers = useNuxtApp().$feathers as any
const route = useRoute()

// ── Types ──────────────────────────────────────────────────────────────────
interface ListingRequest {
  _id: string
  propertyId: string
  agentUserId: string
  landlordId: string
  commissionPercent?: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
}

// ── State ──────────────────────────────────────────────────────────────────
const isLoading = computed(() => alrStore.isLoading)
const requests = computed(() => alrStore.list as ListingRequest[])
const propertiesMap = ref<Record<string, any>>({})
const activeTab = ref<'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'>('all')
const withdrawing = ref<string | null>(null)
const actionMsg = ref<string | null>(null)
const actionMsgType = ref<'success' | 'error'>('success')

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
] as const

// ── Modal state ────────────────────────────────────────────────────────────
const showRequestModal = ref(false)
const modalProperty = ref<any>(null)
const modalForm = reactive({ commissionPercent: undefined as number | undefined, message: '' })
const modalError = ref<string | null>(null)
const modalSubmitting = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────
const filteredRequests = computed(() => {
  if (activeTab.value === 'all') return requests.value
  return requests.value.filter((r) => r.status === activeTab.value)
})

function countForTab(tab: string): number {
  if (tab === 'all') return requests.value.length
  return requests.value.filter((r) => r.status === tab).length
}

// ── Load ───────────────────────────────────────────────────────────────────
async function loadRequests() {
  await alrStore.fetchList({ $sort: { createdAt: -1 } })

  // Batch-fetch property details for display
  const ids = [...new Set(requests.value.map((r) => r.propertyId))]
  await Promise.allSettled(
    ids.map(async (id) => {
      try {
        propertiesMap.value[id] = await feathers.service('properties').get(id)
      } catch {}
    })
  )
}

// Resolve property data for any new requests that arrive in real-time
watch(() => requests.value.length, async () => {
  const newIds = requests.value
    .map((r) => r.propertyId)
    .filter((id) => id && !propertiesMap.value[id])
  if (!newIds.length) return
  await Promise.allSettled(newIds.map(async (id) => {
    try { propertiesMap.value[id] = await feathers.service('properties').get(id) } catch {}
  }))
})

// ── Actions ────────────────────────────────────────────────────────────────
async function withdrawRequest(req: ListingRequest) {
  withdrawing.value = String(req._id)
  actionMsg.value = null
  try {
    await alrStore.patch(req._id, { status: 'withdrawn' })
    showMsg('Request withdrawn.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Failed to withdraw request', 'error')
  } finally {
    withdrawing.value = null
  }
}

// ── Modal ──────────────────────────────────────────────────────────────────
async function openModalForProperty(propertyId: string) {
  try {
    modalProperty.value = propertiesMap.value[propertyId] || await feathers.service('properties').get(propertyId)
    propertiesMap.value[propertyId] = modalProperty.value
  } catch {
    modalProperty.value = { _id: propertyId, name: 'Property' }
  }
  modalForm.commissionPercent = undefined
  modalForm.message = ''
  modalError.value = null
  showRequestModal.value = true
}

function closeModal() {
  showRequestModal.value = false
  modalProperty.value = null
}

async function submitRequest() {
  if (!modalProperty.value) return
  modalError.value = null
  modalSubmitting.value = true
  try {
    await alrStore.create({
      propertyId: String(modalProperty.value._id),
      commissionPercent: modalForm.commissionPercent,
      message: modalForm.message.trim() || undefined,
    })
    closeModal()
    showMsg('Request sent to landlord!', 'success')
  } catch (e: any) {
    modalError.value = e?.message || 'Failed to send request'
  } finally {
    modalSubmitting.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function showMsg(msg: string, type: 'success' | 'error') {
  actionMsg.value = msg
  actionMsgType.value = type
  setTimeout(() => { actionMsg.value = null }, 5000)
}

function statusLabel(status: string): string {
  return { pending: 'Pending', accepted: 'Accepted', rejected: 'Declined', withdrawn: 'Withdrawn' }[status] ?? status
}

function statusBadgeClass(status: string): string {
  return (
    {
      pending: 'inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700',
      accepted: 'inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700',
      rejected: 'inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700',
      withdrawn: 'inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500',
    }[status] ?? 'inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500'
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await loadRequests()
  // Support ?request=<propertyId> query param from listing page
  const pid = route.query.request as string | undefined
  if (pid) openModalForProperty(pid)
})
</script>

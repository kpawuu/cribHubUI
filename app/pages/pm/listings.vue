<template>
  <div>
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">My Management Requests</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Browse properties, propose your management terms, and track negotiations end-to-end.
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

    <div class="mb-4 flex flex-wrap items-center gap-1 border-b border-gray-200">
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

    <div
      v-if="actionMsg"
      class="mb-4 flex items-center gap-2 rounded border px-4 py-3 text-sm"
      :class="actionMsgType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'"
    >
      <i class="text-lg" :class="actionMsgType === 'error' ? 'las la-exclamation-circle text-red-500' : 'las la-check-circle text-green-600'"></i>
      {{ actionMsg }}
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>

    <div
      v-else-if="!filteredRequests.length"
      class="rounded bg-white px-4 py-12 text-center"
    >
      <i class="las la-clipboard-list text-4xl text-gray-300"></i>
      <p class="mt-2 text-sm font-medium text-gray-600">
        {{ activeTab === 'all' ? 'No management requests yet' : `No ${activeTab} requests` }}
      </p>
      <p class="mt-1 text-xs text-gray-400">
        Browse listings and tap "Request to manage" on any property.
      </p>
      <NuxtLink
        to="/listings"
        class="mt-4 inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <i class="las la-search text-base"></i> Browse listings
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="req in filteredRequests"
        :key="String(req._id)"
        class="rounded bg-white p-4"
      >
        <div class="flex items-start gap-3">
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

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-gray-900">
                  {{ propertiesMap[req.propertyId]?.name || 'Property' }}
                </p>
                <p class="mt-0.5 truncate text-xs text-gray-500">
                  {{ propertiesMap[req.propertyId]?.city || propertiesMap[req.propertyId]?.address || req.propertyId }}
                </p>
              </div>
              <span class="shrink-0" :class="statusBadgeClass(req.status)">
                {{ statusLabel(req.status) }}
              </span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
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

            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <div
                v-if="req.proposal"
                class="rounded border border-primary-100 bg-primary-50/40 px-3 py-2 text-xs"
              >
                <p class="font-semibold text-primary-800">
                  <i class="las la-arrow-up text-primary-600"></i> Your proposal
                </p>
                <p class="mt-0.5 text-primary-700">{{ summarizeProposal(req.proposal) }}</p>
              </div>
              <div
                v-if="req.counter"
                class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs"
              >
                <p class="font-semibold text-amber-800">
                  <i class="las la-arrow-down text-amber-600"></i> Landlord's counter
                </p>
                <p class="mt-0.5 text-amber-800">{{ summarizeProposal(req.counter) }}</p>
              </div>
              <div
                v-if="req.acceptedTerms"
                class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:col-span-2"
              >
                <p class="font-semibold text-emerald-800">
                  <i class="las la-handshake text-emerald-600"></i> Agreed terms
                </p>
                <p class="mt-0.5 text-emerald-800">{{ summarizeProposal(req.acceptedTerms) }}</p>
              </div>
            </div>

            <p v-if="req.message" class="mt-2 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-xs italic text-gray-700">
              "{{ req.message }}"
            </p>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <template v-if="req.status === 'pending'">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              :disabled="actingId === String(req._id)"
              @click="withdrawRequest(req)"
            >
              <i class="las la-undo text-sm"></i> Withdraw
            </button>
          </template>

          <template v-else-if="req.status === 'countered'">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              :disabled="actingId === String(req._id)"
              @click="openCounterEditor(req)"
            >
              <i class="las la-pen text-sm"></i> Send new proposal
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              :disabled="actingId === String(req._id)"
              @click="acceptCounter(req)"
            >
              <i class="las la-check text-sm"></i> Accept counter
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              :disabled="actingId === String(req._id)"
              @click="withdrawRequest(req)"
            >
              <i class="las la-times text-sm"></i> Withdraw
            </button>
          </template>

          <span v-else-if="req.status === 'accepted'" class="text-xs font-medium text-emerald-700">
            <i class="las la-check mr-1"></i>You are managing this property
          </span>
          <span v-else-if="req.status === 'rejected'" class="text-xs text-gray-500">
            Request was declined by the landlord
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showRequestModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
        @click.self="closeModal"
      >
        <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded bg-white shadow-lg">
          <div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 class="text-sm font-bold text-gray-900">
                {{ modalMode === 'counter' ? 'Send updated proposal' : 'Request to manage listing' }}
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">
                {{ modalMode === 'counter'
                  ? 'The landlord countered your terms. Adjust and resend.'
                  : 'Propose your management fee — the landlord can accept, decline, or counter.' }}
              </p>
            </div>
            <button type="button" class="text-gray-400 hover:text-gray-600" @click="closeModal">
              <i class="las la-times text-xl"></i>
            </button>
          </div>

          <div v-if="modalProperty" class="flex shrink-0 items-center gap-3 border-b border-gray-100 px-5 py-3">
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
              <p class="truncate text-xs text-gray-500">{{ modalProperty.city || modalProperty.address || '' }}</p>
            </div>
          </div>

          <form class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4" @submit.prevent="submitRequest">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Your management fee proposal</label>
              <UiFeeProposalEditor v-model="modalForm.proposal" />
            </div>
            <div v-if="modalMode === 'create'">
              <label class="mb-1 block text-xs font-semibold text-gray-700">
                Message to landlord <span class="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                v-model="modalForm.message"
                rows="3"
                maxlength="4000"
                placeholder="Introduce yourself and explain your management approach…"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              ></textarea>
            </div>
            <div v-if="modalError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {{ modalError }}
            </div>
          </form>

          <div class="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              class="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeModal"
            >Cancel</button>
            <button
              type="button"
              :disabled="modalSubmitting"
              class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              @click="submitRequest"
            >
              <i v-if="modalSubmitting" class="las la-circle-notch la-spin text-sm"></i>
              <i v-else class="las la-paper-plane text-sm"></i>
              {{ modalSubmitting ? 'Sending…' : modalMode === 'counter' ? 'Send updated proposal' : 'Send request' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import {
  usePropertyManagerListingRequestsStore,
  usePropertyManagerProfilesStore
} from '@@/stores/operations'
import {
  summarizeProposal,
  defaultFeeToProposal,
  emptyProposal,
  type FeeProposal
} from '../../composables/useFeeProposal'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'My Management Requests – CribHub' })

const auth = useAuthStore()
const reqStore = usePropertyManagerListingRequestsStore()
const pmStore = usePropertyManagerProfilesStore()
const feathers = useNuxtApp().$feathers as any
const route = useRoute()

interface PmListingRequest {
  _id: string
  propertyId: string
  managerUserId: string
  landlordId: string
  message?: string
  status: 'pending' | 'countered' | 'accepted' | 'rejected' | 'withdrawn'
  proposal?: FeeProposal
  counter?: FeeProposal
  acceptedTerms?: FeeProposal
  createdAt: string
}

const isLoading = computed(() => reqStore.isLoading)
const requests = computed(() => reqStore.list as unknown as PmListingRequest[])
const propertiesMap = ref<Record<string, any>>({})
const activeTab = ref<'all' | 'pending' | 'countered' | 'accepted' | 'rejected' | 'withdrawn'>('all')
const actingId = ref<string | null>(null)
const actionMsg = ref<string | null>(null)
const actionMsgType = ref<'success' | 'error'>('success')

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'countered', label: 'Countered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
] as const

const showRequestModal = ref(false)
const modalProperty = ref<any>(null)
const modalRequest = ref<PmListingRequest | null>(null)
const modalMode = ref<'create' | 'counter'>('create')
const modalForm = reactive<{
  proposal: FeeProposal | null
  message: string
}>({ proposal: null, message: '' })
const modalError = ref<string | null>(null)
const modalSubmitting = ref(false)

const filteredRequests = computed(() => {
  if (activeTab.value === 'all') return requests.value
  return requests.value.filter((r) => r.status === activeTab.value)
})

function countForTab(tab: string): number {
  if (tab === 'all') return requests.value.length
  return requests.value.filter((r) => r.status === tab).length
}

async function loadRequests() {
  await reqStore.fetchList({ $sort: { createdAt: -1 } })
  const ids = [...new Set(requests.value.map((r) => r.propertyId))]
  await Promise.allSettled(
    ids.map(async (id) => {
      try { propertiesMap.value[id] = await feathers.service('properties').get(id) } catch {}
    })
  )
}

watch(() => requests.value.length, async () => {
  const newIds = requests.value
    .map((r) => r.propertyId)
    .filter((id) => id && !propertiesMap.value[id])
  if (!newIds.length) return
  await Promise.allSettled(newIds.map(async (id) => {
    try { propertiesMap.value[id] = await feathers.service('properties').get(id) } catch {}
  }))
})

async function withdrawRequest(req: PmListingRequest) {
  actingId.value = String(req._id)
  actionMsg.value = null
  try {
    await reqStore.patch(req._id, { status: 'withdrawn' })
    showMsg('Request withdrawn.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Failed to withdraw request', 'error')
  } finally {
    actingId.value = null
  }
}

async function acceptCounter(req: PmListingRequest) {
  actingId.value = String(req._id)
  actionMsg.value = null
  try {
    await reqStore.patch(req._id, { status: 'accepted' })
    showMsg('Counter accepted — you are now managing this property.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Failed to accept counter', 'error')
  } finally {
    actingId.value = null
  }
}

async function openCounterEditor(req: PmListingRequest) {
  modalRequest.value = req
  modalMode.value = 'counter'
  try {
    modalProperty.value = propertiesMap.value[req.propertyId] || (await feathers.service('properties').get(req.propertyId))
    propertiesMap.value[req.propertyId] = modalProperty.value
  } catch {
    modalProperty.value = { _id: req.propertyId, name: 'Property' }
  }
  modalForm.proposal = req.counter ? JSON.parse(JSON.stringify(req.counter)) : (req.proposal ? JSON.parse(JSON.stringify(req.proposal)) : emptyProposal())
  modalForm.message = ''
  modalError.value = null
  showRequestModal.value = true
}

async function openModalForProperty(propertyId: string) {
  modalMode.value = 'create'
  modalRequest.value = null
  try {
    modalProperty.value = propertiesMap.value[propertyId] || (await feathers.service('properties').get(propertyId))
    propertiesMap.value[propertyId] = modalProperty.value
  } catch {
    modalProperty.value = { _id: propertyId, name: 'Property' }
  }
  let defaultProposal: FeeProposal | null = null
  try {
    const uid = (auth.user as any)?._id?.toString?.()
    if (uid) {
      await pmStore.fetchList({ userId: uid })
      const mine = (pmStore.list as any[])[0]
      if (mine?.defaultFee) defaultProposal = defaultFeeToProposal(mine.defaultFee)
    }
  } catch {}
  modalForm.proposal = defaultProposal || emptyProposal()
  modalForm.message = ''
  modalError.value = null
  showRequestModal.value = true
}

function closeModal() {
  showRequestModal.value = false
  modalProperty.value = null
  modalRequest.value = null
}

async function submitRequest() {
  if (!modalProperty.value) return
  modalError.value = null
  modalSubmitting.value = true
  try {
    if (modalMode.value === 'counter' && modalRequest.value) {
      await reqStore.patch(modalRequest.value._id, { proposal: modalForm.proposal as any })
      closeModal()
      showMsg('New proposal sent to landlord.', 'success')
    } else {
      await reqStore.create({
        propertyId: String(modalProperty.value._id),
        proposal: modalForm.proposal as any,
        message: modalForm.message.trim() || undefined
      })
      closeModal()
      showMsg('Request sent to landlord!', 'success')
    }
  } catch (e: any) {
    modalError.value = e?.message || 'Failed to send request'
  } finally {
    modalSubmitting.value = false
  }
}

function showMsg(msg: string, type: 'success' | 'error') {
  actionMsg.value = msg
  actionMsgType.value = type
  setTimeout(() => { actionMsg.value = null }, 5000)
}

function statusLabel(status: string): string {
  return ({
    pending: 'Pending',
    countered: 'Countered',
    accepted: 'Accepted',
    rejected: 'Declined',
    withdrawn: 'Withdrawn'
  } as Record<string, string>)[status] ?? status
}

function statusBadgeClass(status: string): string {
  return (
    ({
      pending: 'inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700',
      countered: 'inline-flex items-center rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700',
      accepted: 'inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700',
      rejected: 'inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700',
      withdrawn: 'inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500'
    } as Record<string, string>)[status] ??
    'inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500'
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await loadRequests()
  const pid = route.query.request as string | undefined
  if (pid) openModalForProperty(pid)
})
</script>

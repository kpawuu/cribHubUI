<template>
  <div>
    <!-- Filter tabs -->
    <div class="mb-4 flex flex-wrap items-center gap-1 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition"
        :class="
          statusFilter === tab.value
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        @click="statusFilter = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="countFor(tab.value) > 0"
          class="rounded-full px-1.5 py-0.5 text-xs font-semibold"
          :class="statusFilter === tab.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'"
        >{{ countFor(tab.value) }}</span>
      </button>
    </div>

    <!-- KPI cards -->
    <div class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending</p>
        <p class="mt-1 text-lg font-bold text-amber-700">{{ formatMoney(totals.pending) }}</p>
      </div>
      <div class="rounded bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Approved</p>
        <p class="mt-1 text-lg font-bold text-blue-700">{{ formatMoney(totals.approved) }}</p>
      </div>
      <div class="rounded bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Paid</p>
        <p class="mt-1 text-lg font-bold text-emerald-700">{{ formatMoney(totals.paid) }}</p>
      </div>
      <div class="rounded bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cancelled</p>
        <p class="mt-1 text-lg font-bold text-gray-500">{{ formatMoney(totals.cancelled) }}</p>
      </div>
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

    <!-- List -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>

    <div v-else-if="!filtered.length" class="rounded bg-white px-4 py-12 text-center">
      <i class="las la-coins text-4xl text-gray-300"></i>
      <p class="mt-2 text-sm font-medium text-gray-600">No {{ statusFilter === 'all' ? '' : statusFilter }} payouts</p>
      <p class="mt-1 text-xs text-gray-400">
        {{ kind === 'agent'
          ? 'Commissions will appear here once a landlord records or approves a payout.'
          : 'Management fees will appear here once a landlord records or approves a payout.' }}
      </p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="p in filtered"
        :key="String(p._id)"
        class="rounded bg-white p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-gray-900">
                {{ propertyName(p.propertyId) }}
              </p>
              <span :class="statusBadgeClass(p.status)">{{ statusLabel(p.status) }}</span>
              <span v-if="p.trigger" class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">{{ triggerLabel(p.trigger) }}</span>
            </div>
            <p class="mt-0.5 text-xs text-gray-500">
              <i class="las la-calendar-alt"></i> {{ formatDate(p.createdAt) }}
              <span v-if="p.paidAt" class="ml-2"><i class="las la-check"></i> Paid {{ formatDate(p.paidAt) }}</span>
            </p>
            <p v-if="p.note" class="mt-1 rounded border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs italic text-gray-700">"{{ p.note }}"</p>
          </div>
          <div class="text-right">
            <p class="text-base font-bold text-gray-900">
              {{ p.currency || 'GHS' }} {{ Number(p.amount || 0).toLocaleString() }}
            </p>
            <p v-if="p.feeSnapshot" class="mt-0.5 text-xs text-gray-500">
              <i class="las la-tag"></i> {{ feeSnapshotLabel(p.feeSnapshot) }}
            </p>
          </div>
        </div>

        <div v-if="canManage" class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <template v-if="p.status === 'pending'">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
              :disabled="actingId === String(p._id)"
              @click="approve(p)"
            >
              <i class="las la-check-circle text-sm"></i> Approve
            </button>
          </template>
          <template v-if="p.status === 'pending' || p.status === 'approved'">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="actingId === String(p._id)"
              @click="markPaid(p)"
            >
              <i class="las la-money-bill-wave text-sm"></i> Mark paid
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              :disabled="actingId === String(p._id)"
              @click="cancel(p)"
            >
              <i class="las la-times text-sm"></i> Cancel
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePayoutsStore } from '@@/stores/operations'
import { useAuthStore } from '@@/stores/auth'

interface Props {
  /** 'agent' for commission payouts, 'pm' for management fee payouts */
  kind: 'agent' | 'pm'
  /** When true, show landlord/admin actions (approve / mark paid / cancel). */
  canManage?: boolean
  /** Filter to a specific property (landlord context). */
  propertyId?: string
}
const props = withDefaults(defineProps<Props>(), { canManage: false })

const auth = useAuthStore()
const store = usePayoutsStore()
const feathers = useNuxtApp().$feathers as any

const list = computed(() => store.list as any[])
const isLoading = computed(() => store.isLoading)

const statusFilter = ref<'all' | 'pending' | 'approved' | 'paid' | 'cancelled'>('all')
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' }
] as const

const propertyMap = ref<Record<string, any>>({})
const actingId = ref<string | null>(null)
const actionMsg = ref<string | null>(null)
const actionMsgType = ref<'success' | 'error'>('success')

const filtered = computed(() => {
  if (statusFilter.value === 'all') return list.value
  return list.value.filter((p) => p.status === statusFilter.value)
})

function countFor(status: string): number {
  if (status === 'all') return list.value.length
  return list.value.filter((p) => p.status === status).length
}

const totals = computed(() => {
  const t = { pending: 0, approved: 0, paid: 0, cancelled: 0 }
  for (const p of list.value) {
    const s = (p.status || 'pending') as keyof typeof t
    if (s in t) t[s] += Number(p.amount || 0)
  }
  return t
})

function propertyName(id?: string): string {
  if (!id) return '—'
  return propertyMap.value[id]?.name || 'Property'
}

function formatMoney(v: number, currency = 'GHS'): string {
  if (!Number.isFinite(v)) return `${currency} 0`
  return `${currency} ${v.toLocaleString()}`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function statusLabel(s: string): string {
  return ({ pending: 'Pending', approved: 'Approved', paid: 'Paid', cancelled: 'Cancelled' } as Record<string, string>)[s] ?? s
}

function statusBadgeClass(s: string): string {
  const base = 'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold'
  return base + ' ' + (({
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-blue-200 bg-blue-50 text-blue-700',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-gray-200 bg-gray-100 text-gray-500'
  } as Record<string, string>)[s] || 'border-gray-200 bg-gray-100 text-gray-500')
}

function triggerLabel(t: string): string {
  return ({
    rent_consummated: 'Rent consummated',
    sale_consummated: 'Sale consummated',
    first_month_paid: 'First month paid',
    each_renewal: 'On renewal',
    monthly_rent_collected: 'Monthly rent'
  } as Record<string, string>)[t] || t
}

function feeSnapshotLabel(snap: any): string {
  if (!snap) return ''
  if (snap.type === 'percent_of_rent') return `${snap.value}% of rent`
  if (snap.type === 'percent_of_sale') return `${snap.value}% of sale`
  if (snap.type === 'fixed') return `${snap.currency || 'GHS'} ${Number(snap.value || 0).toLocaleString()}`
  if (snap.type === 'months_of_rent') return `${snap.value} mo. rent`
  return ''
}

async function loadList() {
  const q: Record<string, any> = { $sort: { createdAt: -1 } }
  if (props.propertyId) q.propertyId = props.propertyId
  await store.fetchList(props.kind, q)
  const ids = [...new Set(list.value.map((p) => p.propertyId).filter(Boolean))]
  await Promise.allSettled(ids.map(async (id) => {
    try { propertyMap.value[id] = await feathers.service('properties').get(id) } catch {}
  }))
}

async function approve(p: any) {
  actingId.value = String(p._id)
  try {
    const svc = props.kind === 'agent' ? 'agent-payouts' : 'pm-payouts'
    await feathers.service(svc).patch(p._id, { status: 'approved' })
    showMsg('Payout approved.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Approve failed', 'error')
  } finally {
    actingId.value = null
  }
}

async function markPaid(p: any) {
  actingId.value = String(p._id)
  try {
    await store.markPaid(p._id)
    showMsg('Marked as paid.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Mark paid failed', 'error')
  } finally {
    actingId.value = null
  }
}

async function cancel(p: any) {
  if (!confirm('Cancel this payout?')) return
  actingId.value = String(p._id)
  try {
    await store.cancel(p._id)
    showMsg('Payout cancelled.', 'success')
  } catch (e: any) {
    showMsg(e?.message || 'Cancel failed', 'error')
  } finally {
    actingId.value = null
  }
}

function showMsg(msg: string, type: 'success' | 'error') {
  actionMsg.value = msg
  actionMsgType.value = type
  setTimeout(() => { actionMsg.value = null }, 5000)
}

watch(() => list.value.length, async () => {
  const newIds = list.value.map((p) => p.propertyId).filter((id) => id && !propertyMap.value[id])
  if (!newIds.length) return
  await Promise.allSettled(newIds.map(async (id) => {
    try { propertyMap.value[id] = await feathers.service('properties').get(id) } catch {}
  }))
})

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await loadList()
})
</script>

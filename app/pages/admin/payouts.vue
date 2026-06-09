<template>
  <div class="mx-auto w-full max-w-7xl px-3 py-4 lg:px-6 lg:py-6">
    <!-- Header -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-widest text-primary-600">Admin · Moderation</p>
        <h1 class="mt-0.5 text-xl font-bold text-gray-900 lg:text-2xl">Payouts moderation</h1>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Cross-platform view of every commission and management-fee payout. Drill down by status, take
          corrective action on stuck records, and export totals for accounting.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          @click="refresh()"
        >
          <i class="las la-sync"></i> Refresh
        </button>
      </div>
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
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total records</p>
        <p class="mt-1 text-lg font-bold text-gray-900">{{ list.length }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending</p>
        <p class="mt-1 text-lg font-bold text-amber-700">{{ formatMoney(totals.pending) }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Approved</p>
        <p class="mt-1 text-lg font-bold text-blue-700">{{ formatMoney(totals.approved) }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Paid</p>
        <p class="mt-1 text-lg font-bold text-emerald-700">{{ formatMoney(totals.paid) }}</p>
      </div>
      <div class="rounded border border-gray-100 bg-white p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cancelled</p>
        <p class="mt-1 text-lg font-bold text-gray-500">{{ formatMoney(totals.cancelled) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 grid gap-2 md:grid-cols-4">
      <div class="md:col-span-2">
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Search</label>
        <input
          v-model="search"
          type="text"
          placeholder="Search by property, payee, currency, or note…"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</label>
        <select
          v-model="statusFilter"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Trigger</label>
        <select
          v-model="triggerFilter"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All triggers</option>
          <option v-for="t in triggerOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
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

    <!-- Table -->
    <div v-if="isLoading" class="flex items-center justify-center py-20 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>
    <div v-else-if="!filtered.length" class="rounded border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
      <i class="las la-coins text-4xl text-gray-300"></i>
      <p class="mt-2 text-sm font-medium text-gray-600">No payouts match the current filters.</p>
      <p class="mt-1 text-xs text-gray-400">Adjust the filters above or switch payout type.</p>
    </div>

    <div v-else class="overflow-hidden rounded border border-gray-100 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[920px] text-sm">
          <thead class="bg-gray-50 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th class="px-3 py-2">Created</th>
              <th class="px-3 py-2">Property</th>
              <th class="px-3 py-2">{{ kind === 'agent' ? 'Agent' : 'Property manager' }}</th>
              <th class="px-3 py-2">Amount</th>
              <th class="px-3 py-2">Trigger</th>
              <th class="px-3 py-2">Status</th>
              <th class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in filtered" :key="String(p._id)" class="hover:bg-gray-50/40">
              <td class="px-3 py-3 align-top text-xs text-gray-500">{{ formatDate(p.createdAt) }}</td>
              <td class="px-3 py-3 align-top">
                <div class="text-sm font-medium text-gray-900">{{ propertyName(p.propertyId) }}</div>
                <div class="mt-0.5 text-[11px] text-gray-400">{{ String(p.propertyId).slice(-8) }}</div>
              </td>
              <td class="px-3 py-3 align-top">
                <div class="text-sm text-gray-900">{{ payeeName(p) }}</div>
                <div class="mt-0.5 text-[11px] text-gray-400">{{ String(payeeUserId(p)).slice(-8) }}</div>
              </td>
              <td class="px-3 py-3 align-top">
                <div class="text-sm font-semibold text-gray-900">{{ formatMoney(Number(p.amount || 0), p.currency || 'GHS') }}</div>
                <div v-if="p.baseAmount" class="mt-0.5 text-[11px] text-gray-400">
                  Base {{ formatMoney(Number(p.baseAmount), p.currency || 'GHS') }}
                </div>
              </td>
              <td class="px-3 py-3 align-top text-xs text-gray-600">{{ triggerLabel(p.trigger) }}</td>
              <td class="px-3 py-3 align-top">
                <span :class="statusBadgeClass(p.status)">{{ statusLabel(p.status) }}</span>
                <div v-if="p.status === 'paid' && p.paidAt" class="mt-1 text-[11px] text-gray-400">
                  Paid {{ formatDate(p.paidAt) }}
                </div>
              </td>
              <td class="px-3 py-3 align-top">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <button
                    v-if="p.status === 'pending'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    :disabled="actingId === String(p._id)"
                    @click="setStatus(p, 'approved')"
                  >
                    <i class="las la-thumbs-up"></i> Approve
                  </button>
                  <button
                    v-if="p.status !== 'paid' && p.status !== 'cancelled'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    :disabled="actingId === String(p._id)"
                    @click="markPaid(p)"
                  >
                    <i class="las la-check"></i> Mark paid
                  </button>
                  <button
                    v-if="p.status !== 'cancelled'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    :disabled="actingId === String(p._id)"
                    @click="setStatus(p, 'cancelled')"
                  >
                    <i class="las la-times"></i> Cancel
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    :disabled="actingId === String(p._id)"
                    @click="removeRecord(p)"
                  >
                    <i class="las la-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth', 'admin'] })
useHead({ title: 'Payouts moderation' })

const feathers = useNuxtApp().$feathers as any

type Kind = 'agent' | 'pm'
const kind = ref<Kind>('agent')
const kindTabs: Array<{ value: Kind; label: string; icon: string }> = [
  { value: 'agent', label: 'Agent commissions', icon: 'las la-user-tie' },
  { value: 'pm', label: 'PM fees', icon: 'las la-briefcase' }
]

const list = ref<any[]>([])
const propertyMap = ref<Record<string, any>>({})
const userMap = ref<Record<string, any>>({})
const isLoading = ref(false)
const actingId = ref<string | null>(null)
const actionMsg = ref<string | null>(null)
const actionMsgType = ref<'success' | 'error'>('success')

const search = ref('')
const statusFilter = ref<'all' | 'pending' | 'approved' | 'paid' | 'cancelled'>('all')
const triggerFilter = ref('all')

const triggerOptions = [
  { value: 'rent_consummated', label: 'Rent consummated' },
  { value: 'sale_consummated', label: 'Sale consummated' },
  { value: 'first_month_paid', label: 'First month paid' },
  { value: 'each_renewal', label: 'On renewal' },
  { value: 'monthly_rent_collected', label: 'Monthly rent' },
  { value: 'manual', label: 'Manual' }
]

function svcPath() {
  return kind.value === 'agent' ? 'agent-payouts' : 'pm-payouts'
}

function payeeUserId(p: any): string {
  return String(kind.value === 'agent' ? p.agentUserId : p.managerUserId || '')
}
function payeeName(p: any): string {
  const uid = payeeUserId(p)
  const u = userMap.value[uid]
  return u?.fullName || u?.email || (uid ? uid.slice(-8) : '—')
}
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
  return triggerOptions.find((o) => o.value === t)?.label || t
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return list.value.filter((p) => {
    if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false
    if (triggerFilter.value !== 'all' && p.trigger !== triggerFilter.value) return false
    if (!q) return true
    const hay = [
      propertyName(p.propertyId),
      payeeName(p),
      String(p.currency || ''),
      String(p.paidNote || ''),
      String(p._id || '')
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const totals = computed(() => {
  const t = { pending: 0, approved: 0, paid: 0, cancelled: 0 }
  for (const p of list.value) {
    const s = (p.status || 'pending') as keyof typeof t
    if (s in t) t[s] += Number(p.amount || 0)
  }
  return t
})

async function loadProperties(ids: string[]) {
  const need = ids.filter((id) => id && !propertyMap.value[id])
  if (!need.length) return
  try {
    const res = await feathers.service('properties').find({
      query: { _id: { $in: need }, $limit: need.length }
    })
    const arr = Array.isArray(res) ? res : res?.data || []
    for (const p of arr) propertyMap.value[String(p._id)] = p
  } catch {
    // non-fatal
  }
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
  } catch {
    // non-fatal
  }
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
      loadProperties([...new Set(arr.map((p: any) => String(p.propertyId)).filter(Boolean) as string[])]),
      loadUsers([...new Set(arr.map((p: any) => payeeUserId(p)).filter(Boolean) as string[])])
    ])
    wireRealtime()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to load payouts.'
    actionMsgType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

/* Realtime: pick up payouts created/paid/cancelled elsewhere (e.g., by the
 * landlord on the property page) without forcing the admin to hit Refresh. */
let stopPayoutRt: (() => void) | null = null
function wireRealtime() {
  stopPayoutRt?.()
  if (!import.meta.client) return
  stopPayoutRt = useFeathersRealtime<any>(svcPath(), {
    onCreated: (row) => {
      if (!list.value.some((x) => String(x._id) === String(row._id))) list.value.unshift(row)
      void loadProperties([String(row.propertyId || '')])
      void loadUsers([payeeUserId(row)].filter(Boolean) as string[])
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
onScopeDispose(() => stopPayoutRt?.())

function setKind(k: Kind) {
  if (kind.value === k) return
  kind.value = k
  search.value = ''
  statusFilter.value = 'all'
  triggerFilter.value = 'all'
  refresh()
}

async function setStatus(p: any, status: 'approved' | 'cancelled') {
  if (!confirm(`Mark this payout as ${status}?`)) return
  actingId.value = String(p._id)
  try {
    await feathers.service(svcPath()).patch(String(p._id), { status })
    actionMsg.value = `Payout updated to ${status}.`
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to update payout.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

async function markPaid(p: any) {
  const note = prompt('Optional note for this payment (visible to the payee):', '') ?? ''
  actingId.value = String(p._id)
  try {
    await feathers.service(svcPath()).patch(String(p._id), {
      status: 'paid',
      paidAt: new Date().toISOString(),
      ...(note ? { paidNote: note } : {})
    })
    actionMsg.value = 'Payout marked as paid.'
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to mark paid.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

async function removeRecord(p: any) {
  if (!confirm('Delete this payout record? This action cannot be undone.')) return
  actingId.value = String(p._id)
  try {
    await feathers.service(svcPath()).remove(String(p._id))
    actionMsg.value = 'Payout deleted.'
    actionMsgType.value = 'success'
    await refresh()
  } catch (e: any) {
    actionMsg.value = e?.message || 'Failed to delete payout.'
    actionMsgType.value = 'error'
  } finally {
    actingId.value = null
  }
}

onMounted(refresh)
</script>

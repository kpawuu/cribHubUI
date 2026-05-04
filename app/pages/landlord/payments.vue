<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Landlord</p>
      <h1 class="mt-0.5 text-xl font-bold tracking-tight text-gray-900">Payments</h1>
      <p class="mt-0.5 text-sm text-gray-500">Recorded rent, online and offline entries</p>
    </div>

    <!-- Summary -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-gray-900">{{ pay.list.length }}</p>
        <p class="text-xs text-gray-500">Total entries</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-emerald-600">{{ successCount }}</p>
        <p class="text-xs text-gray-500">Successful</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-gray-900">{{ manualCount }}</p>
        <p class="text-xs text-gray-500">Manual</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-primary-700">{{ totalAmount }}</p>
        <p class="text-xs text-gray-500">GHS total</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Log manual payment form -->
      <div class="compact-card rounded bg-white p-5">
        <h2 class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-emerald-600">
            <i class="las la-plus text-xs text-white"></i>
          </div>
          Log manual payment
        </h2>
        <p class="mb-4 text-xs text-gray-500">Record offline or bank-confirmed rent.</p>

        <div v-if="formError" class="mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">{{ formError }}</div>
        <div v-if="formSuccess" class="mb-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
          <i class="las la-check-circle mr-1"></i>Payment recorded!
        </div>

        <form class="space-y-3" @submit.prevent="onCreate">

          <!-- ── Tenant search ── -->
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Tenant <span class="text-red-500">*</span></label>

            <!-- Selected tenant chip -->
            <div v-if="selectedTenant" class="flex items-center gap-2 rounded border border-primary-300 bg-primary-50 px-3 py-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">
                {{ initials(selectedTenant.fullName) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-semibold text-gray-900">{{ selectedTenant.fullName }}</p>
                <p class="truncate text-xs text-gray-500">{{ selectedTenant.email }}</p>
              </div>
              <button type="button" class="ml-1 text-gray-400 hover:text-red-500" @click="clearTenant">
                <i class="las la-times text-sm"></i>
              </button>
            </div>

            <!-- Search input -->
            <div v-else class="relative">
              <div class="relative">
                <i class="las la-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
                <input
                  v-model="tenantQuery"
                  type="text"
                  placeholder="Search by name or email…"
                  class="w-full rounded border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="onTenantInput"
                  @focus="onTenantFocus"
                  @blur="scheduleCloseTenant"
                />
                <i v-if="tenantSearching" class="las la-spinner animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
              </div>
              <!-- Dropdown -->
              <div
                v-if="showTenantDrop && (tenantResults.length || tenantQuery.length >= 2)"
                class="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg"
              >
                <div v-if="tenantSearching" class="px-3 py-3 text-xs text-gray-400">
                  <i class="las la-spinner animate-spin mr-1"></i>Searching…
                </div>
                <div v-else-if="!tenantResults.length" class="px-3 py-3 text-xs text-gray-400">
                  No tenants found for "{{ tenantQuery }}"
                </div>
                <button
                  v-for="t in tenantResults"
                  :key="t._id"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-gray-50"
                  @mousedown.prevent="selectTenant(t)"
                >
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">
                    {{ initials(t.fullName) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-xs font-semibold text-gray-900">{{ t.fullName }}</p>
                    <p class="truncate text-xs text-gray-500">{{ t.email }}</p>
                  </div>
                  <span v-if="t.roles?.includes('tenant')" class="ml-auto rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">tenant</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ── Unit search ── -->
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Unit <span class="text-red-500">*</span></label>

            <!-- Selected unit chip -->
            <div v-if="selectedUnit" class="flex items-center gap-2 rounded border border-primary-300 bg-primary-50 px-3 py-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-600 text-xs font-bold text-white">
                {{ selectedUnit.unitNumber }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-semibold text-gray-900">Unit #{{ selectedUnit.unitNumber }}</p>
                <p class="truncate text-xs text-gray-500">
                  {{ selectedUnit.bedrooms }}bd · {{ selectedUnit.bathrooms }}ba
                  <span v-if="selectedUnit.rentAmount"> · {{ selectedUnit.rentCurrency || 'GHS' }} {{ selectedUnit.rentAmount?.toLocaleString() }}</span>
                  <span class="ml-1 capitalize">· {{ selectedUnit.status }}</span>
                </p>
              </div>
              <button type="button" class="ml-1 text-gray-400 hover:text-red-500" @click="clearUnit">
                <i class="las la-times text-sm"></i>
              </button>
            </div>

            <!-- Search input -->
            <div v-else class="relative">
              <div class="relative">
                <i class="las la-door-open absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
                <input
                  v-model="unitQuery"
                  type="text"
                  placeholder="Search by unit number…"
                  class="w-full rounded border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="onUnitInput"
                  @focus="onUnitFocus"
                  @blur="scheduleCloseUnit"
                />
                <i v-if="unitSearching" class="las la-spinner animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
              </div>
              <!-- Dropdown -->
              <div
                v-if="showUnitDrop && (unitResults.length || unitQuery.length >= 1)"
                class="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg"
              >
                <div v-if="unitSearching" class="px-3 py-3 text-xs text-gray-400">
                  <i class="las la-spinner animate-spin mr-1"></i>Searching…
                </div>
                <div v-else-if="!unitResults.length" class="px-3 py-3 text-xs text-gray-400">
                  No units found for "{{ unitQuery }}"
                </div>
                <button
                  v-for="u in unitResults"
                  :key="u._id"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-gray-50"
                  @mousedown.prevent="selectUnit(u)"
                >
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-700">
                    {{ String(u.unitNumber).slice(0, 3) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-xs font-semibold text-gray-900">Unit #{{ u.unitNumber }}</p>
                    <p class="truncate text-xs text-gray-500">
                      {{ u.bedrooms }}bd · {{ u.bathrooms }}ba
                      <span v-if="u.rentAmount"> · {{ u.rentCurrency || 'GHS' }} {{ u.rentAmount?.toLocaleString() }}</span>
                    </p>
                  </div>
                  <span
                    class="ml-auto shrink-0 rounded px-1.5 py-0.5 text-xs font-medium capitalize"
                    :class="u.status === 'occupied' ? 'bg-emerald-50 text-emerald-700' : u.status === 'maintenance' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'"
                  >{{ u.status }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Amount + currency -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Amount <span class="text-red-500">*</span></label>
              <input
                v-model.number="form.amount"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Currency</label>
              <select
                v-model="form.currency"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Payer name</label>
            <input
              v-model="form.payerName"
              placeholder="e.g. John Mensah"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Payer phone</label>
            <input
              v-model="form.payerPhone"
              placeholder="+233 55 000 0000"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="creating || !form.tenantId || !form.unitId"
          >
            <i v-if="creating" class="las la-spinner animate-spin mr-1"></i>
            {{ creating ? 'Recording…' : 'Record payment' }}
          </button>
        </form>
      </div>

      <!-- Payments list -->
      <div class="lg:col-span-2">
        <div class="compact-card rounded bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">Payment history</h2>
            <button type="button" class="text-xs text-primary-600 hover:underline" @click="reload">
              <i class="las la-sync-alt mr-1"></i>Refresh
            </button>
          </div>

          <div v-if="pay.isLoading" class="space-y-3 p-4">
            <div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded bg-gray-100" />
          </div>

          <div v-else-if="!pay.list.length" class="p-8 text-center">
            <i class="las la-wallet mb-2 block text-4xl text-gray-200"></i>
            <p class="text-sm font-medium text-gray-700">No payments yet</p>
            <p class="mt-0.5 text-xs text-gray-500">Log manual entries or initiate online payments.</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="row in pay.list"
              :key="String(row._id)"
              class="flex items-start gap-3 px-4 py-3"
              :data-payment-id="String(row._id)"
            >
              <div :class="`flex h-9 w-9 shrink-0 items-center justify-center rounded ${statusIconClass(row.status)}`">
                <i :class="statusIcon(row.status)" class="text-base"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-1">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">
                      {{ row.currency || 'GHS' }} {{ (row.amount || 0).toLocaleString() }}
                      <span v-if="row.payerName" class="ml-1 text-xs font-normal text-gray-500">· {{ row.payerName }}</span>
                    </p>
                    <p class="text-xs text-gray-500">
                      Unit {{ paymentUnitLabel(String(row.unitId)) }}
                      <span v-if="row.reference"> · {{ row.reference }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span v-if="row.isManualEntry" class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">Manual</span>
                    <span class="rounded px-2 py-0.5 text-xs font-medium capitalize" :class="payStatusClass(row.status)">{{ row.status }}</span>
                  </div>
                </div>
                <p class="mt-0.5 text-xs text-gray-400">{{ row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { usePaymentsStore } from '@@/stores/operations'
import { scrollToDataTarget } from '../../../utils/scrollToQueryTarget'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Payments - CribHub' })

const auth = useAuthStore()
const route = useRoute()
const pay = usePaymentsStore()
const creating = ref(false)
const formError = ref<string | null>(null)
const formSuccess = ref(false)
const form = reactive({ tenantId: '', unitId: '', amount: 0, currency: 'GHS', payerName: '', payerPhone: '' })

// ── Tenant search state ──
const tenantQuery = ref('')
const tenantResults = ref<any[]>([])
const tenantSearching = ref(false)
const showTenantDrop = ref(false)
const selectedTenant = ref<any>(null)
let tenantTimer: ReturnType<typeof setTimeout> | null = null

// ── Unit search state ──
const unitQuery = ref('')
const unitResults = ref<any[]>([])
const unitSearching = ref(false)
const showUnitDrop = ref(false)
const selectedUnit = ref<any>(null)
// cache for hydrating payment list unit labels
const unitCache = ref<Record<string, any>>({})
let unitTimer: ReturnType<typeof setTimeout> | null = null

// ── helpers ──
function initials(name: string) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
}

function paymentUnitLabel(unitId: string) {
  const u = unitCache.value[unitId]
  return u ? `#${u.unitNumber}` : unitId.slice(-6)
}

// ── Tenant search ──
function onTenantFocus() {
  if (tenantQuery.value) showTenantDrop.value = true
}

function onTenantInput() {
  showTenantDrop.value = true
  if (tenantTimer) clearTimeout(tenantTimer)
  if (tenantQuery.value.trim().length < 2) { tenantResults.value = []; return }
  tenantTimer = setTimeout(() => searchTenants(), 300)
}

async function searchTenants() {
  tenantSearching.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const q = tenantQuery.value.trim()
    const res = await feathers.service('users').find({
      query: { $search: q, $limit: 8, $sort: { fullName: 1 } }
    })
    const list = Array.isArray(res) ? res : (res?.data ?? [])
    tenantResults.value = list
  } catch {
    tenantResults.value = []
  } finally {
    tenantSearching.value = false
  }
}

function selectTenant(t: any) {
  selectedTenant.value = t
  form.tenantId = String(t._id)
  if (!form.payerName && t.fullName) form.payerName = t.fullName
  showTenantDrop.value = false
  tenantQuery.value = ''
}

function clearTenant() {
  selectedTenant.value = null
  form.tenantId = ''
  tenantQuery.value = ''
  tenantResults.value = []
}

function scheduleCloseTenant() {
  setTimeout(() => { showTenantDrop.value = false }, 200)
}

// ── Unit search ──
function onUnitFocus() {
  if (unitQuery.value) showUnitDrop.value = true
}

function onUnitInput() {
  showUnitDrop.value = true
  if (unitTimer) clearTimeout(unitTimer)
  if (unitQuery.value.trim().length < 1) { unitResults.value = []; return }
  unitTimer = setTimeout(() => searchUnits(), 300)
}

async function searchUnits() {
  unitSearching.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const q = unitQuery.value.trim()
    const res = await feathers.service('units').find({
      query: { unitNumber: { $regex: q, $options: 'i' }, $limit: 10, $sort: { unitNumber: 1 } }
    })
    const list = Array.isArray(res) ? res : (res?.data ?? [])
    unitResults.value = list
    // cache results for payment list labels
    for (const u of list) unitCache.value[String(u._id)] = u
  } catch {
    unitResults.value = []
  } finally {
    unitSearching.value = false
  }
}

function selectUnit(u: any) {
  selectedUnit.value = u
  form.unitId = String(u._id)
  // auto-fill amount from unit rent if not already set
  if (!form.amount && u.rentAmount) {
    form.amount = u.rentAmount
    form.currency = u.rentCurrency || 'GHS'
  }
  unitCache.value[String(u._id)] = u
  showUnitDrop.value = false
  unitQuery.value = ''
}

function clearUnit() {
  selectedUnit.value = null
  form.unitId = ''
  unitQuery.value = ''
  unitResults.value = []
}

function scheduleCloseUnit() {
  setTimeout(() => { showUnitDrop.value = false }, 200)
}

// ── Stats ──
const successCount = computed(() => (pay.list as any[]).filter((r: any) => r.status === 'success').length)
const manualCount = computed(() => (pay.list as any[]).filter((r: any) => r.isManualEntry).length)
const totalAmount = computed(() => {
  const sum = (pay.list as any[]).filter((r: any) => r.currency === 'GHS').reduce((s: number, r: any) => s + (r.amount || 0), 0)
  return sum.toLocaleString()
})

function statusIcon(status: string) {
  return status === 'success' ? 'las la-check-circle' : status === 'failed' ? 'las la-times-circle' : 'las la-clock'
}
function statusIconClass(status: string) {
  if (status === 'success') return 'bg-emerald-50 text-emerald-600'
  if (status === 'failed') return 'bg-red-50 text-red-500'
  return 'bg-gray-100 text-gray-400'
}
function payStatusClass(status: string) {
  if (status === 'success') return 'bg-emerald-50 text-emerald-700'
  if (status === 'failed') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

async function reload() {
  await pay.fetchList({ $sort: { createdAt: -1 } })
}

async function onCreate() {
  formError.value = null; formSuccess.value = false; creating.value = true
  try {
    const payload: Record<string, any> = {
      tenantId: form.tenantId,
      unitId: form.unitId,
      amount: form.amount,
      currency: form.currency || 'GHS',
      ...(form.payerName.trim() ? { payerName: form.payerName.trim() } : {}),
      ...(form.payerPhone.trim() ? { payerPhone: form.payerPhone.trim() } : {})
    }
    if (auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin')) {
      const u = selectedUnit.value
      const pid = u?.propertyId
      if (!pid) throw new Error('Select a unit so we can resolve the landlord for this payment.')
      const feathers = useNuxtApp().$feathers as any
      const prop = await feathers.service('properties').get(String(pid))
      payload.landlordId = String((prop as any).landlordId || '')
      if (!payload.landlordId) throw new Error('Could not resolve landlord for this unit')
    }
    await pay.createManualPayment(payload)
    // reset form
    clearTenant(); clearUnit()
    Object.assign(form, { amount: 0, payerName: '', payerPhone: '', currency: 'GHS' })
    formSuccess.value = true
    setTimeout(() => { formSuccess.value = false }, 4000)
    await reload()
  } catch (e: any) {
    formError.value = e?.message || 'Failed to record payment'
  } finally {
    creating.value = false
  }
}

async function focusPaymentFromQuery() {
  const id = route.query.payment
  if (typeof id !== 'string' || !id) return
  await reload()
  scrollToDataTarget('payment-id', id)
}

onMounted(async () => {
  if (typeof route.query.payment === 'string' && route.query.payment) {
    await focusPaymentFromQuery()
  } else {
    await reload()
  }
})

watch(
  () => route.query.payment,
  async (q) => {
    if (typeof q !== 'string' || !q) return
    await focusPaymentFromQuery()
  }
)
</script>

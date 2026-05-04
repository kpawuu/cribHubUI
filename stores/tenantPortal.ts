import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

function wire(servicePath: string, list: Ref<any[]>, sub: Ref<boolean>) {
  if (import.meta.server || sub.value) return
  sub.value = true
  const feathers = useNuxtApp().$feathers as any
  const svc = feathers.service(servicePath)
  const upsert = (row: any) => {
    const id = String(row?._id || '')
    if (!id) return
    const i = list.value.findIndex((x) => String(x._id) === id)
    if (i >= 0) list.value[i] = row
    else list.value.unshift(row)
  }
  svc.on('created', upsert)
  svc.on('patched', upsert)
  svc.on('updated', upsert)
  svc.on('removed', (row: any) => {
    const id = String(row?._id || '')
    list.value = list.value.filter((x) => String(x._id) !== id)
  })
}

export const useTenantPortalStore = defineStore('tenantPortal', () => {
  // ─── State ───────────────────────────────────────────────────────────
  const unit = ref<any | null>(null)
  const property = ref<any | null>(null)
  const contracts = ref<any[]>([])
  const maintenanceRequests = ref<any[]>([])
  const payments = ref<any[]>([])

  const isLoadingUnit = ref(false)
  const isLoadingContracts = ref(false)
  const isLoadingMaintenance = ref(false)
  const isLoadingPayments = ref(false)

  const contractsSub = ref(false)
  const maintenanceSub = ref(false)

  const isLoading = computed(
    () => isLoadingUnit.value || isLoadingContracts.value || isLoadingMaintenance.value
  )

  // ─── Derived ─────────────────────────────────────────────────────────
  const activeContract = computed(() =>
    contracts.value.find((c) => c.status === 'active') ??
    contracts.value.find((c) => c.status === 'signed') ??
    null
  )

  const pendingSignatureContracts = computed(() =>
    contracts.value.filter(
      (c) => (c.status === 'draft' || c.status === 'sent') && !c.tenantSignedAt
    )
  )

  const expiringWithin60Days = computed(() => {
    const now = Date.now()
    return contracts.value.filter((c) => {
      if (c.status !== 'active') return false
      const end = new Date(c.endDate).getTime()
      const diff = (end - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 60
    })
  })

  const openMaintenanceCount = computed(
    () => maintenanceRequests.value.filter((r) => r.status !== 'completed').length
  )

  // ─── Fetch ────────────────────────────────────────────────────────────
  async function fetchUnit(userId: string) {
    isLoadingUnit.value = true
    unit.value = null
    property.value = null
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('units').find({
        query: { tenantId: userId, $limit: 1, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind(res)
      unit.value = norm.data[0] ?? null

      if (unit.value?.propertyId) {
        try {
          property.value = await feathers.service('properties').get(unit.value.propertyId)
        } catch {
          property.value = null
        }
      }
    } finally {
      isLoadingUnit.value = false
    }
  }

  async function fetchContracts() {
    isLoadingContracts.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('rental-contracts').find({
        query: { $sort: { createdAt: -1 }, $limit: 50 }
      })
      const norm = normalizeFeathersFind(res)
      contracts.value = norm.data
      wire('rental-contracts', contracts, contractsSub)
    } finally {
      isLoadingContracts.value = false
    }
  }

  async function fetchMaintenance() {
    isLoadingMaintenance.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('maintenance-requests').find({
        query: { $sort: { createdAt: -1 }, $limit: 100 }
      })
      const norm = normalizeFeathersFind(res)
      maintenanceRequests.value = norm.data
      wire('maintenance-requests', maintenanceRequests, maintenanceSub)
    } finally {
      isLoadingMaintenance.value = false
    }
  }

  async function fetchPayments() {
    if (!unit.value?._id) return
    isLoadingPayments.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('payments').find({
        query: { unitId: String(unit.value._id), $sort: { createdAt: -1 }, $limit: 50 }
      })
      const norm = normalizeFeathersFind(res)
      payments.value = norm.data
    } catch {
      payments.value = []
    } finally {
      isLoadingPayments.value = false
    }
  }

  async function fetchAll(userId: string) {
    await fetchUnit(userId)
    await Promise.all([fetchContracts(), fetchMaintenance(), fetchPayments()])
  }

  // ─── Actions ──────────────────────────────────────────────────────────
  async function signContract(contractId: string) {
    const feathers = useNuxtApp().$feathers as any
    const updated = await feathers.service('rental-contracts').patch(contractId, {
      tenantSignedAt: new Date().toISOString(),
      status: 'signed'
    })
    const i = contracts.value.findIndex((c) => String(c._id) === contractId)
    if (i >= 0) contracts.value[i] = updated
    return updated
  }

  async function renewContract(contractId: string, months: number) {
    const feathers = useNuxtApp().$feathers as any
    const renewal = await feathers.service('rental-contracts').patch(contractId, {
      action: 'renew',
      months
    })
    // The hook returns the new contract; add it to the list
    const exists = contracts.value.find((c) => String(c._id) === String(renewal._id))
    if (!exists) contracts.value.unshift(renewal)
    return renewal
  }

  async function submitMaintenance(data: {
    title: string
    description: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }) {
    if (!unit.value?._id) throw new Error('No active unit found.')
    const feathers = useNuxtApp().$feathers as any
    const created = await feathers.service('maintenance-requests').create({
      unitId: String(unit.value._id),
      ...data
    })
    const id = String(created?._id || '')
    if (id && !maintenanceRequests.value.find((x) => String(x._id) === id)) {
      maintenanceRequests.value.unshift(created)
    }
    return created
  }

  function $reset() {
    unit.value = null
    property.value = null
    contracts.value = []
    maintenanceRequests.value = []
    payments.value = []
    contractsSub.value = false
    maintenanceSub.value = false
  }

  return {
    unit,
    property,
    contracts,
    maintenanceRequests,
    payments,
    isLoading,
    isLoadingUnit,
    isLoadingContracts,
    isLoadingMaintenance,
    isLoadingPayments,
    activeContract,
    pendingSignatureContracts,
    expiringWithin60Days,
    openMaintenanceCount,
    fetchUnit,
    fetchContracts,
    fetchMaintenance,
    fetchPayments,
    fetchAll,
    signContract,
    renewContract,
    submitMaintenance,
    $reset
  }
})

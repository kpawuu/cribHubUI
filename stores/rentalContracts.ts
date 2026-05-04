import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

function wireListRealtime(servicePath: string, list: Ref<any[]>, isSubscribed: Ref<boolean>) {
  if (import.meta.server || isSubscribed.value) return
  isSubscribed.value = true
  const feathers = useNuxtApp().$feathers as any
  const svc = feathers.service(servicePath)
  const upsert = (row: any) => {
    const id = String(row?._id || '')
    if (!id) return
    const i = list.value.findIndex((x) => String(x._id) === id)
    if (i >= 0) list.value[i] = row
    else list.value.unshift(row)
  }
  const onRemoved = (row: any) => {
    const id = String(row?._id || '')
    list.value = list.value.filter((x) => String(x._id) !== id)
  }
  svc.on('created', upsert)
  svc.on('patched', upsert)
  svc.on('updated', upsert)
  svc.on('removed', onRemoved)
}

/**
 * Returns the number of whole months between startDate and endDate.
 * Used to compute the total rent payment for the full lease period.
 */
export function leasePeriodMonths(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 1
  try {
    const s = new Date(startDate)
    const e = new Date(endDate)
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
    return Math.max(1, months)
  } catch {
    return 1
  }
}

export const useRentalContractsStore = defineStore('rentalContracts', () => {
  const list = ref<any[]>([])
  const isLoading = ref(false)
  const isSubscribed = ref(false)

  function ensureRealtime() {
    wireListRealtime('rental-contracts', list, isSubscribed)
  }

  async function fetchList() {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('rental-contracts').find({
        query: { $sort: { createdAt: -1 }, $limit: 50 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function patchContract(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    const updated = await feathers.service('rental-contracts').patch(id, data)
    const i = list.value.findIndex((x) => String(x._id) === id)
    if (i >= 0) list.value[i] = updated
    return updated
  }

  async function signContract(id: string, role: 'landlord' | 'tenant') {
    const data: Record<string, any> = { status: 'signed' }
    if (role === 'landlord') data.landlordSignedAt = new Date().toISOString()
    else data.tenantSignedAt = new Date().toISOString()
    return patchContract(id, data)
  }

  async function initializePayment(contract: any, userEmail: string) {
    const months = leasePeriodMonths(contract.startDate, contract.endDate)
    const totalAmount = (contract.monthlyRent || 0) * months
    const feathers = useNuxtApp().$feathers as any
    const result = await feathers.service('payments').create({
      action: 'initialize',
      email: userEmail,
      amount: totalAmount,
      currency: contract.rentCurrency || 'GHS',
      unitId: contract.unitId,
      landlordId: contract.landlordId,
      callback_url: typeof window !== 'undefined' ? `${window.location.origin}/payments/callback` : undefined
    })
    return result as { authorization_url: string; reference: string; access_code: string }
  }

  return { list, isLoading, isSubscribed, fetchList, patchContract, signContract, initializePayment, ensureRealtime }
})

import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useRentalApplicationsStore = defineStore('rentalApplications', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)

  const hasMore = computed(() => list.value.length < total.value)

  function pageSize() {
    const n = Number(useRuntimeConfig().public.pageSize)
    return Number.isFinite(n) && n > 0 ? n : 12
  }

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = useNuxtApp().$feathers as any
    const svc = feathers.service('rental-applications')
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

  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    list.value = []
    const q = { ...query }
    delete q.$limit
    delete q.$skip
    limit.value = pageSize()
    lastQuery.value = { ...q, $sort: (q as any).$sort ?? { createdAt: -1 } }
    skip.value = 0
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('rental-applications').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function createApplication(data: { unitId: string; applicationData: Record<string, unknown>; documents?: string[] }) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('rental-applications').create(data)
  }

  async function updateApplication(id: string, patch: { status?: 'approved' | 'rejected' | 'pending'; reviewNotes?: string }) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('rental-applications').patch(id, patch)
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('rental-applications').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: skip.value }
      })
      const norm = normalizeFeathersFind(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      ensureRealtime()
    } finally {
      isLoadingMore.value = false
    }
  }

  return {
    list,
    total,
    skip,
    limit,
    lastQuery,
    hasMore,
    isLoading,
    isLoadingMore,
    fetchList,
    loadMore,
    createApplication,
    updateApplication
  }
})

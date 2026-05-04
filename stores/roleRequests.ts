import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useRoleRequestsStore = defineStore('roleRequests', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = useNuxtApp().$feathers as any
    const svc = feathers.service('role-requests')
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
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('role-requests').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('role-requests').create(data)
  }
  async function patch(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('role-requests').patch(id, data)
  }
  return { list, total, isLoading, fetchList, create, patch }
})

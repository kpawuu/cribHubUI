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

export const usePropertyManagersStore = defineStore('propertyManagers', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)

  const hasMore = computed(() => list.value.length < total.value)
  const pageSize = () => 18

  function ensureRealtime() {
    wireListRealtime('property-manager-profiles', list, isSubscribed)
  }

  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('property-manager-profiles').find({
        query: { $sort: { createdAt: -1 }, $limit: pageSize(), ...query }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore(query: Record<string, any> = {}) {
    if (isLoadingMore.value || !hasMore.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('property-manager-profiles').find({
        query: { $sort: { createdAt: -1 }, $skip: list.value.length, $limit: pageSize(), ...query }
      })
      const norm = normalizeFeathersFind(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
    } finally {
      isLoadingMore.value = false
    }
  }

  return { list, total, isLoading, isLoadingMore, isSubscribed, hasMore, fetchList, loadMore, ensureRealtime }
})

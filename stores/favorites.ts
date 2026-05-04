import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export type FavoriteRow = { _id: string; userId: string; propertyId: string; createdAt?: string }

export const useFavoritesStore = defineStore('favorites', () => {
  /** Paginated rows for /favorites */
  const list = ref<FavoriteRow[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)

  /** All favorited property IDs (for hearts across listings). */
  const favoritedPropertyIds = ref(new Set<string>())

  const hasMore = computed(() => list.value.length < total.value)

  function pageSize() {
    const n = Number(useRuntimeConfig().public.pageSize)
    return Number.isFinite(n) && n > 0 ? n : 12
  }

  function touchIdSet() {
    favoritedPropertyIds.value = new Set(favoritedPropertyIds.value)
  }

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = useNuxtApp().$feathers as any
    const svc = feathers.service('favorites')
    const upsert = (row: any) => {
      const id = String(row?._id || '')
      const pid = String(row?.propertyId || '')
      if (!id || !pid) return
      favoritedPropertyIds.value.add(pid)
      touchIdSet()
      const i = list.value.findIndex((x) => String(x._id) === id)
      if (i >= 0) list.value[i] = row
      else if (list.value.length < limit.value) list.value.unshift(row)
    }
    const onRemoved = (row: any) => {
      const id = String(row?._id || '')
      const pid = String(row?.propertyId || '')
      if (pid) {
        favoritedPropertyIds.value.delete(pid)
        touchIdSet()
      }
      list.value = list.value.filter((x) => String(x._id) !== id)
    }
    svc.on('created', upsert)
    svc.on('patched', upsert)
    svc.on('updated', upsert)
    svc.on('removed', onRemoved)
  }

  /** Load every favorited property id (for heart state). Paginates server-side. */
  async function syncFavoriteIds() {
    const feathers = useNuxtApp().$feathers as any
    const next = new Set<string>()
    const batch = 100
    let sk = 0
    let tot = Infinity
    while (sk < tot) {
      const res = await feathers.service('favorites').find({ query: { $limit: batch, $skip: sk } })
      const norm = normalizeFeathersFind<FavoriteRow>(res)
      tot = norm.total
      for (const r of norm.data) next.add(String(r.propertyId))
      sk += norm.data.length
      if (!norm.data.length) break
    }
    favoritedPropertyIds.value = next
    ensureRealtime()
  }

  /** First page of saved properties (favorites page). */
  async function fetchList() {
    isLoading.value = true
    list.value = []
    limit.value = pageSize()
    skip.value = 0
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('favorites').find({
        query: { $limit: limit.value, $skip: 0, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind<FavoriteRow>(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('favorites').find({
        query: { $limit: limit.value, $skip: skip.value, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind<FavoriteRow>(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      ensureRealtime()
    } finally {
      isLoadingMore.value = false
    }
  }

  function isFavorited(propertyId: string) {
    return favoritedPropertyIds.value.has(String(propertyId))
  }

  async function toggle(propertyId: string) {
    const feathers = useNuxtApp().$feathers as any
    const pid = String(propertyId)
    if (favoritedPropertyIds.value.has(pid)) {
      let row = list.value.find((x) => String(x.propertyId) === pid)
      if (!row) {
        const r = await feathers.service('favorites').find({ query: { propertyId: pid, $limit: 1 } })
        const norm = normalizeFeathersFind<FavoriteRow>(r)
        row = norm.data[0]
      }
      if (row?._id) await feathers.service('favorites').remove(row._id)
      favoritedPropertyIds.value.delete(pid)
      touchIdSet()
      list.value = list.value.filter((x) => String(x.propertyId) !== pid)
      total.value = Math.max(0, total.value - 1)
    } else {
      const created = (await feathers.service('favorites').create({ propertyId: pid })) as FavoriteRow
      favoritedPropertyIds.value.add(pid)
      touchIdSet()
      total.value += 1
      if (list.value.length < limit.value) list.value.unshift(created)
    }
  }

  /** @deprecated use syncFavoriteIds */
  async function fetchMine(_query: Record<string, any> = {}) {
    await syncFavoriteIds()
  }

  return {
    list,
    total,
    skip,
    limit,
    hasMore,
    isLoading,
    isLoadingMore,
    favoritedPropertyIds,
    syncFavoriteIds,
    fetchList,
    loadMore,
    isFavorited,
    toggle,
    fetchMine
  }
})

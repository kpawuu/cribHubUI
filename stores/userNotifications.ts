import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

let unreadRefreshTimer: ReturnType<typeof setTimeout> | null = null

function scheduleUnreadRefresh(fn: () => void) {
  if (import.meta.server) return
  if (unreadRefreshTimer) clearTimeout(unreadRefreshTimer)
  unreadRefreshTimer = setTimeout(() => {
    unreadRefreshTimer = null
    fn()
  }, 120)
}

export const useUserNotificationsStore = defineStore('userNotifications', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const unreadTotal = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({ $sort: { createdAt: -1 } })
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)

  const hasMore = computed(() => list.value.length < total.value)

  function pageSize() {
    const n = Number(useRuntimeConfig().public.pageSize)
    return Number.isFinite(n) && n > 0 ? n : 12
  }

  async function fetchUnreadCount() {
    if (import.meta.server) return
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('user-notifications').find({
        query: { unreadOnly: true, $limit: 1, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind(res)
      unreadTotal.value = typeof norm.total === 'number' ? norm.total : norm.data?.length ?? 0
    } catch {
      /* ignore */
    }
  }

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = useNuxtApp().$feathers as any
    const svc = feathers.service('user-notifications')
    const upsert = (row: any) => {
      const id = String(row?._id || '')
      if (!id) return
      const i = list.value.findIndex((x) => String(x._id) === id)
      if (i >= 0) list.value[i] = row
      else list.value.unshift(row)
      scheduleUnreadRefresh(() => {
        void fetchUnreadCount()
      })
    }
    const onRemoved = (row: any) => {
      const id = String(row?._id || '')
      list.value = list.value.filter((x) => String(x._id) !== id)
      scheduleUnreadRefresh(() => {
        void fetchUnreadCount()
      })
    }
    svc.on('created', upsert)
    svc.on('patched', upsert)
    svc.on('updated', upsert)
    svc.on('removed', onRemoved)
  }

  async function fetchRecent(n = 30) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('user-notifications').find({
        query: { $limit: n, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      ensureRealtime()
      await fetchUnreadCount()
    } finally {
      isLoading.value = false
    }
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
      const res = await feathers.service('user-notifications').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      ensureRealtime()
      await fetchUnreadCount()
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('user-notifications').find({
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

  async function markAsRead(id: string) {
    const feathers = useNuxtApp().$feathers as any
    const patched = await feathers.service('user-notifications').patch(id, {})
    const sid = String(patched?._id || id)
    const i = list.value.findIndex((x) => String(x._id) === sid)
    if (i >= 0) list.value[i] = patched
    await fetchUnreadCount()
  }

  async function markAsUnread(id: string) {
    const feathers = useNuxtApp().$feathers as any
    const patched = await feathers.service('user-notifications').patch(id, { readAt: null })
    const sid = String(patched?._id || id)
    const i = list.value.findIndex((x) => String(x._id) === sid)
    if (i >= 0) list.value[i] = patched
    await fetchUnreadCount()
  }

  async function markAllRead() {
    const feathers = useNuxtApp().$feathers as any
    const batch = 80
    for (;;) {
      const res = await feathers.service('user-notifications').find({
        query: { unreadOnly: true, $limit: batch, $sort: { createdAt: -1 } }
      })
      const norm = normalizeFeathersFind(res)
      if (!norm.data.length) break
      await Promise.all(norm.data.map((row: any) => feathers.service('user-notifications').patch(String(row._id), {})))
      if (norm.data.length < batch) break
    }
    await fetchUnreadCount()
    const refresh = { ...lastQuery.value }
    delete (refresh as any).$limit
    delete (refresh as any).$skip
    await fetchList(refresh)
  }

  return {
    list,
    total,
    unreadTotal,
    skip,
    limit,
    lastQuery,
    hasMore,
    isLoading,
    isLoadingMore,
    fetchRecent,
    fetchList,
    loadMore,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllRead
  }
})

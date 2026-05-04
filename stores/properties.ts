import { defineStore } from 'pinia'
import { getFeathersClient } from '../utils/feathersClient'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

/** Resolved on GET when `include=agent` and an assignment + profile exist. */
export type PropertyAgent = {
  name: string
  agency?: string
  avatarUrl?: string
  listingsCount?: number
  responseTimeMinutes?: number
}

export type Property = {
  _id: string
  name: string
  address: string
  city: string
  state?: string
  country: string
  geo?: { lat: number; lng: number }
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  price?: number
  priceCurrency?: string
  pricePeriod?: string
  coverImageUrl?: string
  photosCount?: number
  verified?: boolean
  images?: string[]
  description?: string
  amenities?: string[]
  /** Display hint for size (e.g. from resolver); optional */
  sizeLabel?: string
  units?: unknown[]
  /** Denormalised from the first active agent-assignment. Present on create/patch by the API. */
  agentUserId?: string | null
  /** Populated when `include=agent` is requested and an agent profile exists. */
  agent?: PropertyAgent
}

export const usePropertiesStore = defineStore('properties', () => {
  const list = ref<Property[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const selected = ref<Property | null>(null)
  const isSubscribed = ref(false)

  const hasMore = computed(() => list.value.length < total.value)

  function pageSize() {
    const n = Number(useRuntimeConfig().public.pageSize)
    return Number.isFinite(n) && n > 0 ? n : 12
  }

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    const feathers = getFeathersClient()
    if (!feathers) return
    isSubscribed.value = true
    const svc = feathers.service('properties')
    const upsert = (p: any) => {
      const id = String(p?._id || '')
      if (!id) return
      const idx = list.value.findIndex((x) => String(x._id) === id)
      if (idx >= 0) list.value[idx] = { ...(list.value[idx] as any), ...(p as any) }
      else if (list.value.length < limit.value * 3) list.value.unshift(p)
      if (selected.value && String(selected.value._id) === id) selected.value = { ...(selected.value as any), ...(p as any) }
    }
    const onRemoved = (p: any) => {
      const id = String(p?._id || '')
      list.value = list.value.filter((x) => String(x._id) !== id)
      if (selected.value && String(selected.value._id) === id) selected.value = null
    }
    svc.on('created', upsert)
    svc.on('patched', upsert)
    svc.on('updated', upsert)
    svc.on('removed', onRemoved)
  }

  /** First page or replace list (resets pagination). */
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    list.value = []
    const q = { ...query }
    const explicit = q.$limit
    delete q.$limit
    limit.value = typeof explicit === 'number' && explicit > 0 ? explicit : pageSize()
    lastQuery.value = { ...q }
    skip.value = 0
    try {
      const feathers = getFeathersClient()
      if (!feathers) return
      const res = (await feathers.service('properties').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })) as unknown
      const norm = normalizeFeathersFind<Property>(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.skip + norm.data.length
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = getFeathersClient()
      if (!feathers) return
      const res = (await feathers.service('properties').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: skip.value }
      })) as unknown
      const norm = normalizeFeathersFind<Property>(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      ensureRealtime()
    } finally {
      isLoadingMore.value = false
    }
  }

  async function fetchById(id: string, include: string[] = ['units', 'agent']) {
    isLoading.value = true
    try {
      const feathers = getFeathersClient()
      if (!feathers) return
      const res = (await feathers.service('properties').get(id, {
        query: include.length ? { include: include.join(',') } : {}
      })) as Property
      selected.value = res
      ensureRealtime()
      return res
    } finally {
      isLoading.value = false
    }
  }

  /** Back-compat alias used by older pages. */
  function subscribeRealtime() {
    ensureRealtime()
  }

  async function createProperty(data: Record<string, unknown>) {
    const feathers = getFeathersClient()
    if (!feathers) throw new Error('Connection not ready')
    const created = await feathers.service('properties').create(data)
    return created
  }

  async function patchProperty(id: string, data: Record<string, unknown>) {
    const feathers = getFeathersClient()
    if (!feathers) throw new Error('Connection not ready')
    return await feathers.service('properties').patch(id, data)
  }

  async function removeProperty(id: string) {
    const feathers = getFeathersClient()
    if (!feathers) throw new Error('Connection not ready')
    await feathers.service('properties').remove(id)
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
    selected,
    fetchList,
    loadMore,
    fetchById,
    subscribeRealtime,
    createProperty,
    patchProperty,
    removeProperty
  }
})

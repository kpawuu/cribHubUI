import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useUnitsStore = defineStore('units', () => {
  const vacantList = ref<any[]>([])
  const isLoading = ref(false)
  const selected = ref<any | null>(null)
  /** Per-property cache populated by `fetchForProperty` — kept in sync by realtime listeners. */
  const byProperty = ref<Record<string, any[]>>({})
  const isSubscribed = ref(false)

  /**
   * Wire Socket.IO listeners ONCE per store instance. Updates `vacantList` (only
   * vacant rows), `selected`, and any cached `byProperty[propertyId]` lists.
   */
  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = (useNuxtApp() as any).$feathers
    if (!feathers) return
    const svc = feathers.service('units')

    const upsertIn = (list: any[], row: any) => {
      const id = String(row?._id || '')
      if (!id) return list
      const i = list.findIndex((x) => String(x._id) === id)
      if (i >= 0) {
        const next = list.slice()
        next[i] = row
        return next
      }
      return [row, ...list]
    }
    const removeFrom = (list: any[], id: string) => list.filter((x) => String(x._id) !== id)
    const inVacantQuery = (row: any) => String(row?.status || '') === 'vacant'

    const onUpsert = (row: any) => {
      const id = String(row?._id || '')
      const pid = String(row?.propertyId || '')

      vacantList.value = inVacantQuery(row)
        ? upsertIn(vacantList.value, row)
        : removeFrom(vacantList.value, id)

      if (pid && byProperty.value[pid]) {
        byProperty.value = { ...byProperty.value, [pid]: upsertIn(byProperty.value[pid], row) }
      }
      if (selected.value && String(selected.value._id) === id) selected.value = row
    }
    const onRemoved = (row: any) => {
      const id = String(row?._id || '')
      const pid = String(row?.propertyId || '')
      vacantList.value = removeFrom(vacantList.value, id)
      if (pid && byProperty.value[pid]) {
        byProperty.value = { ...byProperty.value, [pid]: removeFrom(byProperty.value[pid], id) }
      }
      if (selected.value && String(selected.value._id) === id) selected.value = null
    }

    svc.on('created', onUpsert)
    svc.on('patched', onUpsert)
    svc.on('updated', onUpsert)
    svc.on('removed', onRemoved)
  }

  async function fetchVacant(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      if (!feathers) return
      const res = await feathers.service('units').find({
        query: {
          status: 'vacant',
          $sort: { createdAt: -1 },
          $limit: 60,
          ...query
        }
      })
      const norm = normalizeFeathersFind(res)
      vacantList.value = norm.data
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) return null
    const u = await feathers.service('units').get(id)
    selected.value = u
    ensureRealtime()
    return u
  }

  async function fetchForProperty(propertyId: string) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) return []
    const res = await feathers.service('units').find({
      query: { propertyId, $limit: 200, $sort: { createdAt: -1 } }
    })
    const norm = normalizeFeathersFind(res)
    byProperty.value = { ...byProperty.value, [propertyId]: norm.data }
    ensureRealtime()
    return norm.data
  }

  async function createUnit(data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) throw new Error('Connection not ready')
    return await feathers.service('units').create(data)
  }

  async function patchUnit(id: string, data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) throw new Error('Connection not ready')
    return await feathers.service('units').patch(id, data)
  }

  async function removeUnit(id: string) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) throw new Error('Connection not ready')
    await feathers.service('units').remove(id)
  }

  return { vacantList, byProperty, isLoading, selected, fetchVacant, fetchById, fetchForProperty, createUnit, patchUnit, removeUnit }
})

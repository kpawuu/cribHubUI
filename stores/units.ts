import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useUnitsStore = defineStore('units', () => {
  const vacantList = ref<any[]>([])
  const isLoading = ref(false)
  const selected = ref<any | null>(null)

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
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) return null
    const u = await feathers.service('units').get(id)
    selected.value = u
    return u
  }

  async function fetchForProperty(propertyId: string) {
    const feathers = useNuxtApp().$feathers as any
    if (!feathers) return []
    const res = await feathers.service('units').find({
      query: { propertyId, $limit: 200, $sort: { createdAt: -1 } }
    })
    const norm = normalizeFeathersFind(res)
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

  return { vacantList, isLoading, selected, fetchVacant, fetchById, fetchForProperty, createUnit, patchUnit, removeUnit }
})

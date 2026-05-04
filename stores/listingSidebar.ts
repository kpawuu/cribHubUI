import { defineStore } from 'pinia'
import { getFeathersClient } from '../utils/feathersClient'

export type ListingSidebarLink = {
  label: string
  query: Record<string, string>
}

export const useListingSidebarStore = defineStore('listingSidebar', () => {
  const popularSearches = ref<ListingSidebarLink[]>([])
  const nearbyAreas = ref<ListingSidebarLink[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSidebar() {
    const feathers = getFeathersClient()
    if (!feathers) return
    isLoading.value = true
    error.value = null
    try {
      const raw = await feathers.service('listing-sidebar').find({ query: {}, paginate: false } as any)
      const r = raw as Record<string, unknown> | unknown[]
      const data =
        Array.isArray(r) ? (r[0] as Record<string, unknown>) : Array.isArray((r as any)?.data) ? (r as any).data[0] : (r as Record<string, unknown>)
      const res = (data && typeof data === 'object' ? data : {}) as {
        popularSearches?: ListingSidebarLink[]
        nearbyAreas?: ListingSidebarLink[]
      }
      popularSearches.value = Array.isArray(res.popularSearches) ? res.popularSearches : []
      nearbyAreas.value = Array.isArray(res.nearbyAreas) ? res.nearbyAreas : []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load sidebar'
      popularSearches.value = []
      nearbyAreas.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    popularSearches,
    nearbyAreas,
    isLoading,
    error,
    fetchSidebar
  }
})

import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<Record<string, unknown> | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSummary() {
    isLoading.value = true
    error.value = null
    try {
      const feathers = useNuxtApp().$feathers as any
      const rows = await feathers.service('dashboard').find({ query: {}, paginate: false } as any)
      const r: any = rows
      const data = Array.isArray(r) ? r[0] : Array.isArray(r?.data) ? r.data[0] : r
      summary.value = (data && typeof data === 'object' ? data : null) as Record<string, unknown> | null
    } catch (e: any) {
      error.value = e?.message || 'Failed to load dashboard'
      summary.value = null
    } finally {
      isLoading.value = false
    }
  }

  return { summary, isLoading, error, fetchSummary }
})

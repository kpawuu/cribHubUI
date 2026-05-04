import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useExchangeRatesStore = defineStore('exchangeRates', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)

  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = useNuxtApp().$feathers as any
    const svc = feathers.service('exchange-rates')
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
      const res = await feathers.service('exchange-rates').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  return { list, total, isLoading, fetchList }
})

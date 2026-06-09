import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useLegalDocumentsStore = defineStore('legalDocuments', () => {
  const list = ref<any[]>([])
  const isLoading = ref(false)
  const isSubscribed = ref(false)

  /** Wire CRUD listeners ONCE. Safe to call from every fetch path. */
  function ensureRealtime() {
    if (import.meta.server || isSubscribed.value) return
    isSubscribed.value = true
    const feathers = (useNuxtApp() as any).$feathers
    if (!feathers) return
    const svc = feathers.service('legal-documents')
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

  async function fetchList() {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('legal-documents').find({
        query: { $sort: { createdAt: -1 }, $limit: 50 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      ensureRealtime()
    } finally {
      isLoading.value = false
    }
  }

  async function createDoc(payload: {
    title: string
    documentType: string
    jurisdiction?: string
    content: string
    metadata?: Record<string, unknown>
  }) {
    const feathers = useNuxtApp().$feathers as any
    const row = await feathers.service('legal-documents').create(payload)
    await fetchList()
    return row
  }

  async function patchDoc(id: string, payload: Partial<{ title: string; documentType: string; jurisdiction: string; content: string; status: 'draft' | 'final' }>) {
    const feathers = useNuxtApp().$feathers as any
    const row = await feathers.service('legal-documents').patch(id, payload)
    const idx = list.value.findIndex((d) => String(d._id) === id)
    if (idx >= 0) list.value[idx] = row
    else await fetchList()
    return row
  }

  async function removeDoc(id: string) {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('legal-documents').remove(id)
    list.value = list.value.filter((d) => String(d._id) !== id)
  }

  return { list, isLoading, fetchList, createDoc, patchDoc, removeDoc }
})

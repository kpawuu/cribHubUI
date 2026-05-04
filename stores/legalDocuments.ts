import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

export const useLegalDocumentsStore = defineStore('legalDocuments', () => {
  const list = ref<any[]>([])
  const isLoading = ref(false)

  async function fetchList() {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('legal-documents').find({
        query: { $sort: { createdAt: -1 }, $limit: 50 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
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

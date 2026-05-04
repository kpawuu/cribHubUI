import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

function wire(servicePath: string, list: Ref<any[]>, flag: Ref<boolean>) {
  if (import.meta.server || flag.value) return
  flag.value = true
  const feathers = useNuxtApp().$feathers as any
  const svc = feathers.service(servicePath)
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

export const useLegalDocumentsStore = defineStore('legalDocuments', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const rt = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('legal-documents').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wire('legal-documents', list, rt)
    } finally {
      isLoading.value = false
    }
  }
  return { list, total, isLoading, fetchList }
})

export const useVirtualViewingRequestsStore = defineStore('virtualViewingRequests', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const rt = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('virtual-viewing-requests').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wire('virtual-viewing-requests', list, rt)
    } finally {
      isLoading.value = false
    }
  }
  return { list, total, isLoading, fetchList }
})

export const useVerificationDocumentsStore = defineStore('verificationDocuments', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const rt = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('verification-documents').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wire('verification-documents', list, rt)
    } finally {
      isLoading.value = false
    }
  }
  return { list, total, isLoading, fetchList }
})

export const useFilesStore = defineStore('files', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const rt = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('files').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wire('files', list, rt)
    } finally {
      isLoading.value = false
    }
  }
  return { list, total, isLoading, fetchList }
})

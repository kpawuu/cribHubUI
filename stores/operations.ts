import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

function wireListRealtime(servicePath: string, list: Ref<any[]>, isSubscribed: Ref<boolean>) {
  if (import.meta.server || isSubscribed.value) return
  isSubscribed.value = true
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

function pageSize() {
  const n = Number(useRuntimeConfig().public.pageSize)
  return Number.isFinite(n) && n > 0 ? n : 12
}

export const useMaintenanceRequestsStore = defineStore('maintenanceRequests', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)
  const hasMore = computed(() => list.value.length < total.value)

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
      const res = await feathers.service('maintenance-requests').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      wireListRealtime('maintenance-requests', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('maintenance-requests').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: skip.value }
      })
      const norm = normalizeFeathersFind(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      wireListRealtime('maintenance-requests', list, isSubscribed)
    } finally {
      isLoadingMore.value = false
    }
  }

  async function patchRequest(id: string, data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('maintenance-requests').patch(id, data)
  }

  async function createRequest(data: {
    unitId: string
    title: string
    description: string
    category: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    images?: string[]
  }) {
    const feathers = useNuxtApp().$feathers as any
    const created = await feathers.service('maintenance-requests').create(data)
    // Optimistic prepend — realtime listener will dedupe
    const id = String(created?._id || '')
    if (id && !list.value.find((x) => String(x._id) === id)) {
      list.value.unshift(created)
      total.value += 1
    }
    return created
  }

  return { list, total, skip, limit, lastQuery, hasMore, isLoading, isLoadingMore, fetchList, loadMore, patchRequest, createRequest }
})

export const useInquiriesStore = defineStore('inquiries', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)
  const hasMore = computed(() => list.value.length < total.value)

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
      const res = await feathers.service('inquiries').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      wireListRealtime('inquiries', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('inquiries').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: skip.value }
      })
      const norm = normalizeFeathersFind(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      wireListRealtime('inquiries', list, isSubscribed)
    } finally {
      isLoadingMore.value = false
    }
  }

  async function create(payload: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('inquiries').create(payload)
  }
  async function patch(id: string, data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('inquiries').patch(id, data)
  }
  return { list, total, skip, limit, lastQuery, hasMore, isLoading, isLoadingMore, fetchList, loadMore, create, patch }
})

export const useCommunicationsStore = defineStore('communications', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const skip = ref(0)
  const limit = ref(12)
  const lastQuery = ref<Record<string, unknown>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubscribed = ref(false)
  const hasMore = computed(() => list.value.length < total.value)

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
      const res = await feathers.service('communications').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: 0 }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      skip.value = norm.data.length
      wireListRealtime('communications', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value || isLoading.value) return
    isLoadingMore.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('communications').find({
        query: { ...lastQuery.value, $limit: limit.value, $skip: skip.value }
      })
      const norm = normalizeFeathersFind(res)
      list.value = [...list.value, ...norm.data]
      total.value = norm.total
      skip.value = skip.value + norm.data.length
      wireListRealtime('communications', list, isSubscribed)
    } finally {
      isLoadingMore.value = false
    }
  }

  async function createEntry(data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('communications').create(data)
  }

  return { list, total, skip, limit, lastQuery, hasMore, isLoading, isLoadingMore, fetchList, loadMore, createEntry }
})

export const useNoticesStore = defineStore('notices', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('notices').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('notices', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function createNotice(data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('notices').create(data)
  }

  return { list, total, isLoading, fetchList, createNotice }
})

export const usePaymentsStore = defineStore('payments', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('payments').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('payments', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function createManualPayment(data: Record<string, unknown>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('payments').create(data)
  }

  return { list, total, isLoading, fetchList, createManualPayment }
})

export const useRentalContractsStore = defineStore('rentalContracts', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('rental-contracts').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('rental-contracts', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  return { list, total, isLoading, fetchList }
})

export const useAgentProfilesStore = defineStore('agentProfiles', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('agent-profiles').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('agent-profiles', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function get(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-profiles').get(id)
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-profiles').create(data)
  }
  async function patch(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-profiles').patch(id, data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-profiles').remove(id)
  }
  return { list, total, isLoading, fetchList, get, create, patch, remove }
})

export const useAgentAssignmentsStore = defineStore('agentAssignments', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('agent-assignments').find({ query: { $limit: 100, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('agent-assignments', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-assignments').create(data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-assignments').remove(id)
  }
  return { list, total, isLoading, fetchList, create, remove }
})

export const useAgentListingRequestsStore = defineStore('agentListingRequests', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('agent-listing-requests').find({ query: { $limit: 100, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('agent-listing-requests', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-listing-requests').create(data)
  }
  async function patch(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-listing-requests').patch(id, data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('agent-listing-requests').remove(id)
  }
  return { list, total, isLoading, fetchList, create, patch, remove }
})

export const usePropertyManagerAssignmentsStore = defineStore('propertyManagerAssignments', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('property-manager-assignments').find({ query: { $limit: 100, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('property-manager-assignments', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-assignments').create(data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-assignments').remove(id)
  }
  return { list, total, isLoading, fetchList, create, remove }
})

/**
 * usePropertyManagerProfilesStore — public directory of property-manager profiles,
 * plus CRUD for the signed-in PM.
 */
export const usePropertyManagerProfilesStore = defineStore('propertyManagerProfiles', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('property-manager-profiles').find({ query: { $limit: 50, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('property-manager-profiles', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function get(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-profiles').get(id)
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-profiles').create(data)
  }
  async function patch(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-profiles').patch(id, data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-profiles').remove(id)
  }
  return { list, total, isLoading, fetchList, get, create, patch, remove }
})

/** Direct landlord ↔ agent/PM (or legacy landlord-tenant) message threads. */
export const useThreadsStore = defineStore('threads', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('threads').find({
        query: { $sort: { lastMessageAt: -1, createdAt: -1 }, $limit: 50, ...query }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('threads', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function get(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('threads').get(id)
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('threads').create(data)
  }
  return { list, total, isLoading, fetchList, get, create }
})

/** Tracks both agent + PM payouts (toggle by `kind`). */
export const usePayoutsStore = defineStore('payouts', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  const kind = ref<'agent' | 'pm'>('agent')
  function svcPath() {
    return kind.value === 'agent' ? 'agent-payouts' : 'pm-payouts'
  }
  async function fetchList(k: 'agent' | 'pm', query: Record<string, any> = {}) {
    kind.value = k
    isSubscribed.value = false
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service(svcPath()).find({
        query: { $sort: { createdAt: -1 }, $limit: 100, ...query }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime(svcPath(), list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service(svcPath()).create(data)
  }
  async function markPaid(id: string, note?: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service(svcPath()).patch(id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      ...(note ? { paidNote: note } : {})
    })
  }
  async function cancel(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service(svcPath()).patch(id, { status: 'cancelled' })
  }
  return { list, total, isLoading, kind, fetchList, create, markPaid, cancel }
})

export const usePropertyManagerListingRequestsStore = defineStore('propertyManagerListingRequests', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)
  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('property-manager-listing-requests').find({ query: { $limit: 100, ...query } })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      wireListRealtime('property-manager-listing-requests', list, isSubscribed)
    } finally {
      isLoading.value = false
    }
  }
  async function create(data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-listing-requests').create(data)
  }
  async function patch(id: string, data: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-listing-requests').patch(id, data)
  }
  async function remove(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('property-manager-listing-requests').remove(id)
  }
  return { list, total, isLoading, fetchList, create, patch, remove }
})

/**
 * useChatMessagesStore — fetches and maintains messages for ONE active thread.
 * Supports both modern `threadId` and legacy `inquiryId` references.
 */
export const useChatMessagesStore = defineStore('chatMessages', () => {
  const messages = ref<any[]>([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const activeThreadId = ref<string | null>(null)
  const activeInquiryId = ref<string | null>(null)

  let _svc: any = null
  let _onCreate: ((row: any) => void) | null = null
  let _onUpsert: ((row: any) => void) | null = null
  let _onRemove: ((row: any) => void) | null = null

  function _teardown() {
    if (_svc) {
      try {
        if (_onCreate) _svc.off('created', _onCreate)
        if (_onUpsert) {
          _svc.off('patched', _onUpsert)
          _svc.off('updated', _onUpsert)
        }
        if (_onRemove) _svc.off('removed', _onRemove)
      } catch {}
    }
    _svc = null
    _onCreate = null
    _onUpsert = null
    _onRemove = null
  }

  async function open(opts: { threadId?: string; inquiryId?: string }) {
    const tid = opts.threadId ? String(opts.threadId) : null
    const iid = opts.inquiryId ? String(opts.inquiryId) : null
    if (!tid && !iid) return
    if ((tid && activeThreadId.value === tid) || (iid && activeInquiryId.value === iid && !tid)) return
    _teardown()
    activeThreadId.value = tid
    activeInquiryId.value = iid
    messages.value = []
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const query: Record<string, any> = { $sort: { createdAt: 1 }, $limit: 200 }
      if (tid) query.threadId = tid
      else if (iid) query.inquiryId = iid
      const res = await feathers.service('chat-messages').find({ query })
      const norm = normalizeFeathersFind(res)
      messages.value = norm.data

      _svc = feathers.service('chat-messages')
      const matches = (row: any) => {
        const matchesThread = tid && String(row?.threadId) === tid
        const matchesInquiry = iid && String(row?.inquiryId) === iid
        return Boolean(matchesThread || matchesInquiry)
      }
      _onCreate = (row: any) => {
        if (!matches(row)) return
        const rowId = String(row?._id || '')
        const exists = messages.value.some((m) => String(m._id) === rowId)
        if (!exists) messages.value.push(row)
      }
      // Read receipts, edits, and any future "soft delete via patch" all arrive
      // here. We upsert in place so the message bubble updates without scroll jump.
      _onUpsert = (row: any) => {
        if (!matches(row)) return
        const rowId = String(row?._id || '')
        const i = messages.value.findIndex((m) => String(m._id) === rowId)
        if (i >= 0) messages.value[i] = row
        else messages.value.push(row)
      }
      _onRemove = (row: any) => {
        const rowId = String(row?._id || '')
        if (!rowId) return
        messages.value = messages.value.filter((m) => String(m._id) !== rowId)
      }
      _svc.on('created', _onCreate)
      _svc.on('patched', _onUpsert)
      _svc.on('updated', _onUpsert)
      _svc.on('removed', _onRemove)
    } finally {
      isLoading.value = false
    }
  }

  /** Backward-compat alias used by `pages/messages.vue`. */
  async function openThread(inquiryId: string) {
    await open({ inquiryId })
  }

  function close() {
    _teardown()
    activeThreadId.value = null
    activeInquiryId.value = null
    messages.value = []
  }

  async function sendMessage(body: string) {
    if (!body.trim()) return
    if (!activeThreadId.value && !activeInquiryId.value) return
    isSending.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const payload: Record<string, any> = { body: body.trim() }
      if (activeThreadId.value) payload.threadId = activeThreadId.value
      else if (activeInquiryId.value) payload.inquiryId = activeInquiryId.value
      await feathers.service('chat-messages').create(payload)
    } finally {
      isSending.value = false
    }
  }

  return {
    messages,
    isLoading,
    isSending,
    activeThreadId,
    activeInquiryId,
    open,
    openThread,
    closeThread: close,
    close,
    sendMessage
  }
})

<template>
  <div class="mx-auto max-w-4xl">

    <!-- Header -->
    <div class="mb-5 flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 mb-0.5">Document center</p>
        <h1 class="text-xl font-bold text-gray-900">Legal documents</h1>
        <p class="mt-0.5 text-sm text-gray-500">Create, manage and export legal drafts for your properties</p>
      </div>
      <button
        type="button"
        class="shrink-0 inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <i :class="showForm ? 'las la-times' : 'las la-plus'" class="text-primary-600 text-sm"></i>
        {{ showForm ? 'Cancel' : 'New document' }}
      </button>
    </div>

    <!-- Stats row -->
    <div class="mb-5 grid grid-cols-4 gap-2">
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-gray-900 tabular-nums">{{ store.list.length }}</p>
        <p class="text-[11px] text-gray-500">Total</p>
      </div>
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-amber-600 tabular-nums">{{ countByStatus('draft') }}</p>
        <p class="text-[11px] text-gray-500">Drafts</p>
      </div>
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ countByStatus('final') }}</p>
        <p class="text-[11px] text-gray-500">Final</p>
      </div>
      <div class="compact-card bg-white rounded border border-gray-200 p-3 text-center">
        <p class="text-lg font-bold text-primary-600 tabular-nums">{{ uniqueJurisdictions }}</p>
        <p class="text-[11px] text-gray-500">Jurisdictions</p>
      </div>
    </div>

    <!-- Create / Edit form -->
    <Transition name="slide-down">
      <div v-if="showForm" class="mb-5 compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-file-alt text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">{{ editingId ? 'Edit document' : 'New document' }}</span>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="onSubmit">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Title <span class="text-red-500">*</span></label>
              <input
                v-model="form.title"
                required
                type="text"
                placeholder="e.g. Residential Tenancy Agreement"
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Document type <span class="text-red-500">*</span></label>
              <select
                v-model="form.documentType"
                required
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
              >
                <option value="tenancy_agreement">Tenancy Agreement</option>
                <option value="tenancy_addendum">Tenancy Addendum</option>
                <option value="notice_to_vacate">Notice to Vacate</option>
                <option value="lease_renewal">Lease Renewal</option>
                <option value="sublease_agreement">Sublease Agreement</option>
                <option value="property_inspection">Property Inspection Report</option>
                <option value="rent_receipt">Rent Receipt</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Jurisdiction</label>
              <input
                v-model="form.jurisdiction"
                type="text"
                placeholder="Ghana"
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
              />
            </div>
            <div v-if="editingId">
              <label class="mb-1 block text-xs font-semibold text-gray-700">Status</label>
              <select
                v-model="form.status"
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
              >
                <option value="draft">Draft</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Content <span class="text-red-500">*</span></label>
            <textarea
              v-model="form.content"
              required
              rows="8"
              placeholder="Enter the full document content here…"
              class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white font-mono"
            />
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-3">
              <p v-if="err" class="flex items-center gap-1 text-xs text-red-600"><i class="las la-exclamation-circle"></i>{{ err }}</p>
              <p v-if="ok" class="flex items-center gap-1 text-xs text-emerald-600"><i class="las la-check-circle"></i>Saved successfully.</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50" @click="cancelEdit">
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="pending"
              >
                <i v-if="pending" class="las la-spinner animate-spin"></i>
                {{ pending ? 'Saving…' : (editingId ? 'Update' : 'Save draft') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Filter bar -->
    <div class="mb-4 flex items-center gap-2">
      <div class="flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium w-fit">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          class="rounded px-3 py-1.5 transition"
          :class="filterStatus === tab.key ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="filterStatus = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="relative ml-auto">
        <i class="las la-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search documents…"
          class="rounded border border-gray-200 bg-white pl-7 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 w-44"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="space-y-2">
      <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.list.length" class="compact-card bg-white rounded border border-gray-200 p-12 text-center">
      <i class="las la-folder-open block mb-2 text-4xl text-gray-200"></i>
      <p class="text-sm font-semibold text-gray-900">No documents yet</p>
      <p class="mt-1 text-xs text-gray-500">Create your first legal document to get started.</p>
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
        @click="showForm = true"
      >
        <i class="las la-plus"></i> New document
      </button>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredDocs.length === 0" class="compact-card bg-white rounded border border-gray-200 p-8 text-center">
      <i class="las la-search block mb-2 text-3xl text-gray-200"></i>
      <p class="text-sm text-gray-500">No documents match your filter.</p>
    </div>

    <!-- Document list -->
    <div v-else class="space-y-2">
      <div
        v-for="d in filteredDocs"
        :key="d._id"
        class="compact-card bg-white rounded border border-gray-200 overflow-hidden transition hover:shadow-sm"
      >
        <div class="flex items-start gap-3 px-4 py-3">
          <!-- Icon -->
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary-50 text-primary-600 mt-0.5">
            <i :class="docIcon(d.documentType)" class="text-sm"></i>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-2 flex-wrap">
              <p class="text-sm font-semibold text-gray-900 leading-tight">{{ d.title }}</p>
              <span
                :class="[
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  d.status === 'final' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                ]"
              >
                {{ d.status || 'draft' }}
              </span>
            </div>
            <div class="mt-0.5 flex items-center gap-3 flex-wrap">
              <span class="text-xs text-gray-500">{{ formatDocType(d.documentType) }}</span>
              <span v-if="d.jurisdiction" class="flex items-center gap-0.5 text-xs text-gray-400">
                <i class="las la-map-marker text-[10px]"></i>{{ d.jurisdiction }}
              </span>
              <span class="text-[11px] text-gray-400 ml-auto">
                <i class="las la-clock text-[10px] mr-0.5"></i>{{ fmtDate(d.createdAt) }}
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-400 line-clamp-1">{{ d.content }}</p>
          </div>

          <!-- Actions -->
          <div class="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:bg-gray-50"
              title="View document"
              @click="viewDoc(d)"
            >
              <i class="las la-eye text-sm"></i>
            </button>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:bg-gray-50"
              title="Edit document"
              @click="editDoc(d)"
            >
              <i class="las la-pen text-sm"></i>
            </button>
            <button
              v-if="d.status === 'draft'"
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
              title="Mark as final"
              @click="markFinal(d)"
            >
              <i class="las la-check text-sm"></i>
            </button>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-500 transition hover:bg-red-50"
              title="Delete document"
              @click="deleteDoc(d)"
            >
              <i class="las la-trash-alt text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View modal -->
    <Teleport to="body">
      <div
        v-if="viewingDoc"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="viewingDoc = null"
      >
        <div class="relative flex w-full max-w-2xl flex-col rounded border border-gray-200 bg-white overflow-hidden max-h-[90vh]">
          <!-- Modal header -->
          <div class="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
            <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-50 text-primary-600">
              <i :class="docIcon(viewingDoc.documentType)" class="text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ viewingDoc.title }}</p>
              <p class="text-xs text-gray-500">{{ formatDocType(viewingDoc.documentType) }} · {{ viewingDoc.jurisdiction || 'No jurisdiction' }}</p>
            </div>
            <span
              :class="[
                'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                viewingDoc.status === 'final' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              ]"
            >{{ viewingDoc.status || 'draft' }}</span>
            <div class="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                class="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                @click="printDoc(viewingDoc)"
              >
                <i class="las la-print text-sm"></i> Print
              </button>
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50"
                @click="viewingDoc = null"
              >
                <i class="las la-times text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Modal body -->
          <div class="overflow-y-auto p-5">
            <div class="mb-4 grid grid-cols-2 gap-3 text-xs">
              <div class="rounded border border-gray-100 bg-gray-50 p-2.5">
                <p class="text-gray-400 text-[10px] uppercase tracking-wide mb-0.5">Created</p>
                <p class="font-medium text-gray-700">{{ fmtDate(viewingDoc.createdAt) }}</p>
              </div>
              <div class="rounded border border-gray-100 bg-gray-50 p-2.5">
                <p class="text-gray-400 text-[10px] uppercase tracking-wide mb-0.5">Last updated</p>
                <p class="font-medium text-gray-700">{{ fmtDate(viewingDoc.updatedAt || viewingDoc.createdAt) }}</p>
              </div>
            </div>
            <div class="rounded border border-gray-100 bg-gray-50 p-4">
              <p class="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">{{ viewingDoc.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div
        v-if="deletingDoc"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="deletingDoc = null"
      >
        <div class="w-full max-w-sm rounded border border-gray-200 bg-white p-5 text-center">
          <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <i class="las la-trash-alt text-lg"></i>
          </div>
          <p class="text-sm font-bold text-gray-900">Delete document?</p>
          <p class="mt-1 text-xs text-gray-500">"{{ deletingDoc.title }}" will be permanently removed.</p>
          <div class="mt-4 flex justify-center gap-2">
            <button type="button" class="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50" @click="deletingDoc = null">Cancel</button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="deleteLoading"
              @click="confirmDelete"
            >
              <i v-if="deleteLoading" class="las la-spinner animate-spin"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { useLegalDocumentsStore } from '@@/stores/legalDocuments'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Legal documents - CribHub' })

const store = useLegalDocumentsStore()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const viewingDoc = ref<any>(null)
const deletingDoc = ref<any>(null)
const deleteLoading = ref(false)
const filterStatus = ref<'all' | 'draft' | 'final'>('all')
const searchQuery = ref('')

const filterTabs = [
  { key: 'all' as const, label: 'All' },
  { key: 'draft' as const, label: 'Drafts' },
  { key: 'final' as const, label: 'Final' },
]

const form = reactive({ title: '', documentType: 'tenancy_agreement', jurisdiction: 'Ghana', content: '', status: 'draft' as 'draft' | 'final' })
const err = ref('')
const ok = ref(false)
const pending = ref(false)

const countByStatus = (s: string) => store.list.filter((d) => (d.status || 'draft') === s).length
const uniqueJurisdictions = computed(() => new Set(store.list.map((d) => d.jurisdiction).filter(Boolean)).size)

const filteredDocs = computed(() => {
  let list = [...store.list]
  if (filterStatus.value !== 'all') list = list.filter((d) => (d.status || 'draft') === filterStatus.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((d) => [d.title, d.documentType, d.jurisdiction, d.content].some((s) => (s || '').toLowerCase().includes(q)))
  }
  return list
})

function docIcon(type?: string) {
  const t = type || ''
  if (t.includes('tenancy') || t.includes('lease')) return 'las la-file-contract'
  if (t.includes('notice')) return 'las la-bullhorn'
  if (t.includes('receipt')) return 'las la-receipt'
  if (t.includes('inspection')) return 'las la-clipboard-check'
  if (t.includes('sublease')) return 'las la-exchange-alt'
  return 'las la-file-alt'
}

function formatDocType(type?: string) {
  if (!type) return 'Custom'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function viewDoc(d: any) { viewingDoc.value = d }

function editDoc(d: any) {
  editingId.value = String(d._id)
  form.title = d.title
  form.documentType = d.documentType
  form.jurisdiction = d.jurisdiction || 'Ghana'
  form.content = d.content
  form.status = d.status || 'draft'
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function deleteDoc(d: any) { deletingDoc.value = d }

async function markFinal(d: any) {
  try { await store.patchDoc(String(d._id), { status: 'final' }) } catch { /* ignore */ }
}

function cancelEdit() {
  showForm.value = false
  editingId.value = null
  form.title = ''
  form.documentType = 'tenancy_agreement'
  form.jurisdiction = 'Ghana'
  form.content = ''
  form.status = 'draft'
  err.value = ''
  ok.value = false
}

async function onSubmit() {
  err.value = ''
  ok.value = false
  pending.value = true
  try {
    if (editingId.value) {
      await store.patchDoc(editingId.value, { title: form.title, documentType: form.documentType, jurisdiction: form.jurisdiction, content: form.content, status: form.status })
    } else {
      await store.createDoc({ title: form.title, documentType: form.documentType, jurisdiction: form.jurisdiction, content: form.content })
    }
    ok.value = true
    setTimeout(() => { cancelEdit() }, 1200)
  } catch (e: any) {
    err.value = e?.message || 'Failed to save'
  } finally {
    pending.value = false
  }
}

async function confirmDelete() {
  if (!deletingDoc.value) return
  deleteLoading.value = true
  try {
    await store.removeDoc(String(deletingDoc.value._id))
    deletingDoc.value = null
  } catch { /* ignore */ } finally {
    deleteLoading.value = false
  }
}

function printDoc(d: any) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>${d.title}</title><style>body{font-family:serif;max-width:700px;margin:40px auto;color:#111;line-height:1.6}h1{font-size:1.2rem;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:16px}pre{white-space:pre-wrap;font-family:serif;font-size:.9rem}.meta{font-size:.8rem;color:#666;margin-bottom:16px}@media print{@page{margin:2cm}}</style></head><body>
    <h1>${d.title}</h1>
    <div class="meta">${formatDocType(d.documentType)} · ${d.jurisdiction || ''} · ${fmtDate(d.createdAt)}</div>
    <pre>${d.content}</pre>
  </body></html>`)
  win.document.close()
  win.print()
}

onMounted(() => store.fetchList())
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>

<template>
  <div>
    <!-- Existing documents -->
    <div v-if="localFiles.length" class="mb-3 space-y-2">
      <div
        v-for="(f, i) in localFiles"
        :key="String(f._id ?? f.url ?? i)"
        class="flex items-start gap-3 rounded border border-gray-200 bg-white px-3 py-2"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500">
          <i :class="iconFor(f) + ' text-lg'"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-gray-900">{{ f.originalName || f.name || labelFromUrl(f.url) || 'Document' }}</p>
          <p class="mt-0.5 text-[10px] text-gray-500">
            <span v-if="f.purpose" class="rounded bg-gray-100 px-1.5 py-0.5 uppercase tracking-wider">{{ f.purpose }}</span>
            <span v-if="f.size" class="ml-1">{{ formatSize(f.size) }}</span>
          </p>
        </div>
        <a
          v-if="f.url"
          :href="f.url"
          target="_blank"
          rel="noopener"
          class="rounded border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
        >
          <i class="las la-external-link-alt"></i> View
        </a>
        <button
          v-if="f._id"
          type="button"
          class="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          :disabled="removingId === String(f._id)"
          @click="removeFile(f)"
        >
          <i class="las la-trash"></i>
        </button>
      </div>
    </div>

    <!-- Upload zone -->
    <label
      class="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-primary-400 hover:bg-primary-50/30"
      :class="dragging ? 'border-primary-500 bg-primary-50' : ''"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="accept"
        class="sr-only"
        @change="onFileChange"
      />
      <i class="las la-cloud-upload-alt text-3xl text-gray-400"></i>
      <span class="mt-1 text-xs font-semibold text-gray-600">Upload {{ label }}</span>
      <span class="mt-0.5 text-[11px] text-gray-400">PDF · DOC · JPG · PNG — up to {{ formatSize(maxSize) }} per file</span>
    </label>

    <!-- Upload queue -->
    <div v-if="queue.length" class="mt-3 space-y-1.5">
      <div
        v-for="q in queue"
        :key="q.id"
        class="rounded border border-gray-200 bg-white px-3 py-2 text-xs"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="truncate font-medium text-gray-700">{{ q.name }}</span>
          <span v-if="q.error" class="text-red-600"><i class="las la-exclamation-circle"></i> {{ q.error }}</span>
          <span v-else-if="q.done" class="text-emerald-600"><i class="las la-check"></i> Done</span>
          <span v-else class="text-gray-500">{{ q.progress }}%</span>
        </div>
        <div class="mt-1 h-1 overflow-hidden rounded bg-gray-100">
          <div
            class="h-full bg-primary-500 transition-all"
            :style="{ width: q.done ? '100%' : `${q.progress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <p v-if="lastError" class="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <i class="las la-exclamation-circle mr-1"></i>{{ lastError }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface FileRow {
  _id?: string
  url?: string
  originalName?: string
  name?: string
  purpose?: string
  size?: number
  mime?: string
}

const props = withDefaults(
  defineProps<{
    entityType: string
    entityId: string
    files?: FileRow[]
    label?: string
    purpose?: string
    accept?: string
    maxSize?: number
  }>(),
  {
    files: () => [],
    label: 'documents',
    purpose: 'verification',
    accept: '.pdf,.doc,.docx,image/png,image/jpeg,image/webp',
    maxSize: 10 * 1024 * 1024
  }
)

const emit = defineEmits<{ (e: 'update:files', value: FileRow[]): void }>()

const config = useRuntimeConfig()
const localFiles = ref<FileRow[]>([...(props.files ?? [])])
const dragging = ref(false)
const lastError = ref<string | null>(null)
const removingId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

interface QueueItem {
  id: string
  name: string
  progress: number
  done: boolean
  error: string | null
}
const queue = ref<QueueItem[]>([])

watch(() => props.files, (v) => { if (v) localFiles.value = [...v] }, { deep: true })

function onDrop(e: DragEvent) {
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) void uploadFiles(files)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) void uploadFiles(files)
  input.value = ''
}

async function uploadFiles(files: File[]) {
  if (!props.entityId) {
    lastError.value = 'Save the record first before uploading documents.'
    return
  }
  lastError.value = null
  const authStore = (useNuxtApp() as any).$pinia?.state?.value?.auth
  const token = authStore?.accessToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : '') || ''

  for (const file of files) {
    if (file.size > props.maxSize) {
      lastError.value = `${file.name} exceeds ${formatSize(props.maxSize)} limit.`
      continue
    }
    const id = Math.random().toString(36).slice(2)
    const item: QueueItem = { id, name: file.name, progress: 0, done: false, error: null }
    queue.value.push(item)

    try {
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('entityType', props.entityType)
      formData.append('entityId', props.entityId)
      formData.append('purpose', props.purpose)

      const xhr = new XMLHttpRequest()
      const url = `${config.public.apiBaseUrl}/file-upload`

      const created: any = await new Promise((resolve, reject) => {
        xhr.open('POST', url)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) item.progress = Math.round((ev.loaded / ev.total) * 100)
        })
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({}) }
          } else {
            try {
              const body = JSON.parse(xhr.responseText)
              reject(new Error(body?.message || `Upload failed (${xhr.status})`))
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`))
            }
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(formData)
      })

      item.done = true
      item.progress = 100
      const fileRow: FileRow = {
        _id: created?._id,
        url: created?.url,
        originalName: created?.originalName || file.name,
        purpose: created?.purpose || props.purpose,
        size: created?.size ?? file.size,
        mime: created?.mime ?? file.type
      }
      localFiles.value = [...localFiles.value, fileRow]
      emit('update:files', localFiles.value)
    } catch (e: any) {
      item.error = e?.message || 'Upload failed'
    } finally {
      setTimeout(() => { queue.value = queue.value.filter((x) => x.id !== id) }, 2500)
    }
  }
}

async function removeFile(f: FileRow) {
  if (!f._id) return
  removingId.value = String(f._id)
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('files').remove(String(f._id))
    localFiles.value = localFiles.value.filter((x) => String(x._id ?? '') !== String(f._id))
    emit('update:files', localFiles.value)
  } catch (e: any) {
    lastError.value = e?.message || 'Could not remove document'
  } finally {
    removingId.value = null
  }
}

function iconFor(f: FileRow): string {
  const ext = (f.originalName || f.name || '').toLowerCase().split('.').pop()
  if (ext === 'pdf') return 'las la-file-pdf text-red-500'
  if (['doc', 'docx'].includes(ext || '')) return 'las la-file-word text-blue-500'
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'las la-file-image text-emerald-500'
  return 'las la-file text-gray-500'
}

function labelFromUrl(u?: string): string {
  if (!u) return ''
  try { return decodeURIComponent(u.split('/').pop() || '') } catch { return '' }
}

function formatSize(b: number): string {
  if (!Number.isFinite(b) || b <= 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${(b / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
</script>

<template>
  <div>
    <!-- Image grid -->
    <div v-if="localImages.length || true" class="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      <div
        v-for="(img, i) in localImages"
        :key="img + i"
        class="group relative overflow-hidden rounded border border-gray-200 bg-gray-100"
        style="aspect-ratio:4/3"
      >
        <img :src="img" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
        <!-- Cover badge -->
        <span v-if="i === 0" class="absolute left-1.5 top-1.5 rounded bg-primary-600 px-1.5 py-0.5 text-xs font-semibold text-white">
          Cover
        </span>
        <!-- Remove button -->
        <button
          type="button"
          class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded bg-red-600 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-700"
          :title="`Remove image ${i + 1}`"
          @click="removeImage(i)"
        >
          <i class="las la-times text-xs"></i>
        </button>
        <!-- Set as cover button (for non-first images) -->
        <button
          v-if="i !== 0"
          type="button"
          class="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 opacity-0 transition group-hover:opacity-100 hover:bg-white"
          @click="setCover(i)"
        >
          Set cover
        </button>
      </div>

      <!-- Upload zone tile -->
      <label
        class="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-primary-400 hover:bg-primary-50/30"
        style="aspect-ratio:4/3"
        :class="dragging ? 'border-primary-500 bg-primary-50' : ''"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="sr-only"
          @change="onFileChange"
        />
        <i class="las la-cloud-upload-alt text-2xl text-gray-400"></i>
        <span class="mt-1 text-xs text-gray-500">Add photos</span>
      </label>
    </div>

    <!-- Upload queue -->
    <div v-if="queue.length" class="space-y-1.5">
      <div
        v-for="item in queue"
        :key="item.id"
        class="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-xs"
      >
        <!-- thumbnail preview -->
        <div class="h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
          <img v-if="item.preview" :src="item.preview" alt="" class="h-full w-full object-cover" />
          <i v-else class="las la-image flex h-full w-full items-center justify-center text-gray-300 text-lg"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-gray-800">{{ item.name }}</p>
          <!-- progress bar -->
          <div class="mt-1 h-1 w-full overflow-hidden rounded bg-gray-200">
            <div
              class="h-full rounded transition-all duration-200"
              :class="item.error ? 'bg-red-500' : item.done ? 'bg-emerald-500' : 'bg-primary-500'"
              :style="{ width: `${item.progress}%` }"
            />
          </div>
        </div>
        <span v-if="item.error" class="shrink-0 text-red-600"><i class="las la-exclamation-circle"></i></span>
        <span v-else-if="item.done" class="shrink-0 text-emerald-600"><i class="las la-check-circle"></i></span>
        <span v-else class="shrink-0 text-gray-400"><i class="las la-spinner animate-spin"></i></span>
      </div>
    </div>

    <!-- Error summary -->
    <p v-if="lastError" class="mt-2 text-xs text-red-600"><i class="las la-exclamation-triangle mr-1"></i>{{ lastError }}</p>
    <p class="mt-1.5 text-xs text-gray-400">Drag &amp; drop or click to add. First image becomes cover. Max 5 MB per file.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  entityType: string
  entityId: string
  images?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:images', value: string[]): void
}>()

const config = useRuntimeConfig()
const auth = useNuxtApp().$pinia ? (useNuxtApp() as any).$pinia.state.value?.auth : null

const localImages = ref<string[]>([...(props.images ?? [])])
const dragging = ref(false)
const lastError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

interface QueueItem {
  id: string
  name: string
  preview: string | null
  progress: number
  done: boolean
  error: string | null
}
const queue = ref<QueueItem[]>([])

watch(() => props.images, (v) => {
  if (v) localImages.value = [...v]
}, { deep: true })

function setCover(i: number) {
  const arr = [...localImages.value]
  const [img] = arr.splice(i, 1)
  arr.unshift(img)
  localImages.value = arr
  emit('update:images', arr)
}

function removeImage(i: number) {
  const arr = [...localImages.value]
  arr.splice(i, 1)
  localImages.value = arr
  emit('update:images', arr)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
  if (files.length) uploadFiles(files)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) uploadFiles(files)
  input.value = ''
}

async function uploadFiles(files: File[]) {
  if (!props.entityId) {
    lastError.value = 'Save the record first before uploading images.'
    return
  }
  lastError.value = null

  // Get token — try multiple sources
  const authStore = (useNuxtApp() as any).$pinia?.state?.value?.auth
  const token = authStore?.accessToken || localStorage.getItem('accessToken') || ''

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      lastError.value = `${file.name} exceeds 5 MB limit.`
      continue
    }

    const id = Math.random().toString(36).slice(2)
    const preview = await createPreview(file)
    const item: QueueItem = { id, name: file.name, preview, progress: 0, done: false, error: null }
    queue.value.push(item)

    try {
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('entityType', props.entityType)
      formData.append('entityId', props.entityId)
      formData.append('purpose', 'gallery')

      const xhr = new XMLHttpRequest()
      const url = `${config.public.apiBaseUrl}/file-upload`

      await new Promise<void>((resolve, reject) => {
        xhr.open('POST', url)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) item.progress = Math.round((ev.loaded / ev.total) * 90)
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            item.progress = 100; item.done = true
            try {
              const res = JSON.parse(xhr.responseText)
              // The API patches the entity automatically, but we also update local state
              const uploaded = res?.uploaded ?? (res?.cloudinary ? [res] : [])
              const urls: string[] = uploaded
                .map((u: any) => u?.cloudinary?.secure_url)
                .filter(Boolean)
              if (!urls.length && res?.cloudinary?.secure_url) urls.push(res.cloudinary.secure_url)
              if (urls.length) {
                localImages.value = [...localImages.value, ...urls]
                emit('update:images', localImages.value)
              }
            } catch {}
            resolve()
          } else {
            reject(new Error(`Upload failed (${xhr.status})`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.send(formData)
      })
    } catch (e: any) {
      item.error = e?.message || 'Upload failed'
      item.progress = 100
      lastError.value = item.error
    }

    // Remove from queue after short delay
    setTimeout(() => {
      const idx = queue.value.findIndex((q) => q.id === id)
      if (idx >= 0) queue.value.splice(idx, 1)
    }, 2500)
  }
}

function createPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}
</script>

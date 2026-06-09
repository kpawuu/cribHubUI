<template>
  <div>
    <div
      v-if="!docs.length"
      class="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-xs text-gray-500"
    >
      <i class="las la-folder-open text-2xl text-gray-300"></i>
      <p class="mt-1">No verification documents uploaded yet.</p>
    </div>
    <ul v-else class="divide-y divide-gray-100 rounded border border-gray-100 bg-white">
      <li
        v-for="d in docs"
        :key="String(d._id || d.url)"
        class="flex items-center gap-3 px-3 py-2.5"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500">
          <i :class="iconForType(d)" class="text-lg"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900">
            {{ d.docType || d.fileName || d.name || 'Document' }}
          </p>
          <p class="text-[11px] text-gray-500">
            <span v-if="d.fileName">{{ d.fileName }}</span>
            <span v-if="d.fileSize"> · {{ formatFileSize(d.fileSize) }}</span>
            <span v-if="d.createdAt"> · {{ fmtDate(d.createdAt) }}</span>
          </p>
        </div>
        <a
          v-if="d.url || d.fileUrl"
          :href="d.url || d.fileUrl"
          target="_blank"
          rel="noopener"
          class="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
        >
          <i class="las la-external-link-alt"></i> View
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ docs: any[] }>()

function iconForType(d: any) {
  const t = String(d.mimeType || d.fileName || '').toLowerCase()
  if (t.includes('image') || /\.(png|jpg|jpeg|gif|webp)$/.test(t)) return 'las la-image'
  if (t.includes('pdf') || t.endsWith('.pdf')) return 'las la-file-pdf'
  return 'las la-file-alt'
}

function formatFileSize(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

void props
</script>

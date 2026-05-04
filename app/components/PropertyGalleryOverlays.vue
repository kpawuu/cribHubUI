<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** When `false`, hide the verified pill. Omitted or `true` shows verified (matches API default). */
  verified?: boolean
  /** When set, "View on map" opens this URL (e.g. Google Maps) in a new tab. */
  mapsUrl?: string
  /** Total photos for the listing (including beyond the on-page gallery). Used for label and aria. */
  totalPhotoCount?: number
}>()

const emit = defineEmits<{
  'show-photos': []
}>()

const showVerified = computed(() => props.verified !== false)

const photosButtonLabel = computed(() => {
  const n = props.totalPhotoCount
  if (typeof n === 'number' && n > 5) return `Show all photos (${n})`
  return 'Show photos'
})

const photosAriaLabel = computed(() => {
  const n = props.totalPhotoCount
  if (typeof n === 'number' && n > 0) return `Open photo gallery, ${n} photos`
  return 'Open photo gallery'
})
</script>

<template>
  <div v-if="showVerified" class="absolute top-3 left-3 z-10" @click.stop>
    <span class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded">
      <i class="las la-star mr-1"></i>
      VERIFIED
    </span>
  </div>
  <div class="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2" @click.stop>
    <button
      type="button"
      class="px-4 py-2 bg-white/95 hover:bg-white rounded text-sm font-medium transition shadow-sm flex items-center"
      :aria-label="photosAriaLabel"
      @click="emit('show-photos')"
    >
      <i class="las la-camera mr-2" aria-hidden="true"></i>
      {{ photosButtonLabel }}
    </button>
    <a
      v-if="mapsUrl"
      :href="mapsUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="px-4 py-2 bg-white/95 hover:bg-white rounded text-sm font-medium transition shadow-sm flex items-center text-gray-900"
    >
      <i class="las la-map-marker mr-2"></i>
      View on map
    </a>
    <button
      v-else
      type="button"
      class="px-4 py-2 bg-white/95 hover:bg-white rounded text-sm font-medium transition shadow-sm flex items-center opacity-60 cursor-not-allowed"
      disabled
    >
      <i class="las la-map-marker mr-2"></i>
      View on map
    </button>
  </div>
</template>

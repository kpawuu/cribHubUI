<template>
  <div>
    <!-- Selected location tags -->
    <div v-if="modelValue.length > 0" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="(loc, i) in modelValue"
        :key="i"
        class="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 pl-2.5 pr-1.5 py-1 text-xs font-medium text-primary-700"
      >
        <i class="las la-map-marker text-primary-400"></i>
        {{ loc }}
        <button
          type="button"
          class="ml-0.5 flex h-4 w-4 items-center justify-center rounded text-primary-400 transition hover:bg-primary-100 hover:text-primary-700"
          @click="remove(i)"
        >
          <i class="las la-times text-[10px]"></i>
        </button>
      </span>
    </div>

    <!-- Search input -->
    <div class="relative">
      <i class="las la-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder || 'Search areas, cities, neighbourhoods…'"
        autocomplete="off"
        class="w-full rounded border border-gray-300 py-2 pl-9 pr-9 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        @keydown.enter.prevent="addManual"
        @keydown.backspace="onBackspace"
      />
      <!-- Status -->
      <span class="absolute right-3 top-1/2 -translate-y-1/2">
        <i v-if="loading" class="las la-circle-notch la-spin text-sm text-gray-400"></i>
        <i v-else-if="ready" class="las la-check-circle text-sm text-emerald-500" title="Google Places active"></i>
        <i v-else-if="noKey" class="las la-exclamation-triangle text-sm text-amber-400" title="No API key — press Enter to add manually"></i>
      </span>
    </div>

    <p class="mt-1 text-[11px] text-gray-400">
      <template v-if="!noKey">Select from suggestions or press <kbd class="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to add as typed.</template>
      <template v-else>No API key — type a location and press <kbd class="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to add.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  maxItems?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const config = useRuntimeConfig()
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const loading = ref(false)
const ready = ref(false)
const noKey = ref(false)

const max = computed(() => props.maxItems ?? 10)

function add(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  if (props.modelValue.length >= max.value) return
  if (props.modelValue.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return
  emit('update:modelValue', [...props.modelValue, trimmed])
  query.value = ''
  nextTick(() => inputRef.value?.focus())
}

function remove(i: number) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}

function addManual() {
  if (query.value.trim()) add(query.value)
}

function onBackspace() {
  if (query.value === '' && props.modelValue.length > 0) {
    remove(props.modelValue.length - 1)
  }
}

// ── Google Places ────────────────────────────────────────────────────────────

let loadPromise: Promise<void> | null = null

function loadGoogleMapsScript(key: string): Promise<void> {
  if (loadPromise) return loadPromise
  if ((window as any).google?.maps?.places) {
    loadPromise = Promise.resolve()
    return loadPromise
  }
  loadPromise = new Promise<void>((resolve, reject) => {
    const cb = '__gmapsLocationCb__'
    ;(window as any)[cb] = () => { delete (window as any)[cb]; resolve() }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=${cb}`
    s.async = true
    s.defer = true
    s.onerror = () => { loadPromise = null; reject(new Error('Google Maps failed to load')) }
    document.head.appendChild(s)
  })
  return loadPromise
}

async function initAutocomplete() {
  if (!inputRef.value) return
  const key = config.public.googleMapsKey as string
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    noKey.value = true
    return
  }
  loading.value = true
  try {
    await loadGoogleMapsScript(key)
    if (!inputRef.value) return

    // Use (regions) so results include neighbourhoods, suburbs, cities
    const ac = new google.maps.places.Autocomplete(inputRef.value, {
      types: ['(regions)'],
      fields: ['name', 'address_components', 'geometry'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      // Prefer short name: neighbourhood → sublocality → city → formatted
      const comps: google.maps.GeocoderAddressComponent[] = place.address_components || []
      const neighbourhood =
        comps.find((c) => c.types.includes('neighborhood') || c.types.includes('sublocality_level_1'))?.long_name ||
        comps.find((c) => c.types.includes('sublocality'))?.long_name ||
        comps.find((c) => c.types.includes('locality'))?.long_name ||
        place.name || ''
      add(neighbourhood)
    })

    ready.value = true
  } catch (e) {
    console.warn('[UiLocationMultiPicker] Places init failed:', e)
    noKey.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => { initAutocomplete() })
</script>

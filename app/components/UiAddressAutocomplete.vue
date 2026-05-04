<template>
  <div class="relative">
    <div class="relative">
      <i class="las la-map-marker absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        :placeholder="placeholder || 'Start typing an address…'"
        class="w-full rounded border border-gray-300 py-2 pl-8 pr-9 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        :class="{ 'border-primary-500 ring-1 ring-primary-500': ready }"
        autocomplete="off"
        @input="(e) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
      />
      <!-- Status indicator -->
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
        <i v-if="loading" class="las la-spinner animate-spin text-gray-400"></i>
        <i v-else-if="ready" class="las la-check-circle text-emerald-500" title="Google Places ready"></i>
        <i v-else-if="noKey" class="las la-exclamation-triangle text-amber-400" title="No API key — type manually"></i>
      </span>
    </div>

    <!-- No-key fallback note -->
    <p v-if="noKey" class="mt-1 text-xs text-amber-600">
      <i class="las la-info-circle mr-0.5"></i>
      Add <code class="rounded bg-amber-50 px-1">NUXT_PUBLIC_GOOGLE_MAPS_KEY</code> to your <code>.env</code> for address autocomplete.
    </p>
  </div>
</template>

<script setup lang="ts">
export interface PlaceResult {
  address: string
  buildingName: string
  area: string
  neighborhood: string
  city: string
  state: string
  country: string
  postalCode: string
  lat: number | null
  lng: number | null
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'place-selected', place: PlaceResult): void
}>()

const config = useRuntimeConfig()
const inputRef = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const ready = ref(false)
const noKey = ref(false)

// Singleton promise so the script only loads once per page lifecycle
let loadPromise: Promise<void> | null = null

function loadGoogleMapsScript(key: string): Promise<void> {
  if (loadPromise) return loadPromise
  if ((window as any).google?.maps?.places) {
    loadPromise = Promise.resolve()
    return loadPromise
  }
  loadPromise = new Promise<void>((resolve, reject) => {
    const callbackName = '__gmapsCallback__'
    ;(window as any)[callbackName] = () => {
      delete (window as any)[callbackName]
      resolve()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps script'))
    }
    document.head.appendChild(script)
  })
  return loadPromise
}

function extractComponent(components: google.maps.GeocoderAddressComponent[], types: string[]): string {
  const found = components.find((c) => types.some((t) => c.types.includes(t)))
  return found?.long_name || ''
}
function extractShort(components: google.maps.GeocoderAddressComponent[], types: string[]): string {
  const found = components.find((c) => types.some((t) => c.types.includes(t)))
  return found?.short_name || ''
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

    const autocomplete = new google.maps.places.Autocomplete(inputRef.value, {
      types: ['address'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place?.geometry?.location) return

      const comps: google.maps.GeocoderAddressComponent[] = place.address_components || []

      const streetNumber = extractComponent(comps, ['street_number'])
      const streetName = extractComponent(comps, ['route'])
      const address = [streetNumber, streetName].filter(Boolean).join(' ') || place.formatted_address || ''

      const result: PlaceResult = {
        address,
        buildingName: extractComponent(comps, ['premise', 'establishment']),
        area: extractComponent(comps, ['sublocality_level_1', 'sublocality']),
        neighborhood: extractComponent(comps, ['neighborhood', 'sublocality_level_2']),
        city: extractComponent(comps, ['locality', 'administrative_area_level_2']),
        state: extractComponent(comps, ['administrative_area_level_1']),
        country: extractComponent(comps, ['country']),
        postalCode: extractComponent(comps, ['postal_code']),
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }

      // Update the visible input value to the clean street address
      emit('update:modelValue', address || place.formatted_address || '')
      emit('place-selected', result)
    })

    ready.value = true
  } catch (e) {
    console.warn('[UiAddressAutocomplete] Failed to initialise Google Places:', e)
    noKey.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initAutocomplete()
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/landlord/properties" class="inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600">
        <i class="las la-arrow-left mr-1"></i>Back to properties
      </NuxtLink>
      <h1 class="mt-2 text-xl font-bold tracking-tight text-gray-900">New property</h1>
      <p class="mt-0.5 text-sm text-gray-500">Fill in the details. You can add images and units after saving.</p>
    </div>

    <div v-if="error" class="mb-4 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <i class="las la-exclamation-circle mt-0.5 shrink-0 text-red-500"></i>
      <span>{{ error }}</span>
    </div>

    <form @submit.prevent="onSubmit">
      <!-- ── 1. Listing info ── -->
      <div class="compact-card mb-4 rounded bg-white p-5">
        <div class="flex items-center gap-2"><div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600"><i class="las la-tag text-xs text-white"></i></div><h2 class="text-sm font-semibold text-gray-900">Listing</h2></div>
        <div class="mt-4 space-y-3">
          <div>
            <label class="field-label">Listing label</label>
            <input v-model="form.listingLabel" placeholder="e.g. APARTMENT FOR RENT IN EAST LEGON" class="field-input" />
            <p class="mt-0.5 text-xs text-gray-400">Short all-caps headline (optional)</p>
          </div>
          <div>
            <label class="field-label">Property name <span class="text-red-500">*</span></label>
            <input v-model="form.name" required placeholder="e.g. Tropical Gardens Block A" class="field-input" />
          </div>
          <div>
            <label class="field-label">Sub-title</label>
            <input v-model="form.title" placeholder="e.g. Fully Furnished | Ready to Move In" class="field-input" />
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Property type <span class="text-red-500">*</span></label>
              <select v-model="form.propertyType" required class="field-input">
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Duplex">Duplex</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed-use">Mixed-use</option>
              </select>
            </div>
            <div>
              <label class="field-label">Listing type</label>
              <select v-model="form.listingType" class="field-input">
                <option value="rent">For rent</option>
                <option value="buy">For sale</option>
                <option value="commercial">Commercial</option>
                <option value="new">New build</option>
              </select>
            </div>
          </div>
          <div>
            <label class="field-label">Description</label>
            <textarea v-model="form.description" rows="4" placeholder="Describe key features, amenities, views…" class="field-input" />
          </div>
        </div>
      </div>

      <!-- ── 2. Location ── -->
      <div class="compact-card mb-4 rounded bg-white p-5">
        <div class="flex items-center gap-2"><div class="flex h-6 w-6 items-center justify-center rounded bg-blue-600"><i class="las la-map-marker text-xs text-white"></i></div><h2 class="text-sm font-semibold text-gray-900">Location</h2></div>
        <div class="mt-4 space-y-3">
          <!-- Google Places autocomplete -->
          <div>
            <label class="field-label">Street address <span class="text-red-500">*</span></label>
            <UiAddressAutocomplete
              v-model="form.address"
              placeholder="Search address…"
              @place-selected="onPlaceSelected"
            />
            <p class="mt-0.5 text-xs text-gray-400">Select from the dropdown to auto-fill the fields below.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Building name</label>
              <input v-model="form.buildingName" placeholder="e.g. Tower 108" class="field-input" />
            </div>
            <div>
              <label class="field-label">Area / District</label>
              <input v-model="form.area" placeholder="e.g. Spintex" class="field-input" />
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Neighbourhood</label>
              <input v-model="form.neighborhood" placeholder="e.g. East Legon" class="field-input" />
            </div>
            <div>
              <label class="field-label">Postal code</label>
              <input v-model="form.postalCode" placeholder="e.g. GA-000-0000" class="field-input" />
            </div>
          </div>
          <!-- City / Region / Country — auto-filled from Google, override-able -->
          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="field-label mb-0">City · Region · Country</label>
              <button type="button" class="text-xs text-primary-600 hover:underline" @click="manualGeo = !manualGeo">
                <i :class="manualGeo ? 'las la-lock-open' : 'las la-pen'" class="mr-0.5"></i>
                {{ manualGeo ? 'Auto-fill from map' : 'Edit manually' }}
              </button>
            </div>

            <!-- Auto-filled chips (default state) -->
            <div v-if="!manualGeo">
              <div
                v-if="form.city || form.state || form.country"
                class="flex flex-wrap items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2.5"
              >
                <i class="las la-map-marker text-emerald-600 shrink-0"></i>
                <span v-if="form.city" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  <i class="las la-city mr-0.5 text-emerald-500"></i>{{ form.city }}
                </span>
                <span v-if="form.state" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  <i class="las la-map mr-0.5 text-emerald-500"></i>{{ form.state }}
                </span>
                <span v-if="form.country" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  <i class="las la-globe mr-0.5 text-emerald-500"></i>{{ form.country }}
                </span>
                <span class="ml-auto text-xs text-emerald-600 flex items-center gap-0.5">
                  <i class="las la-check-circle"></i> from Google Maps
                </span>
              </div>
              <div
                v-else
                class="flex items-center gap-2 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-400"
              >
                <i class="las la-map-marker text-lg text-gray-300"></i>
                <span>City, region and country will be filled when you select an address above.</span>
              </div>
            </div>

            <!-- Manual override inputs -->
            <div v-else class="grid gap-2 sm:grid-cols-3">
              <div>
                <label class="mb-1 block text-xs text-gray-500">City</label>
                <input v-model="form.city" placeholder="e.g. Accra" class="field-input" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Region / State</label>
                <input v-model="form.state" placeholder="e.g. Greater Accra" class="field-input" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Country</label>
                <input v-model="form.country" placeholder="e.g. Ghana" class="field-input" />
              </div>
            </div>
          </div>

          <!-- Coordinates — auto-filled from Places, editable manually -->
          <div v-if="form.geoLat || form.geoLng" class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Latitude</label>
              <input v-model.number="form.geoLat" type="number" step="any" class="field-input bg-gray-50 font-mono text-xs" />
            </div>
            <div>
              <label class="field-label">Longitude</label>
              <input v-model.number="form.geoLng" type="number" step="any" class="field-input bg-gray-50 font-mono text-xs" />
            </div>
          </div>
          <!-- Mini map preview when coords are set -->
          <div v-if="form.geoLat && form.geoLng" class="overflow-hidden rounded border border-gray-200">
            <iframe
              :src="`https://www.google.com/maps?q=${form.geoLat},${form.geoLng}&z=16&output=embed`"
              class="h-40 w-full border-0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <!-- ── 3. Property details ── -->
      <div class="compact-card mb-4 rounded bg-white p-5">
        <div class="flex items-center gap-2"><div class="flex h-6 w-6 items-center justify-center rounded bg-violet-600"><i class="las la-home text-xs text-white"></i></div><h2 class="text-sm font-semibold text-gray-900">Property details</h2></div>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label class="field-label">Bedrooms</label>
            <input v-model.number="form.bedrooms" type="number" min="0" placeholder="0" class="field-input" />
          </div>
          <div>
            <label class="field-label">Bathrooms</label>
            <input v-model.number="form.bathrooms" type="number" min="0" placeholder="0" class="field-input" />
          </div>
          <div>
            <label class="field-label">Total units</label>
            <input v-model.number="form.totalUnits" type="number" min="1" placeholder="1" class="field-input" />
          </div>
          <div>
            <label class="field-label">Size (sq ft)</label>
            <input v-model.number="form.sizeSqft" type="number" min="0" placeholder="e.g. 1200" class="field-input" />
          </div>
          <div>
            <label class="field-label">Size (sq m)</label>
            <input v-model.number="form.sizeSqm" type="number" min="0" placeholder="e.g. 111" class="field-input" />
          </div>
          <div>
            <label class="field-label">Property age (years)</label>
            <input v-model.number="form.propertyAgeYears" type="number" min="0" placeholder="e.g. 3" class="field-input" />
          </div>
        </div>
      </div>

      <!-- ── 4. Pricing ── -->
      <div class="compact-card mb-4 rounded bg-white p-5">
        <div class="flex items-center gap-2"><div class="flex h-6 w-6 items-center justify-center rounded bg-emerald-600"><i class="las la-tag text-xs text-white"></i></div><h2 class="text-sm font-semibold text-gray-900">Pricing</h2></div>
        <div class="mt-4 space-y-3">
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <label class="field-label">Price</label>
              <input v-model.number="form.price" type="number" min="0" placeholder="0" class="field-input" />
            </div>
            <div>
              <label class="field-label">Currency</label>
              <select v-model="form.priceCurrency" class="field-input">
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label class="field-label">Period</label>
              <select v-model="form.pricePeriod" class="field-input">
                <option value="month">Per month</option>
                <option value="year">Per year</option>
                <option value="week">Per week</option>
                <option value="day">Per day</option>
              </select>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Est. mortgage (monthly)</label>
              <input v-model.number="form.estimatedMortgageMonthly" type="number" min="0" placeholder="Optional" class="field-input" />
            </div>
            <div>
              <label class="field-label">Mortgage currency</label>
              <select v-model="form.mortgageCurrency" class="field-input">
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label class="field-label">Price trends note</label>
            <input v-model="form.priceTrendsNote" placeholder="e.g. Prices in this area rose 8% last year" class="field-input" />
          </div>
        </div>
      </div>

      <!-- ── 5. Amenities ── -->
      <div class="compact-card mb-6 rounded bg-white p-5">
        <div class="flex items-center gap-2"><div class="flex h-6 w-6 items-center justify-center rounded bg-amber-600"><i class="las la-list-alt text-xs text-white"></i></div><h2 class="text-sm font-semibold text-gray-900">Amenities</h2></div>
        <div class="mt-4">
          <UiTagInput v-model="form.amenities" placeholder="e.g. Swimming pool" :show-suggestions="true" />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          type="submit"
          class="rounded bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          :disabled="saving"
        >
          <i v-if="saving" class="las la-spinner animate-spin mr-1.5"></i>
          {{ saving ? 'Creating…' : 'Create property' }}
        </button>
        <NuxtLink to="/landlord/properties" class="rounded border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          Cancel
        </NuxtLink>
      </div>
      <p class="mt-2 text-xs text-gray-400">
        <i class="las la-info-circle mr-0.5"></i>Images can be uploaded after saving the property.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { usePropertiesStore } from '@@/stores/properties'

definePageMeta({ middleware: ['auth', 'landlord-only'], layout: 'account' })
useHead({ title: 'New property - CribHub' })

const properties = usePropertiesStore()
const saving = ref(false)
const error = ref<string | null>(null)
const manualGeo = ref(false)

const form = reactive({
  // Listing
  listingLabel: '', name: '', title: '', propertyType: 'Apartment', listingType: 'rent', description: '',
  // Location
  address: '', buildingName: '', area: '', neighborhood: '', postalCode: '',
  city: '', state: '', country: 'Ghana', geoLat: null as number | null, geoLng: null as number | null,
  // Details
  bedrooms: null as number | null, bathrooms: null as number | null, totalUnits: null as number | null,
  sizeSqft: null as number | null, sizeSqm: null as number | null, propertyAgeYears: null as number | null,
  // Pricing
  price: null as number | null, priceCurrency: 'GHS', pricePeriod: 'month',
  estimatedMortgageMonthly: null as number | null, mortgageCurrency: 'GHS', priceTrendsNote: '',
  // Amenities
  amenities: [] as string[]
})

function onPlaceSelected(place: import('@@/components/UiAddressAutocomplete.vue').PlaceResult) {
  form.address = place.address || form.address
  if (place.buildingName) form.buildingName = place.buildingName
  if (place.area) form.area = place.area
  if (place.neighborhood) form.neighborhood = place.neighborhood
  // Always overwrite city/state/country from Google — switch back to chip view
  form.city = place.city || form.city
  form.state = place.state || form.state
  form.country = place.country || form.country
  manualGeo.value = false
  if (place.postalCode) form.postalCode = place.postalCode
  if (place.lat !== null) form.geoLat = place.lat
  if (place.lng !== null) form.geoLng = place.lng
}

async function onSubmit() {
  error.value = null
  saving.value = true
  try {
    const payload: Record<string, any> = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      propertyType: form.propertyType
    }
    // Optional fields — only include if non-empty
    const optStr = (v: string) => v.trim() || undefined
    const optNum = (v: number | null) => (v != null && v > 0 ? v : undefined)

    payload.listingLabel = optStr(form.listingLabel)
    payload.title = optStr(form.title)
    payload.description = optStr(form.description)
    payload.buildingName = optStr(form.buildingName)
    payload.area = optStr(form.area)
    payload.neighborhood = optStr(form.neighborhood)
    payload.postalCode = optStr(form.postalCode)
    payload.state = optStr(form.state)
    payload.priceTrendsNote = optStr(form.priceTrendsNote)
    payload.bedrooms = optNum(form.bedrooms)
    payload.bathrooms = optNum(form.bathrooms)
    payload.totalUnits = optNum(form.totalUnits)
    payload.sizeSqft = optNum(form.sizeSqft)
    payload.sizeSqm = optNum(form.sizeSqm)
    payload.propertyAgeYears = optNum(form.propertyAgeYears)
    payload.price = optNum(form.price)
    if (payload.price) { payload.priceCurrency = form.priceCurrency; payload.pricePeriod = form.pricePeriod }
    if (optNum(form.estimatedMortgageMonthly)) {
      payload.estimatedMortgageMonthly = form.estimatedMortgageMonthly
      payload.mortgageCurrency = form.mortgageCurrency
    }
    if (form.geoLat && form.geoLng) payload.geo = { lat: form.geoLat, lng: form.geoLng }
    if (form.amenities.length) payload.amenities = form.amenities

    // Remove undefined keys
    for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k]

    const created: any = await properties.createProperty(payload)
    await navigateTo(`/landlord/properties/${created._id}`)
  } catch (e: any) {
    error.value = e?.message || 'Failed to create property'
  } finally {
    saving.value = false
  }
}
</script>


<style scoped>
.field-label { @apply mb-1 block text-xs font-semibold text-gray-700; }
.field-input { @apply w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500; }
</style>

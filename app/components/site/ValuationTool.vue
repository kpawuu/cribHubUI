<template>
  <div class="rounded border border-gray-200 bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-white">
        <i class="las la-home text-lg"></i>
      </div>
      <div>
        <h2 class="text-sm font-bold text-gray-900">Property Valuation Estimator</h2>
        <p class="text-[11px] text-gray-500">Get an indicative market value for any Accra property</p>
      </div>
    </div>

    <div class="p-5">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Location -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Location</label>
          <div class="relative">
            <select
              v-model="form.location"
              class="w-full appearance-none rounded border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm font-medium text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            >
              <option v-for="loc in locations" :key="loc.key" :value="loc.key">{{ loc.label }}</option>
            </select>
            <i class="las la-angle-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
          </div>
        </div>

        <!-- Property type -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Property Type</label>
          <div class="relative">
            <select
              v-model="form.type"
              class="w-full appearance-none rounded border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm font-medium text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House / Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="commercial">Commercial</option>
            </select>
            <i class="las la-angle-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
          </div>
        </div>

        <!-- Transaction -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Transaction Type</label>
          <div class="grid grid-cols-2 gap-1.5 rounded border border-gray-200 p-1">
            <button
              v-for="t in ['rent', 'sale']"
              :key="t"
              class="rounded py-2 text-xs font-semibold transition-all capitalize"
              :class="form.transaction === t ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'"
              @click="setTransaction(t)"
            >
              {{ t === 'rent' ? 'For Rent' : 'For Sale' }}
            </button>
          </div>
        </div>

        <!-- Bedrooms -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Bedrooms</label>
          <div class="flex gap-1.5">
            <button
              v-for="n in [1, 2, 3, 4, '5+']"
              :key="n"
              class="flex-1 rounded border py-2 text-xs font-bold transition-all"
              :class="form.bedrooms === String(n) ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300'"
              @click="form.bedrooms = String(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Bathrooms -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Bathrooms</label>
          <div class="flex gap-1.5">
            <button
              v-for="n in [1, 2, 3, 4]"
              :key="n"
              class="flex-1 rounded border py-2 text-xs font-bold transition-all"
              :class="form.bathrooms === n ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300'"
              @click="form.bathrooms = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Size -->
        <div>
          <label class="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Floor Area</span>
            <span class="font-normal text-gray-500">{{ form.size }} m²</span>
          </label>
          <input
            v-model.number="form.size"
            type="range"
            min="40"
            max="600"
            step="10"
            class="w-full h-2 rounded-full appearance-none bg-gray-200 accent-primary-600 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>40 m²</span>
            <span>600 m²</span>
          </div>
        </div>

        <!-- Condition -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Condition</label>
          <div class="relative">
            <select
              v-model="form.condition"
              class="w-full appearance-none rounded border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm font-medium text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            >
              <option value="new">New / Off-plan</option>
              <option value="renovated">Recently Renovated</option>
              <option value="good">Good Condition</option>
              <option value="fair">Fair Condition</option>
            </select>
            <i class="las la-angle-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
          </div>
        </div>

        <!-- Amenities -->
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Amenities</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="amenity in amenities"
              :key="amenity.key"
              class="flex items-center gap-1.5 rounded border px-3 py-1 text-[11px] font-semibold transition-all"
              :class="form.amenities.includes(amenity.key) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'"
              @click="toggleAmenity(amenity.key)"
            >
              <i :class="amenity.icon" class="text-sm"></i>
              {{ amenity.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Result -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="estimate" class="mt-5 rounded overflow-hidden border border-primary-200">
          <!-- Result header -->
          <div class="bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-wider text-primary-200">Estimated Value</p>
                <p class="mt-1 font-heading text-3xl font-bold text-white tabular-nums">{{ estimate.midLabel }}</p>
                <p class="mt-0.5 text-sm text-primary-200">Range: {{ estimate.lowLabel }} — {{ estimate.highLabel }}</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] text-primary-300">Per m²</p>
                <p class="text-base font-bold text-white tabular-nums">{{ estimate.perSqmLabel }}</p>
              </div>
            </div>
            <!-- Confidence bar -->
            <div class="mt-3">
              <div class="flex items-center justify-between mb-1">
                <p class="text-[11px] font-semibold text-primary-200">Confidence</p>
                <p class="text-[11px] font-bold text-white">{{ estimate.confidence }}%</p>
              </div>
              <div class="h-1.5 w-full rounded-full bg-primary-800/40">
                <div
                  class="h-1.5 rounded-full bg-white transition-all duration-700"
                  :style="{ width: estimate.confidence + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <!-- Factors -->
          <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100 bg-white">
            <div v-for="factor in estimate.factors" :key="factor.label" class="px-4 py-3 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{{ factor.label }}</p>
              <p class="mt-1 text-sm font-bold" :class="factor.impact > 0 ? 'text-emerald-600' : factor.impact < 0 ? 'text-red-500' : 'text-gray-700'">
                <i class="las" :class="factor.impact > 0 ? 'la-arrow-up' : factor.impact < 0 ? 'la-arrow-down' : 'la-equals'"></i>
                {{ factor.value }}
              </p>
            </div>
          </div>
        </div>
      </transition>

      <p class="mt-3 text-[10px] text-gray-400">
        <i class="las la-info-circle"></i>
        Indicative estimate based on comparable market data. Not a formal appraisal.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const locations = [
  { key: 'east-legon', label: 'East Legon', multiplier: 1.28 },
  { key: 'cantonments', label: 'Cantonments', multiplier: 1.52 },
  { key: 'airport', label: 'Airport Residential', multiplier: 1.18 },
  { key: 'labone', label: 'Labone', multiplier: 1.12 },
  { key: 'osu', label: 'Osu', multiplier: 0.98 },
  { key: 'spintex', label: 'Spintex', multiplier: 0.78 },
  { key: 'achimota', label: 'Achimota', multiplier: 0.72 },
  { key: 'tema', label: 'Tema', multiplier: 0.62 },
  { key: 'adenta', label: 'Adenta', multiplier: 0.58 },
  { key: 'haatso', label: 'Haatso', multiplier: 0.55 },
]

const amenities = [
  { key: 'pool', label: 'Pool', icon: 'las la-swimming-pool' },
  { key: 'gym', label: 'Gym', icon: 'las la-dumbbell' },
  { key: 'security', label: '24h Security', icon: 'las la-shield-alt' },
  { key: 'parking', label: 'Parking', icon: 'las la-parking' },
  { key: 'generator', label: 'Generator', icon: 'las la-bolt' },
  { key: 'borehole', label: 'Borehole', icon: 'las la-tint' },
  { key: 'estate', label: 'Gated Estate', icon: 'las la-lock' },
]

const form = reactive({
  location: 'east-legon',
  type: 'apartment',
  transaction: 'rent' as 'rent' | 'sale',
  bedrooms: '2',
  bathrooms: 2,
  size: 120,
  condition: 'good',
  amenities: [] as string[]
})

function setTransaction(val: string) {
  form.transaction = val as 'rent' | 'sale'
}

function toggleAmenity(key: string) {
  const i = form.amenities.indexOf(key)
  if (i >= 0) form.amenities.splice(i, 1)
  else form.amenities.push(key)
}

const basePerSqm = {
  rent: { apartment: 28, house: 38, townhouse: 32, commercial: 45 },
  sale: { apartment: 4200, house: 5800, townhouse: 4900, commercial: 6800 }
}

const conditionMultiplier: Record<string, number> = { new: 1.25, renovated: 1.10, good: 1.0, fair: 0.82 }
const bedroomBonus: Record<string, number> = { '1': 0.88, '2': 1.0, '3': 1.12, '4': 1.24, '5+': 1.40 }

const estimate = computed(() => {
  const loc = locations.find(l => l.key === form.location)!
  const base = basePerSqm[form.transaction][form.type as keyof typeof basePerSqm.rent] ?? 28
  const amenityBoost = 1 + form.amenities.length * 0.03
  const raw = base * form.size * loc.multiplier * conditionMultiplier[form.condition] * bedroomBonus[form.bedrooms] * amenityBoost
  const low = Math.round(raw * 0.88)
  const high = Math.round(raw * 1.12)
  const mid = Math.round(raw)
  const perSqm = Math.round(raw / form.size)

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `GHS ${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `GHS ${(n / 1_000).toFixed(0)}K`
    return `GHS ${n.toLocaleString()}`
  }

  const suffix = form.transaction === 'rent' ? '/mo' : ''
  const confidence = Math.min(95, 55 + form.amenities.length * 4 + (form.size > 60 ? 10 : 0) + (form.condition !== 'fair' ? 8 : 0))

  const factors = [
    { label: 'Location', value: loc.label.split(' ')[0], impact: loc.multiplier > 1 ? 1 : loc.multiplier < 0.8 ? -1 : 0 },
    { label: 'Condition', value: form.condition.charAt(0).toUpperCase() + form.condition.slice(1), impact: conditionMultiplier[form.condition] > 1 ? 1 : conditionMultiplier[form.condition] < 1 ? -1 : 0 },
    { label: 'Size', value: `${form.size} m²`, impact: form.size > 150 ? 1 : form.size < 80 ? -1 : 0 },
    { label: 'Amenities', value: `${form.amenities.length} selected`, impact: form.amenities.length > 2 ? 1 : 0 },
  ]

  return { lowLabel: fmt(low) + suffix, midLabel: fmt(mid) + suffix, highLabel: fmt(high) + suffix, perSqmLabel: fmt(perSqm) + '/m²', confidence, factors }
})
</script>

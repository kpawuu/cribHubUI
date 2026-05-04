<template>
  <div class="rounded border border-gray-200 bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-white">
        <i class="las la-chart-line text-lg"></i>
      </div>
      <div>
        <h2 class="text-sm font-bold text-gray-900">Market Trends</h2>
        <p class="text-[11px] text-gray-500">Accra property price index — illustrative data</p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded px-3 py-1.5 text-xs font-semibold transition-all"
          :class="activeTab === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="p-5">
      <!-- Filter row -->
      <div class="mb-5 flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Filter:</span>
        <button
          v-for="type in propertyTypes"
          :key="type.key"
          class="rounded border px-3 py-1 text-xs font-semibold transition-all"
          :class="activeType === type.key ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'"
          @click="activeType = type.key"
        >
          {{ type.label }}
        </button>
        <div class="ml-auto flex items-center gap-1.5 text-[11px] text-gray-400">
          <i class="las la-info-circle"></i>
          GHS / mo (rent) or GHS total (sale)
        </div>
      </div>

      <!-- Bar chart by area -->
      <div class="space-y-2.5">
        <div v-for="area in sortedAreas" :key="area.name" class="group">
          <div class="flex items-center gap-3">
            <div class="w-36 shrink-0 text-[12px] font-semibold text-gray-700 truncate">{{ area.name }}</div>
            <div class="relative flex-1 h-7 rounded bg-gray-100 overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-700 ease-out"
                :style="{ width: barWidth(area) + '%' }"
              ></div>
              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <span class="text-[11px] font-bold" :class="barWidth(area) > 30 ? 'text-white' : 'text-primary-700'">
                  {{ formatVal(area) }}
                </span>
              </div>
            </div>
            <div class="w-14 shrink-0 text-right text-[11px] font-medium" :class="area.trend > 0 ? 'text-emerald-600' : 'text-red-500'">
              <i class="las" :class="area.trend > 0 ? 'la-arrow-up' : 'la-arrow-down'"></i>
              {{ Math.abs(area.trend) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Summary stats row -->
      <div class="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
        <div class="rounded bg-primary-50 px-4 py-3 text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-primary-600 mb-1">Median Price</p>
          <p class="text-base font-bold text-primary-800 tabular-nums">{{ medianPrice }}</p>
        </div>
        <div class="rounded bg-emerald-50 px-4 py-3 text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-1">YoY Growth</p>
          <p class="text-base font-bold text-emerald-800">+{{ yoyGrowth }}%</p>
        </div>
        <div class="rounded bg-amber-50 px-4 py-3 text-center">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-amber-600 mb-1">Listings Active</p>
          <p class="text-base font-bold text-amber-800">{{ activeListings }}</p>
        </div>
      </div>

      <!-- Price trend sparkline -->
      <div class="mt-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">12-Month Price Index</p>
        <div class="relative h-20 rounded bg-gray-50 px-3 py-2 overflow-hidden">
          <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 240 60">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0F4C75" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#0F4C75" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="sparklineFill" fill="url(#sparkGrad)"/>
            <path :d="sparklinePath" fill="none" stroke="#0F4C75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="absolute bottom-2 left-3 right-3 flex justify-between text-[9px] text-gray-400 font-medium">
            <span v-for="m in months" :key="m">{{ m }}</span>
          </div>
        </div>
      </div>

      <p class="mt-3 text-[10px] text-gray-400">
        <i class="las la-info-circle"></i>
        Data is representative of Accra Greater Area market estimates. Not for investment advice. Last updated {{ new Date().toLocaleDateString() }}.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref<'rent' | 'sale'>('rent')
const activeType = ref<'all' | 'apartment' | 'house' | 'commercial'>('all')

const tabs = [
  { key: 'rent' as const, label: 'Rent' },
  { key: 'sale' as const, label: 'Sale' }
]

const propertyTypes = [
  { key: 'all' as const, label: 'All' },
  { key: 'apartment' as const, label: 'Apartments' },
  { key: 'house' as const, label: 'Houses' },
  { key: 'commercial' as const, label: 'Commercial' }
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type AreaData = {
  name: string
  rent: { all: number; apartment: number; house: number; commercial: number }
  sale: { all: number; apartment: number; house: number; commercial: number }
  trend: number
}

const areaData: AreaData[] = [
  { name: 'East Legon', rent: { all: 6200, apartment: 5800, house: 7500, commercial: 8500 }, sale: { all: 920000, apartment: 780000, house: 1200000, commercial: 1800000 }, trend: 8.4 },
  { name: 'Cantonments', rent: { all: 7800, apartment: 7200, house: 9000, commercial: 11000 }, sale: { all: 1150000, apartment: 950000, house: 1500000, commercial: 2200000 }, trend: 11.2 },
  { name: 'Airport Res.', rent: { all: 5900, apartment: 5400, house: 7200, commercial: 9000 }, sale: { all: 870000, apartment: 720000, house: 1100000, commercial: 1600000 }, trend: 7.8 },
  { name: 'Spintex', rent: { all: 3800, apartment: 3400, house: 4500, commercial: 5200 }, sale: { all: 580000, apartment: 480000, house: 720000, commercial: 950000 }, trend: 5.6 },
  { name: 'Tema', rent: { all: 2900, apartment: 2600, house: 3400, commercial: 4100 }, sale: { all: 420000, apartment: 350000, house: 520000, commercial: 700000 }, trend: 4.2 },
  { name: 'Achimota', rent: { all: 3200, apartment: 2900, house: 3900, commercial: 4600 }, sale: { all: 490000, apartment: 410000, house: 610000, commercial: 820000 }, trend: 6.1 },
  { name: 'Osu', rent: { all: 4100, apartment: 3800, house: 5000, commercial: 6200 }, sale: { all: 640000, apartment: 540000, house: 800000, commercial: 1100000 }, trend: 9.3 },
  { name: 'Labone', rent: { all: 5400, apartment: 4900, house: 6600, commercial: 8200 }, sale: { all: 820000, apartment: 680000, house: 1050000, commercial: 1550000 }, trend: 7.5 },
]

const sortedAreas = computed(() => {
  return [...areaData].sort((a, b) => b[activeTab.value][activeType.value] - a[activeTab.value][activeType.value])
})

const maxVal = computed(() => Math.max(...sortedAreas.value.map(a => a[activeTab.value][activeType.value])))

function barWidth(area: AreaData) {
  return Math.round((area[activeTab.value][activeType.value] / maxVal.value) * 92)
}

function formatVal(area: AreaData) {
  const v = area[activeTab.value][activeType.value]
  if (v >= 1000000) return `GHS ${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `GHS ${(v / 1000).toFixed(0)}K`
  return `GHS ${v.toLocaleString()}`
}

const medianPrice = computed(() => {
  const vals = sortedAreas.value.map(a => a[activeTab.value][activeType.value]).sort((a, b) => a - b)
  const mid = vals[Math.floor(vals.length / 2)]
  if (mid >= 1000000) return `GHS ${(mid / 1000000).toFixed(2)}M`
  if (mid >= 1000) return `GHS ${(mid / 1000).toFixed(0)}K`
  return `GHS ${mid.toLocaleString()}`
})

const yoyGrowth = computed(() => (areaData.reduce((s, a) => s + a.trend, 0) / areaData.length).toFixed(1))

const activeListings = computed(() => {
  const base = activeTab.value === 'rent' ? 1842 : 634
  const multiplier = activeType.value === 'all' ? 1 : 0.35
  return Math.round(base * multiplier).toLocaleString()
})

const sparklineData = [100, 102, 101, 104, 106, 108, 107, 111, 113, 115, 117, 119]

const sparklinePath = computed(() => {
  const w = 240, h = 50, pad = 5
  const min = Math.min(...sparklineData)
  const max = Math.max(...sparklineData)
  return sparklineData.map((v, i) => {
    const x = pad + (i / (sparklineData.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const sparklineFill = computed(() => {
  const w = 240, h = 50, pad = 5
  const min = Math.min(...sparklineData)
  const max = Math.max(...sparklineData)
  const pts = sparklineData.map((v, i) => {
    const x = pad + (i / (sparklineData.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pad},${h} L${pts.join(' L')} L${w - pad},${h} Z`
})
</script>

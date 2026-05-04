<template>
  <div class="rounded border border-gray-200 bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-white">
        <i class="las la-calculator text-lg"></i>
      </div>
      <div>
        <h2 class="text-sm font-bold text-gray-900">Mortgage Calculator</h2>
        <p class="text-[11px] text-gray-500">Estimate your monthly repayments — GH market rates</p>
      </div>
      <div class="ml-auto">
        <span class="rounded bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <i class="las la-info-circle mr-1"></i>Indicative only
        </span>
      </div>
    </div>

    <div class="p-5">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Property price -->
        <div>
          <label class="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Property Price</span>
            <span class="font-mono font-normal text-gray-500">GHS {{ principal.toLocaleString() }}</span>
          </label>
          <input
            v-model.number="principal"
            type="range"
            min="50000"
            max="5000000"
            step="50000"
            class="w-full h-2 rounded-full appearance-none bg-gray-200 accent-primary-600 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>50K</span><span>5M</span>
          </div>
        </div>

        <!-- Deposit -->
        <div>
          <label class="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Down Payment</span>
            <span class="font-mono font-normal text-gray-500">{{ depositPct }}% · GHS {{ depositAmount.toLocaleString() }}</span>
          </label>
          <input
            v-model.number="depositPct"
            type="range"
            min="5"
            max="60"
            step="5"
            class="w-full h-2 rounded-full appearance-none bg-gray-200 accent-primary-600 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>5%</span><span>60%</span>
          </div>
        </div>

        <!-- Interest rate -->
        <div>
          <label class="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Annual Interest Rate</span>
            <span class="font-mono font-normal text-gray-500">{{ annualRatePct }}%</span>
          </label>
          <input
            v-model.number="annualRatePct"
            type="range"
            min="10"
            max="35"
            step="0.5"
            class="w-full h-2 rounded-full appearance-none bg-gray-200 accent-primary-600 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>10%</span><span>35%</span>
          </div>
        </div>

        <!-- Term -->
        <div>
          <label class="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Loan Term</span>
            <span class="font-mono font-normal text-gray-500">{{ years }} years</span>
          </label>
          <div class="flex gap-1.5">
            <button
              v-for="y in [5, 10, 15, 20, 25, 30]"
              :key="y"
              class="flex-1 rounded border py-1.5 text-[11px] font-bold transition-all"
              :class="years === y ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300'"
              @click="years = y"
            >
              {{ y }}yr
            </button>
          </div>
        </div>

        <!-- Bank presets -->
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-xs font-semibold text-gray-700">Quick Presets (GH Banks)</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="bank in banks"
              :key="bank.name"
              class="rounded border px-3 py-1 text-[11px] font-semibold transition-all"
              :class="annualRatePct === bank.rate ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'"
              @click="annualRatePct = bank.rate"
            >
              {{ bank.name }} · {{ bank.rate }}%
            </button>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <!-- Monthly payment highlight -->
        <div class="sm:col-span-1 rounded bg-gradient-to-br from-primary-700 to-primary-600 px-5 py-4 text-center">
          <p class="text-[11px] font-bold uppercase tracking-wider text-primary-200">Monthly Payment</p>
          <p class="mt-2 font-heading text-3xl font-bold text-white tabular-nums">
            {{ monthly !== null ? 'GHS ' + monthly.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—' }}
          </p>
          <p class="mt-1 text-[11px] text-primary-300">{{ years * 12 }} payments</p>
        </div>

        <!-- Other stats -->
        <div class="sm:col-span-2 grid grid-cols-2 gap-3">
          <div class="rounded border border-gray-200 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Loan Amount</p>
            <p class="mt-1 text-base font-bold text-gray-900 tabular-nums">GHS {{ loanAmount.toLocaleString() }}</p>
          </div>
          <div class="rounded border border-gray-200 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total Interest</p>
            <p class="mt-1 text-base font-bold text-red-600 tabular-nums">
              GHS {{ totalInterest !== null ? totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—' }}
            </p>
          </div>
          <div class="rounded border border-gray-200 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total Repayment</p>
            <p class="mt-1 text-base font-bold text-gray-900 tabular-nums">
              GHS {{ totalRepayment !== null ? totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—' }}
            </p>
          </div>
          <div class="rounded border border-gray-200 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Interest : Principal</p>
            <div class="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-red-400 transition-all duration-500" :style="{ width: interestRatio + '%' }"></div>
            </div>
            <p class="mt-1 text-[11px] text-gray-500">{{ interestRatio }}% interest</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const principal = ref(500000)
const depositPct = ref(20)
const annualRatePct = ref(22)
const years = ref(20)

const banks = [
  { name: 'GCB', rate: 19.5 },
  { name: 'Absa', rate: 21.0 },
  { name: 'Stanbic', rate: 22.5 },
  { name: 'Cal Bank', rate: 24.0 },
  { name: 'Republic', rate: 25.5 },
]

const depositAmount = computed(() => Math.round(principal.value * depositPct.value / 100))
const loanAmount = computed(() => principal.value - depositAmount.value)

const monthly = computed(() => {
  const p = loanAmount.value
  const r = annualRatePct.value / 100 / 12
  const n = years.value * 12
  if (!p || !n) return null
  if (r === 0) return p / n
  const pow = Math.pow(1 + r, n)
  const pay = (p * r * pow) / (pow - 1)
  return Number.isFinite(pay) ? pay : null
})

const totalRepayment = computed(() => monthly.value !== null ? monthly.value * years.value * 12 : null)
const totalInterest = computed(() => totalRepayment.value !== null ? totalRepayment.value - loanAmount.value : null)
const interestRatio = computed(() => {
  if (totalRepayment.value === null || totalRepayment.value === 0) return 0
  return Math.round((totalInterest.value! / totalRepayment.value) * 100)
})
</script>

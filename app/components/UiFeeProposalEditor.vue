<template>
  <div class="space-y-3">
    <!-- Tabs to toggle rent vs sale -->
    <div class="inline-flex rounded border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
      <button
        type="button"
        class="rounded px-3 py-1.5 transition"
        :class="hasRent ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'"
        @click="toggleRent(!hasRent)"
      >
        <i class="las la-home mr-0.5"></i>Rental
      </button>
      <button
        type="button"
        class="rounded px-3 py-1.5 transition"
        :class="hasSale ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'"
        @click="toggleSale(!hasSale)"
      >
        <i class="las la-tag mr-0.5"></i>Sale
      </button>
    </div>

    <!-- Rental fee -->
    <div v-if="hasRent" class="rounded border border-gray-200 p-3">
      <div class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <i class="las la-home text-gray-500"></i> Rental fee
      </div>
      <div class="grid gap-2 sm:grid-cols-3">
        <select v-model="model.rent!.type" class="field-input">
          <option value="percent">% of monthly rent</option>
          <option value="months_rent">Months of rent</option>
          <option value="fixed">Flat amount</option>
          <option value="percent_rent_collected">% of rent collected</option>
        </select>
        <input
          v-model.number="model.rent!.value"
          type="number"
          min="0"
          step="0.5"
          class="field-input"
          :placeholder="model.rent!.type === 'percent' || model.rent!.type === 'percent_rent_collected' ? 'e.g. 2.5' : 'e.g. 1'"
        />
        <input
          v-if="model.rent!.type === 'fixed'"
          v-model="model.rent!.currency"
          type="text"
          maxlength="6"
          class="field-input"
          placeholder="GHS"
        />
      </div>
    </div>

    <!-- Sale fee -->
    <div v-if="hasSale" class="rounded border border-gray-200 p-3">
      <div class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <i class="las la-tag text-gray-500"></i> Sale fee
      </div>
      <div class="grid gap-2 sm:grid-cols-3">
        <select v-model="model.sale!.type" class="field-input">
          <option value="percent">% of sale price</option>
          <option value="fixed">Flat amount</option>
        </select>
        <input
          v-model.number="model.sale!.value"
          type="number"
          min="0"
          step="0.5"
          class="field-input"
          :placeholder="model.sale!.type === 'percent' ? 'e.g. 2.5' : 'e.g. 50000'"
        />
        <input
          v-if="model.sale!.type === 'fixed'"
          v-model="model.sale!.currency"
          type="text"
          maxlength="6"
          class="field-input"
          placeholder="GHS"
        />
      </div>
    </div>

    <!-- Triggers + Notes (collapsible advanced) -->
    <details class="rounded border border-gray-100 bg-gray-50/60 p-3 text-xs">
      <summary class="cursor-pointer font-semibold text-gray-600">
        <i class="las la-cog mr-0.5"></i>Advanced terms
      </summary>
      <div class="mt-3 space-y-2">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Payable when</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="t in TRIGGERS"
              :key="t.id"
              type="button"
              class="rounded border px-2 py-1 text-[11px] font-medium transition"
              :class="
                (model.triggers || []).includes(t.id as any)
                  ? 'border-primary-300 bg-primary-50 text-primary-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              "
              @click="toggleTrigger(t.id as any)"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-600">Offer valid (days)</label>
            <input
              v-model.number="model.validityDays"
              type="number"
              min="1"
              max="365"
              class="field-input"
              placeholder="14"
            />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Notes to landlord</label>
          <textarea
            v-model="model.notes"
            rows="2"
            class="field-input"
            placeholder="Add context: marketing budget, exclusivity, payment timing…"
          />
        </div>
      </div>
    </details>

    <!-- Live summary -->
    <p class="rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
      <i class="las la-info-circle mr-0.5 text-gray-400"></i>
      <span class="font-semibold">Summary:</span> {{ summary }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  type FeeProposal,
  FEE_TRIGGER_LABELS,
  summarizeProposal,
  emptyProposal,
} from '../composables/useFeeProposal'

const props = defineProps<{ modelValue?: FeeProposal | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: FeeProposal | null): void }>()

const TRIGGERS = [
  { id: 'rent_consummated',       label: FEE_TRIGGER_LABELS.rent_consummated },
  { id: 'sale_consummated',       label: FEE_TRIGGER_LABELS.sale_consummated },
  { id: 'first_month_paid',       label: FEE_TRIGGER_LABELS.first_month_paid },
  { id: 'each_renewal',           label: FEE_TRIGGER_LABELS.each_renewal },
  { id: 'monthly_rent_collected', label: FEE_TRIGGER_LABELS.monthly_rent_collected },
]

const model = ref<FeeProposal>(initFromProps())

const hasRent = computed(() => !!model.value?.rent)
const hasSale = computed(() => !!model.value?.sale)
const summary = computed(() => summarizeProposal(model.value))

function initFromProps(): FeeProposal {
  if (props.modelValue) return JSON.parse(JSON.stringify(props.modelValue))
  return emptyProposal()
}

watch(
  () => props.modelValue,
  (v) => {
    model.value = v ? JSON.parse(JSON.stringify(v)) : emptyProposal()
  }
)

watch(model, (v) => emit('update:modelValue', v), { deep: true })

function toggleRent(on: boolean) {
  if (on && !model.value.rent) model.value.rent = { type: 'percent', value: 0 }
  else if (!on) delete model.value.rent
}
function toggleSale(on: boolean) {
  if (on && !model.value.sale) model.value.sale = { type: 'percent', value: 0 }
  else if (!on) delete model.value.sale
}
function toggleTrigger(id: NonNullable<FeeProposal['triggers']>[number]) {
  const arr = new Set(model.value.triggers || [])
  if (arr.has(id)) arr.delete(id)
  else arr.add(id)
  model.value.triggers = arr.size ? [...arr] as any : undefined
}
</script>

<style scoped>
.field-input {
  @apply w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500;
}
</style>

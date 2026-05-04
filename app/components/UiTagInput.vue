<template>
  <div>
    <!-- Tag chips -->
    <div v-if="modelValue.length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="(tag, i) in modelValue"
        :key="tag + i"
        class="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
      >
        {{ tag }}
        <button
          type="button"
          class="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-700"
          @click="remove(i)"
        >
          <i class="las la-times" style="font-size:10px"></i>
        </button>
      </span>
    </div>

    <!-- Input -->
    <div class="flex gap-2">
      <input
        v-model="inputVal"
        :placeholder="placeholder || 'Type and press Enter…'"
        class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        @keydown.enter.prevent="add"
        @keydown.comma.prevent="add"
        @keydown.tab.prevent="inputVal.trim() && add()"
      />
      <button
        type="button"
        class="rounded border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        :disabled="!inputVal.trim()"
        @click="add"
      >
        Add
      </button>
    </div>
    <p class="mt-1 text-xs text-gray-400">Press <kbd class="rounded border border-gray-200 bg-gray-100 px-1 text-xs">Enter</kbd> or comma to add</p>

    <!-- Suggestions (common amenities) -->
    <div v-if="showSuggestions && suggestions.length" class="mt-2 flex flex-wrap gap-1">
      <button
        v-for="s in availableSuggestions"
        :key="s"
        type="button"
        class="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-700"
        @click="addSuggestion(s)"
      >
        + {{ s }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  showSuggestions?: boolean
  suggestions?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const inputVal = ref('')

const defaultSuggestions = [
  'Air conditioning', 'Parking', 'Swimming pool', 'Gym', 'Security',
  'Generator', 'Borehole', 'CCTV', 'Elevator', 'Balcony',
  'Garden', 'Furnished', 'Internet', 'Water heater', 'Laundry',
  'Storage room', 'Gated community', 'Serviced', 'Wheelchair access'
]

const suggestions = computed(() => props.suggestions?.length ? props.suggestions : defaultSuggestions)
const availableSuggestions = computed(() =>
  suggestions.value.filter((s) => !props.modelValue.map((v) => v.toLowerCase()).includes(s.toLowerCase()))
)

function add() {
  const val = inputVal.value.split(',').map((v) => v.trim()).filter(Boolean)
  if (!val.length) return
  const existing = props.modelValue.map((v) => v.toLowerCase())
  const newTags = val.filter((v) => !existing.includes(v.toLowerCase()))
  if (newTags.length) emit('update:modelValue', [...props.modelValue, ...newTags])
  inputVal.value = ''
}

function remove(i: number) {
  const arr = [...props.modelValue]
  arr.splice(i, 1)
  emit('update:modelValue', arr)
}

function addSuggestion(s: string) {
  if (!props.modelValue.map((v) => v.toLowerCase()).includes(s.toLowerCase())) {
    emit('update:modelValue', [...props.modelValue, s])
  }
}
</script>

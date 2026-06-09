<template>
  <article
    class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-primary-500"
  >
    <div class="relative h-28 bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-30%,#ffffff35,transparent_60%)]"></div>

      <div class="absolute -bottom-8 left-5 z-10">
        <div class="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow">
          <img
            v-if="pm.avatarUrl"
            :src="pm.avatarUrl"
            :alt="pm.displayName"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-violet-600 text-base font-bold text-white"
          >
            {{ initials(pm.displayName) }}
          </div>
        </div>
      </div>

      <div class="absolute right-3 top-3">
        <span
          v-if="pm.verified"
          class="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white"
        >
          <i class="las la-check-circle text-sm"></i> Verified
        </span>
      </div>
    </div>

    <div class="px-5 pb-5 pt-10">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h3 class="truncate text-base font-bold text-gray-900">{{ pm.displayName }}</h3>
          <p class="truncate text-sm text-gray-500">{{ pm.companyName || 'Independent property manager' }}</p>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <div class="flex items-center gap-0.5">
          <svg
            v-for="s in 5"
            :key="s"
            class="h-3.5 w-3.5"
            :class="s <= filledStars ? 'text-yellow-400' : 'text-gray-200'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            ></path>
          </svg>
          <span class="ml-1 text-xs font-semibold text-gray-800">{{ ratingLabel }}</span>
        </div>
        <span class="text-gray-300">·</span>
        <span>{{ reviewsLabel }}</span>
        <template v-if="pm.portfolioSize">
          <span class="text-gray-300">·</span>
          <span><i class="las la-building text-gray-400"></i> {{ pm.portfolioSize }} units managed</span>
        </template>
      </div>

      <p v-if="pm.bio" class="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ pm.bio }}</p>

      <div v-if="(pm.services || []).length || (pm.regions || []).length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="s in (pm.services || []).slice(0, 3)"
          :key="'s-' + s"
          class="rounded border border-violet-100 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
          >{{ s }}</span
        >
        <span
          v-for="r in (pm.regions || []).slice(0, 3)"
          :key="'r-' + r"
          class="rounded border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700"
          >{{ r }}</span
        >
      </div>

      <div v-if="defaultFeeSummary" class="mt-3 rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs">
        <p class="font-semibold text-emerald-800">
          <i class="las la-tag text-emerald-600"></i> Default rate
        </p>
        <p class="mt-0.5 text-emerald-700">{{ defaultFeeSummary }}</p>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
        <div>
          <p class="text-sm font-bold text-gray-900">{{ pm.portfolioSize ?? '—' }}</p>
          <p class="text-[11px] text-gray-500">Units</p>
        </div>
        <div class="border-x border-gray-100">
          <p class="text-sm font-bold text-gray-900">{{ pm.yearsManaging ?? '—' }}</p>
          <p class="text-[11px] text-gray-500">Years</p>
        </div>
        <div>
          <p class="text-sm font-bold" :class="pm.verified ? 'text-emerald-600' : 'text-gray-400'">
            {{ pm.verified ? 'Verified' : 'Pending' }}
          </p>
          <p class="text-[11px] text-gray-500">Status</p>
        </div>
      </div>

      <slot name="actions">
        <NuxtLink
          v-if="!hideViewButton"
          :to="`/property-managers/${String(pm._id)}`"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <i class="las la-user-tie"></i> View profile
        </NuxtLink>
      </slot>
    </div>
  </article>
</template>

<script setup lang="ts">
import { summarizeProposal, defaultFeeToProposal } from '../composables/useFeeProposal'

const props = defineProps<{
  pm: Record<string, any>
  hideViewButton?: boolean
}>()

const filledStars = computed(() => {
  const av = Number(props.pm?.ratingAvg)
  if (!Number.isFinite(av) || av <= 0) return 0
  return Math.min(5, Math.max(0, Math.round(av)))
})

const ratingLabel = computed(() => {
  const av = Number(props.pm?.ratingAvg)
  if (!Number.isFinite(av) || av <= 0) return '—'
  return av.toFixed(1)
})

const reviewsLabel = computed(() => {
  const n = Number(props.pm?.ratingCount)
  if (!Number.isFinite(n) || n <= 0) return 'No reviews yet'
  return `${n} review${n === 1 ? '' : 's'}`
})

const defaultFeeSummary = computed(() => {
  if (!props.pm?.defaultFee) return ''
  const s = summarizeProposal(defaultFeeToProposal(props.pm.defaultFee))
  return s === 'No fee proposed' ? '' : s
})

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

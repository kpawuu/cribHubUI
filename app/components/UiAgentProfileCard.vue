<template>
  <article
    class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-500 transition-colors group"
  >
    <div class="relative h-28 bg-gray-100">
      <img
        :src="bannerSrc"
        alt=""
        class="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

      <div class="absolute left-5 -bottom-8 z-10">
        <div class="w-16 h-16 rounded-full overflow-hidden border-4 border-white bg-white shadow">
          <img
            v-if="agent.avatarUrl"
            :src="agent.avatarUrl"
            :alt="agent.displayName"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-primary-600 text-white text-lg font-bold"
          >
            {{ initials(agent.displayName) }}
          </div>
        </div>
      </div>

      <div class="absolute top-3 right-3">
        <span
          v-if="agent.verified"
          class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Verified
        </span>
      </div>
    </div>

    <div class="pt-10 px-5 pb-5">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h3 class="text-base font-bold text-gray-900 truncate">{{ agent.displayName }}</h3>
          <p class="text-sm text-gray-500 truncate">{{ agent.agency || 'Independent agent' }}</p>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-0.5">
          <svg
            v-for="s in 5"
            :key="s"
            class="w-3.5 h-3.5"
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
        <span class="text-gray-300 text-xs">·</span>
        <span class="text-xs text-gray-500">{{ reviewsLabel }}</span>
        <template v-if="agent.responseTimeMinutes">
          <span class="text-gray-300 text-xs">·</span>
          <span class="text-xs text-gray-500">
            <svg class="inline w-3 h-3 mr-0.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ agent.responseTimeMinutes }} min response
          </span>
        </template>
      </div>

      <p v-if="agent.bio" class="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">{{ agent.bio }}</p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="region in (agent.regions || []).slice(0, 3)"
          :key="'r-' + region"
          class="px-2 py-0.5 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100"
          >{{ region }}</span
        >
        <span
          v-for="lang in (agent.languages || []).slice(0, 2)"
          :key="'l-' + lang"
          class="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded border border-primary-100"
          >{{ lang }}</span
        >
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
        <div>
          <p class="text-sm font-bold text-gray-900">{{ agent.listingsCount ?? '—' }}</p>
          <p class="text-[11px] text-gray-500">Listings</p>
        </div>
        <div class="border-x border-gray-100">
          <p class="text-sm font-bold text-gray-900">{{ memberSince(agent.createdAt) }}</p>
          <p class="text-[11px] text-gray-500">Since</p>
        </div>
        <div>
          <p class="text-sm font-bold" :class="agent.verified ? 'text-emerald-600' : 'text-gray-400'">
            {{ agent.verified ? 'Verified' : 'Pending' }}
          </p>
          <p class="text-[11px] text-gray-500">Status</p>
        </div>
      </div>

      <NuxtLink
        :to="`/agents/${String(agent._id)}`"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        View profile & listings
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  agentProfileFilledStars,
  agentProfileHasReviews,
  agentProfileRatingCount,
  agentProfileRatingLabel,
} from '../composables/useAgentProfileRatings'

const props = defineProps<{
  agent: Record<string, any>
  /** Used to cycle banner images (same order as agents index). */
  cardIndex: number
}>()

const bannerImages = [
  '/images/apartments/6.jpeg',
  '/images/apartments/1.jpeg',
  '/images/apartments/5.jpeg',
  '/images/apartments/4.jpeg',
  '/images/apartments/2.jpeg',
  '/images/apartments/3.jpeg',
]

const bannerSrc = computed(() => bannerImages[props.cardIndex % bannerImages.length])

const filledStars = computed(() => agentProfileFilledStars(props.agent))

const ratingLabel = computed(() => agentProfileRatingLabel(props.agent))

const reviewsLabel = computed(() => {
  if (agentProfileHasReviews(props.agent)) {
    const n = agentProfileRatingCount(props.agent)
    return `${n} review${n === 1 ? '' : 's'}`
  }
  return 'No reviews yet'
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

function memberSince(d?: string) {
  if (!d) return '—'
  return new Date(d).getFullYear().toString()
}
</script>

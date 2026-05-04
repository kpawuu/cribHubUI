<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-lg">

      <!-- Logo -->
      <div class="mb-6 text-center">
        <NuxtLink to="/">
          <img src="/images/logo/logo.png" alt="CribHub" class="mx-auto h-9" />
        </NuxtLink>
      </div>

      <!-- Step progress -->
      <div class="mb-6 flex items-center justify-center gap-1.5">
        <span class="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-600">
          <i class="las la-check text-[9px]"></i>
        </span>
        <span class="text-xs text-gray-400 line-through">Choose role</span>
        <span class="mx-1 h-px w-8 bg-primary-300"></span>
        <span class="flex h-5 w-5 items-center justify-center rounded bg-primary-600 text-[10px] font-bold text-white">2</span>
        <span class="text-xs font-semibold text-primary-600">Complete profile</span>
        <span class="mx-1 h-px w-8 bg-gray-300"></span>
        <span class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 text-[10px] font-medium text-gray-400">3</span>
        <span class="text-xs text-gray-400">Get started</span>
      </div>

      <!-- Card -->
      <div class="rounded border border-gray-200 bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h1 class="text-sm font-bold text-gray-900">Tenant preferences</h1>
            <p class="mt-0.5 text-xs text-gray-500">Help us tailor property recommendations for you.</p>
          </div>
          <NuxtLink to="/onboarding/role" class="flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-700">
            <i class="las la-angle-left"></i> Back
          </NuxtLink>
        </div>

        <!-- Messages -->
        <div v-if="error" class="mx-5 mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          <i class="las la-exclamation-circle mr-1"></i>{{ error }}
        </div>
        <div v-if="success" class="mx-5 mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          <i class="las la-check-circle mr-1"></i>{{ success }}
        </div>

        <!-- Form -->
        <form class="space-y-4 p-5" @submit.prevent="onSubmit">
          <!-- Looking for -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700">Looking for</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded border px-3 py-2 text-sm font-medium transition"
                :class="lookingFor === 'rent' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                @click="lookingFor = 'rent'"
              >
                <i class="las la-key mr-1"></i> Rent
              </button>
              <button
                type="button"
                class="rounded border px-3 py-2 text-sm font-medium transition"
                :class="lookingFor === 'buy' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                @click="lookingFor = 'buy'"
              >
                <i class="las la-home mr-1"></i> Buy
              </button>
            </div>
          </div>

          <!-- Budget range -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Budget min</label>
              <input
                v-model.number="budgetMin"
                type="number"
                min="0"
                placeholder="0"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Budget max</label>
              <input
                v-model.number="budgetMax"
                type="number"
                min="0"
                placeholder="5,000"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <!-- Preferred locations -->
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Preferred locations</label>
            <UiLocationMultiPicker
              v-model="locationTags"
              placeholder="Search areas, cities, neighbourhoods…"
              :max-items="8"
            />
          </div>

          <!-- Bedrooms -->
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Minimum bedrooms</label>
            <select
              v-model.number="bedrooms"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option :value="0">Any</option>
              <option :value="1">1+</option>
              <option :value="2">2+</option>
              <option :value="3">3+</option>
              <option :value="4">4+</option>
            </select>
          </div>
        </form>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <button type="button" class="text-xs text-gray-400 transition hover:text-gray-600" @click="skipForNow">
            Skip for now
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="onSubmit"
          >
            <i v-if="isSubmitting" class="las la-circle-notch la-spin"></i>
            {{ isSubmitting ? 'Saving…' : 'Continue' }}
            <i v-if="!isSubmitting" class="las la-arrow-right text-base"></i>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ middleware: ['auth'], layout: 'auth' })
useHead({ title: 'Tenant Profile – CribHub' })

const auth = useAuthStore()

const lookingFor = ref<'rent' | 'buy'>('rent')
const budgetMin = ref<number>(0)
const budgetMax = ref<number>(0)
const locationTags = ref<string[]>([])
const bedrooms = ref<number>(0)

const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)

async function skipForNow() {
  await navigateTo('/dashboard')
}

async function onSubmit() {
  error.value = null
  success.value = null
  isSubmitting.value = true
  try {
    const id = (auth.user as any)?._id?.toString?.() || (auth.user as any)?._id
    if (!id) throw new Error('Missing user id')

    const feathers = useNuxtApp().$feathers as any
    const patched = await feathers.service('users').patch(id, {
      isOnboarded: true,
      onboarding: {
        lookingFor: lookingFor.value,
        budgetMin: budgetMin.value || undefined,
        budgetMax: budgetMax.value || undefined,
        locations: locationTags.value,
        bedrooms: bedrooms.value || undefined,
      },
    })

    auth.user = patched
    localStorage.setItem('user', JSON.stringify(patched))
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.message || 'Failed to save'
  } finally {
    isSubmitting.value = false
  }
}
</script>

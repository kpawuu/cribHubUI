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
            <h1 class="text-sm font-bold text-gray-900">Landlord profile setup</h1>
            <p class="mt-0.5 text-xs text-gray-500">A few details to complete your verification request.</p>
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
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Business name</label>
              <input
                v-model="businessName"
                type="text"
                placeholder="e.g. Mensah Properties"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">
                Tax ID <span class="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                v-model="taxId"
                type="text"
                placeholder="TIN or VAT number"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">
              About your business <span class="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              v-model="about"
              rows="3"
              placeholder="Describe your portfolio, experience, or any relevant background…"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            ></textarea>
          </div>

          <div class="flex items-start gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2.5">
            <input
              v-model="accepted"
              type="checkbox"
              required
              class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label class="text-xs leading-relaxed text-gray-600">
              I confirm the information provided is accurate and understand it may be reviewed for verification.
            </label>
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
            {{ isSubmitting ? 'Submitting…' : 'Submit' }}
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
useHead({ title: 'Landlord Profile – CribHub' })

const auth = useAuthStore()

const businessName = ref('')
const taxId = ref('')
const about = ref('')
const accepted = ref(false)

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

    const roleRequestId = sessionStorage.getItem('roleRequestId') || ''
    if (!roleRequestId) throw new Error('Missing role request id — please go back and select your role again.')

    const feathers = useNuxtApp().$feathers as any
    const patched = await feathers.service('users').patch(id, {
      onboarding: {
        landlord: {
          businessName: businessName.value.trim(),
          taxId: taxId.value.trim() || undefined,
          about: about.value.trim() || undefined,
        },
      },
      isOnboarded: true,
    })

    auth.user = patched
    localStorage.setItem('user', JSON.stringify(patched))
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.message || 'Failed to submit'
  } finally {
    isSubmitting.value = false
  }
}
</script>
